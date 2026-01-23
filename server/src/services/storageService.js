const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const STORAGE_ROOT = path.join(__dirname, '../../'); // server root
const PUBLIC_DIR = path.join(STORAGE_ROOT, 'public', 'uploads');
const PRIVATE_DIR = path.join(STORAGE_ROOT, 'storage', 'private');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(PRIVATE_DIR)) fs.mkdirSync(PRIVATE_DIR, { recursive: true });

class StorageService {
  constructor() {
    this.allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  /**
   * Defines where a file should be stored based on visibility
   * @param {string} visibility 'public' or 'private'
   * @returns {string} Absolute directory path
   */
  getDestination(visibility) {
    return visibility === 'public' ? PUBLIC_DIR : PRIVATE_DIR;
  }

  /**
   * Saves a file buffer to disk
   * @param {Buffer} buffer File content
   * @param {string} originalName Original filename
   * @param {string} visibility 'public' | 'private'
   * @returns {Object} { storedName, path, url (if public) }
   */
  async saveFile(buffer, originalName, visibility = 'private') {
    const ext = path.extname(originalName);
    const storedName = `${uuidv4()}${ext}`;
    const destDir = this.getDestination(visibility);
    const filePath = path.join(destDir, storedName);

    // Relative path for database mainly
    // For public: /uploads/filename.ext
    // For private: /private/filename.ext (internal identifier)
    const relativePath = visibility === 'public' 
      ? `/uploads/${storedName}` 
      : `/private/${storedName}`;

    await fs.promises.writeFile(filePath, buffer);

    return {
      storedName,
      originalName,
      path: relativePath,
      absolutePath: filePath,
      size: buffer.length
    };
  }

  /**
   * Deletes a file from disk
   * @param {string} relativePath 
   * @param {string} visibility 
   */
  async deleteFile(relativePath, visibility) {
    const destDir = this.getDestination(visibility);
    const fileName = path.basename(relativePath);
    const filePath = path.join(destDir, fileName);

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
    return false;
  }

  /**
   * Gets absolute path for file streaming
   * @param {string} relativePath 
   * @param {string} visibility 
   */
  getAbsolutePath(relativePath, visibility) {
    const destDir = this.getDestination(visibility);
    const fileName = path.basename(relativePath);
    return path.join(destDir, fileName);
  }
}

module.exports = new StorageService();
