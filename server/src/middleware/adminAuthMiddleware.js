const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const verifyAdminToken = async (req, res, next) => {
    const token = req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated as admin' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Strict check: Ensure token has role 'admin' or 'super_admin'
        if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied: Not an admin token' });
        }
        
        // Check Session Revocation
        if (decoded.sessionId) {
            const sessionCheck = await pool.query(
                'SELECT is_active FROM sessions WHERE id = $1', 
                [decoded.sessionId]
            );
            
            if (sessionCheck.rows.length === 0 || !sessionCheck.rows[0].is_active) {
                res.clearCookie('token');
                res.clearCookie('admin_token');
                return res.status(401).json({ message: 'Session expired or revoked' });
            }
            
             // Async update last_active
             pool.query('UPDATE sessions SET last_active = NOW() WHERE id = $1', [decoded.sessionId]).catch(()=>{});
        }

        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid admin token' });
    }
};

const requireSuperAdmin = (req, res, next) => {
    if (req.admin && req.admin.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Super Admin only' });
    }
};

module.exports = { verifyAdminToken, requireSuperAdmin };
