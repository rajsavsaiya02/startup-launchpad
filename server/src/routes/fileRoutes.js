const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Upload File (Any authenticated user)
// POST /api/files/upload
router.post('/upload', protect, upload.single('file'), fileController.uploadFile);

// Get Private File (Controller handles auth check internal logic or we can add verifyToken here too)
// GET /api/files/:id
// We add verifyToken here ensuring at least some valid token is present, 
// controller deals with "is this user allowed to see this specific file"
router.get('/:id', protect, fileController.getFile);

// Delete File
// DELETE /api/files/:id
router.delete('/:id', protect, fileController.deleteFile);

module.exports = router;
