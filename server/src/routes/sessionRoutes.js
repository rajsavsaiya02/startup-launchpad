const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, sessionController.getActiveSessions);
router.delete('/:sessionId', protect, sessionController.revokeSession);
router.delete('/', protect, sessionController.revokeAllOtherSessions);

module.exports = router;
