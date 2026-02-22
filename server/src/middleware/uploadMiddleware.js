const multer = require("multer");
const path = require("path");

// Configure storage
// We use memory storage to access the buffer before saving to disk via StorageService
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Define explicitly dangerous file types that could harm the server or execute XSS attacks
  const dangerousMimeTypes = [
    "application/x-msdownload", // EXEs
    "application/x-sh", // Bash scripts
    "application/x-executable", // Linux binaries
    "application/javascript", // JS scripts
    "text/javascript",
    "text/html", // HTML pages
    "text/x-python", // Python scripts
    "application/x-php", // PHP scripts
  ];

  const dangerousExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".js",
    ".py",
    ".php",
    ".rb",
    ".pl",
    ".html",
    ".htm",
    ".ps1",
    ".vbs",
    ".msi",
    ".apk",
    ".app",
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
    // Return a 400 status error string that can be caught
    const error = new Error(
      `File type not permitted for security reasons: ${ext || file.mimetype}`,
    );
    error.status = 400;
    return cb(error, false);
  }

  // Allow all other file types (PSD, CAD, CDR, etc.)
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB default limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
