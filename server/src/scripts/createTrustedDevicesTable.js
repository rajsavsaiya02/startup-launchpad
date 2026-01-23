const { pool } = require('../database');

const createTrustedDevicesTable = async () => {
  try {
    console.log('Creating trusted_devices table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS trusted_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        device_hash VARCHAR(255) NOT NULL,
        device_name VARCHAR(255),
        trusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_owner CHECK ( (user_id IS NOT NULL AND admin_id IS NULL) OR (user_id IS NULL AND admin_id IS NOT NULL) ),
        CONSTRAINT uniq_user_device UNIQUE (user_id, device_hash),
        CONSTRAINT uniq_admin_device UNIQUE (admin_id, device_hash)
      );
    `);

    console.log('trusted_devices table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating trusted_devices table:', err);
    process.exit(1);
  }
};

createTrustedDevicesTable();
