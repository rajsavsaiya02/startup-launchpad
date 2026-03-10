const express = require("express");
const router = express.Router();
const talentController = require("../controllers/talentController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Simple role authorization middleware
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

// Public Profile (Public)
router.get("/profile/:username", talentController.getPublicProfile);

// Protect all following routes
router.use(protect);

// Talent User Search (for Find Talent tab in org Talent Hub)
router.get(
  "/users",
  authorizeRoles("founder", "admin"),
  talentController.getTalentUsers,
);

// Self Profile Management
router.put("/profile/me", talentController.updatePublicProfile);
router.post(
  "/profile/me/avatar",
  upload.single("avatar"),
  talentController.updatePublicProfileAvatar,
);
router.delete("/profile/me/avatar", talentController.removePublicProfileAvatar);

// Opportunities (Creation and listing)
router.post(
  "/opportunities",
  authorizeRoles("founder", "admin"),
  talentController.createOpportunity,
);
router.get("/opportunities", talentController.getAllOpportunities);
router.get("/opportunities/:id", talentController.getOpportunityById);

// Applying and Reviewing Applications
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
router.get(
  "/opportunities/:id/applications",
  authorizeRoles("founder", "admin"),
  talentController.getOpportunityApplications,
);
router.put(
  "/applications/:id/status",
  authorizeRoles("founder", "admin"),
  talentController.updateApplicationStatus,
);
router.get(
  "/applications/org",
  authorizeRoles("founder", "admin"),
  talentController.getOrgApplications,
);

// Shortlisting (Org -> Talent)
router.post(
  "/shortlist/:userId",
  authorizeRoles("founder", "admin"),
  talentController.toggleShortlist,
);
router.get(
  "/shortlist",
  authorizeRoles("founder", "admin"),
  talentController.getOrgShortlistedTalent,
);
router.get(
  "/shortlist/me",
  authorizeRoles("freelancer", "student", "normal_user"),
  talentController.getMyShortlists,
);

// Messaging
router.get(
  "/conversations/org",
  authorizeRoles("founder", "admin"),
  talentController.getOrgConversations,
);
router.post("/applications/:id/messages", talentController.sendMessage);
router.get(
  "/applications/:id/messages",
  talentController.getApplicationMessages,
);

// Direct Messaging (Shortlisted candidates)
router.post("/messages/:userId", talentController.sendDirectMessage);
router.get("/messages/:userId", talentController.getDirectMessages);
router.delete(
  "/messages/conversation/:userId",
  authorizeRoles("founder", "admin"),
  talentController.deleteConversation,
);

// Block Organization (Talent -> Org)
router.post(
  "/block-org/:orgId",
  authorizeRoles("freelancer", "student", "normal_user"),
  talentController.blockOrganization,
);

// Archives
router.get("/archives", talentController.getArchives);
router.delete("/archives/:id", talentController.deleteFromArchive);

module.exports = router;
