const { pool } = require("../database");

/**
 * Middleware to verify a user is an active member of an organization.
 * It attaches the `req.org` and `req.org_member` objects to the request for downstream use.
 */
const requireOrgMember = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const memberQuery = await pool.query(
      `
            SELECT 
                m.organization_member_id,
                m.organization_id,
                m.org_role,
                m.is_active,
                m.designation_id,
                o.name as organization_name,
                o.timezone as organization_timezone,
                o.status as organization_status
            FROM organization_members m
            JOIN organizations o ON m.organization_id = o.organization_id
            WHERE m.user_id = $1 AND m.is_active = true
        `,
      [userId],
    );

    if (memberQuery.rows.length === 0) {
      return res
        .status(403)
        .json({
          error:
            "Access denied: You are not an active member of any organization.",
        });
    }

    const memberData = memberQuery.rows[0];

    if (memberData.organization_status !== "active") {
      return res
        .status(403)
        .json({
          error:
            "Access denied: Your organization is currently inactive or suspended.",
        });
    }

    // Attach to request
    req.org = {
      organization_id: memberData.organization_id,
      name: memberData.organization_name,
      timezone: memberData.organization_timezone,
      status: memberData.organization_status,
    };

    req.org_member = {
      member_id: memberData.organization_member_id,
      role: memberData.org_role,
      designation_id: memberData.designation_id,
    };

    next();
  } catch (error) {
    console.error("Error in requireOrgMember middleware:", error);
    res
      .status(500)
      .json({
        error: "Internal server error during organization authorization",
      });
  }
};

/**
 * Middleware factory to restrict access based on organization roles.
 * Usage: router.post('/...', requireOrgRole(['FOUNDER', 'ADMIN']), controller)
 */
const requireOrgRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.org_member || !req.org_member.role) {
      return res
        .status(403)
        .json({ error: "Access denied: Organization member context missing." });
    }

    if (!allowedRoles.includes(req.org_member.role)) {
      return res.status(403).json({
        error: `Access denied: Requires one of [${allowedRoles.join(", ")}], but got ${req.org_member.role}.`,
      });
    }

    next();
  };
};

module.exports = {
  requireOrgMember,
  requireOrgRole,
};
