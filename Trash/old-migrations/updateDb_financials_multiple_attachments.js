const { pool } = require("../../../database");

const updateDb = async () => {
  try {
    console.log("Creating expense_attachments table...");

    // Create the mapping table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expense_attachments (
        expense_id INTEGER REFERENCES project_expenses(id) ON DELETE CASCADE,
        file_asset_id INTEGER REFERENCES file_assets(file_asset_id) ON DELETE CASCADE,
        PRIMARY KEY (expense_id, file_asset_id)
      );
    `);

    // Make sure we migrate any existing data from the old column, if it exists
    try {
      console.log("Migrating existing single attachments...");
      await pool.query(`
         INSERT INTO expense_attachments (expense_id, file_asset_id)
         SELECT id, file_asset_id 
         FROM project_expenses 
         WHERE file_asset_id IS NOT NULL
         ON CONFLICT DO NOTHING;
       `);

      console.log("Dropping old file_asset_id column from project_expenses...");
      await pool.query(`
         ALTER TABLE project_expenses DROP COLUMN file_asset_id;
       `);
    } catch (e) {
      console.log(
        "Column file_asset_id doesn't exist or already dropped. Skipping column drop.",
      );
    }

    console.log("Successfully updated DB for multiple attachments.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

updateDb();
