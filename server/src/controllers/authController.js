const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../database');
const emailService = require('../services/emailService');

// Helper to generate generic token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Helper to set cookie
const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check user
        const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (unverified by default)
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, is_verified, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, hashedPassword, false, 'local']
        );
        const user = newUser.rows[0];

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await pool.query(
            'INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)',
            [email, otp, 'verification', expiresAt]
        );

        // Send Email
        await emailService.sendVerificationEmail(email, otp);

        res.json({ message: 'Registration successful. Please check your email for OTP.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await pool.query(
            'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND type = $3 AND expires_at > NOW()',
            [email, otp, 'verification']
        );

        if (otpRecord.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Verify User
        await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);

        // Delete used OTP
        await pool.query('DELETE FROM otps WHERE id = $1', [otpRecord.rows[0].id]);

        // Auto-login? Or ask to login. Let's return success and let frontend redirect to login.
        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = userResult.rows[0];

        // If generic provider (google/github) trying to login with password -> might fail if no hash
        if (!user.password_hash) {
            return res.status(400).json({ message: 'Please login with your social account' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.is_verified) {
            // Generate generic OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await pool.query(
                'INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)',
                [email, otp, 'verification', expiresAt]
            );

            await emailService.sendVerificationEmail(email, otp);

            return res.status(403).json({
                message: 'Email not verified. A new verification code has been sent.',
                requireVerification: true,
                email: user.email
            });
        }

        const token = generateToken(user);
        setAuthCookie(res, token);
        res.json({ user, message: 'Logged in successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.googleCallback = (req, res) => {
    if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    const token = generateToken(req.user);
    setAuthCookie(res, token);
    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
};

exports.githubCallback = exports.googleCallback;

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            // Security: Don't reveal if user exists, just say sent. 
            // Or if you prefer UX over strict security for this project, say User not found (not recommended generally)
            // For this project, I'll return success to avoid enumeration, but log internally.
            return res.json({ message: 'If that email exists, we sent a reset code.' });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Store OTP with type 'reset'
        await pool.query(
            'INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)',
            [email, otp, 'reset', expiresAt]
        );

        await emailService.sendPasswordResetEmail(email, otp);
        res.json({ message: 'Password reset code sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const otpRecord = await pool.query(
            'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND type = $3 AND expires_at > NOW()',
            [email, otp, 'reset']
        );

        if (otpRecord.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);

        // Delete used OTP
        await pool.query('DELETE FROM otps WHERE id = $1', [otpRecord.rows[0].id]);

        res.json({ message: 'Password reset successful. Please login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Logged out successfully' });
};

