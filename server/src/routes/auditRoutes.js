const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyAdminToken } = require('../middleware/adminAuthMiddleware');

// All routes require admin authentication
router.use(verifyAdminToken);

router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);

module.exports = router;
