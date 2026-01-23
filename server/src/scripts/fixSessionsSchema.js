const { pool } = require('../database');

async function fixSessionsSchema() {
    try {
        console.log('--- Fixing Sessions Table Schema ---');

        // 1. Drop existing sessions table
        console.log('Dropping existing sessions table...');
        await pool.query('DROP TABLE IF EXISTS sessions CASCADE');

        // 2. Recreate with UUID
        console.log('Recreating sessions table with UUID...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
                refresh_token_hash TEXT,
                
                -- Device Fingerprinting
                browser VARCHAR(50),
                browser_version VARCHAR(50),
                os VARCHAR(50),
                os_version VARCHAR(50),
                device_type VARCHAR(50),
                device_model VARCHAR(100),
                
                -- Network & Location
                ip_address VARCHAR(45),
                location_city VARCHAR(100),
                location_country VARCHAR(100),
                location_country_code VARCHAR(10),
                isp VARCHAR(100),
                
                -- Context
                login_method VARCHAR(50) DEFAULT 'local',
                user_agent_raw TEXT,
                
                -- Timestamps & Status
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                revoked_at TIMESTAMP,
                
                -- Constraints
                CONSTRAINT user_or_admin_check CHECK (
                    (user_id IS NOT NULL AND admin_id IS NULL) OR 
                    (user_id IS NULL AND admin_id IS NOT NULL)
                )
            );
            
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(refresh_token_hash);
        `);

        console.log('SUCCESS: Sessions table recreated with UUID.');
        process.exit(0);

    } catch (err) {
        console.error('FIX FAILURE:', err);
        process.exit(1);
    }
}

fixSessionsSchema();
