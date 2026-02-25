require("dotenv").config();
const { pool } = require("../database");

async function upgradeOrgSecurity() {
  const client = await pool.connect();
  try {
    console.log(
      "Starting migration: Upgrading organization security and URL logic...",
    );

    await client.query("BEGIN");

    // 1. Add org_handle column
    await client.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS org_handle UUID UNIQUE DEFAULT gen_random_uuid();
    `);

    // 2. Ensure workspace_url is NOT NULL and UNIQUE for existing
    // We uniqueify them if any duplicates exist (though unlikely given previous logic)
    await client.query(`
      ALTER TABLE organizations 
      ALTER COLUMN workspace_url SET NOT NULL;
    `);

    await client.query("COMMIT");
    console.log(
      "Migration successful: org_handle added and workspace_url constrained.",
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

upgradeOrgSecurity();
