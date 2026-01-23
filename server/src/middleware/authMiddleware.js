const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const protect = async (req, res, next) => {
    // Check for either user token or admin token
    const token = req.cookies.token || req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check Session Revocation
        if (decoded.sessionId) {
            const sessionCheck = await pool.query(
                'SELECT is_active FROM sessions WHERE id = $1', 
                [decoded.sessionId]
            );
            
            if (sessionCheck.rows.length === 0 || !sessionCheck.rows[0].is_active) {
                // Session revoked or not found
                res.clearCookie('token');
                res.clearCookie('admin_token');
                return res.status(401).json({ message: 'Session expired or revoked' });
            }
            
             // Async update last_active without blocking
             pool.query('UPDATE sessions SET last_active = NOW() WHERE id = $1', [decoded.sessionId]).catch(()=>{});
        }

        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = { protect };
