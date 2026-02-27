const { pool } = require("../database");

const updateDatabase = async () => {
  try {
    console.log("Adding Organization tables to the database...");

    // 1. Create Organizations Table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS organizations (
                organization_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                timezone VARCHAR(100) DEFAULT 'UTC',
                status VARCHAR(50) DEFAULT 'active',
                subscription_plan_id INTEGER,
                logo_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    console.log("✅ Organizations table created/verified.");

    // 2. Create Organization Designations Table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS organization_designations (
                designation_id SERIAL PRIMARY KEY,
                organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
                title VARCHAR(100) NOT NULL,
                department VARCHAR(100),
                hierarchy_level INTEGER DEFAULT 0,
                base_salary_band VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_org_designations_org ON organization_designations(organization_id);
        `);
    console.log("✅ Organization Designations table created/verified.");

    // 3. Create Organization Members Table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS organization_members (
                organization_member_id SERIAL PRIMARY KEY,
                organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                is_active BOOLEAN DEFAULT TRUE,
                manager_member_id INTEGER REFERENCES organization_members(organization_member_id) ON DELETE SET NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                hourly_cost_rate NUMERIC(10, 2) DEFAULT 0.00,
                org_role VARCHAR(50) DEFAULT 'MEMBER' CHECK (org_role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN', 'MEMBER', 'GUEST')),
                designation_id INTEGER REFERENCES organization_designations(designation_id) ON DELETE SET NULL,
                UNIQUE(user_id) -- Ensures 1 user = 1 org
            );
            CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
            CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
        `);
    console.log("✅ Organization Members table created/verified.");

    console.log("Database update complete! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating database schema:", error);
    process.exit(1);
  }
};

updateDatabase();
