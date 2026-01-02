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

    console.log('Database initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDb();
