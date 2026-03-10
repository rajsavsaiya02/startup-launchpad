const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

/**
 * UnifiedStorageService
 * Tiered storage system: /admin, /user, /org/<id>
 * Visibility layers: /public, /private
 */
class UnifiedStorageService {
  constructor() {
    this.STORAGE_ROOT = path.join(__dirname, "../../storage");
    this.TIERS = {
      ADMIN: "admin",
      USER: "user",
      ORG: "org",
    };
    this.VISIBILITY = {
      PUBLIC: "public",
      PRIVATE: "private",
    };

    // Ensure root structure exists
    this._ensureDir(this.STORAGE_ROOT);
  }

  /**
   * Internal: Ensure directory exists
   */
  _ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Resolves the physical path for a given tier, visibility, and optional sub-context.
   * @param {string} tier 'admin' | 'user' | 'org'
   * @param {string} visibility 'public' | 'private'
   * @param {string|number} contextId Optional ID for user or org
   * @param {string} subPath Optional further nesting (e.g. 'avatars', 'projects/42')
   */
  resolveDirPath(tier, visibility, contextId = null, subPath = null) {
    let parts = [this.STORAGE_ROOT, tier];

    // Organizations are isolated by ID at the top level of the tier
    if (tier === this.TIERS.ORG && contextId) {
      parts.push(String(contextId));
    }

    parts.push(visibility);

    // Users might want context-specific folders in their tier too, or we use subPath
    if (tier === this.TIERS.USER && contextId) {
      // Optional: /user/<userId>/public/avatars or just /user/public/avatars/<userId>?
      // User prefers keeping it clean. Let's stick to tier structure first.
    }

    if (subPath) {
      parts.push(subPath);
    }

    const absolutePath = path.join(...parts);
    this._ensureDir(absolutePath);
    return absolutePath;
  }

  /**
   * Saves a file buffer to the tiered storage.
   * @param {Object} params
   * @param {Buffer} params.buffer
   * @param {string} params.originalName
   * @param {string} params.tier
   * @param {string} params.visibility
   * @param {string|number} [params.contextId]
   * @param {string} [params.subPath]
   */
  async saveFile({
    buffer,
    originalName,
    tier,
    visibility,
    contextId = null,
    subPath = null,
  }) {
    const ext = path.extname(originalName);
    const storedName = `${uuidv4()}${ext}`;
    const destDir = this.resolveDirPath(tier, visibility, contextId, subPath);
    const absolutePath = path.join(destDir, storedName);

    // Relative path for Database storage
    // Format: /<tier>/[contextId]/<visibility>/[subPath]/<storedName>
    let relativeParts = [tier];
    if (tier === this.TIERS.ORG && contextId)
      relativeParts.push(String(contextId));
    relativeParts.push(visibility);
    if (subPath) relativeParts.push(subPath);
    relativeParts.push(storedName);

    const relativePath = "/" + relativeParts.join("/");

    await fs.promises.writeFile(absolutePath, buffer);

    return {
      storedName,
      originalName,
      path: relativePath,
      absolutePath: absolutePath,
      size: buffer.length,
    };
  }

  /**
   * Deletes a file from tiered storage.
   * @param {string} relativePath As stored in DB
   */
  async deleteFile(relativePath) {
    // Remove leading slash if present
    const cleanPath = relativePath.startsWith("/")
      ? relativePath.substring(1)
      : relativePath;
    const absolutePath = path.join(this.STORAGE_ROOT, cleanPath);

    try {
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        return true;
      }
    } catch (error) {
      logger.error(
        `UnifiedStorage: Failed to delete file at ${absolutePath}`,
        error,
      );
      return false;
    }
    return false;
  }

  /**
   * Utility to get absolute path from relative DB path
   */
  getAbsolutePath(relativePath) {
    const cleanPath = relativePath.startsWith("/")
      ? relativePath.substring(1)
      : relativePath;
    return path.join(this.STORAGE_ROOT, cleanPath);
  }
}

module.exports = new UnifiedStorageService();
