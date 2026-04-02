const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const { protect } = require("../middleware/authMiddleware");
const { requireOrgMember } = require("../middleware/orgAuthMiddleware");
const upload = require("../middleware/uploadMiddleware");

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

// Get Dashboard Aggregated Dynamic Metrics
router.get("/dashboard", organizationController.getDashboardMetrics);

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

// Update Organization Logo
router.put(
  "/logo",
  protect,
  requireOrgMember,
  upload.single("logo"),
  organizationController.updateLogo,
);

// Upload Gallery Photo
router.post(
  "/gallery",
  protect,
  requireOrgMember,
  upload.single("photo"),
  organizationController.uploadGalleryPhoto,
);

// Get Organization Members
router.get("/members", organizationController.getOrganizationMembers);

// Invitations
router.post(
  "/invitations/generate",
  protect,
  requireOrgMember,
  organizationController.generateInvitation,
);
router.post(
  "/invitations/email",
  protect,
  requireOrgMember,
  organizationController.emailInvitation,
);

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
  "/members/status",
  protect,
  requireOrgMember,
  organizationController.updatePersonalStatus,
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

// Departments
router.get(
  "/departments",
  protect,
  requireOrgMember,
  organizationController.getDepartments,
);
router.post(
  "/departments",
  protect,
  requireOrgMember,
  organizationController.createDepartment,
);
router.put(
  "/departments/:id",
  protect,
  requireOrgMember,
  organizationController.updateDepartment,
);
router.delete(
  "/departments/:id",
  protect,
  requireOrgMember,
  organizationController.deleteDepartment,
);

// Designations
router.get(
  "/designations",
  protect,
  requireOrgMember,
  organizationController.getDesignations,
);
router.post(
  "/designations",
  protect,
  requireOrgMember,
  organizationController.createDesignation,
);
router.put(
  "/designations/:id",
  protect,
  requireOrgMember,
  organizationController.updateDesignation,
);
router.delete(
  "/designations/:id",
  protect,
  requireOrgMember,
  organizationController.deleteDesignation,
);

module.exports = router;
