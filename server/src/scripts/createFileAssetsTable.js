const { pool } = require("../database");

const createFileAssetsTable = async () => {
  try {
    console.log("Creating file_assets table...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_assets (
          file_asset_id SERIAL PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100),
          size_bytes BIGINT,
          storage_url TEXT NOT NULL,          -- Either local relative path (e.g. '/FileAssets/project/...'), or external link
          is_external BOOLEAN DEFAULT FALSE,  -- Distinguishes external links from locally hosted files
          context_type VARCHAR(50) NOT NULL,  -- e.g., 'project', 'task', 'gig', 'transaction'
          context_id INTEGER NOT NULL,        -- ID of the related entity
          uploader_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          organization_id INTEGER,            -- Captures multi-tenant isolation
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_file_assets_context ON file_assets(context_type, context_id);
    `);

    console.log("file_assets table created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error creating file_assets table:", err);
    process.exit(1);
  }
};

createFileAssetsTable();
