const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const { protect } = require("../middleware/authMiddleware");
const { requireOrgMember } = require("../middleware/orgAuthMiddleware");

// Route to create a new organization (must be logged in as 'founder', checked in controller)
router.post("/", protect, organizationController.createOrganization);

// Check URL availability
router.get(
  "/check-url",
  protect,
  organizationController.checkWorkspaceUrlAvailability,
);

// Join Organization (Doesn't require requireOrgMember yet)
router.post("/join", protect, organizationController.joinOrganization);

// Fetch Organization Public Profile (Open Route)
router.get("/public/:slug", organizationController.getPublicProfileBySlug);

// From here on, all routes require the user to be part of an organization
router.use(protect, requireOrgMember);

// Get Organization Details
router.get("/", organizationController.getOrganizationDetails);

// Update Workspace Settings
router.put(
  "/",
  protect,
  requireOrgMember,
  organizationController.updateOrganizationSettings,
);

// Update Public Profile
router.put(
  "/profile",
  protect,
  requireOrgMember,
  organizationController.updatePublicProfile,
);

// Get Organization Members
router.get("/members", organizationController.getOrganizationMembers);

// Member Management
router.post(
  "/leave",
  protect,
  requireOrgMember,
  organizationController.leaveOrganization,
);
router.delete(
  "/kick",
  protect,
  requireOrgMember,
  organizationController.kickMember,
);
router.put(
  "/members/role",
  protect,
  requireOrgMember,
  organizationController.updateMemberRole,
);
router.put(
  "/members/hierarchy",
  protect,
  requireOrgMember,
  organizationController.updateTeamHierarchy,
);

// Explicit Teams Management
router.post(
  "/teams",
  protect,
  requireOrgMember,
  organizationController.createTeam,
);
router.put(
  "/teams/:teamId",
  protect,
  requireOrgMember,
  organizationController.updateTeam,
);
router.delete(
  "/teams/:teamId",
  protect,
  requireOrgMember,
  organizationController.deleteTeam,
);

// Delete Organization
router.post(
  "/delete-otp",
  protect,
  requireOrgMember,
  organizationController.requestDeleteOrganizationOtp,
);
router.delete(
  "/",
  protect,
  requireOrgMember,
  organizationController.deleteOrganization,
);

// Master Password Management
router.post(
  "/security-code-otp",
  protect,
  requireOrgMember,
  organizationController.requestChangeSecurityCodeOtp,
);

router.put(
  "/security-code",
  protect,
  requireOrgMember,
  organizationController.updateSecurityCode,
);

module.exports = router;
