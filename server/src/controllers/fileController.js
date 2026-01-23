const { pool } = require('../database');
const storageService = require('../services/storageService');
const fs = require('fs');

class FileController {
  
  /**
   * Upload a File
   * POST /upload
   * Body: { visibility: 'public' | 'private' }
   */
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Default to private if not specified
      const visibility = req.body.visibility === 'public' ? 'public' : 'private';
      const uploaderId = req.user ? req.user.id : null; // Assumes auth middleware
      const uploaderType = req.user ? (req.user.role === 'admin' || req.user.role === 'super_admin' ? 'admin' : 'user') : 'unknown';

      if (!uploaderId && visibility === 'private') {
         return res.status(401).json({ error: 'Unauthorized to upload private files' });
      }

      // Save to Disk
      const savedFile = await storageService.saveFile(req.file.buffer, req.file.originalname, visibility);

      try {
        // Save to DB
        const result = await pool.query(
          `INSERT INTO files 
          (uploader_id, uploader_type, original_name, stored_name, mime_type, size, path, visibility)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [uploaderId, uploaderType, savedFile.originalName, savedFile.storedName, req.file.mimetype, savedFile.size, savedFile.path, visibility]
        );

        const fileRecord = result.rows[0];

        res.status(201).json({
          message: 'File uploaded successfully',
          file: {
            id: fileRecord.id,
            url: visibility === 'public' ? `${process.env.BASE_URL || 'http://localhost:5000'}${fileRecord.path}` : `/api/files/${fileRecord.id}`,
            original_name: fileRecord.original_name,
            mime_type: fileRecord.mime_type
          }
        });
      } catch (dbError) {
        // Rollback: Delete the file if DB insert fails
        console.error('Database insert failed, cleaning up file:', dbError);
        await storageService.deleteFile(savedFile.path, visibility);
        throw dbError; // Re-throw to be caught by outer catch
      }

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'File upload failed' });
    }
  }

  /**
   * Get Private File (Secure Stream)
   * GET /files/:id
   */
  async getFile(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query('SELECT * FROM files WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      const file = result.rows[0];

      // Authorization Check for Private Files
      if (file.visibility === 'private') {
        // Must be logged in
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        // Must be Owner OR Admin
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        // Use loose equality or conversion to handle string (JWT) vs int (DB) mismatch
        const isOwner = String(file.uploader_id) === String(req.user.id);

        if (!isAdmin && !isOwner) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      // Get absolute path
      const absolutePath = storageService.getAbsolutePath(file.stored_name, file.visibility); // Stored name is filename? No, stored_name is uuid. path is relative. 
      // storageService expects relative path for helper? No, getAbsolutePath logic:
      // it takes relativePath? currently implemented as taking relativePath or filename. 
      // Looking at storageService: getAbsolutePath(relativePath, visibility) -> path.join(dest, path.basename(rel))
      // So passed "file.path" (e.g. /private/uuid.ext) works.
      const filePath = storageService.getAbsolutePath(file.path, file.visibility);

      if (!fs.existsSync(filePath)) {
         return res.status(404).json({ error: 'File content missing' });
      }

      // Stream file
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);

    } catch (error) {
      console.error('File retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve file' });
    }
  }

  /**
   * Delete File
   * DELETE /files/:id
   */
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query('SELECT * FROM files WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      const file = result.rows[0];

      // Auth Check
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      const isOwner = String(file.uploader_id) === String(req.user.id);

      if (!isAdmin && !isOwner) {
         return res.status(403).json({ error: 'Forbidden' });
      }

      // Delete from Disk
      await storageService.deleteFile(file.path, file.visibility);

      // Delete from DB
      await pool.query('DELETE FROM files WHERE id = $1', [id]);

      res.json({ message: 'File deleted successfully' });

    } catch (error) {
       console.error('Delete error:', error);
       res.status(500).json({ error: 'Failed to delete file' });
    }
  }

}

module.exports = new FileController();
