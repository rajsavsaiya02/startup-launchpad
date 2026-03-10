const { pool } = require("../../../database/connection");

async function migrate() {
  try {
    console.log("Starting migration: update_branding_schema...");

    await pool.query(`
            ALTER TABLE system_settings 
            ADD COLUMN IF NOT EXISTS logo_url TEXT,
            ADD COLUMN IF NOT EXISTS favicon_url TEXT,
            ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7),
            ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7),
            ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7);
        `);

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
