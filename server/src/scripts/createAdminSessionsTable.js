const { pool } = require('../database');

const createAdminSessionsTable = async () => {
    try {
        console.log('Creating admin_sessions table...');

        const query = `
            CREATE TABLE IF NOT EXISTS admin_login_history (
                id SERIAL PRIMARY KEY,
                admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
                ip_address VARCHAR(45),
                user_agent TEXT,
                device_name VARCHAR(100),
                location VARCHAR(100),
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            );
        `;

        await pool.query(query);
        console.log('admin_login_history table created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
};

createAdminSessionsTable();
