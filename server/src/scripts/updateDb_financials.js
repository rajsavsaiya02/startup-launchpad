const { pool } = require("../database");

const updateDb_financials = async () => {
  try {
    console.log("Updating database for Project Financials...");

    // 1. Add budget column to projects table if it doesn't exist
    await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='projects' AND column_name='budget'
                ) THEN 
                    ALTER TABLE projects ADD COLUMN budget DECIMAL(15, 2) DEFAULT 0.00;
                END IF; 
            END $$;
        `);
    console.log("Budget column ensured on projects table.");

    // 2. Create project_expenses table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS project_expenses (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                description VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                vendor_name VARCHAR(255),
                expense_date TIMESTAMP NOT NULL,
                amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_project_expenses_project_id ON project_expenses(project_id);
            CREATE INDEX IF NOT EXISTS idx_project_expenses_date ON project_expenses(expense_date);
            CREATE INDEX IF NOT EXISTS idx_project_expenses_category ON project_expenses(category);
            CREATE INDEX IF NOT EXISTS idx_project_expenses_status ON project_expenses(status);
        `);
    console.log("Project Expenses table created or already exists.");

    console.log("Database update complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating database:", err);
    process.exit(1);
  }
};

updateDb_financials();
