const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All routes here are protected
router.use(protect);

router.get("/me", userController.getMe);
router.put("/profile", userController.updateProfile); // Or /me
router.post("/avatar", upload.single("avatar"), userController.updateAvatar);
router.delete("/avatar", userController.removeAvatar);
router.put("/password", userController.updatePassword);
router.get("/preferences", userController.getPreferences);
router.put("/preferences", userController.updatePreferences);

module.exports = router;
