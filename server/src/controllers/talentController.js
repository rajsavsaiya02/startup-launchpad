const { pool } = require("../database");
const unifiedStorage = require("../services/UnifiedStorageService");
const logger = require("../utils/logger");

// ─────────────────────────────────────────────────────────────
// HELPER — delete an old local avatar file + its files record
// ─────────────────────────────────────────────────────────────
const LOCAL_AVATAR_PREFIXES = ["/public-assets/user/public/uploads"];

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

// 1. Opportunities CRUD
exports.createOpportunity = async (req, res) => {
  try {
    const {
      project_id,
      organization_id,
      type,
      title,
      description,
      skills,
      compensation_type,
      budget_min,
      budget_max,
      duration,
      media_urls,
      external_links,
    } = req.body;

    // Validate required fields
    if (!organization_id || !type || !title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const { id: owner_id } = req.user;

    const result = await pool.query(
      `INSERT INTO opportunities 
      (project_id, organization_id, owner_id, type, title, description, skills, compensation_type, budget_min, budget_max, duration, media_urls, external_links) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        project_id || null,
        organization_id,
        owner_id,
        type,
        title,
        description,
        skills || [],
        compensation_type || null,
        budget_min || null,
        budget_max || null,
        duration || null,
        media_urls || [],
        external_links || [],
      ],
    );

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      opportunity: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating opportunity:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error creating opportunity" });
  }
};

exports.getAllOpportunities = async (req, res) => {
  try {
    const { type, status, search, owner_id, organization_id } = req.query;

    let query = `
      SELECT o.*, org.name as organization_name, org.logo_url as organization_logo 
      FROM opportunities o
      LEFT JOIN organizations org ON o.organization_id = org.organization_id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      params.push(type);
      query += ` AND o.type = $${params.length}`;
    }

    if (status && status !== "all") {
      params.push(status);
      query += ` AND o.status ILIKE $${params.length}`;
    } else if (!status) {
      query += ` AND o.status ILIKE 'Open'`; // default to Open if no status provided
    }
    // if status === 'all', we don't add the status filter

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (o.title ILIKE $${params.length} OR o.description ILIKE $${params.length})`;
    }

    if (owner_id) {
      params.push(owner_id);
      query += ` AND o.owner_id = $${params.length}`;
    }

    if (organization_id) {
      params.push(organization_id);
      query += ` AND o.organization_id = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, opportunities: result.rows });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching opportunities" });
  }
};

exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT o.*, org.name as organization_name, org.logo_url as organization_logo, org.brief_description as organization_bio,
             u.name as owner_name, u.avatar as owner_avatar, u.job_title as owner_job_title
      FROM opportunities o
      LEFT JOIN organizations org ON o.organization_id = org.organization_id
      LEFT JOIN users u ON o.owner_id = u.id
      WHERE o.id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Opportunity not found" });
    }

    res.status(200).json({ success: true, opportunity: result.rows[0] });
  } catch (error) {
    console.error("Error fetching opportunity details:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching opportunity details",
    });
  }
};

exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      status,
      skills,
      compensation_type,
      budget_min,
      budget_max,
      duration,
      media_urls,
      external_links,
    } = req.body;

    const orgId = req.org?.organization_id;
    
    console.log(`[DEBUG] updateOpportunity: id=${id}, orgId=${orgId}, status=${status}`);

    const result = await pool.query(
      `UPDATE opportunities SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        skills = COALESCE($5, skills),
        compensation_type = COALESCE($6, compensation_type),
        budget_min = COALESCE($7, budget_min),
        budget_max = COALESCE($8, budget_max),
        duration = COALESCE($9, duration),
        media_urls = COALESCE($10, media_urls),
        external_links = COALESCE($11, external_links),
        updated_at = NOW()
      WHERE id = $12 AND organization_id = $13 RETURNING *`,
      [
        title || null,
        description || null,
        type || null,
        status || null,
        skills || null,
        compensation_type || null,
        budget_min || null,
        budget_max || null,
        duration || null,
        media_urls || null,
        external_links || null,
        id,
        orgId,
      ],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Opportunity not found" });
    }

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      opportunity: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating opportunity:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating opportunity" });
  }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.org?.organization_id;

    const result = await pool.query(
      "DELETE FROM opportunities WHERE id = $1 AND organization_id = $2 RETURNING *",
      [id, orgId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error deleting opportunity" });
  }
};

// 2. Applications Flow
exports.getOrgApplications = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    // Find organization
    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [user_id],
    );

    if (orgResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }
    const organization_id = orgResult.rows[0].organization_id;

    const result = await pool.query(
      `
      SELECT app.*, 
             u.name as applicant_name, u.username as applicant_username, u.avatar as applicant_avatar, u.job_title as applicant_title,
             opp.title as opportunity_title, opp.type as opportunity_type
      FROM opportunity_applications app
      JOIN opportunities opp ON app.opportunity_id = opp.id
      JOIN users u ON app.freelancer_id = u.id
      WHERE opp.organization_id = $1
      ORDER BY app.created_at DESC
    `,
      [organization_id],
    );

    res.status(200).json({ success: true, applications: result.rows });
  } catch (error) {
    console.error("Error fetching org applications:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching applications" });
  }
};

exports.applyForOpportunity = async (req, res) => {
  try {
    const { id: opportunity_id } = req.params;
    const { cover_letter, proposed_rate } = req.body;
    const { id: freelancer_id } = req.user;

    // Check if already applied
    const existingApplication = await pool.query(
      `SELECT * FROM opportunity_applications WHERE opportunity_id = $1 AND freelancer_id = $2`,
      [opportunity_id, freelancer_id],
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this opportunity",
      });
    }

    const result = await pool.query(
      `INSERT INTO opportunity_applications (opportunity_id, freelancer_id, cover_letter, proposed_rate) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        opportunity_id,
        freelancer_id,
        cover_letter || "",
        proposed_rate || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error submitting application" });
  }
};

exports.getOpportunityApplications = async (req, res) => {
  try {
    const { id: opportunity_id } = req.params;
    const { id: owner_id } = req.user;

    // Optional: verify the requester is the owner of the opportunity
    const oppCheck = await pool.query(
      `SELECT owner_id, organization_id FROM opportunities WHERE id = $1`,
      [opportunity_id],
    );
    if (oppCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Opportunity not found" });
    }

    // Fetch applications with freelancer basic info
    const result = await pool.query(
      `
      SELECT app.*, u.name as applicant_name, u.username as applicant_username, u.avatar as applicant_avatar, u.job_title as applicant_title
      FROM opportunity_applications app
      JOIN users u ON app.freelancer_id = u.id
      WHERE app.opportunity_id = $1
      ORDER BY app.created_at DESC
    `,
      [opportunity_id],
    );

    res.status(200).json({ success: true, applications: result.rows });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching applications" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const { id: freelancer_id } = req.user;

    const result = await pool.query(
      `
      SELECT app.*, 
             opp.title as opportunity_title, opp.type as opportunity_type, opp.status as opportunity_status,
             org.name as organization_name, org.logo_url as organization_logo
      FROM opportunity_applications app
      JOIN opportunities opp ON app.opportunity_id = opp.id
      LEFT JOIN organizations org ON opp.organization_id = org.organization_id
      WHERE app.freelancer_id = $1
      ORDER BY app.created_at DESC
      `,
      [freelancer_id],
    );

    res.status(200).json({ success: true, applications: result.rows });
  } catch (error) {
    console.error("Error fetching my applications:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching my applications",
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id: application_id } = req.params;
    const { status } = req.body;
    const orgId = req.org?.organization_id;

    if (!orgId) {
      return res.status(403).json({ success: false, message: "Organization context missing" });
    }

    // 1. Verify application exists and belongs to the user's organization
    const appCheck = await pool.query(
      `SELECT app.id, opp.organization_id 
       FROM opportunity_applications app
       JOIN opportunities opp ON app.opportunity_id = opp.id
       WHERE app.id = $1`,
      [application_id]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (appCheck.rows[0].organization_id !== orgId) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this application" });
    }

    // 2. Perform update
    const result = await pool.query(
      `UPDATE opportunity_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, application_id],
    );

    const application = result.rows[0];

    // 3. Auto-archive logic
    if (status === "Accepted") {
      await pool.query(
        `INSERT INTO opportunity_archives (application_id) VALUES ($1) ON CONFLICT DO NOTHING`,
        [application.id],
      );
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating status" });
  }
};

// 3. Public Profiles
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `
      SELECT username, name,
             COALESCE(public_profile_avatar, avatar) AS avatar_url,
             avatar AS my_profile_avatar,
             public_profile_avatar,
             bio, location, job_title, department, skills, public_profile,
             social_linkedin, social_github, social_website
      FROM users WHERE username = $1
    `,
      [username],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching public profile",
    });
  }
};

exports.updatePublicProfile = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { public_profile, bio, skills, public_profile_avatar } = req.body;

    // Normalize empty strings to null (treat as removal)
    const normalizedAvatar =
      public_profile_avatar === "" ? null : public_profile_avatar;

    // Fetch current public_profile_avatar to check for changes
    const currentResult = await pool.query(
      "SELECT public_profile_avatar FROM users WHERE id = $1",
      [user_id],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentAvatar = currentResult.rows[0].public_profile_avatar;

    // Handle public_profile_avatar change/deletion
    if (normalizedAvatar !== undefined && normalizedAvatar !== currentAvatar) {
      await _deleteOldAvatar(currentAvatar);
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (public_profile !== undefined) {
      updates.push(`public_profile = $${paramIndex}`);
      values.push(public_profile);
      paramIndex++;
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex}`);
      values.push(bio);
      paramIndex++;
    }
    if (skills !== undefined) {
      updates.push(`skills = $${paramIndex}`);
      values.push(skills);
      paramIndex++;
    }
    if (public_profile_avatar !== undefined) {
      updates.push(`public_profile_avatar = $${paramIndex}`);
      values.push(normalizedAvatar);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No distinct fields provided to update",
      });
    }

    values.push(user_id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING username, public_profile, bio, skills, public_profile_avatar`,
      values,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating public profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating profile" });
  }
};

// ─────────────────────────────────────────────────────────────
// Update Public Profile Avatar (upload - replaces, deletes old)
// POST /api/talent/profile/me/avatar
// ─────────────────────────────────────────────────────────────
exports.updatePublicProfileAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No avatar file uploaded" });
    }

    const { id: user_id } = req.user;

    // Save new file to disk
    const savedFile = await unifiedStorage.saveFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      tier: "user",
      visibility: "public",
      subPath: "uploads",
    });

    const avatarUrl = `/public-assets${savedFile.path}`;

    // Fetch old public_profile_avatar before overwriting
    const oldResult = await pool.query(
      "SELECT public_profile_avatar FROM users WHERE id = $1",
      [user_id],
    );
    const oldAvatar = oldResult.rows[0]?.public_profile_avatar;

    // Update DB
    await pool.query(
      "UPDATE users SET public_profile_avatar = $1 WHERE id = $2",
      [avatarUrl, user_id],
    );

    // Track new file in files table
    await pool.query(
      `INSERT INTO files
       (uploader_id, uploader_type, original_name, stored_name, mime_type, size, path, visibility)
       VALUES ($1, 'user', $2, $3, $4, $5, $6, 'public')`,
      [
        user_id,
        savedFile.originalName,
        savedFile.storedName,
        req.file.mimetype,
        savedFile.size,
        savedFile.path,
      ],
    );

    // Delete old public_profile_avatar file (only local uploads, never the shared avatar)
    await _deleteOldAvatar(oldAvatar);

    res.status(200).json({
      success: true,
      message: "Public profile avatar updated successfully",
      public_profile_avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Error updating public profile avatar:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating public profile avatar",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Remove Public Profile Avatar (deletes file, falls back to avatar)
// DELETE /api/talent/profile/me/avatar
// ─────────────────────────────────────────────────────────────
exports.removePublicProfileAvatar = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    const oldResult = await pool.query(
      "SELECT public_profile_avatar FROM users WHERE id = $1",
      [user_id],
    );
    const oldAvatar = oldResult.rows[0]?.public_profile_avatar;

    if (!oldAvatar) {
      return res.status(200).json({
        success: true,
        message:
          "No separate public profile avatar to remove. Already using My Profile avatar.",
      });
    }

    // Set to null in DB first
    await pool.query(
      "UPDATE users SET public_profile_avatar = NULL WHERE id = $1",
      [user_id],
    );

    // Delete old file from disk (never touches the main avatar)
    await _deleteOldAvatar(oldAvatar);

    res.status(200).json({
      success: true,
      message: "Public profile avatar removed. Now showing My Profile avatar.",
      public_profile_avatar: null,
    });
  } catch (error) {
    console.error("Error removing public profile avatar:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing public profile avatar",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Search / browse talent users (for org Talent Hub)
// GET /api/talent/users
// Returns: normal_user | freelancer | student who are NOT in any org
// Query params: search, role, page, limit
// ─────────────────────────────────────────────────────────────
exports.getTalentUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const ALLOWED_ROLES = ["normal_user", "freelancer", "student"];

    const { id: user_id_req } = req.user;
    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [user_id_req],
    );
    let orgId = null;
    if (orgResult.rows.length > 0) {
      orgId = orgResult.rows[0].organization_id;
    }

    const conditions = [
      `u.role IN ('normal_user','freelancer','student')`,
      `u.id NOT IN (SELECT user_id FROM organization_members)`,
    ];

    // Hide users that have already been shortlisted by this organization
    if (orgId) {
      conditions.push(
        `u.id NOT IN (SELECT user_id FROM organization_shortlisted_talent WHERE organization_id = ${orgId})`,
      );
    }

    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const idx = params.length;
      conditions.push(
        `(u.name ILIKE $${idx} OR u.job_title ILIKE $${idx} OR EXISTS (
           SELECT 1 FROM unnest(u.skills) AS s WHERE s ILIKE $${idx}
         ))`,
      );
    }

    if (role && ALLOWED_ROLES.includes(role)) {
      params.push(role);
      conditions.push(`u.role = $${params.length}`);
    }

    const whereClause = conditions.join(" AND ");

    // Count total matching rows (for pagination metadata)
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Paginated data query
    params.push(limitNum);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.name,
         COALESCE(u.public_profile_avatar, u.avatar) AS avatar_url,
         u.job_title,
         u.location,
         u.skills,
         u.role,
         u.bio,
         u.public_profile->>'headline'     AS headline,
         u.public_profile->>'rate'         AS rate,
         u.public_profile->>'availability' AS availability,
         (SELECT app.id FROM opportunity_applications app 
          JOIN opportunities opp ON app.opportunity_id = opp.id
          WHERE app.freelancer_id = u.id AND opp.organization_id = $${params.length + 1}
          ORDER BY app.created_at DESC LIMIT 1) as application_id
       FROM users u
       WHERE ${whereClause}
       ORDER BY u.id
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      [...params, orgId],
    );

    res.status(200).json({
      success: true,
      users: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error("Error fetching talent users:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching talent users",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 3b. Talent Shortlisting (For Organizations)
// ─────────────────────────────────────────────────────────────

exports.toggleShortlist = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { userId: talentId } = req.params;

    // Get org ID for this user
    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [user_id],
    );

    if (orgResult.rows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "No active organization found." });
    }
    const orgId = orgResult.rows[0].organization_id;

    // Check if already shortlisted
    const checkResult = await pool.query(
      "SELECT * FROM organization_shortlisted_talent WHERE organization_id = $1 AND user_id = $2",
      [orgId, talentId],
    );

    let isShortlisted = false;
    if (checkResult.rows.length > 0) {
      // Un-shortlist
      await pool.query(
        "DELETE FROM organization_shortlisted_talent WHERE organization_id = $1 AND user_id = $2",
        [orgId, talentId],
      );
    } else {
      // Shortlist
      await pool.query(
        "INSERT INTO organization_shortlisted_talent (organization_id, user_id) VALUES ($1, $2)",
        [orgId, talentId],
      );
      isShortlisted = true;
    }

    res.status(200).json({ success: true, isShortlisted });
  } catch (error) {
    console.error("Error toggling shortlist:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error toggling shortlist" });
  }
};

exports.getOrgShortlistedTalent = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [user_id],
    );

    if (orgResult.rows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "No active organization found." });
    }
    const orgId = orgResult.rows[0].organization_id;

    const result = await pool.query(
      `SELECT
         s.created_at AS shortlisted_at,
         u.id,
         u.username,
         u.name,
         COALESCE(u.public_profile_avatar, u.avatar) AS avatar_url,
         u.job_title,
         u.location,
         u.skills,
         u.role,
         u.public_profile->>'headline' AS headline,
         u.public_profile->>'rate' AS rate,
         u.public_profile->>'availability' AS availability
       FROM organization_shortlisted_talent s
       JOIN users u ON s.user_id = u.id
       WHERE s.organization_id = $1
       ORDER BY s.created_at DESC`,
      [orgId],
    );

    res.status(200).json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Error fetching shortlisted talent:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching shortlist" });
  }
};

exports.getMyShortlists = async (req, res) => {
  try {
    const { id: talentId } = req.user;

    const result = await pool.query(
      `SELECT
         s.created_at AS shortlisted_at,
         o.organization_id,
         o.name AS organization_name,
         o.logo_url AS organization_logo,
         o.brief_description AS organization_bio
       FROM organization_shortlisted_talent s
       JOIN organizations o ON s.organization_id = o.organization_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [talentId],
    );

    res.status(200).json({ success: true, orgs: result.rows });
  } catch (error) {
    console.error("Error fetching my shortlists:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching shortlists" });
  }
};

// ─────────────────────────────────────────────────────────────
// 4. Messaging
// ─────────────────────────────────────────────────────────────

exports.sendDirectMessage = async (req, res) => {
  try {
    const { id: sender_id } = req.user;
    const { userId: recipientId } = req.params;
    const { content, organizationId } = req.body; // orgId is required

    if (!content || !organizationId) {
      return res.status(400).json({
        success: false,
        message: "Content and organizationId are required",
      });
    }

    const isOrgSender =
      ["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(req.user.role?.toUpperCase());

    const talent_id = isOrgSender ? recipientId : sender_id;

    // 1. Verify user is not banned/deleted
    const userCheck = await pool.query(
      "SELECT status FROM users WHERE id = $1",
      [talent_id],
    );
    if (userCheck.rows.length === 0 || userCheck.rows[0].status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "User account is no longer active." });
    }

    // 2. Verify talent hasn't blocked the org
    const blockCheck = await pool.query(
      "SELECT 1 FROM talent_blocked_organizations WHERE organization_id = $1 AND user_id = $2",
      [organizationId, talent_id],
    );
    if (blockCheck.rows.length > 0) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You cannot send messages to this user.",
        });
    }

    // 3. Auto-shortlist if org initiates chat and they aren't shortlisted
    if (isOrgSender) {
      // Auto-shortlist logic (upsert)
      await pool.query(
        `INSERT INTO organization_shortlisted_talent (organization_id, user_id)
           VALUES ($1, $2) ON CONFLICT (organization_id, user_id) DO NOTHING`,
        [organizationId, talent_id],
      );
      // Ensure conversation is visible again if previously deleted
      await pool.query(
        `UPDATE organization_talent_messages SET is_deleted_by_org = FALSE
           WHERE organization_id = $1 AND user_id = $2`,
        [organizationId, talent_id],
      );
    } else {
      // If talent is sending, ensure they've either been shortlisted or received a message
      // Essentially verified by existing checks but we leave pass-through for organic flow
    }

    // Enforce 3-message consecutive limit for organizations
    if (isOrgSender) {
      const messageHistory = await pool.query(
        `SELECT sender_id FROM organization_talent_messages
         WHERE organization_id = $1 AND user_id = $2
         ORDER BY created_at DESC LIMIT 3`,
        [organizationId, talent_id],
      );

      if (messageHistory.rows.length === 3) {
        const allFromOrg = messageHistory.rows.every(
          (row) => row.sender_id !== talent_id,
        );
        if (allFromOrg) {
          return res.status(403).json({
            success: false,
            message:
              "You can only send up to 3 direct messages before the candidate replies.",
          });
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO organization_talent_messages
       (organization_id, user_id, sender_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        organizationId,
        isOrgSender
          ? recipientId
          : sender_id,
        sender_id,
        content,
      ],
    );

    // Undelete whole conversation for org regardless of sender so that replies become visible
    await pool.query(
      "UPDATE organization_talent_messages SET is_deleted_by_org = FALSE WHERE organization_id = $1 AND user_id = $2",
      [organizationId, isOrgSender ? recipientId : sender_id]
    );

    const fullMsgParams = [result.rows[0].id];
    const fullMessage = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
       FROM organization_talent_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = $1`,
      fullMsgParams,
    );

    res.status(201).json({ success: true, data: fullMessage.rows[0] });
  } catch (error) {
    console.error("Error sending direct message:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error sending message" });
  }
};

exports.getDirectMessages = async (req, res) => {
  try {
    const { userId: otherPartyId } = req.params;
    const { organizationId } = req.query; // Always provide org context

    if (!organizationId) {
      return res
        .status(400)
        .json({ success: false, message: "Organization ID required" });
    }

    // Identify who is the talent
    const isOrgQuerying = ["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(
      req.user.role?.toUpperCase(),
    );

    const talentId = isOrgQuerying ? otherPartyId : req.user.id;

    // If org is querying, undelete all messages for them (restore conversation)
    if (isOrgQuerying) {
      await pool.query(
        "UPDATE organization_talent_messages SET is_deleted_by_org = FALSE WHERE organization_id = $1 AND user_id = $2",
        [organizationId, talentId]
      );
    }

    const result = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
       FROM organization_talent_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.organization_id = $1 AND m.user_id = $2
         AND ($3::boolean = FALSE OR m.is_deleted_by_org = FALSE)
       ORDER BY m.created_at ASC`,
      [organizationId, talentId, isOrgQuerying],
    );

    res.status(200).json({ success: true, messages: result.rows });
  } catch (error) {
    console.error("Error fetching direct messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching messages" });
  }
};

exports.getApplicationMessages = async (req, res) => {
  try {
    const { id: application_id } = req.params;

    // Auto-undelete if accessed by an org member
    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [req.user.id]
    );
    if (orgResult.rows.length > 0) {
      await pool.query(
        "UPDATE opportunity_applications SET is_deleted_by_org = FALSE WHERE id = $1 AND opportunity_id IN (SELECT id FROM opportunities WHERE organization_id = $2)",
        [application_id, orgResult.rows[0].organization_id]
      );
    }

    const result = await pool.query(
      `
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM opportunity_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.application_id = $1
      ORDER BY m.created_at ASC
    `,
      [application_id],
    );

    res.status(200).json({ success: true, messages: result.rows });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { id: application_id } = req.params;
    const { content } = req.body;
    const { id: sender_id } = req.user;

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Message content cannot be empty" });
    }

    const result = await pool.query(
      `INSERT INTO opportunity_messages (application_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [application_id, sender_id, content],
    );

    // Ensure conversation is NOT deleted for org
    // We update the specific application to be visible (is_deleted_by_org = FALSE)
    await pool.query(
      "UPDATE opportunity_applications SET is_deleted_by_org = FALSE WHERE id = $1",
      [application_id]
    );

    const fullMessage = await pool.query(
      `
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM opportunity_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = $1
    `,
      [result.rows[0].id],
    );

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: fullMessage.rows[0],
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error sending message" });
  }
};

exports.getOrgConversations = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    // First find the organization the user belongs to
    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [user_id],
    );

    if (orgResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const organization_id = orgResult.rows[0].organization_id;

    const result = await pool.query(
      `
      WITH app_convs AS (
        SELECT 
          app.id as application_id,
          app.status as application_status,
          opp.title as opportunity_title,
          opp.id as opportunity_id,
          u.name as candidate_name,
          u.avatar as candidate_avatar,
          u.id as candidate_id,
          u.role as candidate_role,
          (SELECT content FROM opportunity_messages WHERE application_id = app.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM opportunity_messages WHERE application_id = app.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
          'application' as type,
          app.is_deleted_by_org as is_deleted_by_org,
          FALSE as is_disabled
        FROM opportunity_applications app
        JOIN opportunities opp ON app.opportunity_id = opp.id
        JOIN users u ON app.freelancer_id = u.id
        WHERE opp.organization_id = $1 AND app.is_deleted_by_org = FALSE
      ),
      direct_convs AS (
        SELECT 
          NULL::integer as application_id,
          NULL::varchar as application_status,
          'Direct Message'::varchar as opportunity_title,
          NULL::integer as opportunity_id,
          u.name as candidate_name,
          u.avatar as candidate_avatar,
          u.id as candidate_id,
          u.role as candidate_role,
          (SELECT content FROM organization_talent_messages WHERE organization_id = $1 AND user_id = u.id AND is_deleted_by_org = FALSE ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM organization_talent_messages WHERE organization_id = $1 AND user_id = u.id AND is_deleted_by_org = FALSE ORDER BY created_at DESC LIMIT 1) as last_message_at,
          'direct' as type,
          FALSE as is_deleted_by_org,
          CASE WHEN 
             (NOT EXISTS (SELECT 1 FROM organization_shortlisted_talent WHERE organization_id = $1 AND user_id = u.id)
              AND NOT EXISTS (SELECT 1 FROM organization_talent_messages WHERE organization_id = $1 AND user_id = u.id AND sender_id IN (SELECT user_id FROM organization_members WHERE organization_id = $1)))
             OR EXISTS (SELECT 1 FROM talent_blocked_organizations WHERE organization_id = $1 AND user_id = u.id)
             OR COALESCE(u.status, 'active') != 'active'
          THEN TRUE ELSE FALSE END as is_disabled
        FROM users u
        WHERE u.id IN (
            SELECT user_id FROM organization_shortlisted_talent WHERE organization_id = $1
            UNION
            SELECT user_id FROM organization_talent_messages WHERE organization_id = $1 AND is_deleted_by_org = FALSE
        )
      )
      SELECT * FROM app_convs
      UNION ALL
      SELECT * FROM direct_convs
      ORDER BY last_message_at DESC NULLS LAST, application_id DESC NULLS LAST
    `,
      [organization_id],
    );

    res
      .status(200)
      .json({ success: true, conversations: result.rows, organization_id });
  } catch (error) {
    console.error("Error fetching org conversations:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching conversations",
    });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id: user_id } = req.user;

    // Must be ORG to delete a conversation in this way
    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [user_id],
    );

    if (orgResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const organization_id = orgResult.rows[0].organization_id;

    // Remove from shortlist if exists
    await pool.query(
      "DELETE FROM organization_shortlisted_talent WHERE organization_id = $1 AND user_id = $2",
      [organization_id, userId],
    );

    // Hide messages from org
    await pool.query(
      "UPDATE organization_talent_messages SET is_deleted_by_org = TRUE WHERE organization_id = $1 AND user_id = $2",
      [organization_id, userId],
    );

    res.status(200).json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error deleting conversation" });
  }
};

exports.blockOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { id: talent_id } = req.user;
    const { action } = req.body; // 'block' or 'unblock'

    if (action === "block") {
      await pool.query(
        "INSERT INTO talent_blocked_organizations (user_id, organization_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [talent_id, orgId],
      );
    } else {
      await pool.query(
        "DELETE FROM talent_blocked_organizations WHERE user_id = $1 AND organization_id = $2",
        [talent_id, orgId],
      );
    }

    res
      .status(200)
      .json({
        success: true,
        message: `Organization ${action}ed successfully.`,
      });
  } catch (error) {
    console.error("Error blocking organization:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5. Archives
exports.getArchives = async (req, res) => {
  try {
    const { id: user_id } = req.user; // To figure out if they are a freelancer or founder, we query by both conditions

    // Find archives where the user is either the freelancer or the founder
    const result = await pool.query(
      `
      SELECT arc.id as archive_id, arc.archived_at, 
             app.id as application_id, app.status as application_status, app.proposed_rate,
             opp.id as opportunity_id, opp.title, opp.type, opp.compensation_type, opp.duration,
             founder.name as founder_name, freelancer.name as freelancer_name,
             org.name as org_name
      FROM opportunity_archives arc
      JOIN opportunity_applications app ON arc.application_id = app.id
      JOIN opportunities opp ON app.opportunity_id = opp.id
      JOIN users founder ON opp.owner_id = founder.id
      JOIN users freelancer ON app.freelancer_id = freelancer.id
      LEFT JOIN organizations org ON opp.organization_id = org.organization_id
      WHERE (opp.owner_id = $1 AND arc.founder_deleted = FALSE)
         OR (app.freelancer_id = $1 AND arc.freelancer_deleted = FALSE)
      ORDER BY arc.archived_at DESC
    `,
      [user_id],
    );

    res.status(200).json({ success: true, archives: result.rows });
  } catch (error) {
    console.error("Error fetching archives:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching archives" });
  }
};

exports.deleteFromArchive = async (req, res) => {
  try {
    const { id: archive_id } = req.params;
    const { id: user_id } = req.user;

    // Get the archive record
    const arcCheck = await pool.query(
      `
        SELECT arc.*, opp.owner_id, app.freelancer_id
        FROM opportunity_archives arc
        JOIN opportunity_applications app ON arc.application_id = app.id
        JOIN opportunities opp ON app.opportunity_id = opp.id
        WHERE arc.id = $1
      `,
      [archive_id],
    );

    if (arcCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Archive not found" });
    }

    const archive = arcCheck.rows[0];

    if (archive.owner_id === user_id) {
      await pool.query(
        `UPDATE opportunity_archives SET founder_deleted = TRUE WHERE id = $1`,
        [archive_id],
      );
    } else if (archive.freelancer_id === user_id) {
      await pool.query(
        `UPDATE opportunity_archives SET freelancer_deleted = TRUE WHERE id = $1`,
        [archive_id],
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this archive",
      });
    }

    // Check if both deleted, if so permanently delete
    const finalCheck = await pool.query(
      `SELECT founder_deleted, freelancer_deleted FROM opportunity_archives WHERE id = $1`,
      [archive_id],
    );
    if (
      finalCheck.rows[0].founder_deleted &&
      finalCheck.rows[0].freelancer_deleted
    ) {
      // This cascade deletes the archive but to really clean up we might want to let the DB cascade handle messages by relying on foreign keys, but normally wait we don't drop messages. A hard delete might be complex, so keeping it soft deleted is safer.
      // Because archive relies on application, maybe we don't hard delete app. We'll just keep it soft deleted.
    }

    res.status(200).json({ success: true, message: "Archive removed" });
  } catch (error) {
    console.error("Error deleting archive:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error deleting archive" });
  }
};

exports.deleteApplicationConversation = async (req, res) => {
  try {
    const { id: application_id } = req.params;
    const { id: user_id } = req.user;

    // Verify user is part of the organization that owns the opportunity
    const orgResult = await pool.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1",
      [user_id],
    );

    if (orgResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const organization_id = orgResult.rows[0].organization_id;

    const appCheck = await pool.query(
      `
      SELECT app.id FROM opportunity_applications app
      JOIN opportunities opp ON app.opportunity_id = opp.id
      WHERE app.id = $1 AND opp.organization_id = $2
      `,
      [application_id, organization_id],
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found or access denied",
      });
    }

    await pool.query(
      "UPDATE opportunity_applications SET is_deleted_by_org = TRUE WHERE id = $1",
      [application_id],
    );

    res.status(200).json({ success: true, message: "Conversation hidden" });
  } catch (error) {
    console.error("Error hiding application conversation:", error);
    res.status(500).json({
      success: false,
      message: "Server error hiding conversation",
    });
  }
};
