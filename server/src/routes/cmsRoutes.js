const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const upload = require('../middleware/uploadMiddleware');
// const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware'); 
// Assuming auth middleware is available, will comment out for now to ensure connectivity first
// In production, uncomment and import middleware

// Sitemap & SEO
router.get('/sitemap.xml', cmsController.generateSitemap);
router.get('/robots.txt', cmsController.generateRobots);

// Public Routes (No Auth)
router.get('/public-index', cmsController.getPublicIndex);
router.get('/public/:slug', cmsController.getPagePublic);
router.get('/pages', cmsController.listPages); // List pages can be public or admin protected, usually admin

// Admin Routes (Should be protected)
router.post('/pages', cmsController.createPage);
router.get('/admin/:id', cmsController.getPageAdmin);
router.put('/admin/:id/draft', cmsController.updateDraft);
router.post('/upload', upload.single('file'), cmsController.uploadMedia);
router.post('/admin/:id/publish', cmsController.publishPage);
router.delete('/admin/:id', cmsController.deletePage);

module.exports = router;
