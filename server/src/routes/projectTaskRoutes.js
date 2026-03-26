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

// Base routes
router.get("/tasks/all", protect, getAllTasksForUser);
router.post("/", protect, createTask); // Personal task creation is always allowed


// Project-specific routes
router.get("/:id/tasks", protect, getTasksByProject);
router.post("/:id/tasks", protect, requireOrgMember, requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"]), createTask);
router.put("/:id/tasks/:taskId", protect, requireOrgMember, requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"]), updateTask);
router.delete("/:id/tasks/:taskId", protect, requireOrgMember, requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN"]), deleteTask);

// Task Comments routes
router.get("/:id/tasks/:taskId/comments", protect, getTaskComments);
router.post("/:id/tasks/:taskId/comments", protect, addTaskComment);
router.delete(
  "/:id/tasks/:taskId/comments/:commentId",
  protect,
  requireOrgMember,
  requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"]),
  deleteTaskComment,
);

module.exports = router;

