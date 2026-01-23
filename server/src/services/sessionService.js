const crypto = require('crypto');
const { pool } = require('../database');
const emailService = require('./emailService');
const { parseUserAgent } = require('../utils/deviceDetector');
const { getLocationFromIp } = require('../utils/geoLocator');

// Helper to generate consistent device hash
const generateDeviceHash = (device) => {
    // Simple hash of key browser/os attributes
    const data = `${device.browser}|${device.os}|${device.device_type}|${device.device_model}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

exports.createSession = async (userId, isAdmin, req, userRole = null) => {
    const userAgentRaw = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    
    // Parse Device Info
    const device = parseUserAgent(userAgentRaw);
    const deviceHash = generateDeviceHash(device);

    // Determine Role for Security Rules
    let role = userRole;
    if (isAdmin) {
        role = 'admin';
    } else if (!role) {
        // Fetch if not provided
        const u = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (u.rows.length > 0) role = u.rows[0].role;
    }

    // Security Rules
    // Enforced: Admin, Founder, Employee
    // Exempt: Normal User, Freelancer, Student
    const enforcedRoles = ['admin', 'founder', 'employee'];
    const isEnforced = enforcedRoles.includes(role);

    // Check Trust Status
    let isTrusted = false;
    // Check trusted_devices table
    const trustQuery = `
        SELECT id FROM trusted_devices 
        WHERE ${isAdmin ? 'admin_id' : 'user_id'} = $1 
        AND device_hash = $2
        AND expires_at > NOW()
    `;
    const trustCheck = await pool.query(trustQuery, [userId, deviceHash]);
    if (trustCheck.rows.length > 0) {
        isTrusted = true;
        // Optionally update last_used_at
        await pool.query(
            `UPDATE trusted_devices SET last_used_at = NOW() WHERE id = $1`, 
            [trustCheck.rows[0].id]
        );
    }

    // Determine Expiry
    // If Enforced AND Not Trusted -> 24 Hours
    // Else (Trusted OR Exempt) -> 90 Days
    let expiryInterval = '90 days';
    if (isEnforced && !isTrusted) {
        expiryInterval = '24 hours';
    }

    // Resolve Location
    const locationInfo = await getLocationFromIp(ip);
    
    // Check for "New Device" logic (for alerts) - keep existing logic or use trust status?
    // Existing logic uses sessions table. Let's keep it for "New Login" alerts which are useful regardless of trust.
    const existingSessionQuery = `
        SELECT id FROM sessions 
        WHERE ${isAdmin ? 'admin_id' : 'user_id'} = $1 
        AND browser = $2 AND os = $3 AND device_type = $4
        LIMIT 1
    `;
    
    const existingSession = await pool.query(existingSessionQuery, [
        userId, 
        device.browser, 
        device.os, 
        device.device_type
    ]);

    const isNewDevice = existingSession.rows.length === 0;

    // Create Session Record
    const insertQuery = `
        INSERT INTO sessions (
            user_id, admin_id, 
            browser, browser_version, os, os_version, device_type, device_model,
            ip_address, location_city, location_country, location_country_code, isp,
            user_agent_raw, login_method,
            expires_at
        ) VALUES (
            $1, $2,
            $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13,
            $14, $15,
            NOW() + INTERVAL '${expiryInterval}'
        ) RETURNING id, created_at
    `;
    
    const newSessionResult = await pool.query(insertQuery, [
        isAdmin ? null : userId,
        isAdmin ? userId : null,
        device.browser, device.browser_version, device.os, device.os_version, device.device_type, device.device_model,
        ip, locationInfo.city, locationInfo.country, locationInfo.countryCode, locationInfo.isp,
        userAgentRaw, 'local', 
    ]);
    
    const sessionId = newSessionResult.rows[0].id;

    // Send Alert if New Device or Untrusted Enforced Login
    if (isNewDevice || (isEnforced && !isTrusted)) {
        // Fetch User Email
        let email = '';
        if (isAdmin) {
             // Admin email fetch logic if needed
        } else {
             const u = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
             if (u.rows.length > 0) email = u.rows[0].email;
        }

        if (email) {
            emailService.sendNewDeviceAlert(email, {
                deviceType: device.device_type,
                browser: device.browser,
                os: device.os,
                location: `${locationInfo.city}, ${locationInfo.country}`,
                time: new Date().toLocaleString(),
                isUntrusted: isEnforced && !isTrusted
            });
        }
    }

    return sessionId;
};

exports.generateDeviceHash = generateDeviceHash;
