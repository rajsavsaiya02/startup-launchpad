const { pool } = require("../database");

const migrate = async () => {
  try {
    console.log("Checking if description column exists in file_assets...");
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'file_assets' AND column_name = 'description'
    `);

    if (checkResult.rows.length === 0) {
      console.log("Adding description column to file_assets...");
      await pool.query(`
        ALTER TABLE file_assets ADD COLUMN description TEXT;
      `);
      console.log("Description column added successfully.");
    } else {
      console.log("Description column already exists.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
