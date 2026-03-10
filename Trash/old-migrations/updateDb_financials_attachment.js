const { pool } = require("../../../database");

const updateDb = async () => {
  try {
    console.log("Adding file_asset_id to project_expenses...");
    await pool.query(`
      ALTER TABLE project_expenses 
      ADD COLUMN IF NOT EXISTS file_asset_id INTEGER REFERENCES file_assets(file_asset_id) ON DELETE SET NULL;
    `);
    console.log("Successfully added file_asset_id.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

updateDb();
