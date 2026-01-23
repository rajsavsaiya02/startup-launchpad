const { pool } = require('../database');
const { createSession } = require('../services/sessionService');

async function debugSessionCreation() {
    try {
        console.log('--- Starting Session Debug ---');

        // 1. Check if root_admin exists
        const adminRes = await pool.query("SELECT * FROM admins WHERE username = 'root_admin'");
        if (adminRes.rows.length === 0) {
            console.error('CRITICAL: root_admin not found. Please run initDb.js');
            process.exit(1);
        }
        const admin = adminRes.rows[0];
        console.log(`Found Admin: ID=${admin.id}, Username=${admin.username}`);

        // 2. Mock Request Object
        const mockReq = {
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            ip: '127.0.0.1',
            connection: { remoteAddress: '127.0.0.1' }
        };

        // 3. Attempt Session Creation
        console.log('Attempting to create session...');
        const sessionId = await createSession(admin.id, true, mockReq);
        console.log('SUCCESS: Session created. ID:', sessionId);

        // 4. Verify Session in DB
        const sessionRes = await pool.query("SELECT * FROM sessions WHERE id = $1", [sessionId]);
        if (sessionRes.rows.length > 0) {
            console.log('VERIFIED: Session found in database.');
            console.log('Session Data:', sessionRes.rows[0]);
        } else {
            console.error('FAILURE: Session ID returned but record not found in DB.');
        }

    } catch (err) {
        console.error('DEBUG FAILURE:', err);
    } finally {
        await pool.end();
    }
}

debugSessionCreation();
