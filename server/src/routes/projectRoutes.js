const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(protect);

router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

// Project Member Routes
router.get("/:id/members", projectController.getProjectMembers);
router.post("/:id/members", projectController.addProjectMembers);
router.delete("/:id/members/:userId", projectController.removeProjectMember);

module.exports = router;
