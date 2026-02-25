const { pool } = require("../database");

async function addOrganizationTeams() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    console.log("Starting DB upgrade for Organization Teams...");

    // 1. Create organization_teams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_teams (
        team_id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        team_lead_member_id INTEGER REFERENCES organization_members(organization_member_id) ON DELETE SET NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Created 'organization_teams' table.");

    // 2. Add team_id to organization_members
    // We add it without dropping manager_member_id just in case,
    // though the new UI will rely primarily on team_id.
    const checkColumnQuery = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='organization_members' AND column_name='team_id';
    `);

    if (checkColumnQuery.rows.length === 0) {
      await client.query(`
        ALTER TABLE organization_members
        ADD COLUMN team_id INTEGER REFERENCES organization_teams(team_id) ON DELETE SET NULL;
      `);
      console.log("✅ Added 'team_id' to 'organization_members'.");
    } else {
      console.log("ℹ️ 'team_id' already exists in 'organization_members'.");
    }

    // 3. Add Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_org_teams_org ON organization_teams(organization_id);
      CREATE INDEX IF NOT EXISTS idx_org_members_team ON organization_members(team_id);
    `);
    console.log("✅ Created indexes for teams.");

    await client.query("COMMIT");
    console.log("🎉 Database upgrade complete.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Database upgrade failed:", error);
  } finally {
    client.release();
    pool.end();
  }
}

addOrganizationTeams();
