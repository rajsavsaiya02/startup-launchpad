const { pool } = require("../database");

/**
 * Middleware to verify a user is an active member of an organization.
 * Enforces role-aware access control based on organization status:
 *
 *   Status         | FOUNDER | CO-FOUNDER | Others (ADMIN/MEMBER/GUEST)
 *   ---------------+---------+------------+----------------------------
 *   active         |   ✅    |    ✅      |         ✅
 *   under_review   |   ✅    |    ✅      |         ❌ (403)
 *   suspended      |   ✅    |    ❌      |         ❌ (403)
 *
 * All member data is preserved on status changes — access is only restricted.
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
                m.designation_id,
                o.name as organization_name,
                o.timezone as organization_timezone,
                o.status as organization_status,
                (SELECT EXISTS (SELECT 1 FROM organization_teams WHERE team_lead_member_id = m.organization_member_id)) as is_team_lead
            FROM organization_members m
            JOIN organizations o ON m.organization_id = o.organization_id
            WHERE m.user_id = $1 AND m.is_active = true
        `,
      [userId],
    );

    if (memberQuery.rows.length === 0) {
      return res.status(403).json({
        error:
          "Access denied: You are not an active member of any organization.",
      });
    }

    const memberData = memberQuery.rows[0];
    const orgStatus = memberData.organization_status;
    const orgRole = memberData.org_role; // 'FOUNDER' | 'CO-FOUNDER' | 'ADMIN' | 'MEMBER' | 'GUEST'

    // --- Role-aware access control based on org status ---

    if (orgStatus === 'suspended') {
      // Only the true FOUNDER can access a suspended organization
      if (orgRole !== 'FOUNDER') {
        return res.status(403).json({
          error:
            "Access denied: This organization is currently suspended. Only the Founder can access it.",
        });
      }
    } else if (orgStatus === 'under_review') {
      // Only FOUNDER or CO-FOUNDER can access an organization under review
      if (orgRole !== 'FOUNDER' && orgRole !== 'CO-FOUNDER') {
        return res.status(403).json({
          error:
            "Access denied: This organization is currently under review. Only Founders and Co-Founders can access it.",
        });
      }
    } else if (orgStatus !== 'active') {
      // Any other unknown status — deny all
      return res.status(403).json({
        error:
          "Access denied: Your organization is currently inactive.",
      });
    }

    // Attach to request
    req.org = {
      organization_id: memberData.organization_id,
      name: memberData.organization_name,
      timezone: memberData.organization_timezone,
      status: orgStatus,
    };

    req.org_member = {
      member_id: memberData.organization_member_id,
      role: orgRole,
      designation_id: memberData.designation_id,
      is_team_lead: memberData.is_team_lead,
    };

    next();
  } catch (error) {
    console.error("Error in requireOrgMember middleware:", error);
    res.status(500).json({
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
