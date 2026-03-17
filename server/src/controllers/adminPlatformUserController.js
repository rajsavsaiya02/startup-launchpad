const bcrypt = require('bcrypt');
const { pool } = require('../database');

// GET /api/admin/platform-users
exports.getPlatformUsers = async (req, res) => {
    try {
        const { search, status, role } = req.query;
        const pageStr = req.query.page || '1';
        const limitStr = req.query.limit || '10';
        const page = parseInt(pageStr, 10);
        const limit = parseInt(limitStr, 10);
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM users u
            WHERE 1=1
        `;
        const values = [];
        let index = 1;

        if (search) {
            baseQuery += ` AND (u.name ILIKE $${index} OR u.email ILIKE $${index})`;
            values.push('%' + search + '%');
            index++;
        }
        
        if (status) {
            baseQuery += ` AND u.status = $${index}`;
            values.push(status);
            index++;
        }
        
        if (role) {
            baseQuery += ` AND u.role = $${index}`;
            values.push(role);
            index++;
        }

        // 1. Get total count
        const countQueryStr = `SELECT COUNT(*) ${baseQuery}`;
        const countResult = await pool.query(countQueryStr, values);
        const total = parseInt(countResult.rows[0].count, 10);

        // 2. Get paginated data
        let query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.status, 
                u.avatar AS avatar_url,
                u.created_at,
                (
                    SELECT o.name 
                    FROM organization_members om 
                    JOIN organizations o ON om.organization_id = o.organization_id 
                    WHERE om.user_id = u.id 
                    LIMIT 1
                ) AS organization,
                (
                    SELECT MAX(last_active)
                    FROM sessions s
                    WHERE s.user_id = u.id
                ) AS last_active
            ${baseQuery}
            ORDER BY u.created_at DESC
            LIMIT $${index} OFFSET $${index + 1}
        `;
        
        const paginationValues = [...values, limit, offset];
        const result = await pool.query(query, paginationValues);

        res.json({
            users: result.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get Platform Users Error:', error);
        res.status(500).json({ message: 'Failed to fetch platform users' });
    }
};

// POST /api/admin/platform-users
exports.createPlatformUser = async (req, res) => {
    try {
        const { name, email, role, password, status = 'active' } = req.body;

        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, role, password_hash, status) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, name, email, role, status`,
            [name, email, role, hashedPassword, status]
        );

        res.status(201).json({ 
            message: 'User created successfully', 
            user: result.rows[0] 
        });
    } catch (error) {
        console.error('Create Platform User Error:', error);
        res.status(500).json({ message: 'Failed to create platform user' });
    }
};

// PUT /api/admin/platform-users/:id/status
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be active or suspended.' });
        }

        const result = await pool.query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, status',
            [status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If suspended, optionally revoke sessions (out of scope for quick fix, but good practice)
        if (status === 'suspended') {
            await pool.query('UPDATE sessions SET is_active = false, revoked_at = NOW() WHERE user_id = $1', [id]);
        }

        res.json({ message: 'User status updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Update User Status Error:', error);
        res.status(500).json({ message: 'Failed to update user status' });
    }
};

// PUT /api/admin/platform-users/:id/password
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        let { newPassword } = req.body;

        // Auto-generate if not provided
        if (!newPassword) {
            newPassword = Math.random().toString(36).slice(-8);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email',
            [hashedPassword, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // In a real app, you'd email them the new password
        res.json({ 
            message: 'User password reset successfully', 
            email: result.rows[0].email,
            generatedPassword: newPassword // Returning it so admin can see/copy it
        });
    } catch (error) {
        console.error('Reset User Password Error:', error);
        res.status(500).json({ message: 'Failed to reset user password' });
    }
};

// DELETE /api/admin/platform-users/:id
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // This will cascade delete most things due to ON DELETE CASCADE constraints
        // like organization_members, projects created, etc.
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        // Handle constraint violations manually if ON DELETE CASCADE isn't everywhere
        if (error.code === '23503') { 
            return res.status(400).json({ message: 'Cannot delete user because they are linked to other critical system data.' });
        }
        res.status(500).json({ message: 'Failed to delete user' });
    }
};
