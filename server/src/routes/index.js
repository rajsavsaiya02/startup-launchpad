const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const configRoutes = require('./configRoutes');

router.use('/auth', authRoutes);
router.use('/configs', configRoutes);
router.use('/', healthRoutes);

module.exports = router;
