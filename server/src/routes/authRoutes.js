const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();

// Trigger Google OAuth
router.get(
    '/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

// Google OAuth Callback
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

// Trigger GitHub OAuth
router.get(
    '/github',
    passport.authenticate('github', { session: false, scope: ['user:email'] })
);

// GitHub OAuth Callback
router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    authController.githubCallback
);

// Email/Password Auth
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Get Current User (Session Verification)
const verifyToken = require('../middleware/authMiddleware');
router.get('/me', verifyToken, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
