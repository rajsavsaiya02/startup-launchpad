const { pool } = require("../../../database");

const addUsersProfileFields = async () => {
  try {
    console.log("Adding profile fields to users table...");

    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS office_location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS social_github VARCHAR(255),
      ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR(255),
      ADD COLUMN IF NOT EXISTS social_website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
      ADD COLUMN IF NOT EXISTS department VARCHAR(100),
      ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS skills TEXT[]
    `);

    console.log("Profile fields added to users table successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error adding profile fields:", err);
    process.exit(1);
  }
};

addUsersProfileFields();
