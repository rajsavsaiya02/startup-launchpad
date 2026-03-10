require("dotenv").config();
const { pool } = require("../../../database");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

async function reseedFirstStartup() {
  const workspaceUrl = "firststartup";
  const csvPath = path.join(
    __dirname,
    "../../../docs/reference/organization_accounts.csv",
  );
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Find the organization ID
    const orgResult = await client.query(
      "SELECT organization_id FROM organizations WHERE workspace_url = $1",
      [workspaceUrl],
    );

    if (orgResult.rows.length === 0) {
      console.log(
        `❌ Organization with workspace URL '${workspaceUrl}' not found.`,
      );
      await client.query("ROLLBACK");
      process.exit(0);
    }

    const orgId = orgResult.rows[0].organization_id;
    console.log(`🔍 Found organization '${workspaceUrl}' with ID: ${orgId}`);

    // 2. Clear existing members for this org (CASCADE handles designations and departments)
    // Actually designations and departments are linked to org, let's clear them too.
    // CASCADE on organization_id should handle members, but let's be explicit within the org context.

    // Get all user IDs currently in this org to potential cleanup if they are ONLY in this org
    // But request says "remove this old record and re seed", usually implying users too.
    const memberUsers = await client.query(
      "SELECT user_id FROM organization_members WHERE organization_id = $1",
      [orgId],
    );
    const userIds = memberUsers.rows.map((r) => r.user_id);

    console.log(
      `🗑️ Removing ${userIds.length} existing members from FIRSTSTARTUP...`,
    );
    await client.query(
      "DELETE FROM organization_members WHERE organization_id = $1",
      [orgId],
    );

    // We don't delete users from the main 'users' table to avoid breaking global references if any,
    // but the task says "remove this old record", so for a clean seed we might want to update or re-use them.
    // Given the CSV has passwords, we'll create/update them.

    console.log(
      `🗑️ Clearing existing designations and departments for FIRSTSTARTUP...`,
    );
    await client.query(
      "DELETE FROM organization_designations WHERE organization_id = $1",
      [orgId],
    );
    await client.query(
      "DELETE FROM organization_departments WHERE organization_id = $1",
      [orgId],
    );

    // 3. Parse CSV
    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split(/\r?\n/).filter((line) => line.trim());
    const headers = lines[0].split(",");
    const data = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((h, i) => (obj[h] = values[i]));
      return obj;
    });

    console.log(`📄 Parsed ${data.length} records from CSV.`);

    // 4. Create Departments
    const uniqueDepartments = [...new Set(data.map((d) => d.Department))];
    const deptMap = {};
    for (const dName of uniqueDepartments) {
      const res = await client.query(
        "INSERT INTO organization_departments (organization_id, name) VALUES ($1, $2) RETURNING department_id",
        [orgId, dName],
      );
      deptMap[dName] = res.rows[0].department_id;
    }
    console.log(`🏢 Created ${uniqueDepartments.length} departments.`);

    // 5. Create Designations
    const uniqueDesignations = [];
    const desigMap = {}; // key: "Title|Department"
    for (const record of data) {
      const key = `${record.Designation}|${record.Department}`;
      if (!desigMap[key]) {
        const res = await client.query(
          "INSERT INTO organization_designations (organization_id, title, department_id, hierarchy_level) VALUES ($1, $2, $3, $4) RETURNING designation_id",
          [
            orgId,
            record.Designation,
            deptMap[record.Department],
            record.OrgRole === "FOUNDER"
              ? 1
              : record.OrgRole === "ADMIN"
                ? 2
                : 3,
          ],
        );
        desigMap[key] = res.rows[0].designation_id;
      }
    }
    console.log(`🏷️ Created unique designations.`);

    // 6. Create/Update Users and Link Members
    for (const u of data) {
      const hashedPassword = await bcrypt.hash(u.Password, 10);
      const nameParts = u.Name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      const username =
        u.Email.split("@")[0].replace(".", "_") +
        "_" +
        Math.floor(Math.random() * 1000);

      // Check if user exists by email
      const userCheck = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [u.Email],
      );
      let userId;
      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
        await client.query(
          "UPDATE users SET name = $1, first_name = $2, last_name = $3, password_hash = $4, role = $5, department = $6 WHERE id = $7",
          [
            u.Name,
            firstName,
            lastName,
            hashedPassword,
            u.Role,
            u.Department,
            userId,
          ],
        );
      } else {
        const userRes = await client.query(
          "INSERT INTO users (username, email, name, first_name, last_name, password_hash, is_verified, role, department) VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8) RETURNING id",
          [
            username,
            u.Email,
            u.Name,
            firstName,
            lastName,
            hashedPassword,
            u.Role,
            u.Department,
          ],
        );
        userId = userRes.rows[0].id;
      }

      // Link to organization (Handle case where user might already be in an org record)
      await client.query(
        `INSERT INTO organization_members (organization_id, user_id, is_active, org_role, designation_id, hourly_cost_rate) 
         VALUES ($1, $2, TRUE, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET 
            organization_id = EXCLUDED.organization_id,
            is_active = TRUE,
            org_role = EXCLUDED.org_role,
            designation_id = EXCLUDED.designation_id,
            hourly_cost_rate = EXCLUDED.hourly_cost_rate`,
        [
          orgId,
          userId,
          u.OrgRole,
          desigMap[`${u.Designation}|${u.Department}`],
          Math.floor(Math.random() * 80) + 20,
        ],
      );
    }

    await client.query("COMMIT");
    console.log(
      `✅ Successfully re-seeded organization '${workspaceUrl}' with ${data.length} members.`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error during re-seeding:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

reseedFirstStartup();
