const multer = require("multer");
const path = require("path");

// Configure storage
// We use memory storage to access the buffer before saving to disk via UnifiedStorageService
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Define explicitly dangerous file types
  const dangerousMimeTypes = [
    "application/x-msdownload", // EXEs
    "application/x-executable", // Linux binaries
  ];

  const dangerousExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".scr",
    ".vbs",
    ".msi",
    ".dll",
    ".so",
  ];

  const ext = file.originalname
    ? path.extname(file.originalname).toLowerCase()
    : "";

  if (
    dangerousMimeTypes.includes(file.mimetype.toLowerCase()) ||
    dangerousExtensions.includes(ext)
  ) {
    const error = new Error(
      `File type not permitted for security reasons: ${ext || file.mimetype}`,
    );
    error.status = 400;
    return cb(error, false);
  }

  cb(null, true);
};

// Default upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Increased to 50MB as standard for docs/media
  },
  fileFilter: fileFilter,
});

/**
 * Dynamic configuration helper (optional use)
 * Allows routes to override limits or add storage hints
 */
upload.configure = (options = {}) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: options.fileSize || 50 * 1024 * 1024,
    },
    fileFilter: options.fileFilter || fileFilter,
  });
};

module.exports = upload;
