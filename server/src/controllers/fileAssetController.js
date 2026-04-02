const { pool } = require("../database");
const unifiedStorage = require("../services/UnifiedStorageService");
const fs = require("fs");

class FileAssetController {
  // Helper to check user access based on context.
  async _checkAccess(
    userId,
    userRole,
    contextType,
    contextId,
    isWriteAction = false,
  ) {
    if (userRole === "admin" || userRole === "super_admin") return true;

    if (
      contextType === "organization" ||
      contextType === "organization_finance"
    ) {
      const result = await pool.query(
        "SELECT org_role FROM organization_members WHERE organization_id = $1 AND user_id = $2",
        [contextId, userId],
      );
      if (result.rows.length > 0) {
        const orgRole = result.rows[0].org_role;
        if (isWriteAction) {
          return orgRole === "FOUNDER" || orgRole === "ADMIN";
        }
        return true; // Any member can read
      }
      return false;
    }

    if (contextType === "project") {
      // 1. Check project membership
      const memberResult = await pool.query(
        "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
        [contextId, userId],
      );
      if (memberResult.rows.length > 0) return true;

      // 2. Check organization membership if the project is org-owned
      const projectResult = await pool.query(
        "SELECT owner_org_id FROM projects WHERE id = $1",
        [contextId]
      );
      
      if (projectResult.rows.length > 0 && projectResult.rows[0].owner_org_id) {
        const orgId = projectResult.rows[0].owner_org_id;
        const orgMemberResult = await pool.query(
          "SELECT org_role FROM organization_members WHERE organization_id = $1 AND user_id = $2 AND is_active = true",
          [orgId, userId]
        );
        
        if (orgMemberResult.rows.length > 0) {
          const orgRole = orgMemberResult.rows[0].org_role;
          // Privileged org roles can view files
          if (["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"].includes(orgRole)) {
            return true;
          }
        }
      }

      return false;
    }

    if (contextType === "task") {
      // Check if user is the creator, a project member, or an organization member
      const taskResult = await pool.query(
        "SELECT project_id, organization_id, created_by FROM tasks WHERE id = CAST($1 AS INTEGER)",
        [contextId],
      );
      if (taskResult.rows.length === 0) return false;
      const task = taskResult.rows[0];

      if (task.created_by === userId) return true;

      if (task.project_id) {
        const pmResult = await pool.query(
          "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
          [task.project_id, userId],
        );
        if (pmResult.rows.length > 0) return true;
      }

      if (task.organization_id) {
        const omResult = await pool.query(
          "SELECT 1 FROM organization_members WHERE organization_id = $1 AND user_id = $2",
          [task.organization_id, userId],
        );
        if (omResult.rows.length > 0) return true;
      }

      return false;
    }

    if (contextType === "user") {
      return contextId === userId.toString() || contextId === userId;
    }

    if (contextType === "organization_transaction") {
      if (contextId === "0" || parseInt(contextId) === 0) {
        // Special case: Adding a new transaction. 
        // We verify if the user is an admin or founder of at least one active organization.
        const res = await pool.query(
          "SELECT 1 FROM organization_members WHERE user_id = $1 AND is_active = true AND org_role IN ('FOUNDER', 'CO-FOUNDER', 'ADMIN')",
          [userId]
        );
        return res.rows.length > 0;
      }
      // Check if user has access to the organization that owns this transaction
      const txRes = await pool.query(
        "SELECT organization_id FROM financial_transactions WHERE id = CAST($1 AS INTEGER)",
        [contextId]
      );
      if (txRes.rows.length === 0) return false;
      const orgId = txRes.rows[0].organization_id;
      const result = await pool.query(
        "SELECT org_role FROM organization_members WHERE organization_id = $1 AND user_id = $2 AND is_active = true",
        [orgId, userId],
      );
      if (result.rows.length > 0) {
        const orgRole = result.rows[0].org_role;
        if (isWriteAction) {
          return ["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(orgRole);
        }
        return true;
      }
      return false;
    }

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
        false,
      );
      if (!hasAccess)
        return res.status(403).json({ error: "Access denied to this context" });

      let queryLogic = `f.context_type = $1 AND f.context_id = CAST($2 AS INTEGER)`;
      if (contextType === "project") {
        queryLogic = `
          (f.context_type = $1 AND f.context_id = CAST($2 AS INTEGER)) 
          OR (f.context_type = 'task' AND f.context_id IN (
            SELECT id FROM tasks WHERE project_id = CAST($2 AS INTEGER)
          ))
        `;
      } else if (contextType === "organization_finance") {
        queryLogic = `
          (f.context_type = $1 AND f.context_id = CAST($2 AS INTEGER)) 
          OR (f.context_type = 'organization_transaction' AND (
            f.context_id IN (SELECT id FROM financial_transactions WHERE organization_id = CAST($2 AS INTEGER))
            OR (CAST(f.context_id AS INTEGER) = 0 AND f.uploader_user_id IN (SELECT user_id FROM organization_members WHERE organization_id = CAST($2 AS INTEGER)))
          ))
        `;
      } else if (contextType === "organization") {
        queryLogic = `
          (f.context_type = $1 AND f.context_id = CAST($2 AS INTEGER)) 
          OR (f.context_type = 'task' AND f.context_id IN (
            SELECT id FROM tasks WHERE organization_id = CAST($2 AS INTEGER)
          ))
        `;
      } else if (contextType === "user") {
        queryLogic = `
          (f.context_type = $1 AND f.context_id = CAST($2 AS INTEGER)) 
          OR (f.context_type = 'task' AND f.context_id IN (
            SELECT id FROM tasks WHERE created_by = CAST($2 AS INTEGER) AND project_id IS NULL AND organization_id IS NULL
          ))
        `;
      }

      const query = `
        SELECT f.*, u.first_name, u.last_name, u.name as user_name 
        FROM file_assets f
        LEFT JOIN users u ON f.uploader_user_id = u.id
        WHERE ${queryLogic}
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
        description: row.description,
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
        true,
      );
      if (!hasAccess)
        return res
          .status(403)
          .json({ error: "Access denied to modify this context" });

      // Handle External Link
      if (req.body.isExternal === "true" || req.body.isExternal === true) {
        if (!req.body.storageUrl || !req.body.fileName) {
          return res
            .status(400)
            .json({ error: "Missing required link fields" });
        }
        const result = await pool.query(
          `INSERT INTO file_assets (file_name, storage_url, is_external, context_type, context_id, uploader_user_id, description)
           VALUES ($1, $2, true, $3, $4, $5, $6) RETURNING *`,
          [
            req.body.fileName,
            req.body.storageUrl,
            contextType,
            contextId,
            userId,
            req.body.description,
          ],
        );
        return res.status(201).json(result.rows[0]);
      }

      // Handle File Upload
      if (!req.file) {
        return res.status(400).json({ error: "No file or link provided" });
      }

      // Determine Tier for Unified Storage
      let tier = "org";
      let targetContextId = contextId;
      let subPath = contextType;

      if (contextType === "user") {
        tier = "user";
        subPath = "assets";
      } else if (contextType === "organization") {
        tier = "org";
        subPath = "general";
      }

      const savedFile = await unifiedStorage.saveFile({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        tier: tier,
        visibility: "private", // File Assets are private by default in this context
        contextId: targetContextId,
        subPath: subPath,
      });

      try {
        const result = await pool.query(
          `INSERT INTO file_assets (file_name, mime_type, size_bytes, storage_url, is_external, context_type, context_id, uploader_user_id, description)
           VALUES ($1, $2, $3, $4, false, $5, $6, $7, $8) RETURNING *`,
          [
            req.body.title || savedFile.originalName,
            req.file.mimetype,
            savedFile.size,
            savedFile.path,
            contextType,
            contextId,
            userId,
            req.body.description,
          ],
        );

        res.status(201).json(result.rows[0]);
      } catch (dbErr) {
        await unifiedStorage.deleteFile(savedFile.path);
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
        true,
      );

      if (!hasAccess && fileAsset.uploader_user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete from disk if local
      if (!fileAsset.is_external) {
        await unifiedStorage.deleteFile(fileAsset.storage_url);
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
      const { fileName, description } = req.body;
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
        true,
      );

      if (!hasAccess && fileAsset.uploader_user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateResult = await pool.query(
        "UPDATE file_assets SET file_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE file_asset_id = $3 RETURNING *",
        [fileName.trim(), description, id],
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
        false,
      );
      if (!hasAccess) return res.status(403).json({ error: "Access denied" });

      if (fileAsset.is_external) {
        return res
          .status(400)
          .json({ error: "Cannot download external link directly" });
      }

      const filePath = unifiedStorage.getAbsolutePath(fileAsset.storage_url);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File physically missing" });
      }

      const encodedFilename = encodeURIComponent(fileAsset.file_name);
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
