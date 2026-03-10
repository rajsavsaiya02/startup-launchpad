const { pool } = require("../../../database");

async function migrate() {
  try {
    console.log("Running migration...");
    await pool.query(`
            ALTER TABLE system_settings 
            ADD COLUMN IF NOT EXISTS navigation_menu JSONB DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS homepage_slug VARCHAR(255) DEFAULT NULL;
        `);
    console.log("Migration successful");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
