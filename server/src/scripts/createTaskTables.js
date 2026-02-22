const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { pool } = require("../database");

const createTaskTables = async () => {
  try {
    console.log("Connecting to the database...");

    // 1. Create Tasks Table
    // kanban_status: 'todo', 'in_progress', 'done', etc.
    // priority: 'Low', 'Medium', 'High'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        organization_id INTEGER, -- For multi-tenancy as seen in other tables
        parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        kanban_status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'Medium',
        due_date TIMESTAMP,
        is_milestone BOOLEAN DEFAULT FALSE,
        health_score_ai DECIMAL DEFAULT 100,
        subtasks JSONB DEFAULT '[]'::JSONB,
        assigned_member_id INTEGER, -- Placeholder for OrganizationMembers link
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_kanban_status ON tasks(kanban_status);
    `);

    // 2. Create Task Assignees Table (Many-to-Many)
    // Even though ERD shows assigned_member_id, we keep many-to-many for flexibility
    // and can use assigned_member_id for the 'primary' assignee.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_assignees (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(task_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON task_assignees(task_id);
    `);

    // 3. Create Task Association Table (as seen in ERD)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_associations (
        id SERIAL PRIMARY KEY,
        source_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        target_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        association_type VARCHAR(50), -- e.g., 'blocks', 'related_to'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tasks and Task Assignees tables created successfully.");
  } catch (err) {
    console.error("❌ Error creating task tables:", err);
    process.exit(1);
  } finally {
    console.log("Database connection cleanup...");
    process.exit(0);
  }
};

createTaskTables();
