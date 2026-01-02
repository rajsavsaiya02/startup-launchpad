const logger = require('../utils/logger');
const db = require('../database');

exports.checkHealth = async (req, res) => {
    let dbStatus = 'disconnected';
    let timestamp = null;

    try {
        const result = await db.query('SELECT NOW()');
        dbStatus = 'connected';
        timestamp = result.rows[0].now;
    } catch (error) {
        logger.error('Health check DB connection failed: ' + error.message);
    }

    res.status(200).json({
        status: 'success',
        server: 'running',
        database: dbStatus,
        timestamp: timestamp || new Date(),
    });
};
