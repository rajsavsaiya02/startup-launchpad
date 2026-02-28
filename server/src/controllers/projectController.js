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
      SELECT p.*, pm.role as project_role,
        om.org_role,
        (SELECT COUNT(*) FROM organization_teams ot WHERE ot.team_lead_member_id = om.organization_member_id) > 0 as is_team_lead,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN t.kanban_status = 'done' THEN 1 END)::numeric / COUNT(t.id)) * 100)
        END AS progress
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN organization_members om ON p.owner_org_id = om.organization_id AND om.user_id = $1
      WHERE pm.user_id = $1
    `;
    const params = [userId];

    if (scope === "organization") {
      query += " AND p.owner_org_id IS NOT NULL";
    } else {
      query += " AND p.owner_org_id IS NULL";
    }

    query +=
      " GROUP BY p.id, pm.role, om.org_role, om.organization_member_id ORDER BY p.updated_at DESC";

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

// Get members of a specific project
exports.getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify current user has access to this project
    const accessCheck = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [id, userId],
    );

    let hasAccess = false;
    if (accessCheck.rows.length > 0) {
      hasAccess = true;
    } else {
      // Check if user is an admin/founder of the org that owns the project
      const projectQuery = await pool.query(
        `SELECT owner_org_id FROM projects WHERE id = $1`,
        [id],
      );
      if (projectQuery.rows.length > 0 && projectQuery.rows[0].owner_org_id) {
        const orgId = projectQuery.rows[0].owner_org_id;
        const orgAccessCheck = await pool.query(
          `SELECT org_role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
          [orgId, userId],
        );
        if (
          orgAccessCheck.rows.length > 0 &&
          ["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(
            orgAccessCheck.rows[0].org_role,
          )
        ) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const membersQuery = `
      SELECT pm.role as project_role, pm.joined_at, u.id as user_id, u.first_name, u.last_name, u.email, u.avatar,
             om.organization_member_id, om.org_role, od.title as designation_title, om.status,
             (SELECT COUNT(*) FROM organization_teams ot WHERE ot.team_lead_member_id = om.organization_member_id) > 0 as is_team_lead
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      JOIN projects p ON pm.project_id = p.id
      LEFT JOIN organization_members om ON u.id = om.user_id AND p.owner_org_id = om.organization_id
      LEFT JOIN organization_designations od ON om.designation_id = od.designation_id
      WHERE pm.project_id = $1
    `;

    const result = await pool.query(membersQuery, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Server error fetching project members" });
  }
};

// Add members to a project
exports.addProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body; // Array of user IDs
    const currentUserId = req.user.id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Valid user IDs array is required" });
    }

    // Verify current user is admin/founder of org or owner of project
    const accessCheck = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [id, currentUserId],
    );

    const projectQuery = await pool.query(
      `SELECT owner_org_id FROM projects WHERE id = $1`,
      [id],
    );
    const owner_org_id = projectQuery.rows[0]?.owner_org_id;

    let canManage = false;
    if (accessCheck.rows.length > 0 && accessCheck.rows[0].role === "owner") {
      canManage = true;
    }

    if (!canManage && owner_org_id) {
      const orgAccessCheck = await pool.query(
        `SELECT organization_member_id, org_role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
        [owner_org_id, currentUserId],
      );

      if (orgAccessCheck.rows.length > 0) {
        const { organization_member_id, org_role } = orgAccessCheck.rows[0];

        // Check if Org Admin/Founder
        if (["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(org_role)) {
          canManage = true;
        }

        // Check if Team Lead
        if (!canManage) {
          const tlCheck = await pool.query(
            `SELECT COUNT(*) FROM organization_teams WHERE team_lead_member_id = $1`,
            [organization_member_id],
          );
          if (parseInt(tlCheck.rows[0].count) > 0) {
            canManage = true;
          }
        }
      }
    }

    if (!canManage) {
      return res.status(403).json({
        message:
          "Access denied. Only project owners, organization admins, or team leads can add members.",
      });
    }

    // Insert all new members, ignoring duplicates
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const uid of userIds) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id, role) 
                 VALUES ($1, $2, 'member') 
                 ON CONFLICT (project_id, user_id) DO NOTHING`,
          [id, uid],
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    res.json({ message: "Members added successfully" });
  } catch (error) {
    console.error("Error adding project members:", error);
    res.status(500).json({ message: "Server error adding project members" });
  }
};

// Remove a member from a project
exports.removeProjectMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user.id;

    // Check if the user is trying to leave voluntarily
    let isLeaving = false;
    if (parseInt(userId) === parseInt(currentUserId)) {
      isLeaving = true;
    }

    if (!isLeaving) {
      // Verify current user is admin/founder of org or owner of project to remove someone else
      const accessCheck = await pool.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [id, currentUserId],
      );

      const projectQuery = await pool.query(
        `SELECT owner_org_id FROM projects WHERE id = $1`,
        [id],
      );
      const owner_org_id = projectQuery.rows[0]?.owner_org_id;

      let canManage = false;
      if (accessCheck.rows.length > 0 && accessCheck.rows[0].role === "owner") {
        canManage = true;
      }

      if (!canManage && owner_org_id) {
        const orgAccessCheck = await pool.query(
          `SELECT organization_member_id, org_role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
          [owner_org_id, currentUserId],
        );

        if (orgAccessCheck.rows.length > 0) {
          const { organization_member_id, org_role } = orgAccessCheck.rows[0];

          // Check if Org Admin/Founder
          if (["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(org_role)) {
            canManage = true;
          }

          // Check if Team Lead
          if (!canManage) {
            const tlCheck = await pool.query(
              `SELECT COUNT(*) FROM organization_teams WHERE team_lead_member_id = $1`,
              [organization_member_id],
            );
            if (parseInt(tlCheck.rows[0].count) > 0) {
              canManage = true;
            }
          }
        }
      }

      if (!canManage) {
        return res.status(403).json({
          message:
            "Access denied. You do not have permission to manage members. Only owners, admins, or team leads can do this.",
        });
      }
    }

    // Cannot remove the owner
    const targetQuery = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (
      targetQuery.rows.length > 0 &&
      targetQuery.rows[0].role === "owner" &&
      !isLeaving
    ) {
      return res
        .status(400)
        .json({ message: "Cannot remove the project owner." });
    }

    // 1. Check if the target member has High Authority
    const authorityQuery = await pool.query(
      `SELECT 
        om.org_role,
        (SELECT COUNT(*) FROM organization_teams ot WHERE ot.team_lead_member_id = om.organization_member_id) as is_team_lead
      FROM organization_members om
      JOIN projects p ON p.owner_org_id = om.organization_id
      WHERE p.id = $1 AND om.user_id = $2`,
      [id, userId],
    );

    const targetMember = authorityQuery.rows[0];
    const isTargetHighAuth =
      targetMember &&
      (["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(targetMember.org_role) ||
        parseInt(targetMember.is_team_lead) > 0);

    if (isTargetHighAuth) {
      // 2. Count other high-authority members in the project
      const othersQuery = await pool.query(
        `SELECT COUNT(*) 
         FROM project_members pm
         JOIN organization_members om ON pm.user_id = om.user_id
         JOIN projects p ON pm.project_id = p.id AND om.organization_id = p.owner_org_id
         LEFT JOIN organization_teams ot ON om.organization_member_id = ot.team_lead_member_id
         WHERE pm.project_id = $1 
         AND pm.user_id != $2
         AND (om.org_role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN') OR ot.team_id IS NOT NULL)`,
        [id, userId],
      );

      const otherHighAuthCount = parseInt(othersQuery.rows[0].count);

      if (otherHighAuthCount === 0) {
        return res.status(400).json({
          message:
            "Cannot remove the last high-authority member (Founder/Admin/Team Lead). At least one must remain in the project.",
        });
      }
    }

    await pool.query(
      "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2",
      [id, userId],
    );

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing project member:", error);
    res.status(500).json({ message: "Server error removing project member" });
  }
};
