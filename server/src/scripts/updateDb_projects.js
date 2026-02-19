const { pool } = require("../database");

const updateDb_projects = async () => {
  try {
    console.log("Updating database with Project tables...");

    // Create Projects Table
    // Supports both user-owned (personal) and organization-owned projects
    // status: 'active', 'planning', 'completed', 'on_hold', 'archived'
    // priority: 'low', 'medium', 'high', 'critical'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        priority VARCHAR(50) DEFAULT 'medium',
        
        start_date TIMESTAMP,
        due_date TIMESTAMP,
        
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        
        -- Ownership (Polymorphic-ish or just separate FKs)
        -- For now, we'll use specific FKs ensuring one is set, or just loose ownership logic
        -- Let's stick to simple: owner_user_id for personal, owner_org_id (future)
        owner_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        owner_org_id INTEGER, -- Placeholder for future Organizations table
        
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Index for faster queries
      CREATE INDEX IF NOT EXISTS idx_projects_owner_user ON projects(owner_user_id);
    `);
    console.log("Projects table created or already exists.");

    // Create Project Members Table (for collaboration)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(project_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
    `);
    console.log("Project Members table created or already exists.");

    console.log("Database update complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating database:", err);
    process.exit(1);
  }
};

updateDb_projects();
