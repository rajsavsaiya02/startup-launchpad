const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../database');

// Helper to generate admin token - using a different scope or secret if needed
// For now using the same secret but adding a role claim for clarity
const generateAdminToken = (admin) => {
    return jwt.sign(
        { id: admin.id, username: admin.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const adminResult = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (adminResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
        const admin = adminResult.rows[0];

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Generate Token
        const token = generateAdminToken(admin);

        // Set Cookie - distinct name or same?
        // Let's use 'admin_token' to keep it completely separate from user sessions
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({ message: 'Admin logged in successfully', admin: { username: admin.username } });
    } catch (err) {
        console.error('Admin Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const existing = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Admin username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const adminRole = role === 'super_admin' ? 'super_admin' : 'admin';

        await pool.query(
            "INSERT INTO admins (username, password_hash, role, status) VALUES ($1, $2, $3, 'active')",
            [username, hashedPassword, adminRole]
        );

        res.json({ message: 'New admin created successfully' });
    } catch (err) {
        console.error('Create Admin Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, username, full_name, email, role, status, created_at, last_login 
            FROM admins 
            ORDER BY created_at ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get All Admins Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status, securityCode } = req.body;

        // Prevent modifying root_admin via API (optional safety, or just checking internal ID)
        if (role) {
            // Check for promotion to super_admin
            if (role === 'super_admin') {
                const STATIC_SECURITY_CODE = '@Startup2026';
                if (securityCode !== STATIC_SECURITY_CODE) {
                    return res.status(403).json({ message: 'Invalid security code for Super Admin promotion' });
                }
            }
        }

        // Only allow status: active, suspended
        // Only allow role: admin, super_admin

        const query = `
            UPDATE admins 
            SET role = COALESCE($1, role), 
                status = COALESCE($2, status) 
            WHERE id = $3 
            RETURNING id, username, role, status
        `;
        const result = await pool.query(query, [role, status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ message: 'Admin updated successfully', admin: result.rows[0] });
    } catch (err) {
        console.error('Update Admin Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changeAdminPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            'UPDATE admins SET password_hash = $1 WHERE id = $2 RETURNING id',
            [hashedPassword, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change Admin Password Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        // Optionally prevent deleting self?
        if (req.admin.id === parseInt(id)) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const result = await pool.query('DELETE FROM admins WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (err) {
         console.error('Delete Admin Error:', err);
         res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Admin logged out successfully' });
};
