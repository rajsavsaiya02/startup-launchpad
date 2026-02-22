const { pool } = require("../database");
const fileAssetStorage = require("../services/fileAssetStorage");
const fs = require("fs");

class FileAssetController {
  // Helper to check user access based on context.
  // Expand this later for other contexts like 'gig', 'transaction'.
  async _checkAccess(userId, userRole, contextType, contextId) {
    if (userRole === "admin" || userRole === "super_admin") return true;

    if (contextType === "project") {
      const result = await pool.query(
        "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
        [contextId, userId],
      );
      return result.rows.length > 0;
    }

    // Default deny for unknown contexts
    return false;
  }

  getFileAssets = async (req, res) => {
    try {
      const { contextType, contextId } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const hasAccess = await this._checkAccess(
        userId,
        role,
        contextType,
        contextId,
      );
      if (!hasAccess)
        return res.status(403).json({ error: "Access denied to this context" });

      const query = `
        SELECT f.*, u.first_name, u.last_name, u.name as user_name 
        FROM file_assets f
        LEFT JOIN users u ON f.uploader_user_id = u.id
        WHERE f.context_type = $1 AND f.context_id = $2
        ORDER BY f.created_at DESC
      `;
      const result = await pool.query(query, [contextType, contextId]);

      const mapped = result.rows.map((row) => ({
        id: row.file_asset_id,
        fileName: row.file_name,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        storageUrl: row.storage_url,
        isExternal: row.is_external,
        createdAt: row.created_at,
        uploaderName:
          row.user_name ||
          (row.first_name
            ? `${row.first_name} ${row.last_name || ""}`.trim()
            : "Unknown"),
      }));

      res.json(mapped);
    } catch (error) {
      console.error("Error fetching file assets:", error);
      res.status(500).json({ error: "Failed to fetch file assets" });
    }
  };

  addFileAsset = async (req, res) => {
    try {
      const { contextType, contextId } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const hasAccess = await this._checkAccess(
        userId,
        role,
        contextType,
        contextId,
      );
      if (!hasAccess)
        return res.status(403).json({ error: "Access denied to this context" });

      // Handle External Link
      if (req.body.isExternal === "true" || req.body.isExternal === true) {
        if (!req.body.storageUrl || !req.body.fileName) {
          return res
            .status(400)
            .json({ error: "Missing required link fields" });
        }
        const result = await pool.query(
          `
          INSERT INTO file_assets (file_name, storage_url, is_external, context_type, context_id, uploader_user_id)
          VALUES ($1, $2, true, $3, $4, $5) RETURNING *
        `,
          [
            req.body.fileName,
            req.body.storageUrl,
            contextType,
            contextId,
            userId,
          ],
        );

        return res.status(201).json(result.rows[0]);
      }

      // Handle File Upload
      if (!req.file) {
        return res.status(400).json({ error: "No file or link provided" });
      }

      const customTitle = req.body.title?.trim();

      const savedFile = await fileAssetStorage.saveFile(
        req.file.buffer,
        req.file.originalname,
        contextType,
        contextId,
      );

      try {
        const result = await pool.query(
          `
          INSERT INTO file_assets (file_name, mime_type, size_bytes, storage_url, is_external, context_type, context_id, uploader_user_id)
          VALUES ($1, $2, $3, $4, false, $5, $6, $7) RETURNING *
        `,
          [
            customTitle || savedFile.originalName,
            req.file.mimetype,
            savedFile.size,
            savedFile.path,
            contextType,
            contextId,
            userId,
          ],
        );

        res.status(201).json(result.rows[0]);
      } catch (dbErr) {
        // Rollback physical file if DB insertion fails
        await fileAssetStorage.deleteFile(savedFile.path);
        throw dbErr;
      }
    } catch (error) {
      console.error("Error adding file asset:", error);
      res.status(500).json({ error: "Failed to add file asset" });
    }
  };

  deleteFileAsset = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const result = await pool.query(
        "SELECT * FROM file_assets WHERE file_asset_id = $1",
        [id],
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Not found" });

      const fileAsset = result.rows[0];
      const hasAccess = await this._checkAccess(
        userId,
        role,
        fileAsset.context_type,
        fileAsset.context_id,
      );

      // Additional check: users can delete their own files even if not strictly context admins,
      // but if they lost context access entirely, allow if they are uploader
      if (!hasAccess && fileAsset.uploader_user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete from disk if local
      if (!fileAsset.is_external) {
        await fileAssetStorage.deleteFile(fileAsset.storage_url);
      }

      await pool.query("DELETE FROM file_assets WHERE file_asset_id = $1", [
        id,
      ]);
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Error deleting file asset:", error);
      res.status(500).json({ error: "Failed to delete file asset" });
    }
  };

  updateFileAsset = async (req, res) => {
    try {
      const { id } = req.params;
      const { fileName } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      if (!fileName || fileName.trim() === "") {
        return res.status(400).json({ error: "File name is required" });
      }

      const result = await pool.query(
        "SELECT * FROM file_assets WHERE file_asset_id = $1",
        [id],
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Not found" });

      const fileAsset = result.rows[0];
      const hasAccess = await this._checkAccess(
        userId,
        role,
        fileAsset.context_type,
        fileAsset.context_id,
      );

      // Same logic as delete: context access or uploader
      if (!hasAccess && fileAsset.uploader_user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateResult = await pool.query(
        "UPDATE file_assets SET file_name = $1, updated_at = CURRENT_TIMESTAMP WHERE file_asset_id = $2 RETURNING *",
        [fileName.trim(), id],
      );

      res.json(updateResult.rows[0]);
    } catch (error) {
      console.error("Error updating file asset:", error);
      res.status(500).json({ error: "Failed to update file asset" });
    }
  };

  downloadFileAsset = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const result = await pool.query(
        "SELECT * FROM file_assets WHERE file_asset_id = $1",
        [id],
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Not found" });

      const fileAsset = result.rows[0];
      const hasAccess = await this._checkAccess(
        userId,
        role,
        fileAsset.context_type,
        fileAsset.context_id,
      );
      if (!hasAccess) return res.status(403).json({ error: "Access denied" });

      if (fileAsset.is_external) {
        return res
          .status(400)
          .json({ error: "Cannot download external link directly" });
      }

      const filePath = fileAssetStorage.getAbsolutePath(fileAsset.storage_url);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File physically missing" });
      }

      const encodedFilename = encodeURIComponent(fileAsset.file_name);
      // Use filename*=UTF-8'' for safe headers, or fallback to simple filename
      res.setHeader(
        "Content-Type",
        fileAsset.mime_type || "application/octet-stream",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileAsset.file_name}"; filename*=UTF-8''${encodedFilename}`,
      );

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      console.error("Error downloading file asset:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  };
}

module.exports = new FileAssetController();
