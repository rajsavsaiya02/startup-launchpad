const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// All routes here are protected
router.use(protect);

router.get("/me", userController.getMe);
router.put("/profile", userController.updateProfile); // Or /me
router.put("/password", userController.updatePassword);

module.exports = router;
