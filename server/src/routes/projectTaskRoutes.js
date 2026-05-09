const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getTasksByProject,
  getAllTasksForUser,
  createTask,
  updateTask,
  deleteTask,
  getTaskComments,
  addTaskComment,
  deleteTaskComment,
} = require("../controllers/projectTaskController");
const { protect } = require("../middleware/authMiddleware");
const { requireOrgMember, requireOrgRole } = require("../middleware/orgAuthMiddleware");
const { pool } = require("../database");

/**
 * Middleware: checks if the project is org-scoped.
 *
 * - Personal projects (owner_org_id IS NULL) → allow authenticated user through,
 *   no org membership required. This supports the Self-side personal project
 *   management which is completely independent of any organization.
 *
 * - Org projects (owner_org_id IS NOT NULL) → enforce requireOrgMember + requireOrgRole
 *   as before.
 */
const ifProjectOrgScoped = (...roles) => async (req, res, next) => {
  const projectId = req.params.id;
  if (!projectId) return next(); // No project context, allow through
  try {
    const result = await pool.query(
      "SELECT owner_org_id FROM projects WHERE id = $1",
      [projectId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const ownerOrgId = result.rows[0].owner_org_id;
    if (!ownerOrgId) {
      // Personal project – skip org requirements, user is already authenticated via protect
      return next();
    }
    // Org project – enforce org membership + role
    return requireOrgMember(req, res, () =>
      requireOrgRole(roles)(req, res, next)
    );
  } catch (err) {
    console.error("ifProjectOrgScoped middleware error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ──────────────────────────────────────────────────────────
// Routes mounted at /api/tasks (independent/personal tasks)
// ──────────────────────────────────────────────────────────
// Get all tasks for the logged-in user
router.get("/tasks/all", protect, getAllTasksForUser);

// Create a personal task (no project_id)
router.post("/", protect, createTask);

// Delete a personal task by ID directly — used when project_id is null
// Only reachable via /api/tasks/:taskId (not /api/projects/:taskId)
router.delete("/:taskId", protect, deleteTask);

// Update a personal task by ID directly — used when project_id is null
router.put("/:taskId", protect, updateTask);

// ──────────────────────────────────────────────────────────
// Project-specific routes (mounted at /api/projects)
// ──────────────────────────────────────────────────────────
// View tasks for a project — no org check, project membership/ownership is implicit
router.get("/:id/tasks", protect, getTasksByProject);

// Create task within a project — personal projects skip org auth
router.post(
  "/:id/tasks",
  protect,
  ifProjectOrgScoped("FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"),
  createTask
);

// Update task within a project — personal projects skip org auth
router.put(
  "/:id/tasks/:taskId",
  protect,
  ifProjectOrgScoped("FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"),
  updateTask
);

// Delete task within a project — personal projects skip org auth
router.delete(
  "/:id/tasks/:taskId",
  protect,
  ifProjectOrgScoped("FOUNDER", "CO-FOUNDER", "ADMIN"),
  deleteTask
);

// Task Comments routes
router.get("/:id/tasks/:taskId/comments", protect, getTaskComments);
router.post("/:id/tasks/:taskId/comments", protect, addTaskComment);
router.delete(
  "/:id/tasks/:taskId/comments/:commentId",
  protect,
  requireOrgMember,
  requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"]),
  deleteTaskComment
);

module.exports = router;
