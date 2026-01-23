const { pool } = require('../database');

const createFilesTable = async () => {
  try {
    console.log('Creating files table...');
    
    // Create ENUM for visibility if it doesn't exist
    // Note: PostgreSQL doesn't support IF NOT EXISTS for TYPE easily in one line, 
    // so we wrap in a block or just handle the error, but for simplicity in this script we'll just try to use text check constraint or create it.
    // Actually, using a CHECK constraint is often easier and more portable than a custom TYPE.
    
    await pool.query('DROP TABLE IF EXISTS files CASCADE');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        uploader_id INTEGER NOT NULL,
        uploader_type VARCHAR(20) NOT NULL, -- 'admin' or 'user'
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL UNIQUE,
        mime_type VARCHAR(100),
        size BIGINT,
        path TEXT NOT NULL,
        visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Files table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating files table:', err);
    process.exit(1);
  }
};

createFilesTable();
