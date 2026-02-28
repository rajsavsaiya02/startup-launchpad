const { pool } = require("../database");

const updateDb_expenses_audit = async () => {
  try {
    console.log("Updating database for Expense Audit Tracking...");

    // 1. Add tracking columns if they don't exist
    await pool.query(`
            DO $$ 
            BEGIN 
                -- Add created_by_id
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='project_expenses' AND column_name='created_by_id'
                ) THEN 
                    ALTER TABLE project_expenses ADD COLUMN created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
                END IF; 

                -- Add updated_by_id
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='project_expenses' AND column_name='updated_by_id'
                ) THEN 
                    ALTER TABLE project_expenses ADD COLUMN updated_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
                END IF; 
            END $$;
        `);
    console.log(
      "Audit columns (created_by_id, updated_by_id) ensured on project_expenses table.",
    );

    console.log("Database update complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating database:", err);
    process.exit(1);
  }
};

updateDb_expenses_audit();
