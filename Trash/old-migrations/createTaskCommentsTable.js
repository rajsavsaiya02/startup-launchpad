const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const { pool } = require("../../../database");

const createTaskCommentsTable = async () => {
  try {
    console.log("Connecting to the database...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id);
    `);

    console.log("✅ task_comments table created successfully.");
  } catch (err) {
    console.error("❌ Error creating task_comments table:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

createTaskCommentsTable();
