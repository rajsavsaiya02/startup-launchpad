const { pool } = require("../database");

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      category,
      start_date,
      due_date,
      owner_org_id,
    } = req.body;
    const userId = req.user.id; // User ID from auth middleware

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Project title is required" });
    }

    // Insert project
    const result = await pool.query(
      `INSERT INTO projects 
       (title, description, status, priority, category, start_date, due_date, owner_user_id, owner_org_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        description || "",
        status || "active",
        priority || "medium",
        category || "General",
        start_date || null,
        due_date || null,
        req.body.is_organizational ? null : userId,
        req.body.is_organizational ? owner_org_id || 1 : null,
        userId,
      ],
    );

    const newProject = result.rows[0];

    // Add creator as a member with 'owner' role
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [newProject.id, userId],
    );

    // Seed initial activity log
    await pool.query(
      `INSERT INTO project_activities (project_id, user_id, content) VALUES ($1, $2, $3)`,
      [
        newProject.id,
        userId,
        `<p><strong>Project Initialize</strong><br/>Project "${title}" was created and initialized successfully.</p>`,
      ],
    );

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error creating project" });
  }
};

// Get all projects for the current user (owned or member)
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scope } = req.query;

    let query = `
      SELECT p.*, pm.role as user_role,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN t.kanban_status = 'done' THEN 1 END)::numeric / COUNT(t.id)) * 100)
        END AS progress
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE pm.user_id = $1
    `;
    const params = [userId];

    if (scope === "organization") {
      query += " AND p.owner_org_id IS NOT NULL";
    } else {
      query += " AND p.owner_org_id IS NULL";
    }

    query += " GROUP BY p.id, pm.role ORDER BY p.updated_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error fetching projects" });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the project
    const result = await pool.query(
      `SELECT p.*, pm.role as user_role 
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = $1 AND pm.user_id = $2`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Project not found or access denied" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error fetching project" });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      category,
      start_date,
      due_date,
      progress,
    } = req.body;
    const userId = req.user.id;

    // Verify ownership or admin rights (simple check: must be a member for now, ideally owner/admin role)
    const accessCheck = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Future: Check for specific roles (e.g., if (role !== 'owner' && role !== 'admin') return 403)

    const result = await pool.query(
      `UPDATE projects 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           category = COALESCE($5, category),
           start_date = COALESCE($6, start_date),
           due_date = COALESCE($7, due_date),
           progress = COALESCE($8, progress),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description,
        status,
        priority,
        category,
        start_date,
        due_date,
        progress,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error updating project" });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Only owner can delete (logic simplified for now)
    const accessCheck = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (accessCheck.rows.length === 0 || accessCheck.rows[0].role !== "owner") {
      return res
        .status(403)
        .json({ message: "Access denied. Only owners can delete projects." });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error deleting project" });
  }
};
