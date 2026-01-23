const { pool } = require('../database');

let cachedSettings = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

exports.getSystemSettings = async () => {
    // Simple in-memory cache to reduce DB load on high-traffic middleware
    if (cachedSettings && (Date.now() - lastFetch < CACHE_TTL)) {
        return cachedSettings;
    }

    try {
        const result = await pool.query('SELECT * FROM system_settings WHERE id = 1');
        if (result.rows.length > 0) {
            cachedSettings = result.rows[0];
            lastFetch = Date.now();
            return cachedSettings;
        }
        return {}; // Should not happen if initialized correctly
    } catch (err) {
        console.error("Error fetching system settings:", err);
        return cachedSettings || {}; // Return stale if available
    }
};

exports.invalidateCache = () => {
    cachedSettings = null;
};
