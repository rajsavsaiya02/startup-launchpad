require("dotenv").config();
const { pool } = require("../../../database");

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Starting migration...");

    // 1. Create organization_departments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_departments (
          department_id SERIAL PRIMARY KEY,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(organization_id, name)
      );
    `);
    console.log("Created organization_departments table");

    // 2. Insert distinct departments from existing designations
    await client.query(`
      INSERT INTO organization_departments (organization_id, name)
      SELECT DISTINCT organization_id, department
      FROM organization_designations
      WHERE department IS NOT NULL AND department != ''
      ON CONFLICT (organization_id, name) DO NOTHING;
    `);
    console.log("Inserted distinct departments");

    // 3. Add department_id to organization_designations if it doesn't exist
    await client.query(`
      ALTER TABLE organization_designations
      ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES organization_departments(department_id) ON DELETE SET NULL;
    `);
    console.log("Added department_id column");

    // 4. Update department_id based on old string
    await client.query(`
      UPDATE organization_designations od
      SET department_id = d.department_id
      FROM organization_departments d
      WHERE od.organization_id = d.organization_id AND od.department = d.name;
    `);
    console.log("Mapped department_id");

    // 5. Drop old department column
    await client.query(`
      ALTER TABLE organization_designations DROP COLUMN IF EXISTS department;
    `);
    console.log("Dropped old department column");

    await client.query("COMMIT");
    console.log("Migration successful!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    process.exit(0);
  }
};

migrate();
