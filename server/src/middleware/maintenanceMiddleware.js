const { getSystemSettings } = require('../services/systemSettingsService');
const jwt = require('jsonwebtoken');

const maintenanceMiddleware = async (req, res, next) => {
    try {
        const settings = await getSystemSettings();
        if (!settings.maintenance_mode) {
            return next();
        }

        // Allow essential routes
        const allowedPaths = [
            '/api/auth/login', 
            '/api/auth/admin-login', 
            '/api/auth/logout',
            '/api/settings', // Needed for public to see it's in maintenance? Or admin to turn off
            '/favicon.svg'
        ];
        
        if (allowedPaths.some(path => req.path.startsWith(path))) {
            return next();
        }

        // Check if user is admin
        const token = req.cookies.admin_token || req.cookies.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.role === 'admin' || decoded.role === 'super_admin') {
                    return next();
                }
            } catch (err) {
                // Token invalid
            }
        }

        return res.status(503).json({ 
            message: 'System is currently under maintenance. Please try again later.',
            maintenance: true 
        });

    } catch (err) {
        console.error('Maintenance middleware error:', err);
        next();
    }
};

module.exports = maintenanceMiddleware;
