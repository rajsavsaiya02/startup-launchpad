const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const STORAGE_ROOT = path.join(__dirname, "../../");
const ASSETS_ROOT = path.join(STORAGE_ROOT, "storage", "FileAssets");
const PRIVATE_DIR = path.join(ASSETS_ROOT, "private");

class FileAssetStorage {
  /**
   * Saves a file buffer to disk under context structure
   */
  async saveFile(buffer, originalName, contextType, contextId) {
    const ext = path.extname(originalName);
    const storedName = `${uuidv4()}${ext}`;

    // e.g. server/storage/FileAssets/private/project/102
    const destDir = path.join(PRIVATE_DIR, contextType, String(contextId));

    if (!fs.existsSync(destDir)) {
      await fs.promises.mkdir(destDir, { recursive: true });
    }

    const filePath = path.join(destDir, storedName);

    // Relative path for database
    const relativePath = `/${contextType}/${contextId}/${storedName}`;

    await fs.promises.writeFile(filePath, buffer);

    return {
      storedName,
      originalName,
      path: relativePath,
      absolutePath: filePath,
      size: buffer.length,
    };
  }

  /**
   * Deletes a file from disk
   */
  async deleteFile(relativePath) {
    // relativePath is like /project/102/xxxx.pdf
    const filePath = path.join(PRIVATE_DIR, relativePath);

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
   */
  getAbsolutePath(relativePath) {
    return path.join(PRIVATE_DIR, relativePath);
  }
}

module.exports = new FileAssetStorage();
