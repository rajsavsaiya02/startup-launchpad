const { Pool } = require("pg");
require("dotenv").config({ path: __dirname + "/../../.env" });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addPaymentModesColumn() {
  try {
    console.log("Adding payment_modes column to project_expenses...");
    await pool.query(`
      ALTER TABLE project_expenses
      ADD COLUMN IF NOT EXISTS payment_modes JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("Successfully added payment_modes column.");
  } catch (error) {
    console.error("Error updating project_expenses table:", error);
  } finally {
    pool.end();
  }
}

addPaymentModesColumn();
