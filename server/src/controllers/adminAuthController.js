const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../database');
const { logAudit } = require('../utils/auditLogger');

const { createSession } = require('../services/sessionService');

// Helper to generate admin token
const generateAdminToken = (admin, sessionId) => {
    return jwt.sign(
        { id: admin.id, username: admin.username, role: admin.role, sessionId },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// Helper to set admin cookie
const setAdminAuthCookie = (res, token) => {
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.connection.remoteAddress;

        console.log(`[Admin Login] Attempt for: ${username}`);

        const adminResult = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (adminResult.rows.length === 0) {
            console.log(`[Admin Login] User not found: ${username}`);
            
            await logAudit({
                event_type: 'Security',
                action: 'Admin Login Failed',
                description: `Failed login attempt for username: ${username} (User not found)`,
                status: 'Failed',
                ip_address: ip,
                details: { reason: 'User not found' }
            });

            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
        const admin = adminResult.rows[0];

        if (admin.status === 'suspended') {
            console.log(`[Admin Login] Account suspended: ${username}`);
            
            await logAudit({
                event_type: 'Security',
                action: 'Admin Login Suspended',
                description: `Login attempt by suspended admin: ${username}`,
                admin_id: admin.id,
                status: 'Failed',
                ip_address: ip
            });

            return res.status(403).json({ message: 'Account is suspended. Contact Super Admin.' });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            console.log(`[Admin Login] Password mismatch for: ${username}`);
            
            await logAudit({
                event_type: 'Security',
                action: 'Admin Login Failed',
                description: `Failed login attempt for admin: ${username} (Invalid password)`,
                admin_id: admin.id,
                status: 'Failed',
                ip_address: ip
            });

            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Update last login
        await pool.query('UPDATE admins SET last_login = NOW() WHERE id = $1', [admin.id]);

        // Create Session
        console.log(`[Admin Login] Creating session for admin ID: ${admin.id}`);
        const sessionId = await createSession(admin.id, true, req);
        console.log(`[Admin Login] Session created: ${sessionId}`);

        const token = generateAdminToken(admin, sessionId);
        setAdminAuthCookie(res, token);
        
        // Clear user token to prevent session collision
        res.clearCookie('token');

        console.log(`[Admin Login] Login successful for: ${username}`);
        
        await logAudit({
            event_type: 'User', // 'User' category fits for user/admin actions
            action: 'Admin Login',
            description: `Admin logged in successfully`,
            admin_id: admin.id,
            status: 'Success',
            ip_address: ip,
            details: { session_id: sessionId }
        });

        res.json({
            admin: { id: admin.id, username: admin.username, role: admin.role },
            message: 'Admin logged in successfully'
        });
    } catch (err) {
        console.error('[Admin Login Error]', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const query = `
            SELECT id, username, full_name, email, avatar_url, role, status, department, bio, 
                   phone_number, job_title, employee_id, office_location, 
                   social_linkedin, social_github, social_website,
                   two_factor_enabled, created_at, last_login 
            FROM admins 
            WHERE id = $1
        `;
        const adminResult = await pool.query(query, [req.admin.id]);
        
        if (adminResult.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(adminResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { 
            full_name, email, department, bio, avatar_url,
            phone_number, job_title, employee_id, office_location,
            social_linkedin, social_github, social_website 
        } = req.body;
        
        // Basic Sanitization (Trimming)
        const sanitizedData = {
            full_name: full_name?.trim(),
            email: email?.trim(),
            department: department?.trim(),
            bio: bio?.trim(),
            avatar_url: avatar_url?.trim(),
            phone_number: phone_number?.trim(),
            job_title: job_title?.trim(),
            employee_id: employee_id?.trim(),
            office_location: office_location?.trim(),
            social_linkedin: social_linkedin?.trim(),
            social_github: social_github?.trim(),
            social_website: social_website?.trim()
        };

        const query = `
            UPDATE admins 
            SET full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                department = COALESCE($3, department),
                bio = COALESCE($4, bio),
                avatar_url = COALESCE($5, avatar_url),
                phone_number = COALESCE($6, phone_number),
                job_title = COALESCE($7, job_title),
                employee_id = COALESCE($8, employee_id),
                office_location = COALESCE($9, office_location),
                social_linkedin = COALESCE($10, social_linkedin),
                social_github = COALESCE($11, social_github),
                social_website = COALESCE($12, social_website)
            WHERE id = $13
            RETURNING *
        `;
        
        const values = [
            sanitizedData.full_name, sanitizedData.email, sanitizedData.department, sanitizedData.bio, sanitizedData.avatar_url,
            sanitizedData.phone_number, sanitizedData.job_title, sanitizedData.employee_id, sanitizedData.office_location,
            sanitizedData.social_linkedin, sanitizedData.social_github, sanitizedData.social_website,
            req.admin.id
        ];

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const adminData = result.rows[0];
        // Remove password hash from response for security
        delete adminData.password_hash;

        await logAudit({
            event_type: 'User',
            action: 'Profile Updated',
            description: 'Admin updated their profile',
            admin_id: req.admin.id,
            status: 'Success',
            ip_address: req.ip || req.connection.remoteAddress
        });

        res.json({ message: 'Profile updated successfully', admin: adminData });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };
    
    // Log Logout before clearing cookies (if we can identify user)
    // Actually verification middleware runs before this, so req.admin might be populated?
    // But this route doesn't have verifyToken middleware in adminRoutes! 
    // Wait, in adminRoutes.js: router.post('/logout', adminAuthController.logout); -- No middleware.
    // So we don't know who is logging out unless we verify token manually. 
    // It's okay, maybe just log a generic "Logout" or skip.
    // We can try to decode token if present just for logging.
    
    // For simplicity, let's just clear cookies. 

    res.clearCookie('admin_token', cookieOptions);
    res.clearCookie('token', cookieOptions);

    res.json({ message: 'Admin logged out successfully' });
};
