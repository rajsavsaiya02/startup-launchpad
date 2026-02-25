require("dotenv").config();
const { pool } = require("../database");

async function addOrgSecurityFields() {
  const client = await pool.connect();
  try {
    console.log(
      "Starting migration: Add security_code_updated_at to organizations...",
    );

    await client.query(`
            ALTER TABLE organizations 
            ADD COLUMN IF NOT EXISTS security_code_updated_at TIMESTAMP DEFAULT NOW();
        `);

    console.log("Migration successful: security_code_updated_at added.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

addOrgSecurityFields();
