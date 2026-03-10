const { pool } = require("../../../database");

const addCategoryToProjects = async () => {
  try {
    console.log("Adding 'category' column to 'projects' table...");

    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
    `);

    console.log("'category' column added successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error adding category column:", err);
    process.exit(1);
  }
};

addCategoryToProjects();
