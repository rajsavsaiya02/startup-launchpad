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

// Base routes
router.get("/tasks/all", protect, getAllTasksForUser);
router.post("/", protect, createTask); // For independent tasks (mounted at /api/tasks)

// Project-specific routes
router.get("/:id/tasks", protect, getTasksByProject);
router.post("/:id/tasks", protect, createTask);
router.put("/:id/tasks/:taskId", protect, updateTask);
router.delete("/:id/tasks/:taskId", protect, deleteTask);

// Task Comments routes
router.get("/:id/tasks/:taskId/comments", protect, getTaskComments);
router.post("/:id/tasks/:taskId/comments", protect, addTaskComment);
router.delete(
  "/:id/tasks/:taskId/comments/:commentId",
  protect,
  deleteTaskComment,
);

module.exports = router;
