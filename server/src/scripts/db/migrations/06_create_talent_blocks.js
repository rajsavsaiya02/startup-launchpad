require("dotenv").config();
const { pool } = require("../../../database");

const runMigration = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Running migration 06: talent_blocks and user status...");

    // 1. Add status column to users if it doesn't exist
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
    `);
    console.log("Added status column to users table");

    // 2. Create talent_blocked_organizations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS talent_blocked_organizations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, organization_id)
      );
    `);
    console.log("Created table: talent_blocked_organizations");

    // 3. Add deleted state to organization_talent_messages for orgs deleting chats
    await client.query(`
      ALTER TABLE organization_talent_messages
      ADD COLUMN IF NOT EXISTS is_deleted_by_org BOOLEAN DEFAULT FALSE;
    `);
    console.log(
      "Added is_deleted_by_org column to organization_talent_messages table",
    );

    await client.query("COMMIT");
    console.log("Migration 06 completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration 06 failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runMigration;
