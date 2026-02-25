require("dotenv").config();
const { pool } = require("../database");

const deleteOrganizationManual = async () => {
  const workspaceUrl = "teststartup";
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

    // 2. Delete tasks
    const tasksDeleted = await client.query(
      "DELETE FROM tasks WHERE organization_id = $1",
      [orgId],
    );
    console.log(`🗑️ Deleted ${tasksDeleted.rowCount} tasks.`);

    // 3. Delete projects
    const projectsDeleted = await client.query(
      "DELETE FROM projects WHERE owner_org_id = $1",
      [orgId],
    );
    console.log(`🗑️ Deleted ${projectsDeleted.rowCount} projects.`);

    // 4. Delete file assets
    const fileAssetsDeleted = await client.query(
      "DELETE FROM file_assets WHERE organization_id = $1",
      [orgId],
    );
    console.log(`🗑️ Deleted ${fileAssetsDeleted.rowCount} file assets.`);

    // 5. Delete the organization
    // This will cascade to organization_members and organization_designations
    const orgDeleted = await client.query(
      "DELETE FROM organizations WHERE organization_id = $1",
      [orgId],
    );
    console.log(`🗑️ Deleted organization record.`);

    await client.query("COMMIT");
    console.log(
      `✅ Successfully deleted organization '${workspaceUrl}' and all associated data.`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error during manual deletion:", err);
  } finally {
    client.release();
    process.exit(0);
  }
};

deleteOrganizationManual();
