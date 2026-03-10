const { pool } = require("../../../database");

async function migrateOpportunities() {
  try {
    await pool.query(`
            ALTER TABLE opportunities 
            ADD COLUMN IF NOT EXISTS media_urls TEXT[],
            ADD COLUMN IF NOT EXISTS external_links TEXT[];
        `);
    console.log(
      "Successfully added media_urls and external_links to opportunities table.",
    );
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit();
  }
}

migrateOpportunities();
