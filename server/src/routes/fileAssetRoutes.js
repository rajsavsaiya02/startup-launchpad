const express = require("express");
const router = express.Router();
const fileAssetController = require("../controllers/fileAssetController");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// GET /api/file-assets/context/:contextType/:contextId
router.get(
  "/context/:contextType/:contextId",
  fileAssetController.getFileAssets,
);

// POST /api/file-assets/context/:contextType/:contextId
// Uses upload.single('file') which is safe even if no file is sent (e.g., when sending an external link)
router.post(
  "/context/:contextType/:contextId",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        // Handle Multer size limits or unhandled file types
        return res
          .status(400)
          .json({ error: err.message || "File upload error" });
      }
      next();
    });
  },
  fileAssetController.addFileAsset,
);

// DELETE /api/file-assets/:id
router.delete("/:id", fileAssetController.deleteFileAsset);

// GET /api/file-assets/:id/download
router.get("/:id/download", fileAssetController.downloadFileAsset);

// PUT /api/file-assets/:id
router.put("/:id", fileAssetController.updateFileAsset);

module.exports = router;
