const { pool } = require("../database");

const migratePublicProfile = async () => {
  try {
    console.log(
      "Starting migration: Add public_profile column to users table...",
    );

    // check if column already exists
    const checkRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='public_profile';
    `);

    if (checkRes.rows.length > 0) {
      console.log("Column public_profile already exists. Skipping...");
    } else {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN public_profile JSONB DEFAULT '{}';
      `);
      console.log("Successfully added public_profile column.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migratePublicProfile();
