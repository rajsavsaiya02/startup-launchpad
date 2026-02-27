const { pool } = require("../database");

const createInvitationsTable = async () => {
  try {
    console.log("Creating organization_invitations table...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_invitations (
        invitation_id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        invitation_code VARCHAR(64) UNIQUE NOT NULL,
        security_code_hash TEXT NOT NULL,
        email VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP,
        used_by INTEGER REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_org_invitations_code ON organization_invitations(invitation_code);
      CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(organization_id);
    `);

    console.log("organization_invitations table created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error creating organization_invitations table:", err);
    process.exit(1);
  }
};

createInvitationsTable();
