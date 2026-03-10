const { pool } = require("../../../database");

const addOrgPublicProfile = async () => {
  try {
    console.log("Updating organizations table...");

    await pool.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS public_profile JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS brief_description TEXT;
    `);

    console.log(
      "Successfully added public_profile and brief_description to organizations.",
    );
    process.exit(0);
  } catch (err) {
    console.error("Error updating organizations schema:", err);
    process.exit(1);
  }
};

addOrgPublicProfile();
