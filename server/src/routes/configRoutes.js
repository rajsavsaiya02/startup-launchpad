const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/:type', configController.serveConfig);

module.exports = router;
