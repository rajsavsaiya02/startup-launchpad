const { pool } = require("../../../database");

const splitUserName = async () => {
  try {
    console.log("Adding first_name and last_name columns to users table...");

    // 1. Add columns
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)
    `);
    console.log("Columns added.");

    // 2. Backfill existing users
    const res = await pool.query("SELECT id, name FROM users");
    const users = res.rows;
    console.log(`Found ${users.length} users to process.`);

    for (const user of users) {
      if (user.name) {
        const parts = user.name.trim().split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(" ") || "";

        await pool.query(
          "UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3",
          [firstName, lastName, user.id],
        );
        console.log(`Updated user ${user.id}: ${firstName} ${lastName}`);
      }
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

splitUserName();
