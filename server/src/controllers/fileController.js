const { pool } = require("../database");
const unifiedStorage = require("../services/UnifiedStorageService");
const fs = require("fs");

class FileController {
  /**
   * Upload a File (Generic User Upload)
   * POST /upload
   * Body: { visibility: 'public' | 'private', tier: 'user' | 'admin' }
   */
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const visibility =
        req.body.visibility === "public" ? "public" : "private";
      const uploaderId = req.user ? req.user.id : null;

      // Determine tier. If admin is uploading, tier is admin.
      const isAdmin =
        req.user &&
        (req.user.role === "admin" || req.user.role === "super_admin");
      const tier = isAdmin && req.body.tier === "admin" ? "admin" : "user";
      const uploaderType = isAdmin ? "admin" : "user";

      if (!uploaderId && visibility === "private") {
        return res
          .status(401)
          .json({ error: "Unauthorized to upload private files" });
      }

      // Save to Disk via Unified Service
      const savedFile = await unifiedStorage.saveFile({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        tier: tier,
        visibility: visibility,
        subPath: "uploads",
      });

      try {
        // Save to DB
        const result = await pool.query(
          `INSERT INTO files 
          (uploader_id, uploader_type, original_name, stored_name, mime_type, size, path, visibility)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            uploaderId,
            uploaderType,
            savedFile.originalName,
            savedFile.storedName,
            req.file.mimetype,
            savedFile.size,
            savedFile.path,
            visibility,
          ],
        );

        const fileRecord = result.rows[0];

        res.status(201).json({
          message: "File uploaded successfully",
          file: {
            id: fileRecord.id,
            url:
              visibility === "public"
                ? `/public-assets${fileRecord.path}`
                : `/api/files/${fileRecord.id}`,
            original_name: fileRecord.original_name,
            mime_type: fileRecord.mime_type,
          },
        });
      } catch (dbError) {
        console.error("Database insert failed, cleaning up file:", dbError);
        await unifiedStorage.deleteFile(savedFile.path);
        throw dbError;
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  }

  /**
   * Get Private File (Secure Stream)
   * GET /files/:id
   */
  async getFile(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query("SELECT * FROM files WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }

      const file = result.rows[0];

      // Authorization Check
      if (file.visibility === "private") {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const isAdmin =
          req.user.role === "admin" || req.user.role === "super_admin";
        const isOwner = String(file.uploader_id) === String(req.user.id);

        if (!isAdmin && !isOwner) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const filePath = unifiedStorage.getAbsolutePath(file.path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File content missing" });
      }

      res.setHeader("Content-Type", file.mime_type);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.original_name}"`,
      );
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      console.error("File retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve file" });
    }
  }

  /**
   * Delete File
   * DELETE /files/:id
   */
  async deleteFile(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query("SELECT * FROM files WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }
      const file = result.rows[0];

      // Auth Check
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const isAdmin =
        req.user.role === "admin" || req.user.role === "super_admin";
      const isOwner = String(file.uploader_id) === String(req.user.id);

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Delete from Disk
      await unifiedStorage.deleteFile(file.path);

      // Delete from DB
      await pool.query("DELETE FROM files WHERE id = $1", [id]);

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  }
}

module.exports = new FileController();
