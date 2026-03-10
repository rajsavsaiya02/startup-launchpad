const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const { pool } = require("../../../database");

const fixTimerTimezone = async () => {
  try {
    console.log(
      "Connecting to the database to fix timer_started_at timezone...",
    );

    await pool.query(`
      ALTER TABLE tasks 
      ALTER COLUMN timer_started_at TYPE TIMESTAMP WITH TIME ZONE
      USING timer_started_at AT TIME ZONE 'UTC';
    `);

    console.log("✅ Fixed timer_started_at timezone.");
  } catch (err) {
    console.error("❌ Error fixing timezone:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

fixTimerTimezone();
