const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const bcrypt = require("bcrypt");
const { pool } = require("../database");

const seedOrganization = async () => {
  try {
    console.log("Starting Organization Seeding process...");

    // 1. Read CSV File
    const csvFilePath = path.join(
      __dirname,
      "../../../docs/organization_accounts.csv",
    );
    const fileContent = fs
      .readFileSync(csvFilePath, "utf8")
      .replace(/\\n/g, "\n");

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Found ${records.length} records in CSV.`);

    // 2. Ensure "Acme Corp" exists or create it
    let orgId = null;
    const orgResult = await pool.query(
      "SELECT organization_id FROM organizations WHERE name = 'Acme Corp'",
    );

    if (orgResult.rows.length > 0) {
      orgId = orgResult.rows[0].organization_id;
      console.log(`Found existing organization Acme Corp with ID ${orgId}`);
    } else {
      console.log("Creating new organization Acme Corp...");
      // For simplicity, generating a random workspace URL
      const workspaceUrl = `acme-corp-${Date.now()}`;
      const newOrgResult = await pool.query(
        "INSERT INTO organizations (name, workspace_url) VALUES ($1, $2) RETURNING organization_id",
        ["Acme Corp", workspaceUrl],
      );
      orgId = newOrgResult.rows[0].organization_id;
    }

    // Process each record
    for (const record of records) {
      const { Email, Password, Name, Role, OrgRole, Department, Designation } =
        record;

      console.log(`Processing user: ${Email}...`);

      // 3. Ensure User Exists
      let userId = null;
      let userRes = await pool.query("SELECT id FROM users WHERE email = $1", [
        Email,
      ]);

      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
        console.log(`User ${Email} already exists with ID ${userId}`);
      } else {
        const passwordHash = await bcrypt.hash(Password, 10);
        // Split name into first and last
        const nameParts = Name.split(" ");
        const firstName = nameParts[0];
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        // Ensure username is unique
        const usernameBase = Email.split("@")[0];
        let username = usernameBase;
        let counter = 1;
        while (
          (
            await pool.query("SELECT id FROM users WHERE username = $1", [
              username,
            ])
          ).rows.length > 0
        ) {
          username = `${usernameBase}${counter}`;
          counter++;
        }

        const newUserRes = await pool.query(
          `INSERT INTO users (email, username, name, first_name, last_name, role, password_hash, is_verified, department, job_title) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9) RETURNING id`,
          [
            Email,
            username,
            Name,
            firstName,
            lastName,
            Role,
            passwordHash,
            Department,
            Designation,
          ],
        );
        userId = newUserRes.rows[0].id;
        console.log(`Created new user ${Email} with ID ${userId}`);
      }

      // 4. Ensure Designation Exists
      let designationId = null;
      if (Designation && Designation !== "") {
        const desigRes = await pool.query(
          "SELECT designation_id FROM organization_designations WHERE organization_id = $1 AND title = $2 AND department = $3",
          [orgId, Designation, Department],
        );

        if (desigRes.rows.length > 0) {
          designationId = desigRes.rows[0].designation_id;
        } else {
          const newDesigRes = await pool.query(
            "INSERT INTO organization_designations (organization_id, title, department) VALUES ($1, $2, $3) RETURNING designation_id",
            [orgId, Designation, Department],
          );
          designationId = newDesigRes.rows[0].designation_id;
        }
      }

      // 5. Ensure Organization Member Exists
      const memberRes = await pool.query(
        "SELECT organization_member_id FROM organization_members WHERE organization_id = $1 AND user_id = $2",
        [orgId, userId],
      );

      if (memberRes.rows.length === 0) {
        await pool.query(
          "INSERT INTO organization_members (organization_id, user_id, org_role, designation_id) VALUES ($1, $2, $3, $4)",
          [orgId, userId, OrgRole, designationId],
        );
        console.log(
          `Added user ${Email} to organization Acme Corp as ${OrgRole}`,
        );
      } else {
        // Update role just in case
        await pool.query(
          "UPDATE organization_members SET org_role = $1, designation_id = $2 WHERE organization_id = $3 AND user_id = $4",
          [OrgRole, designationId, orgId, userId],
        );
        console.log(
          `Updated user ${Email} in organization Acme Corp as ${OrgRole}`,
        );
      }
    }

    console.log("Seeding process completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding process:", error);
    process.exit(1);
  }
};

seedOrganization();
