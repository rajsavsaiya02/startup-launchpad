const { pool } = require("../database");

const updateDb_financials_brief = async () => {
  try {
    console.log("Adding brief column to project_expenses...");

    await pool.query(`
      ALTER TABLE project_expenses 
      ADD COLUMN IF NOT EXISTS brief TEXT;
    `);

    console.log("Brief column ensured on project_expenses table.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating project_expenses table:", err);
    process.exit(1);
  }
};

updateDb_financials_brief();
