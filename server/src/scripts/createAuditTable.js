const { pool } = require('../database');

const createAuditTable = async () => {
  try {
    console.log('Creating audit_logs table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        action VARCHAR(255),
        description TEXT,
        ip_address VARCHAR(45),
        status VARCHAR(20),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    `);

    console.log('Audit logs table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating audit logs table:', err);
    process.exit(1);
  }
};

createAuditTable();
