require("dotenv").config();
const { pool } = require("../../../database");
const crypto = require("crypto");

const updateDatabase = async () => {
  try {
    console.log("Updating Organizations table with workspace fields...");

    // 1. Add columns
    await pool.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS workspace_url VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS join_code VARCHAR(100) UNIQUE,
      ADD COLUMN IF NOT EXISTS security_code_hash VARCHAR(255);
    `);

    // 2. Backfill existing orgs
    const orgs = await pool.query(
      "SELECT organization_id, name FROM organizations WHERE join_code IS NULL",
    );

    for (let org of orgs.rows) {
      const joinCode = crypto.randomBytes(4).toString("hex"); // 8 char hex

      // Generate a safe URL slug
      let urlSlug = org.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (!urlSlug) urlSlug = "org";
      urlSlug = urlSlug + "-" + crypto.randomBytes(2).toString("hex");

      await pool.query(
        "UPDATE organizations SET join_code = $1, workspace_url = $2 WHERE organization_id = $3",
        [joinCode, urlSlug, org.organization_id],
      );
    }

    console.log("✅ Organizations table updated with workspace fields.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating database schema:", error);
    process.exit(1);
  }
};

updateDatabase();
