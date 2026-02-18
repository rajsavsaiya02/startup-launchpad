const bcrypt = require("bcrypt");
const { pool } = require("../database");
const logger = require("../utils/logger");

// Get Current User Profile
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, first_name, last_name, name, email, role, is_verified, created_at, bio, location, office_location, social_github, social_linkedin, social_website, job_title, department, phone_number, skills, public_profile, avatar as avatar_url FROM users WHERE id = $1",
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

// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 1. Get user including password_hash
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult.rows[0];

    // 2. Verify current password
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

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update database
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

// Update Profile (General)
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
      avatar_url,
      role,
      public_profile,
    } = req.body;
    const userId = req.user.id;

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
                avatar = COALESCE($10, avatar),
                social_website = COALESCE($11, social_website),
                job_title = COALESCE($12, job_title),
                department = COALESCE($13, department),
                phone_number = COALESCE($14, phone_number),
                role = COALESCE($15, role),
                public_profile = COALESCE($16, public_profile)
            WHERE id = $17
            RETURNING id, username, first_name, last_name, name, email, bio, location, office_location, social_github, social_linkedin, social_website, job_title, department, phone_number, skills, public_profile, avatar as avatar_url, role
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
      avatar_url,
      social_website,
      job_title,
      department,
      phone_number,
      role,
      public_profile,
      userId,
    ];
    const result = await pool.query(query, values);

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    logger.error(`Error updating profile: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
