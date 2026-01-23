const { pool } = require('../database');

async function debugEnvAndSchema() {
    try {
        console.log('--- Environment & Schema Debug ---');
        console.log('NODE_ENV:', process.env.NODE_ENV);

        // Check Sessions Table Schema
        const schemaRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sessions' AND column_name = 'id'
        `);
        
        if (schemaRes.rows.length > 0) {
            console.log('Sessions ID Type:', schemaRes.rows[0].data_type);
        } else {
            console.error('Sessions table not found in information_schema!');
        }

    } catch (err) {
        console.error('DEBUG FAILURE:', err);
    } finally {
        await pool.end();
    }
}

debugEnvAndSchema();
