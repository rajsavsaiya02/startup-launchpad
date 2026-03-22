const { pool } = require("../database");

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Adding compliance_fields to fin_config_profile...");
    await client.query(`
      ALTER TABLE fin_config_profile 
      ADD COLUMN IF NOT EXISTS compliance_fields JSONB DEFAULT '[]'::jsonb;
    `);

    console.log("Creating fin_coa_classification table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS fin_coa_classification (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        root_type VARCHAR(50) NOT NULL CHECK (root_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Adding classification_id to fin_coa_category...");
    // Check if classification_id exists
    const checkCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='fin_coa_category' AND column_name='classification_id';
    `);

    if (checkCol.rowCount === 0) {
      // Create default classifications for existing categories
      await client.query(`
        ALTER TABLE fin_coa_category 
        ADD COLUMN classification_id INTEGER REFERENCES fin_coa_classification(id) ON DELETE RESTRICT;
      `);

      // Populate default classifications based on distinct types existing
      const existingTypesQuery = await client.query(`SELECT DISTINCT type FROM fin_coa_category`);
      const existingTypes = existingTypesQuery.rows.map(r => r.type);
      
      for (const t of existingTypes) {
        // Create a root classification for each existing type
        const clsRes = await client.query(`
          INSERT INTO fin_coa_classification (organization_id, name, root_type, is_system)
          VALUES (NULL, $1, $1, true)
          RETURNING id;
        `, [t]);
        const clsId = clsRes.rows[0].id;
        
        // Update existing categories to point to this classification
        await client.query(`
          UPDATE fin_coa_category SET classification_id = $1 WHERE type = $2
        `, [clsId, t]);
      }
      
      // Now drop the check constraint on type from fin_coa_category, and maybe drop the type column
      // We will keep type to not break existing code, or just let classification handle it
      // Let's drop CHECK constraint so we can use classification_id safely
      await client.query(`
        ALTER TABLE fin_coa_category DROP CONSTRAINT IF EXISTS fin_coa_category_type_check;
      `);

      // Ensure General Category exists per organization or globally
      const genCat = await client.query(`SELECT id FROM fin_coa_category WHERE name = 'General' AND organization_id IS NULL AND is_system = true`);
      if (genCat.rowCount === 0) {
        // Need a general classification first
        const genCls = await client.query(`
          INSERT INTO fin_coa_classification (organization_id, name, root_type, is_system)
          VALUES (NULL, 'General Operating', 'EXPENSE', true)
          RETURNING id;
        `);
        
        await client.query(`
          INSERT INTO fin_coa_category (organization_id, name, type, is_system, classification_id)
          VALUES (NULL, 'General', 'EXPENSE', true, $1)
        `, [genCls.rows[0].id]);
      }
    }

    await client.query("COMMIT");
    console.log("Migration successful!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
  }
}

migrate().then(() => process.exit(0)).catch(() => process.exit(1));
