const express = require("express");
const router = express.Router();
const projectActivityController = require("../controllers/projectActivityController");
const { protect } = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(protect);

router.get(
  "/:projectId/activities",
  projectActivityController.getProjectActivities,
);
router.post(
  "/:projectId/activities",
  projectActivityController.addProjectActivity,
);
router.put(
  "/:projectId/activities/:id",
  projectActivityController.updateProjectActivity,
);
router.delete(
  "/:projectId/activities/:id",
  projectActivityController.deleteProjectActivity,
);

module.exports = router;
