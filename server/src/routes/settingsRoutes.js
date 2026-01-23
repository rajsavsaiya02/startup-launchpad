const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
// Assuming we might want to add admin auth middleware later, but for now open or consistent with plan
// Plan didn't explicitly demand auth middleware on this new route, but it's an admin feature. 
// I should probably check if I should add verifyAdminToken. 
// Looking at adminRoutes.js, it uses verifyAdminToken. 
// I'll add it for safety, assuming the frontend sends the token.
const { verifyAdminToken } = require('../middleware/adminAuthMiddleware');

router.get('/', settingsController.getSettings); // Anyone can read? Or only admin? Usually settings are public for the app to know name/timezone, but editing is admin only.
// For now, let's make GET public (or at least authenticated user) and PUT admin only.
// Actually, looking at the UI, this is "General Settings" in Admin Panel.
// The plan said "Connect Settings Page to API".
// Let's stick to the simplest first: 
// PUT definitely needs admin token.
// GET might be needed by the app generally.
// I'll leave GET open or require basic auth if I knew where it was.
// Given strictness of "Admin Panel", I'll add verifyAdminToken to PUT. 
// GET I will verifyAdminToken too for now to be safe, as it exposes support email etc which might be public info anyway but context is Admin Dashboard.

router.get('/', settingsController.getSettings); // Public: Required for Login/Landing branding
router.get('/', settingsController.getSettings); // Public: Required for Login/Landing branding

// Specific update routes
router.put('/branding', verifyAdminToken, settingsController.updateBranding);
router.put('/general', verifyAdminToken, settingsController.updateGeneral);
router.put('/email', verifyAdminToken, settingsController.updateEmail);

// Deprecated: Monolithic update (kept if needed for fallback, but frontend will use specific ones)
// router.put('/', verifyAdminToken, settingsController.updateSettings);
router.post('/email/test', verifyAdminToken, settingsController.testEmailConnection);

const emailTemplateController = require('../controllers/emailTemplateController');

// Email Templates Routes
router.get('/email/templates', verifyAdminToken, emailTemplateController.getAllTemplates);
router.get('/email/templates/:id', verifyAdminToken, emailTemplateController.getTemplateById);
router.put('/email/templates/:id', verifyAdminToken, emailTemplateController.updateTemplate);
router.post('/email/templates', verifyAdminToken, emailTemplateController.createTemplate);
router.post('/email/templates/:id/test', verifyAdminToken, emailTemplateController.sendTestEmail);
router.delete('/email/templates/:id', verifyAdminToken, emailTemplateController.deleteTemplate);

module.exports = router;
