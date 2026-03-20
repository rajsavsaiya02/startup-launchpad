const { pool } = require('../database');

const VALID_STATUSES = ['active', 'under_review', 'suspended'];

/**
 * GET /admin/organizations
 * Returns all organizations with logo, name, brief_description, workspace_url,
 * member count, status, and the founding Founder's profile.
 */
exports.getAllOrganizations = async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(o.name ILIKE $${idx} OR o.workspace_url ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (status && VALID_STATUSES.includes(status)) {
      conditions.push(`o.status = $${idx}`);
      values.push(status);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM organizations o ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Main query — fetch orgs with founder info and member count
    const query = `
      SELECT
        o.organization_id,
        o.name,
        o.logo_url,
        o.brief_description,
        o.workspace_url,
        o.status,
        o.created_at,
        (
          SELECT COUNT(*) 
          FROM organization_members m2 
          WHERE m2.organization_id = o.organization_id AND m2.is_active = true
        ) AS member_count,
        u.id             AS founder_id,
        u.first_name     AS founder_first_name,
        u.last_name      AS founder_last_name,
        u.email          AS founder_email,
        u.avatar         AS founder_avatar
      FROM organizations o
      LEFT JOIN organization_members om 
        ON om.organization_id = o.organization_id 
        AND om.org_role = 'FOUNDER' 
        AND om.is_active = true
      LEFT JOIN users u ON u.id = om.user_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(parseInt(limit), offset);
    const result = await pool.query(query, values);

    // Shape response
    const organizations = result.rows.map(row => ({
      organization_id: row.organization_id,
      name: row.name,
      logo_url: row.logo_url,
      brief_description: row.brief_description,
      workspace_url: row.workspace_url,
      status: row.status,
      created_at: row.created_at,
      member_count: parseInt(row.member_count),
      founder: {
        id: row.founder_id,
        name: [row.founder_first_name, row.founder_last_name].filter(Boolean).join(' ') || 'Unknown',
        email: row.founder_email || '—',
        avatar: row.founder_avatar || null
      }
    }));

    res.json({
      organizations,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Admin: getAllOrganizations error:', err);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
};

/**
 * PUT /admin/organizations/:id/status
 * Updates an organization's status (active | under_review | suspended).
 * All member data is preserved — this only changes access control.
 */
exports.updateOrganizationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

  try {
    const result = await pool.query(
      `UPDATE organizations 
       SET status = $1, updated_at = NOW() 
       WHERE organization_id = $2 
       RETURNING organization_id, name, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      message: `Organization status updated to "${status}" successfully.`,
      organization: result.rows[0]
    });
  } catch (err) {
    console.error('Admin: updateOrganizationStatus error:', err);
    res.status(500).json({ message: 'Failed to update organization status' });
  }
};
