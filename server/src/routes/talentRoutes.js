const express = require("express");
const router = express.Router();
const talentController = require("../controllers/talentController");
const { protect } = require("../middleware/authMiddleware");
const { requireOrgMember, requireOrgRole } = require("../middleware/orgAuthMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Simple role authorization middleware (used only for talent-side routes)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles || roles.length === 0) return next();
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${req.user?.role}`,
      });
    }
    next();
  };
};

// Org role shorthand — Founder, Co-Founder, Admin, and active Members get identical access to talent hub management
const orgAdmin = [requireOrgMember, requireOrgRole(["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"])];

// Public Profile (Public)
router.get("/profile/:username", talentController.getPublicProfile);

// Protect all following routes
router.use(protect);

// Talent User Search (for Find Talent tab in org Talent Hub)
router.get("/users", ...orgAdmin, talentController.getTalentUsers);

// Self Profile Management
router.put("/profile/me", talentController.updatePublicProfile);
router.post(
  "/profile/me/avatar",
  upload.single("avatar"),
  talentController.updatePublicProfileAvatar,
);
router.delete("/profile/me/avatar", talentController.removePublicProfileAvatar);

// Opportunities — Org creates, everyone can view
router.post("/opportunities", ...orgAdmin, talentController.createOpportunity);
router.put("/opportunities/:id", ...orgAdmin, talentController.updateOpportunity);
router.delete("/opportunities/:id", ...orgAdmin, talentController.deleteOpportunity);
router.get("/opportunities", talentController.getAllOpportunities);
router.get("/opportunities/:id", talentController.getOpportunityById);

// Applications — Talent applies, Org reviews
router.post(
  "/opportunities/:id/apply",
  authorizeRoles("freelancer", "student", "normal_user"),
  talentController.applyForOpportunity,
);
router.get(
  "/applications/me",
  authorizeRoles("freelancer", "student", "normal_user"),
  talentController.getMyApplications,
);
router.get("/opportunities/:id/applications", ...orgAdmin, talentController.getOpportunityApplications);
router.put("/applications/:id/status", ...orgAdmin, talentController.updateApplicationStatus);
router.get("/applications/org", ...orgAdmin, talentController.getOrgApplications);

// Shortlisting (Org → Talent)
router.post("/shortlist/:userId", ...orgAdmin, talentController.toggleShortlist);
router.get("/shortlist", ...orgAdmin, talentController.getOrgShortlistedTalent);
router.get(
  "/shortlist/me",
  authorizeRoles("freelancer", "student", "normal_user"),
  talentController.getMyShortlists,
);

// Messaging
router.get("/conversations/org", ...orgAdmin, talentController.getOrgConversations);
router.post("/applications/:id/messages", talentController.sendMessage);
router.get("/applications/:id/messages", talentController.getApplicationMessages);

// Direct Messaging (Shortlisted candidates)
router.post("/messages/:userId", talentController.sendDirectMessage);
router.get("/messages/:userId", talentController.getDirectMessages);
router.delete("/messages/conversation/:userId", ...orgAdmin, talentController.deleteConversation);
router.delete("/applications/:id/conversation", ...orgAdmin, talentController.deleteApplicationConversation);

// Block Organization (Talent → Org)
router.post(
  "/block-org/:orgId",
  authorizeRoles("freelancer", "student", "normal_user"),
  talentController.blockOrganization,
);

// Archives
router.get("/archives", talentController.getArchives);
router.delete("/archives/:id", talentController.deleteFromArchive);

module.exports = router;

