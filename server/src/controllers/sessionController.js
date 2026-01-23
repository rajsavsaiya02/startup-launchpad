const { pool } = require('../database');
const { parseUserAgent } = require('../utils/deviceDetector');
const { generateDeviceHash } = require('../services/sessionService');

exports.getActiveSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const isAdmin = role === 'admin';
        
        // Query sessions
        const query = `
            SELECT id, 
                   browser, os, device_type, device_model, 
                   ip_address, location_city, location_country,
                   last_active, created_at, is_active,
                   browser_version, os_version, expires_at
            FROM sessions 
            WHERE ${isAdmin ? 'admin_id' : 'user_id'} = $1 
            AND is_active = TRUE
            ORDER BY last_active DESC
        `;
        
        const result = await pool.query(query, [userId]);
        
        // Fetch Trusted Devices
        const trustQuery = `
            SELECT device_hash FROM trusted_devices 
            WHERE ${isAdmin ? 'admin_id' : 'user_id'} = $1
            AND expires_at > NOW()
        `;
        const trustedResult = await pool.query(trustQuery, [userId]);
        const trustedHashes = new Set(trustedResult.rows.map(r => r.device_hash));
        
        const currentSessionId = req.user.sessionId;
        
        const sessions = result.rows.map(s => {
            // Reconstruct Hash to match Trust
            const deviceObj = {
                browser: s.browser,
                os: s.os,
                device_type: s.device_type,
                device_model: s.device_model
            };
            const hash = generateDeviceHash(deviceObj);
            const isTrusted = trustedHashes.has(hash);

            return {
                ...s,
                isCurrent: s.id === currentSessionId,
                is_trusted: isTrusted,
                // If not trusted and enforced role (frontend knows role), UI shows red.
                // We can also pass expiry info differently if needed.
            };
        });
        
        res.json({ sessions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.revokeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const role = req.user.role;
        const isAdmin = role === 'admin';

        // Check ownership
        const ownershipQuery = `
            SELECT id FROM sessions 
            WHERE id = $1 AND ${isAdmin ? 'admin_id' : 'user_id'} = $2
        `;
        const ownershipCheck = await pool.query(ownershipQuery, [sessionId, userId]);
        
        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found or access denied' });
        }

        // Revoke
        await pool.query(
            'UPDATE sessions SET is_active = FALSE, revoked_at = NOW() WHERE id = $1', 
            [sessionId]
        );

        res.json({ message: 'Session revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.revokeAllOtherSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const isAdmin = role === 'admin';
        const currentSessionId = req.user.sessionId; // Need to ensure this is available!

        if (!currentSessionId) {
             return res.status(400).json({ message: 'Current session ID not found' });
        }

        const query = `
            UPDATE sessions 
            SET is_active = FALSE, revoked_at = NOW() 
            WHERE ${isAdmin ? 'admin_id' : 'user_id'} = $1 
            AND id != $2 
            AND is_active = TRUE
        `;
        
        await pool.query(query, [userId, currentSessionId]);

        res.json({ message: 'All other sessions revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
