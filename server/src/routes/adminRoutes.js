const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');
const adminPlatformUserController = require('../controllers/adminPlatformUserController');
const { verifyAdminToken, requireSuperAdmin } = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);
router.get('/me', verifyAdminToken, adminAuthController.getMe);
router.put('/profile', verifyAdminToken, adminAuthController.updateProfile);

// Super Admin Management Routes
router.get('/users', verifyAdminToken, requireSuperAdmin, adminController.getAllAdmins);
router.post('/users', verifyAdminToken, requireSuperAdmin, adminController.createAdmin);
router.put('/users/:id', verifyAdminToken, requireSuperAdmin, adminController.updateAdmin);
router.put('/users/:id/password', verifyAdminToken, requireSuperAdmin, adminController.changeAdminPassword);
router.delete('/users/:id', verifyAdminToken, requireSuperAdmin, adminController.deleteAdmin);

// Platform User Management Routes (for Admins)
router.get('/platform-users', verifyAdminToken, adminPlatformUserController.getPlatformUsers);
router.post('/platform-users', verifyAdminToken, adminPlatformUserController.createPlatformUser);
router.put('/platform-users/:id/status', verifyAdminToken, adminPlatformUserController.updateUserStatus);
router.put('/platform-users/:id/password', verifyAdminToken, adminPlatformUserController.resetUserPassword);
router.delete('/platform-users/:id', verifyAdminToken, requireSuperAdmin, adminPlatformUserController.deleteUser); // Require super admin for deletion

module.exports = router;
