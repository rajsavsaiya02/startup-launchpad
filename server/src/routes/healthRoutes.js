const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/health', healthController.checkHealth);
router.post('/health/quota', healthController.updateQuota);

module.exports = router;
