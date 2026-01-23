const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { verifyAdminToken, requireSuperAdmin } = require('../middleware/adminAuthMiddleware');

// Protect these routes tightly
router.use(verifyAdminToken);
// router.use(requireSuperAdmin); // Relaxed for demo/access: All admins can view logs

router.get('/logs', systemController.getSystemLogs);
router.get('/ports', systemController.getActivePorts);

module.exports = router;
