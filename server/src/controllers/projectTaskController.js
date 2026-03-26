const { pool } = require("../database");
const logger = require("../utils/logger");
const crypto = require("crypto");

const sanitizeTasksTimers = (tasks) => {
  const now = Date.now();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const tasksToUpdate = [];

  const sanitizedTasks = tasks.map((task) => {
    if (task.timer_started_at) {
      const startTs = new Date(task.timer_started_at).getTime();
      if (
        !isNaN(startTs) &&
        startTs > 0 &&
        now - startTs >= twentyFourHoursMs
      ) {
        let parsedLogs = [];
        if (typeof task.time_logs === "string") {
          try {
            parsedLogs = JSON.parse(task.time_logs);
          } catch (e) {}
        } else if (Array.isArray(task.time_logs)) {
          parsedLogs = [...task.time_logs];
        }

        const sessionLog = {
          id: crypto.randomUUID(),
          start_time: new Date(startTs).toISOString(),
          end_time: new Date(startTs + twentyFourHoursMs).toISOString(),
          duration_seconds: 86400,
        };

        parsedLogs.unshift(sessionLog);

        task.time_spent = (parseInt(task.time_spent) || 0) + 86400;
        task.time_logs = parsedLogs;
        task.timer_started_at = null;

        tasksToUpdate.push({ ...task });
      }
    }
    return task;
  });

  if (tasksToUpdate.length > 0) {
    Promise.all(
      tasksToUpdate.map((t) =>
        pool.query(
          `
        UPDATE tasks 
        SET time_spent = $1, timer_started_at = NULL, time_logs = $2
        WHERE id = $3
      `,
          [t.time_spent, JSON.stringify(t.time_logs), t.id],
        ),
      ),
    ).catch((err) => logger.error("Failed to auto-stop stale timers:", err));
  }

  return sanitizedTasks;
};

const getTasksByProject = async (req, res) => {
  const { id } = req.params; // project_id
  const userId = req.user.id;
  try {
    // Determine the user's org role for this project's organization
    const orgMemberResult = await pool.query(
      `SELECT om.org_role
       FROM organization_members om
       JOIN projects p ON p.owner_org_id = om.organization_id
       WHERE om.user_id = $1 AND om.is_active = true AND p.id = $2
       LIMIT 1`,
      [userId, id],
    );

    const orgRole = orgMemberResult.rows[0]?.org_role;
    const isGuest = !orgRole || !['FOUNDER', 'CO-FOUNDER', 'ADMIN', 'MEMBER'].includes(orgRole);

    let tasksQuery;
    let params;

    if (isGuest) {
      // GUESTs only see tasks they are explicitly assigned to
      tasksQuery = `
        SELECT t.*,
               COALESCE(json_agg(ta.user_id) FILTER (WHERE ta.user_id IS NOT NULL), '[]') as assignee_ids,
               COALESCE(
                 (
                   SELECT json_agg(json_build_object(
                     'file_asset_id', fa.file_asset_id,
                     'file_name', fa.file_name,
                     'storage_url', fa.storage_url,
                     'mime_type', fa.mime_type,
                     'is_external', fa.is_external
                   ))
                   FROM file_assets fa
                   WHERE fa.context_type = 'task' AND fa.context_id = t.id
                 ),
                 '[]'::json
               ) as attachments
        FROM tasks t
        JOIN task_assignees ta_filter ON t.id = ta_filter.task_id AND ta_filter.user_id = $2
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        WHERE t.project_id = $1
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      params = [id, userId];
    } else {
      // Founders, Co-Founders, Admins, Members see all project tasks
      tasksQuery = `
        SELECT t.*,
               COALESCE(json_agg(ta.user_id) FILTER (WHERE ta.user_id IS NOT NULL), '[]') as assignee_ids,
               COALESCE(
                 (
                   SELECT json_agg(json_build_object(
                     'file_asset_id', fa.file_asset_id,
                     'file_name', fa.file_name,
                     'storage_url', fa.storage_url,
                     'mime_type', fa.mime_type,
                     'is_external', fa.is_external
                   ))
                   FROM file_assets fa
                   WHERE fa.context_type = 'task' AND fa.context_id = t.id
                 ),
                 '[]'::json
               ) as attachments
        FROM tasks t
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        WHERE t.project_id = $1
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      params = [id];
    }

    const result = await pool.query(tasksQuery, params);
    const safeTasks = sanitizeTasksTimers(result.rows);
    res.json(safeTasks);
  } catch (err) {
    logger.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAllTasksForUser = async (req, res) => {
  const userId = req.user.id;
  const { scope } = req.query; // 'organization' or default/null
  try {
    // Fetch user's organization_id if scope is organization
    let userOrgId = null;
    if (scope === "organization") {
      const orgMemberResult = await pool.query(
        "SELECT organization_id FROM organization_members WHERE user_id = $1",
        [userId],
      );
      userOrgId = orgMemberResult.rows[0]?.organization_id;
    }

    let tasksQuery = `
      SELECT t.*, 
             p.title as project_title,
             COALESCE(p.owner_org_id, t.organization_id) as owner_org_id,
             COALESCE(json_agg(ta.user_id) FILTER (WHERE ta.user_id IS NOT NULL), '[]') as assignee_ids,
             COALESCE(
               (
                 SELECT json_agg(json_build_object(
                   'file_asset_id', fa.file_asset_id,
                   'file_name', fa.file_name,
                   'storage_url', fa.storage_url,
                   'mime_type', fa.mime_type,
                   'is_external', fa.is_external
                 ))
                 FROM file_assets fa
                 WHERE fa.context_type = 'task' AND fa.context_id = t.id
               ),
               '[]'::json
             ) as attachments
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN task_assignees ta ON t.id = ta.task_id
      WHERE (
        pm.user_id = $1 
        OR (t.project_id IS NULL AND t.created_by = $1 AND t.organization_id IS NULL)
        OR (t.organization_id IS NOT NULL AND t.organization_id = $2)
        OR (p.owner_org_id IS NOT NULL AND p.owner_org_id = $2)
      )
    `;
    const params = [userId, userOrgId];

    if (scope === "organization") {
      // Logic handled in WHERE clause above ($2)
    } else if (scope === "personal") {
      tasksQuery += " AND p.owner_org_id IS NULL AND t.organization_id IS NULL";
    } else {
      // Default: exclude organization tasks if not explicitly requested
      tasksQuery += " AND p.owner_org_id IS NULL AND t.organization_id IS NULL";
    }

    tasksQuery += `
      GROUP BY t.id, p.id
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(tasksQuery, params);
    const safeTasks = sanitizeTasksTimers(result.rows);
    res.json(safeTasks);
  } catch (err) {
    logger.error("Error fetching all tasks:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createTask = async (req, res) => {
  const project_id = req.params.id || null;
  const {
    title,
    description,
    kanban_status,
    priority,
    due_date,
    is_milestone,
    parent_task_id,
    assignee_ids,
    subtasks,
    category,
    time_spent,
    timer_started_at,
    time_logs,
    attachment_ids,
    organization_id,
  } = req.body;
  const created_by = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Handle empty date strings
    const finalDueDate = due_date && due_date.trim() !== "" ? due_date : null;

    const insertTaskQuery = `
      INSERT INTO tasks (
        project_id, title, description, kanban_status, 
        priority, due_date, is_milestone, parent_task_id, created_by, subtasks,
        category, time_spent, timer_started_at, time_logs, organization_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const taskResult = await client.query(insertTaskQuery, [
      project_id,
      title,
      description,
      kanban_status || "todo",
      priority || "Medium",
      finalDueDate,
      is_milestone || false,
      parent_task_id || null,
      created_by,
      subtasks ? JSON.stringify(subtasks) : JSON.stringify([]),
      category || "General",
      parseInt(time_spent) || 0,
      timer_started_at || null,
      time_logs ? JSON.stringify(time_logs) : JSON.stringify([]),
      organization_id || null,
    ]);
    const newTask = taskResult.rows[0];

    if (assignee_ids && Array.isArray(assignee_ids)) {
      for (const user_id of assignee_ids) {
        await client.query(
          "INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)",
          [newTask.id, user_id],
        );
      }
    }

    if (
      attachment_ids &&
      Array.isArray(attachment_ids) &&
      attachment_ids.length > 0
    ) {
      await client.query(
        `UPDATE file_assets SET context_type = 'task', context_id = $1 WHERE file_asset_id = ANY($2::int[])`,
        [newTask.id, attachment_ids.map((id) => parseInt(id))],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ ...newTask, assignee_ids: assignee_ids || [] });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    logger.error("Error creating task:", err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
};

const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const {
    title,
    description,
    kanban_status,
    priority,
    due_date,
    is_milestone,
    parent_task_id,
    assignee_ids,
    subtasks,
    category,
    time_spent,
    timer_started_at,
    time_logs,
    attachment_ids,
    organization_id,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Logic for partial updates:
    // If field is undefined, we want to keep existing value (COALESCE handles this if we pass NULL)
    // If field is "" (empty string) for dates, we treat it as wanting to set to NULL
    // If field is null, we treat it as wanting to set to NULL
    const finalDueDate =
      due_date === undefined
        ? null
        : due_date && due_date.trim() !== ""
          ? due_date
          : null;

    const updateQuery = `
      UPDATE tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          kanban_status = COALESCE($3, kanban_status),
          priority = COALESCE($4, priority),
          due_date = CASE WHEN $14 = true THEN $5 ELSE due_date END,
          is_milestone = COALESCE($6, is_milestone),
          parent_task_id = COALESCE($7, parent_task_id),
          subtasks = COALESCE($8, subtasks),
          category = COALESCE($9, category),
          time_spent = CASE WHEN $16 = true THEN $10 ELSE time_spent END,
          timer_started_at = CASE WHEN $15 = true THEN $11 ELSE timer_started_at END,
          time_logs = CASE WHEN $17 = true THEN $12 ELSE time_logs END,
          organization_id = COALESCE($18, organization_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;
    const result = await client.query(updateQuery, [
      title !== undefined ? title : null,
      description !== undefined ? description : null,
      kanban_status !== undefined ? kanban_status : null,
      priority !== undefined ? priority : null,
      finalDueDate,
      is_milestone !== undefined ? is_milestone : null,
      parent_task_id !== undefined ? parent_task_id : null,
      subtasks ? JSON.stringify(subtasks) : null,
      category !== undefined ? category : null,
      time_spent !== undefined ? parseInt(time_spent) : null,
      timer_started_at !== undefined ? timer_started_at : null,
      time_logs !== undefined ? JSON.stringify(time_logs) : null,
      taskId,
      due_date !== undefined, // $14: was due_date provided?
      timer_started_at !== undefined, // $15: was timer_started_at provided?
      time_spent !== undefined, // $16: was time_spent provided?
      time_logs !== undefined, // $17: was time_logs provided?
      organization_id !== undefined ? organization_id : null, // $18
    ]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Task not found" });
    }

    if (assignee_ids && Array.isArray(assignee_ids)) {
      await client.query("DELETE FROM task_assignees WHERE task_id = $1", [
        taskId,
      ]);
      for (const user_id of assignee_ids) {
        await client.query(
          "INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)",
          [taskId, user_id],
        );
      }
    }

    if (attachment_ids && Array.isArray(attachment_ids)) {
      // For updates, we first clear existing associations for this task (if any)
      // Actually, since file_assets can only belong to one context, we just need to ensure the new ones are linked.
      // But what if some were removed? We should probably "unlink" them or just let them stay with 'task' but maybe they should go back to 'project'?
      // Typically, we only care about the ones currently attached.
      // Let's reset all currently attached to this task back to 'project' (optional) or just update the new set.
      // Easiest is to update all provided IDs.
      if (attachment_ids.length > 0) {
        await client.query(
          `UPDATE file_assets SET context_type = 'task', context_id = $1 WHERE file_asset_id = ANY($2::int[])`,
          [taskId, attachment_ids.map((id) => parseInt(id))],
        );
      }
    }

    await client.query("COMMIT");
    res.json({ ...result.rows[0], assignee_ids: assignee_ids });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    logger.error("Error updating task:", err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING id",
      [taskId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully", id: taskId });
  } catch (err) {
    logger.error("Error deleting task:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTaskComments = async (req, res) => {
  const { id: projectId, taskId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is a member of the project
    const memberCheck = await pool.query(
      "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, userId],
    );
    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const result = await pool.query(
      `
      SELECT tc.*, u.first_name, u.last_name, u.email, u.avatar as profile_picture_url 
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = $1
      ORDER BY tc.created_at ASC
    `,
      [taskId],
    );
    res.json(result.rows);
  } catch (err) {
    logger.error("Error fetching task comments:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addTaskComment = async (req, res) => {
  const { id: projectId, taskId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    // Check if user is a member of the project
    const memberCheck = await pool.query(
      "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, userId],
    );
    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    // Check if the task belongs to the project
    const taskCheck = await pool.query(
      "SELECT id FROM tasks WHERE id = $1 AND project_id = $2",
      [taskId, projectId],
    );
    if (taskCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Task not found in this project" });
    }

    const result = await pool.query(
      `
      INSERT INTO task_comments (task_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [taskId, userId, comment],
    );

    const userResult = await pool.query(
      "SELECT first_name, last_name, email, avatar as profile_picture_url FROM users WHERE id = $1",
      [userId],
    );

    const newComment = {
      ...result.rows[0],
      ...userResult.rows[0],
    };

    res.status(201).json(newComment);
  } catch (err) {
    logger.error("Error adding task comment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTaskComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const check = await pool.query(
      "SELECT user_id FROM task_comments WHERE id = $1",
      [commentId],
    );
    if (check.rows.length === 0)
      return res.status(404).json({ message: "Comment not found" });
    if (check.rows[0].user_id !== userId)
      return res.status(403).json({ message: "Forbidden" });

    await pool.query("DELETE FROM task_comments WHERE id = $1", [commentId]);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    logger.error("Error deleting task comment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getTasksByProject,
  getAllTasksForUser,
  createTask,
  updateTask,
  deleteTask,
  getTaskComments,
  addTaskComment,
  deleteTaskComment,
};
