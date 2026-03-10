const { pool } = require("../../../database");

const migrate = async () => {
  try {
    console.log("Migrating: Adding preferences column to users table...");

    // Add preferences column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
    `);

    console.log("Migration complete: preferences column added.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
