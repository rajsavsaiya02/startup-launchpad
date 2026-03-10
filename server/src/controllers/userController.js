const bcrypt = require("bcrypt");
const { pool } = require("../database");
const logger = require("../utils/logger");
const unifiedStorage = require("../services/UnifiedStorageService");

// ─────────────────────────────────────────────────────────────
// HELPER — delete an old local avatar file + its files record
// ─────────────────────────────────────────────────────────────
const LOCAL_AVATAR_PREFIXES = ["/public-assets/user/public/uploads"];

/**
 * Deletes a locally-stored avatar from disk and from the files table.
 * No-ops gracefully if the URL is external (http/https) or null.
 */
async function _deleteOldAvatar(oldUrl) {
  if (!oldUrl || typeof oldUrl !== "string") return;

  // Use .includes to catch absolute URLs (e.g. http://localhost:3000/public-assets/...)
  const isLocal = LOCAL_AVATAR_PREFIXES.some((prefix) =>
    oldUrl.includes(prefix),
  );
  if (!isLocal) return;

  // Extract the relative path starting from /user/...
  // Regex looks for anything after /public-assets
  const match = oldUrl.match(/\/public-assets(\/.*)/);
  const relativePath = match ? match[1] : null;

  if (!relativePath) {
    logger.warn(
      `_deleteOldAvatar: could not parse relative path from ${oldUrl}`,
    );
    return;
  }

  try {
    await unifiedStorage.deleteFile(relativePath);
    logger.info(`_deleteOldAvatar: deleted file at ${relativePath}`);
  } catch (e) {
    logger.warn(`_deleteOldAvatar: could not delete file at ${relativePath}`);
  }

  try {
    await pool.query("DELETE FROM files WHERE path = $1", [relativePath]);
  } catch (e) {
    logger.warn(
      `_deleteOldAvatar: could not remove files record for ${relativePath}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Get Current User Profile
// ─────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, first_name, last_name, name, email, role,
              is_verified, created_at, bio, location, office_location,
              social_github, social_linkedin, social_website, job_title,
              department, phone_number, skills, public_profile,
              avatar AS avatar_url,
              public_profile_avatar
       FROM users WHERE id = $1`,
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    logger.error(`Error fetching user profile: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Update Password
// ─────────────────────────────────────────────────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult.rows[0];

    if (!user.password_hash) {
      return res.status(400).json({
        message:
          "Account uses social login (Google/GitHub). Please use that to login.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    logger.info(`Password updated for user ${userId}`);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    logger.error(`Error updating password: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Update Profile (General)
// NOTE: avatar_url changes here are handled by the dedicated
//       /avatar endpoint. This route ignores avatar_url to
//       prevent accidental bypassing of file-deletion logic.
// ─────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      location,
      office_location,
      social_github,
      social_linkedin,
      social_website,
      job_title,
      department,
      phone_number,
      skills,
      role,
      public_profile,
      avatar_url,
      public_profile_avatar,
    } = req.body;
    const userId = req.user.id;

    // Normalize empty strings to null (treat as removal)
    const normalizedAvatar = avatar_url === "" ? null : avatar_url;
    const normalizedPublicAvatar =
      public_profile_avatar === "" ? null : public_profile_avatar;

    // Fetch current profile to check for image changes
    const currentResult = await pool.query(
      "SELECT avatar, public_profile_avatar FROM users WHERE id = $1",
      [userId],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = currentResult.rows[0];

    // Handle avatar_url change/deletion
    if (
      normalizedAvatar !== undefined &&
      normalizedAvatar !== currentUser.avatar
    ) {
      await _deleteOldAvatar(currentUser.avatar);
    }

    // Handle public_profile_avatar change/deletion
    if (
      normalizedPublicAvatar !== undefined &&
      normalizedPublicAvatar !== currentUser.public_profile_avatar
    ) {
      await _deleteOldAvatar(currentUser.public_profile_avatar);
    }

    const name = `${firstName} ${lastName}`.trim();

    const query = `
            UPDATE users 
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                name = COALESCE($3, name),
                bio = COALESCE($4, bio),
                location = COALESCE($5, location),
                office_location = COALESCE($6, office_location),
                social_github = COALESCE($7, social_github),
                social_linkedin = COALESCE($8, social_linkedin),
                skills = COALESCE($9, skills),
                social_website = COALESCE($10, social_website),
                job_title = COALESCE($11, job_title),
                department = COALESCE($12, department),
                phone_number = COALESCE($13, phone_number),
                role = COALESCE($14, role),
                public_profile = COALESCE($15, public_profile),
                avatar = CASE WHEN $16::text IS NOT NULL OR $17::boolean THEN $18 ELSE avatar END,
                public_profile_avatar = CASE WHEN $19::text IS NOT NULL OR $20::boolean THEN $21 ELSE public_profile_avatar END
            WHERE id = $22
            RETURNING id, username, first_name, last_name, name, email, bio,
                      location, office_location, social_github, social_linkedin,
                      social_website, job_title, department, phone_number,
                      skills, public_profile, avatar AS avatar_url,
                      public_profile_avatar, role
        `;

    const values = [
      firstName,
      lastName,
      name,
      bio,
      location,
      office_location,
      social_github,
      social_linkedin,
      skills,
      social_website,
      job_title,
      department,
      phone_number,
      role,
      public_profile,
      normalizedAvatar, // $16
      normalizedAvatar === null, // $17 (explicit removal)
      normalizedAvatar, // $18
      normalizedPublicAvatar, // $19
      normalizedPublicAvatar === null, // $20 (explicit removal)
      normalizedPublicAvatar, // $21
      userId, // $22
    ];
    const result = await pool.query(query, values);

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    logger.error(`Error updating profile: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Update My Profile Avatar (replaces, deletes old file)
// POST /api/user/avatar
// ─────────────────────────────────────────────────────────────
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    const userId = req.user.id;

    // Save to disk via Unified Service
    const savedFile = await unifiedStorage.saveFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      tier: "user",
      visibility: "public",
      subPath: "uploads",
    });

    const avatarUrl = `/public-assets${savedFile.path}`;

    // Fetch old avatar before overwriting
    const oldResult = await pool.query(
      "SELECT avatar FROM users WHERE id = $1",
      [userId],
    );
    const oldAvatar = oldResult.rows[0]?.avatar;

    // Update DB
    await pool.query("UPDATE users SET avatar = $1 WHERE id = $2", [
      avatarUrl,
      userId,
    ]);

    // Track new file in files table
    await pool.query(
      `INSERT INTO files 
      (uploader_id, uploader_type, original_name, stored_name, mime_type, size, path, visibility)
      VALUES ($1, 'user', $2, $3, $4, $5, $6, 'public')`,
      [
        userId,
        savedFile.originalName,
        savedFile.storedName,
        req.file.mimetype,
        savedFile.size,
        savedFile.path,
      ],
    );

    // Clean up old avatar file from disk (only local files, not external URLs)
    await _deleteOldAvatar(oldAvatar);

    res.json({
      message: "Avatar updated successfully",
      avatar_url: avatarUrl,
    });
  } catch (err) {
    logger.error(`Error updating avatar: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Remove My Profile Avatar (deletes file, sets avatar to NULL)
// DELETE /api/user/avatar
// ─────────────────────────────────────────────────────────────
exports.removeAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const oldResult = await pool.query(
      "SELECT avatar FROM users WHERE id = $1",
      [userId],
    );
    const oldAvatar = oldResult.rows[0]?.avatar;

    // Set to null in DB first
    await pool.query("UPDATE users SET avatar = NULL WHERE id = $1", [userId]);

    // Delete old file from disk
    await _deleteOldAvatar(oldAvatar);

    res.json({ message: "Avatar removed successfully", avatar_url: null });
  } catch (err) {
    logger.error(`Error removing avatar: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get User Preferences
// ─────────────────────────────────────────────────────────────
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT preferences FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0].preferences || {});
  } catch (err) {
    logger.error(`Error fetching preferences: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Update User Preferences
// ─────────────────────────────────────────────────────────────
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const newPreferences = req.body;

    const currentResult = await pool.query(
      "SELECT preferences FROM users WHERE id = $1",
      [userId],
    );
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const currentPreferences = currentResult.rows[0].preferences || {};

    const updatedPreferences = { ...currentPreferences, ...newPreferences };

    await pool.query("UPDATE users SET preferences = $1 WHERE id = $2", [
      updatedPreferences,
      userId,
    ]);

    res.json(updatedPreferences);
  } catch (err) {
    logger.error(`Error updating preferences: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
