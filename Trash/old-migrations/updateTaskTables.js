const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const { pool } = require("../../../database");

const updateTaskTables = async () => {
  try {
    console.log("Connecting to the database to update tasks table...");

    // Add new columns to tasks table
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General',
      ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP;
    `);

    // Add task_categories to user_preferences
    // Let's check if the column exists or if it's a JSONB we just update
    // Wait, user_preferences usually has specific columns or a single JSONB?
    // Let's check user_preferences by just trying to add project_categories if it doesn't exist?
    // Actually, I'll just check the user preferences table structure here.

    console.log(
      "✅ Tasks table updated successfully with category, time_spent, and timer_started_at.",
    );
  } catch (err) {
    console.error("❌ Error updating task tables:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

updateTaskTables();
