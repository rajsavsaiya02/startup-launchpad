const multer = require('multer');

// Configure storage
// We use memory storage to access the buffer before saving to disk via StorageService
const storage = multer.memoryStorage();

// File filter (optional, can be expanded)
const fileFilter = (req, file, cb) => {
  // Accept images and pdfs/docs
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype.includes('wordprocessingml') ||
    file.mimetype.includes('msword')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB default limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
