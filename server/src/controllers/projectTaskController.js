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
  const { id } = req.params;
  try {
    const tasksQuery = `
      SELECT t.*, 
             COALESCE(json_agg(ta.user_id) FILTER (WHERE ta.user_id IS NOT NULL), '[]') as assignee_ids
      FROM tasks t
      LEFT JOIN task_assignees ta ON t.id = ta.task_id
      WHERE t.project_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(tasksQuery, [id]);
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
    let tasksQuery = `
      SELECT t.*, 
             p.title as project_title,
             p.owner_org_id,
             COALESCE(json_agg(ta.user_id) FILTER (WHERE ta.user_id IS NOT NULL), '[]') as assignee_ids
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN task_assignees ta ON t.id = ta.task_id
      WHERE pm.user_id = $1
    `;
    const params = [userId];

    if (scope === "organization") {
      tasksQuery += " AND p.owner_org_id IS NOT NULL";
    } else {
      tasksQuery += " AND p.owner_org_id IS NULL";
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
  const { id: project_id } = req.params;
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
        category, time_spent, timer_started_at, time_logs
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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

module.exports = {
  getTasksByProject,
  getAllTasksForUser,
  createTask,
  updateTask,
  deleteTask,
};
