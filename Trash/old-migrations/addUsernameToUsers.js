const { pool } = require("../../../database");
const crypto = require("crypto");

const addUsernameToUsers = async () => {
  try {
    console.log("Adding username field to users table...");

    // 1. Add username column (nullable first to allow backfill)
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE
    `);
    console.log("Username column added.");

    // 2. Backfill existing users
    const res = await pool.query(
      "SELECT id, email, name FROM users WHERE username IS NULL",
    );
    const users = res.rows;

    console.log(`Found ${users.length} users to backfill.`);

    for (const user of users) {
      // Generate unique username: user_ + random hex
      // e.g. user_a1b2c3d4
      const randomSuffix = crypto.randomBytes(4).toString("hex");
      const username = `user_${randomSuffix}`; // fallback if name is empty

      await pool.query("UPDATE users SET username = $1 WHERE id = $2", [
        username,
        user.id,
      ]);
      console.log(`Updated user ${user.id} with username: ${username}`);
    }

    // 3. Make username NOT NULL (optional, but good practice if we want to enforce it)
    // await pool.query('ALTER TABLE users ALTER COLUMN username SET NOT NULL');

    console.log("Username migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error adding username field:", err);
    process.exit(1);
  }
};

addUsernameToUsers();
