require("dotenv").config();
const { pool } = require("../../../database");

const runMigration = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Running migration 05: create_shortlist_tables...");

    // 1. organization_shortlisted_talent
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_shortlisted_talent (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id, user_id)
      );
    `);
    console.log("Created table: organization_shortlisted_talent");

    // 2. organization_talent_messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_talent_messages (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created table: organization_talent_messages");

    await client.query("COMMIT");
    console.log("Migration 05 completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration 05 failed:", error);
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
