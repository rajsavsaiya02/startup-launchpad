const { pool } = require("../database");

const verify = async () => {
  try {
    console.log("Starting verification...");

    // 1. Get a project
    const projectRes = await pool.query("SELECT id FROM projects LIMIT 1");
    if (projectRes.rows.length === 0) {
      console.error("No projects found. Please create a project first.");
      process.exit(1);
    }
    const projectId = projectRes.rows[0].id;
    console.log(`Using Project ID: ${projectId}`);

    // 2. Create a dummy file asset
    const fileRes = await pool.query(
      "INSERT INTO file_assets (file_name, storage_url, context_type, context_id) VALUES ($1, $2, $3, $4) RETURNING file_asset_id",
      ["test_attachment.txt", "http://example.com/test", "project", projectId],
    );
    const fileId = fileRes.rows[0].file_asset_id;
    console.log(`Created File Asset ID: ${fileId}`);

    // 3. Create a task with this attachment
    const taskData = {
      project_id: projectId,
      title: "Verification Task " + Date.now(),
      attachment_ids: [fileId],
    };

    // We'll simulate what the controller does:
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const insertTaskRes = await client.query(
        "INSERT INTO tasks (project_id, title) VALUES ($1, $2) RETURNING id",
        [taskData.project_id, taskData.title],
      );
      const taskId = insertTaskRes.rows[0].id;
      console.log(`Created Task ID: ${taskId}`);

      // Link attachment
      await client.query(
        "UPDATE file_assets SET context_type = 'task', context_id = $1 WHERE file_asset_id = ANY($2::int[])",
        [taskId, [fileId]],
      );
      console.log("Linked attachment to task.");
      await client.query("COMMIT");

      // 4. Verify retrieval
      const fetchRes = await pool.query(
        `
                SELECT t.*, 
                       COALESCE(
                         (
                           SELECT json_agg(json_build_object(
                             'file_asset_id', fa.file_asset_id,
                             'file_name', fa.file_name,
                             'storage_url', fa.storage_url
                           ))
                           FROM file_assets fa
                           WHERE fa.context_type = 'task' AND fa.context_id = t.id
                         ),
                         '[]'::json
                       ) as attachments
                FROM tasks t
                WHERE t.id = $1
            `,
        [taskId],
      );

      const task = fetchRes.rows[0];
      console.log(
        "Fetched Task Attachments:",
        JSON.stringify(task.attachments, null, 2),
      );

      if (
        task.attachments &&
        task.attachments.length > 0 &&
        task.attachments[0].file_asset_id === fileId
      ) {
        console.log("SUCCESS: Attachment correctly linked and retrieved!");
      } else {
        console.error("FAILURE: Attachment not found or mismatch.");
      }

      // Cleanup
      await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);
      await pool.query("DELETE FROM file_assets WHERE file_asset_id = $1", [
        fileId,
      ]);
      console.log("Cleanup complete.");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await pool.end();
  }
};

verify();
