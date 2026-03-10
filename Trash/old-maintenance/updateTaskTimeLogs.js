const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const { pool } = require("../../../database");

const updateTaskTimeLogs = async () => {
  try {
    console.log(
      "Connecting to the database to add time_logs to tasks table...",
    );

    // Add new column to tasks table to store detailed timer sessions
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS time_logs JSONB DEFAULT '[]'::JSONB;
    `);

    console.log(
      "✅ Tasks table updated successfully with time_logs JSONB array.",
    );
  } catch (err) {
    console.error("❌ Error updating task tables:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

updateTaskTimeLogs();
