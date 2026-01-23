const { pool } = require('../database');

const initDb = async () => {
  try {
    console.log('Initializing database...');

    // Create Users Table
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        provider VARCHAR(50),
        provider_id VARCHAR(255),
        avatar VARCHAR(500),
        role VARCHAR(20) DEFAULT 'normal_user' CHECK (role IN ('founder', 'freelancer', 'student', 'normal_user')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created or already exists.');

    // Create OTPs Table
    await pool.query('DROP TABLE IF EXISTS otps CASCADE');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        type VARCHAR(20) DEFAULT 'verification', -- verification, reset
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('OTPs table created or already exists.');

    // Create Admins Table
    await pool.query('DROP TABLE IF EXISTS admins CASCADE');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        avatar_url TEXT,
        department VARCHAR(100),
        bio TEXT,
        phone_number VARCHAR(20),
        job_title VARCHAR(100),
        employee_id VARCHAR(50),
        office_location VARCHAR(255),
        social_linkedin VARCHAR(255),
        social_github VARCHAR(255),
        social_website VARCHAR(255),
        two_factor_enabled BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('Admins table created or already exists.');

    console.log('Admins table created or already exists.');

    // Create Sessions Table
    await pool.query('DROP TABLE IF EXISTS sessions CASCADE');
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
    console.log('Sessions table created or already exists.');

    // Seed Root Admin
    const bcrypt = require('bcrypt');
    const rootAdminUsername = 'root_admin';
    const rootAdminPassword = '@Startup2026';

    // Check if root admin exists (though we dropped table above, good practice generally)
    const adminCheck = await pool.query('SELECT * FROM admins WHERE username = $1', [rootAdminUsername]);

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(rootAdminPassword, 10);
      await pool.query(
        "INSERT INTO admins (username, password_hash, role, status) VALUES ($1, $2, 'super_admin', 'active')",
        [rootAdminUsername, hashedPassword]
      );
      console.log('Root admin seeded successfully as super_admin.');
    }

    console.log('Database initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDb();
