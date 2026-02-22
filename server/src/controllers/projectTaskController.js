const { pool } = require("../database");
const logger = require("../utils/logger");

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
    res.json(result.rows);
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
    res.json(result.rows);
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
  } = req.body;
  const created_by = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertTaskQuery = `
      INSERT INTO tasks (
        project_id, title, description, kanban_status, 
        priority, due_date, is_milestone, parent_task_id, created_by, subtasks,
        category, time_spent, timer_started_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const taskResult = await client.query(insertTaskQuery, [
      project_id,
      title,
      description,
      kanban_status || "todo",
      priority || "Medium",
      due_date || null,
      is_milestone || false,
      parent_task_id || null,
      created_by,
      subtasks ? JSON.stringify(subtasks) : JSON.stringify([]),
      category || "General",
      time_spent || 0,
      timer_started_at || null,
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
    await client.query("ROLLBACK");
    logger.error("Error creating task:", err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
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
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateQuery = `
      UPDATE tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          kanban_status = COALESCE($3, kanban_status),
          priority = COALESCE($4, priority),
          due_date = COALESCE($5, due_date),
          is_milestone = COALESCE($6, is_milestone),
          parent_task_id = COALESCE($7, parent_task_id),
          subtasks = COALESCE($8, subtasks),
          category = COALESCE($9, category),
          time_spent = COALESCE($10, time_spent),
          timer_started_at = $11,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;
    const result = await client.query(updateQuery, [
      title,
      description,
      kanban_status,
      priority,
      due_date,
      is_milestone,
      parent_task_id,
      subtasks ? JSON.stringify(subtasks) : null,
      category,
      time_spent,
      timer_started_at !== undefined ? timer_started_at : null,
      taskId,
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
    await client.query("ROLLBACK");
    logger.error("Error updating task:", err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
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
