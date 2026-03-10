const { pool } = require("../../database/index.js");
async function check() {
  const res = await pool.query(
    "SELECT id, time_spent, timer_started_at, time_logs FROM tasks ORDER BY updated_at DESC LIMIT 1",
  );
  console.log(res.rows[0]);
  console.log(typeof res.rows[0].time_logs);
  console.log(Array.isArray(res.rows[0].time_logs));
  process.exit(0);
}
check();
