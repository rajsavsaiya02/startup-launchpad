const { pool } = require("../database");

const createProjectActivitiesTable = async () => {
  try {
    console.log("Connecting to the database...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_activities (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_project_activities_project ON project_activities(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON project_activities(created_at);
    `);

    console.log("✅ project_activities table created successfully.");
  } catch (err) {
    console.error("❌ Error creating project_activities table:", err);
  } finally {
    pool.end();
    console.log("Database connection closed.");
  }
};

createProjectActivitiesTable();
