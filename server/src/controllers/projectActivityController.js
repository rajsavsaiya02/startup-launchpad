const { pool } = require("../database");

// Get all activities for a project
exports.getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id; // from authMiddleware

    // Basic access check: Must be a member of the project
    const accessCheck = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId],
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      `SELECT pa.*, u.first_name, u.last_name, u.avatar 
       FROM project_activities pa 
       LEFT JOIN users u ON pa.user_id = u.id 
       WHERE pa.project_id = $1 
       ORDER BY pa.created_at DESC`,
      [projectId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching project activities:", error);
    res.status(500).json({ error: "Failed to fetch project activities" });
  }
};

// Create a new activity log
exports.addProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Activity content is required" });
    }

    const accessCheck = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId],
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      `INSERT INTO project_activities (project_id, user_id, content) 
       VALUES ($1, $2, $3) RETURNING *`,
      [projectId, userId, content],
    );

    // Fetch the inserted record joined with user info to immediately return to the UI
    const fetchResult = await pool.query(
      `SELECT pa.*, u.first_name, u.last_name, u.avatar 
       FROM project_activities pa 
       LEFT JOIN users u ON pa.user_id = u.id 
       WHERE pa.id = $1`,
      [result.rows[0].id],
    );

    res.status(201).json(fetchResult.rows[0]);
  } catch (error) {
    console.error("Error adding project activity:", error);
    res.status(500).json({ error: "Failed to add project activity" });
  }
};

// Update an activity log
exports.updateProjectActivity = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Activity content is required" });
    }

    // Only allow the original author to update their own note
    const activityCheck = await pool.query(
      `SELECT user_id FROM project_activities WHERE id = $1 AND project_id = $2`,
      [id, projectId],
    );

    if (activityCheck.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    if (activityCheck.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own activities" });
    }

    const result = await pool.query(
      `UPDATE project_activities 
       SET content = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [content, id],
    );

    const fetchResult = await pool.query(
      `SELECT pa.*, u.first_name, u.last_name, u.avatar 
       FROM project_activities pa 
       LEFT JOIN users u ON pa.user_id = u.id 
       WHERE pa.id = $1`,
      [result.rows[0].id],
    );

    res.json(fetchResult.rows[0]);
  } catch (error) {
    console.error("Error updating project activity:", error);
    res.status(500).json({ error: "Failed to update project activity" });
  }
};

// Delete an activity log
exports.deleteProjectActivity = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const userId = req.user.id;

    // Only allow the original author (or possibly a project admin) to delete
    const activityCheck = await pool.query(
      `SELECT user_id FROM project_activities WHERE id = $1 AND project_id = $2`,
      [id, projectId],
    );

    if (activityCheck.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Checking if it's the author. (In the future, could allow project admins to delete).
    if (activityCheck.rows[0].user_id !== userId) {
      // Let's also check if user is admin/owner of project
      const accessCheck = await pool.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId],
      );
      if (
        accessCheck.rows.length === 0 ||
        !["admin", "owner"].includes(accessCheck.rows[0].role)
      ) {
        return res.status(403).json({
          error: "You do not have permission to delete this activity",
        });
      }
    }

    await pool.query(`DELETE FROM project_activities WHERE id = $1`, [id]);

    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting project activity:", error);
    res.status(500).json({ error: "Failed to delete project activity" });
  }
};
