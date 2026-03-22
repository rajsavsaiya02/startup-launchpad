const { pool } = require("../database");
const logger = require("../utils/logger");

exports.getCommunityDirectory = async (req, res) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    
    // Default page & limit
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const userSelect = `
      SELECT 
        id,
        name,
        username as slug,
        'user' as type,
        avatar as avatar_url,
        job_title as headline,
        location,
        department,
        created_at,
        public_profile,
        role
      FROM users
      WHERE public_profile IS NOT NULL 
        AND public_profile->>'isPublic' = 'true'
    `;
    
    const orgSelect = `
      SELECT 
        organization_id as id,
        name,
        workspace_url as slug,
        'organization' as type,
        logo_url as avatar_url,
        public_profile->>'tagline' as headline,
        public_profile->>'hq_location' as location,
        NULL as department,
        created_at,
        public_profile,
        NULL as role
      FROM organizations
      WHERE public_profile IS NOT NULL 
        AND public_profile->>'isPublic' = 'true'
    `;

    let finalQuery = "";
    
    if (type === "user") {
      finalQuery = userSelect;
    } else if (type === "organization") {
      finalQuery = orgSelect;
    } else {
      finalQuery = `(${userSelect}) UNION ALL (${orgSelect})`;
    }

    let wrapperQuery = `
      SELECT * FROM (${finalQuery}) as combined
      WHERE 1=1
    `;
    
    const countParams = [];
    const dataParams = [];
    let paramIndex = 1;
    
    if (search && search.trim() !== "") {
      const qs = `%${search.trim()}%`;
      wrapperQuery += ` AND (
        combined.name ILIKE $${paramIndex} 
        OR combined.headline ILIKE $${paramIndex}
        OR combined.location ILIKE $${paramIndex}
      )`;
      countParams.push(qs);
      dataParams.push(qs);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) FROM (${wrapperQuery}) as counted`;
    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    
    wrapperQuery += ` ORDER BY combined.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    dataParams.push(limitNum, offset);
    
    const dataResult = await pool.query(wrapperQuery, dataParams);
    
    res.json({
      data: dataResult.rows,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum)
      }
    });

  } catch (err) {
    logger.error(`Error in getCommunityDirectory: ${err.message}`);
    res.status(500).json({ message: "Server error fetching community directory" });
  }
};

exports.getProfileBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Try to fetch User Profile
    const userResult = await pool.query(
      `
      SELECT username, name,
             COALESCE(public_profile_avatar, avatar) AS avatar_url,
             avatar AS my_profile_avatar,
             public_profile_avatar,
             bio, location, job_title, department, skills, public_profile,
             social_linkedin, social_github, social_website, email
      FROM users WHERE username = $1
      `,
      [slug]
    );

    if (userResult.rows.length > 0) {
      const profile = userResult.rows[0];
      const publicData = profile.public_profile || {};
      
      if (publicData.isPublic === false || publicData.isPublic === "false") {
        return res.status(403).json({ success: false, isPrivate: true, message: "This user profile is currently private.", type: "user" });
      }

      return res.status(200).json({ success: true, type: "user", profile });
    }

    // 2. Try to fetch Organization Profile
    const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    const orgQuery = await pool.query(
      `
      SELECT 
        organization_id, name, logo_url, workspace_url, created_at,
        brief_description, public_profile, status
      FROM organizations
      WHERE workspace_url = $1 AND status = 'active'
      `,
      [sanitizedSlug]
    );

    if (orgQuery.rows.length > 0) {
      const organization = orgQuery.rows[0];
      const publicData = organization.public_profile || {};
      
      if (publicData.isPublic === false || publicData.isPublic === "false") {
        return res.status(403).json({ success: false, isPrivate: true, message: "This organization profile is currently private.", type: "organization" });
      }

      // Fetch active members mapped to public-safe info layout
      const membersQuery = await pool.query(
        `
          SELECT 
            u.first_name, u.last_name, u.avatar,
            m.org_role,
            d.title as designation_title, dept.name as department
          FROM organization_members m
          JOIN users u ON m.user_id = u.id
          LEFT JOIN organization_designations d ON m.designation_id = d.designation_id
          LEFT JOIN organization_departments dept ON d.department_id = dept.department_id
          WHERE m.organization_id = $1 AND m.is_active = true
          ORDER BY 
            CASE m.org_role 
              WHEN 'FOUNDER' THEN 1 
              WHEN 'ADMIN' THEN 2 
              WHEN 'MEMBER' THEN 3 
              ELSE 4 
            END,
            m.joined_at ASC
        `,
        [organization.organization_id]
      );

      return res.status(200).json({
        success: true,
        type: "organization",
        organization,
        members: membersQuery.rows,
      });
    }

    // 3. Not found
    return res.status(404).json({ success: false, message: "Profile not found" });

  } catch (error) {
    logger.error(`Error fetching profile by slug: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};
