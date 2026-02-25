require("dotenv").config();
const { pool } = require("../database");

async function fixOrgSecurityDefaults() {
  const client = await pool.connect();
  try {
    console.log(
      "Starting migration: Fixing security_code_updated_at defaults...",
    );

    await client.query("BEGIN");

    // 1. Remove the default value from the column
    await client.query(`
      ALTER TABLE organizations 
      ALTER COLUMN security_code_updated_at DROP DEFAULT;
    `);

    // 2. Set existing values to NULL so they don't trigger the 7-day block
    // We assume that if it was set via the previous migration's DEFAULT NOW(),
    // it shouldn't block deletion.
    await client.query(`
      UPDATE organizations 
      SET security_code_updated_at = NULL;
    `);

    await client.query("COMMIT");
    console.log("Migration successful: security_code_updated_at corrected.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

fixOrgSecurityDefaults();
