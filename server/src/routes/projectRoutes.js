const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { requireOrgMember, requireOrgRole } = require("../middleware/orgAuthMiddleware");

// Conditional middleware: only requires org membership when 'is_organizational' is set in body or query
const ifOrgScoped = (...roles) => (req, res, next) => {
  const isOrg = req.body?.is_organizational || req.query?.scope === "organization";
  if (!isOrg) return next(); // Personal project – skip org check
  return requireOrgMember(req, res, () => requireOrgRole(roles)(req, res, next));
};

// Apply auth middleware to all routes
router.use(protect);

router.post("/", ifOrgScoped("FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"), projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", ifOrgScoped("FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"), projectController.updateProject);
router.delete("/:id", ifOrgScoped("FOUNDER", "CO-FOUNDER", "ADMIN"), projectController.deleteProject);

// Project Member Routes
router.get("/:id/members", projectController.getProjectMembers);
router.post("/:id/members", requireOrgMember, requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"]), projectController.addProjectMembers);
router.delete("/:id/members/:userId", requireOrgMember, requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN"]), projectController.removeProjectMember);

module.exports = router;

