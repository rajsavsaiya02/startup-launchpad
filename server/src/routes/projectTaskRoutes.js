const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getTasksByProject,
  getAllTasksForUser,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/projectTaskController");
const { protect } = require("../middleware/authMiddleware");

// Base route: /api/projects
router.get("/tasks/all", protect, getAllTasksForUser);
router.get("/:id/tasks", protect, getTasksByProject);
router.post("/:id/tasks", protect, createTask);
router.put("/:id/tasks/:taskId", protect, updateTask);
router.delete("/:id/tasks/:taskId", protect, deleteTask);

module.exports = router;
