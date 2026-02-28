const { pool } = require("../database");

const organizationController = {
  /**
   * Helper: Validate password strength
   */
  validatePassword: (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Password must contain at least one special character.";
    return null;
  },

  /**
   * Create a new organization and assign the founder
   * Requires user to be "founder" globally and not already in an org.
   */
  createOrganization: async (req, res) => {
    const { name, timezone, workspace_url, security_code } = req.body;
    const userId = req.user.id;
    const crypto = require("crypto");
    const bcrypt = require("bcrypt");

    if (!name)
      return res.status(400).json({ error: "Organization name is required." });
    if (!workspace_url)
      return res.status(400).json({ error: "Workspace URL is required." });

    // Validate Password (Security Code)
    const passError = organizationController.validatePassword(security_code);
    if (passError) return res.status(400).json({ error: passError });

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 0. Verify current user role from DB (JWT might be stale)
      const userQuery = await client.query(
        "SELECT role FROM users WHERE id = $1",
        [userId],
      );
      if (
        userQuery.rows.length === 0 ||
        userQuery.rows[0].role?.toLowerCase() !== "founder"
      ) {
        throw new Error("Only founders can create an organization.");
      }

      // 1. Check if user already exists in organization_members
      const existingMemberCheck = await client.query(
        "SELECT * FROM organization_members WHERE user_id = $1 AND is_active = true",
        [userId],
      );

      if (existingMemberCheck.rows.length > 0) {
        throw new Error("User is already part of an organization");
      }

      // 2. Format / Validate URL and Code
      let urlSlug = workspace_url.toLowerCase().replace(/[^a-z0-9-]+/g, "");

      // Check for URL uniqueness
      const urlCheck = await client.query(
        "SELECT organization_id FROM organizations WHERE workspace_url = $1",
        [urlSlug],
      );
      if (urlCheck.rows.length > 0) {
        throw new Error("Workspace URL is already in use.");
      }

      const joinCode = crypto.randomBytes(32).toString("hex"); // unique 64 char code
      const securityHash = await bcrypt.hash(security_code, 10);

      // 3. Insert into Organizations
      const orgResult = await client.query(
        `INSERT INTO organizations (name, timezone, status, workspace_url, join_code, security_code_hash) 
         VALUES ($1, $2, 'active', $3, $4, $5) RETURNING organization_id`,
        [name, timezone || "UTC", urlSlug, joinCode, securityHash],
      );

      const orgId = orgResult.rows[0].organization_id;

      // 4. Create a default Department and Designation for the founder
      const deptResult = await client.query(
        `INSERT INTO organization_departments (organization_id, name) 
         VALUES ($1, 'Executive') ON CONFLICT (organization_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING department_id`,
        [orgId],
      );
      const departmentId = deptResult.rows[0].department_id;

      const designationResult = await client.query(
        `INSERT INTO organization_designations (organization_id, title, department_id, hierarchy_level) 
         VALUES ($1, 'CEO / Founder', $2, 1) RETURNING designation_id`,
        [orgId, departmentId],
      );

      const designationId = designationResult.rows[0].designation_id;

      // 4. Insert founder into organization_members
      await client.query(
        `INSERT INTO organization_members 
         (organization_id, user_id, is_active, org_role, designation_id) 
         VALUES ($1, $2, true, 'FOUNDER', $3)`,
        [orgId, userId, designationId],
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Organization created successfully",
        organization_id: orgId,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error creating organization:", err);
      if (
        err.message === "Only founders can create an organization." ||
        err.message === "User is already part of an organization" ||
        err.message === "Workspace URL is already in use."
      ) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Failed to create organization" });
    } finally {
      client.release();
    }
  },

  /**
   * Get organization details along with member count
   */
  getOrganizationDetails: async (req, res) => {
    // Assuming 'req.org' is populated by orgAuthMiddleware
    const orgId = req.org?.organization_id;
    if (!orgId)
      return res.status(400).json({ error: "Missing organization context" });

    try {
      const orgQuery = await pool.query(
        `
            SELECT 
                o.organization_id, o.name, o.timezone, o.status, o.logo_url, o.created_at, o.workspace_url, o.join_code, o.org_handle,
                o.brief_description, o.public_profile,
                (SELECT COUNT(*) FROM organization_members m WHERE m.organization_id = o.organization_id AND m.is_active = true) as member_count
            FROM organizations o
            WHERE o.organization_id = $1
        `,
        [orgId],
      );

      if (orgQuery.rows.length === 0) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json({
        organization: orgQuery.rows[0],
        member: req.org_member,
      });
    } catch (err) {
      console.error("Error fetching org:", err);
      res.status(500).json({ error: "Failed to fetch organization details" });
    }
  },

  /**
   * Update Organization Settings (Identity)
   */
  updateOrganizationSettings: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { name, workspace_url } = req.body;

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error:
          "Only Admins, Founders, and Co-Founders can update workspace settings.",
      });
    }

    try {
      // workspace_url is now IMMUTABLE once created.
      // We only allow updating the name.
      await pool.query(
        "UPDATE organizations SET name = COALESCE($1, name) WHERE organization_id = $2",
        [name, orgId],
      );

      res.json({ message: "Workspace settings updated successfully." });
    } catch (err) {
      console.error("Error updating org config:", err);
      res.status(500).json({ error: "Failed to update workspace settings." });
    }
  },

  /**
   * Update Organization Public Profile
   */
  updatePublicProfile: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { brief_description, public_profile } = req.body;

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error:
          "Only Admins, Founders, and Co-Founders can update the public profile.",
      });
    }

    try {
      const query = `
        UPDATE organizations 
        SET 
          brief_description = COALESCE($1, brief_description),
          public_profile = COALESCE($2, public_profile),
          updated_at = NOW()
        WHERE organization_id = $3
        RETURNING *
      `;
      const result = await pool.query(query, [
        brief_description,
        public_profile,
        orgId,
      ]);

      res.json({
        message: "Public profile updated successfully.",
        organization: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating public profile:", err);
      res.status(500).json({ error: "Failed to update public profile." });
    }
  },

  /**
   * Fetch Public Profile by Slug (Open Route)
   */
  getPublicProfileBySlug: async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    try {
      const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "");

      // 1. Fetch organization public info
      const orgQuery = await pool.query(
        `
          SELECT 
            organization_id, name, logo_url, workspace_url, created_at,
            brief_description, public_profile
          FROM organizations
          WHERE workspace_url = $1 AND status = 'active'
        `,
        [sanitizedSlug],
      );

      if (orgQuery.rows.length === 0) {
        return res.status(404).json({ error: "Organization not found" });
      }

      const orgData = orgQuery.rows[0];

      // 2. Fetch active members (if the public profile allows exposing members)
      // For now, we fetch all active members and return basic public-safe info
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
        [orgData.organization_id],
      );

      res.json({
        organization: orgData,
        members: membersQuery.rows,
      });
    } catch (err) {
      console.error("Error fetching public profile:", err);
      res.status(500).json({ error: "Failed to fetch organization profile" });
    }
  },

  /**
   * Get a list of active members inside the organization
   */
  getOrganizationMembers: async (req, res) => {
    const orgId = req.org?.organization_id;
    if (!orgId)
      return res.status(400).json({ error: "Missing organization context" });

    try {
      const query = await pool.query(
        `
        SELECT 
          m.organization_member_id,
          m.user_id,
          m.is_active,
          m.status,
          m.joined_at,
          m.org_role,
          m.hourly_cost_rate,
          m.manager_member_id,
          m.team_id,
          u.first_name,
          u.last_name,
          u.email,
          u.avatar,
          d.designation_id,
          d.title as designation_title,
          dept.name as department
        FROM organization_members m
        JOIN users u ON m.user_id = u.id
        LEFT JOIN organization_designations d ON m.designation_id = d.designation_id
        LEFT JOIN organization_departments dept ON d.department_id = dept.department_id
        WHERE m.organization_id = $1 AND m.is_active = true
        ORDER BY m.joined_at DESC
      `,
        [orgId],
      );

      const teamsQuery = await pool.query(
        `
      SELECT 
        team_id, name, category, team_lead_member_id, description, created_at, updated_at
      FROM organization_teams 
      WHERE organization_id = $1 
      ORDER BY created_at ASC
      `,
        [orgId],
      );

      res.json({ members: query.rows, teams: teamsQuery.rows });
    } catch (err) {
      console.error("Error fetching members:", err);
      res.status(500).json({ error: "Failed to fetch organization members" });
    }
  },

  /**
   * Generate a one-time invitation code
   */
  generateInvitation: async (req, res) => {
    const orgId = req.org?.organization_id;
    const userId = req.user.id;
    const crypto = require("crypto");
    const bcrypt = require("bcrypt");

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error:
          "Only Admins, Founders, and Co-Founders can generate invitations.",
      });
    }

    try {
      const inviteCode = crypto.randomBytes(32).toString("hex"); // 64 chars

      // Generate a 16-char secure password using crypto
      const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let securityCode = "";
      for (let i = 0, n = charset.length; i < 16; ++i) {
        securityCode += charset.charAt(Math.floor(Math.random() * n));
      }

      const securityHash = await bcrypt.hash(securityCode, 10);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await pool.query(
        `INSERT INTO organization_invitations 
         (organization_id, created_by, invitation_code, security_code_hash, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [orgId, userId, inviteCode, securityHash, expiresAt],
      );

      res.status(201).json({
        invitation_code: inviteCode,
        security_code: securityCode,
        message: "Invitation generated successfully.",
      });
    } catch (err) {
      console.error("Error generating invitation:", err);
      res.status(500).json({ error: "Failed to generate invitation" });
    }
  },

  /**
   * Send an already generated invitation to an email
   */
  emailInvitation: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { email, invitation_code, security_code } = req.body;
    const emailService = require("../services/emailService");

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error: "Only Admins, Founders, and Co-Founders can send invitations.",
      });
    }

    if (!email || !invitation_code || !security_code) {
      return res.status(400).json({
        error: "email, invitation_code, and security_code are required",
      });
    }

    try {
      // Verify invitation code exists and belongs to this org, and is pending
      const checkResult = await pool.query(
        "SELECT * FROM organization_invitations WHERE invitation_code = $1 AND organization_id = $2 AND status = 'pending'",
        [invitation_code, orgId],
      );

      if (checkResult.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Valid pending invitation not found" });
      }

      // Update the email field in the invitation
      await pool.query(
        "UPDATE organization_invitations SET email = $1 WHERE invitation_code = $2",
        [email, invitation_code],
      );

      // Get org name
      const orgQuery = await pool.query(
        "SELECT name FROM organizations WHERE organization_id = $1",
        [orgId],
      );
      const orgName = orgQuery.rows[0].name;

      // Send email
      await emailService.sendOrganizationInviteEmail(
        email,
        invitation_code,
        security_code,
        orgName,
      );

      res
        .status(200)
        .json({ message: "Invitation sent successfully to email." });
    } catch (err) {
      console.error("Error emailing invitation:", err);
      res.status(500).json({ error: "Failed to send email invitation" });
    }
  },

  /**
   * Join an organization (Using one-time invitation code).
   */
  joinOrganization: async (req, res) => {
    const { join_code, security_code } = req.body;
    const userId = req.user.id;
    const bcrypt = require("bcrypt");

    if (!join_code || !security_code) {
      return res
        .status(400)
        .json({ error: "join_code and security_code are required" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if user is already in an org
      const existingMemberCheck = await client.query(
        "SELECT * FROM organization_members WHERE user_id = $1 AND is_active = true",
        [userId],
      );

      if (existingMemberCheck.rows.length > 0) {
        throw new Error("You are already part of an organization.");
      }

      // Check the one-time invitation
      const inviteCheck = await client.query(
        "SELECT * FROM organization_invitations WHERE invitation_code = $1 AND status = 'pending'",
        [join_code],
      );

      if (inviteCheck.rows.length === 0) {
        throw new Error("Invalid or expired invitation code.");
      }

      const invite = inviteCheck.rows[0];

      // Check expiration
      if (new Date() > new Date(invite.expires_at)) {
        await client.query(
          "UPDATE organization_invitations SET status = 'expired' WHERE invitation_id = $1",
          [invite.invitation_id],
        );
        throw new Error("This invitation has expired.");
      }

      // Verify security password
      const isMatch = await bcrypt.compare(
        security_code,
        invite.security_code_hash,
      );
      if (!isMatch) {
        throw new Error("Incorrect security password.");
      }

      const orgId = invite.organization_id;

      // Mark invitation as used
      await client.query(
        "UPDATE organization_invitations SET status = 'used', used_at = NOW(), used_by = $1 WHERE invitation_id = $2",
        [userId, invite.invitation_id],
      );

      // Check if org is active
      const orgCheck = await client.query(
        "SELECT status FROM organizations WHERE organization_id = $1",
        [orgId],
      );
      if (orgCheck.rows.length === 0 || orgCheck.rows[0].status !== "active") {
        throw new Error("Organization not found or inactive.");
      }

      // Check joining user's global role
      const userCheck = await client.query(
        "SELECT role FROM users WHERE id = $1",
        [userId],
      );
      const userGlobalRole = userCheck.rows[0]?.role;
      const assignedOrgRole =
        userGlobalRole?.toLowerCase() === "founder" ? "CO-FOUNDER" : "MEMBER";

      // Automatically join as assigned role
      await client.query(
        `INSERT INTO organization_members 
         (organization_id, user_id, is_active, org_role) 
         VALUES ($1, $2, true, $3)`,
        [orgId, userId, assignedOrgRole],
      );

      await client.query("COMMIT");
      res
        .status(200)
        .json({ message: "Successfully joined the organization." });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error joining org:", err);
      if (
        err.message === "You are already part of an organization." ||
        err.message === "Invalid or expired invitation code." ||
        err.message === "This invitation has expired." ||
        err.message === "Incorrect security password." ||
        err.message === "Organization not found or inactive."
      ) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Failed to join organization" });
    } finally {
      client.release();
    }
  },

  /**
   * Leave the current organization
   */
  leaveOrganization: async (req, res) => {
    const userId = req.user.id;
    const memberId = req.org_member?.member_id;

    if (req.org_member?.role === "FOUNDER") {
      return res.status(400).json({
        error:
          "Founders cannot leave the organization. Transfer ownership or delete the organization.",
      });
    }

    try {
      await pool.query(
        "UPDATE organization_members SET is_active = false WHERE organization_member_id = $1",
        [memberId],
      );
      res.status(200).json({ message: "You have left the organization." });
    } catch (err) {
      console.error("Error leaving org:", err);
      res.status(500).json({ error: "Failed to leave organization" });
    }
  },

  /**
   * Kick a member from the organization (Requires ADMIN or FOUNDER)
   */
  kickMember: async (req, res) => {
    const { target_member_id } = req.body;
    const orgId = req.org?.organization_id;
    const requestorRole = req.org_member?.role;

    if (!target_member_id) {
      return res.status(400).json({ error: "target_member_id is required" });
    }

    try {
      // Get target member info
      const targetQuery = await pool.query(
        "SELECT org_role, is_active FROM organization_members WHERE organization_member_id = $1 AND organization_id = $2",
        [target_member_id, orgId],
      );

      if (targetQuery.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Member not found in this organization." });
      }

      const targetRole = targetQuery.rows[0].org_role;
      const targetIsActive = targetQuery.rows[0].is_active;

      if (!targetIsActive) {
        return res.status(400).json({ error: "Member is already inactive." });
      }

      // Hierarchy Check: Admins cannot kick Founders or Co-Founders.
      if (targetRole === "FOUNDER") {
        return res
          .status(403)
          .json({ error: "Cannot kick the true founder of the organization." });
      }
      if (targetRole === "CO-FOUNDER" && requestorRole === "ADMIN") {
        return res
          .status(403)
          .json({ error: "Admins cannot kick a Co-Founder." });
      }

      // Execute kick (soft delete)
      await pool.query(
        "UPDATE organization_members SET is_active = false WHERE organization_member_id = $1",
        [target_member_id],
      );

      res
        .status(200)
        .json({ message: "Member has been removed from the organization." });
    } catch (err) {
      console.error("Error kicking member:", err);
      res.status(500).json({ error: "Failed to remove member" });
    }
  },

  /**
   * Update a member's role (Requires ADMIN or FOUNDER)
   */
  updateMemberRole: async (req, res) => {
    const { target_member_id, new_role, designation_id } = req.body;
    const orgId = req.org?.organization_id;
    const requestorRole = req.org_member?.role;

    const validRoles = ["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER", "GUEST"];

    if (!target_member_id) {
      return res.status(400).json({ error: "target_member_id is required" });
    }

    if (new_role && !validRoles.includes(new_role)) {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    try {
      // Get target member info
      const targetQuery = await pool.query(
        "SELECT org_role, is_active FROM organization_members WHERE organization_member_id = $1 AND organization_id = $2",
        [target_member_id, orgId],
      );

      if (targetQuery.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Member not found in this organization." });
      }

      const targetRole = targetQuery.rows[0].org_role;
      const targetIsActive = targetQuery.rows[0].is_active;

      if (!targetIsActive) {
        return res
          .status(400)
          .json({ error: "Cannot change role of an inactive member." });
      }

      // Hierarchy Check
      if (
        requestorRole === "ADMIN" &&
        (targetRole === "FOUNDER" || targetRole === "CO-FOUNDER")
      ) {
        return res.status(403).json({
          error: "Admins cannot change the role of a founder or co-founder.",
        });
      }
      if (requestorRole === "MEMBER" || requestorRole === "GUEST") {
        return res
          .status(403)
          .json({ error: "You do not have permission to change roles." });
      }
      if (new_role === "FOUNDER") {
        return res.status(403).json({
          error: "Cannot assign true Founder role through this endpoint.",
        });
      }

      // Process target role update if provided
      if (new_role && validRoles.includes(new_role)) {
        if (targetRole === "FOUNDER") {
          return res.status(403).json({
            error: "The true Founder's role cannot be changed.",
          });
        }
        if (targetRole === "CO-FOUNDER" && requestorRole === "ADMIN") {
          return res.status(403).json({
            error: "Admins cannot change a Co-Founder's role.",
          });
        }

        await pool.query(
          "UPDATE organization_members SET org_role = $1 WHERE organization_member_id = $2",
          [new_role, target_member_id],
        );
      }

      // Process designation update if provided (can be null to remove)
      if (designation_id !== undefined) {
        // Verify the designation exists inside this organization
        if (designation_id !== null) {
          const designationCheck = await pool.query(
            "SELECT designation_id FROM organization_designations WHERE designation_id = $1 AND organization_id = $2",
            [designation_id, orgId],
          );
          if (designationCheck.rows.length === 0) {
            return res.status(404).json({ error: "Designation not found." });
          }
        }

        await pool.query(
          "UPDATE organization_members SET designation_id = $1 WHERE organization_member_id = $2",
          [designation_id, target_member_id],
        );
      }

      res
        .status(200)
        .json({ message: "Member position updated successfully." });
    } catch (err) {
      console.error("Error updating member role:", err);
      res.status(500).json({ error: "Failed to update member role" });
    }
  },

  updatePersonalStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.id;
      const orgId = req.org.organization_id;

      if (!status) {
        return res.status(400).json({ error: "Status is required." });
      }

      const validStatuses = [
        "On Work",
        "Leave",
        "Break",
        "Busy",
        "Away",
        "In Meeting",
        "Remote",
        "Deep Work",
        "Personal",
        "Traveling",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
      }

      const query = `
        UPDATE organization_members 
        SET status = $1 
        WHERE user_id = $2 AND organization_id = $3
        RETURNING *;
      `;
      const result = await pool.query(query, [status, userId, orgId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Member not found." });
      }

      res.status(200).json({
        message: "Status updated successfully.",
        member: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating personal status:", error);
      res.status(500).json({ error: "Failed to update status." });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // DYNAMIC DESIGNATION MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  // --- Departments ---
  getDepartments: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const query = `
        SELECT department_id, name, created_at
        FROM organization_departments
        WHERE organization_id = $1
        ORDER BY name ASC;
      `;
      const result = await pool.query(query, [orgId]);
      res.status(200).json({ departments: result.rows });
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ error: "Failed to load departments." });
    }
  },

  createDepartment: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const { name } = req.body;
      if (!name)
        return res.status(400).json({ error: "Department name is required." });

      const query = `
        INSERT INTO organization_departments (organization_id, name)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const result = await pool.query(query, [orgId, name]);
      res.status(201).json({
        department: result.rows[0],
        message: "Department created successfully.",
      });
    } catch (error) {
      console.error("Error creating department:", error);
      if (error.code === "23505") {
        // unique violation
        return res
          .status(400)
          .json({ error: "A department with this name already exists." });
      }
      res.status(500).json({ error: "Failed to create department." });
    }
  },

  updateDepartment: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const { id } = req.params;
      const { name } = req.body;
      if (!name)
        return res.status(400).json({ error: "Department name is required." });

      const query = `
        UPDATE organization_departments
        SET name = $1
        WHERE department_id = $2 AND organization_id = $3
        RETURNING *;
      `;
      const result = await pool.query(query, [name, id, orgId]);
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Department not found." });
      res.status(200).json({
        department: result.rows[0],
        message: "Department updated successfully.",
      });
    } catch (error) {
      console.error("Error updating department:", error);
      if (error.code === "23505") {
        return res
          .status(400)
          .json({ error: "A department with this name already exists." });
      }
      res.status(500).json({ error: "Failed to update department." });
    }
  },

  deleteDepartment: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const { id } = req.params;
      const query = `
        DELETE FROM organization_departments
        WHERE department_id = $1 AND organization_id = $2
        RETURNING department_id;
      `;
      const result = await pool.query(query, [id, orgId]);
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Department not found." });
      res.status(200).json({ message: "Department deleted successfully." });
    } catch (error) {
      console.error("Error deleting department:", error);
      res
        .status(500)
        .json({ error: "Failed to delete department. It might be in use." });
    }
  },

  // --- Designations ---
  getDesignations: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const query = `
        SELECT d.designation_id, d.title, d.hierarchy_level, d.base_salary_band, d.created_at,
               d.department_id, dept.name as department
        FROM organization_designations d
        LEFT JOIN organization_departments dept ON d.department_id = dept.department_id
        WHERE d.organization_id = $1
        ORDER BY d.created_at DESC;
      `;
      const result = await pool.query(query, [orgId]);
      res.status(200).json({ designations: result.rows });
    } catch (error) {
      console.error("Error fetching designations:", error);
      res.status(500).json({ error: "Failed to load designations." });
    }
  },

  createDesignation: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const { title, department_id, hierarchy_level, base_salary_band } =
        req.body;

      if (!title) {
        return res
          .status(400)
          .json({ error: "Designation title is required." });
      }

      const query = `
        INSERT INTO organization_designations 
          (organization_id, title, department_id, hierarchy_level, base_salary_band)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [
        orgId,
        title,
        department_id || null,
        hierarchy_level || 0,
        base_salary_band || null,
      ];

      const result = await pool.query(query, values);
      res.status(201).json({
        designation: result.rows[0],
        message: "Designation created successfully.",
      });
    } catch (error) {
      console.error("Error creating designation:", error);
      res.status(500).json({ error: "Failed to create designation." });
    }
  },

  updateDesignation: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const { id } = req.params;
      const { title, department_id, hierarchy_level, base_salary_band } =
        req.body;

      // Verify ownership
      const ownershipCheck = await pool.query(
        "SELECT designation_id FROM organization_designations WHERE designation_id = $1 AND organization_id = $2",
        [id, orgId],
      );

      if (ownershipCheck.rows.length === 0) {
        return res.status(404).json({ error: "Designation not found." });
      }

      const query = `
        UPDATE organization_designations
        SET title = COALESCE($1, title),
            department_id = COALESCE($2, department_id),
            hierarchy_level = COALESCE($3, hierarchy_level),
            base_salary_band = COALESCE($4, base_salary_band)
        WHERE designation_id = $5 AND organization_id = $6
        RETURNING *;
      `;
      const result = await pool.query(query, [
        title,
        department_id !== undefined ? department_id : null,
        hierarchy_level,
        base_salary_band,
        id,
        orgId,
      ]);
      res.status(200).json({
        designation: result.rows[0],
        message: "Designation updated successfully.",
      });
    } catch (error) {
      console.error("Error updating designation:", error);
      res.status(500).json({ error: "Failed to update designation." });
    }
  },

  deleteDesignation: async (req, res) => {
    try {
      const orgId = req.org.organization_id;
      const { id } = req.params;

      const deleteQuery = `
        DELETE FROM organization_designations
        WHERE designation_id = $1 AND organization_id = $2
        RETURNING designation_id;
      `;
      const result = await pool.query(deleteQuery, [id, orgId]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Designation not found or not authorized." });
      }

      res.status(200).json({ message: "Designation deleted successfully." });
    } catch (error) {
      console.error("Error deleting designation:", error);
      res
        .status(500)
        .json({ error: "Failed to delete designation. It might be in use." });
    }
  },

  /**
   * Batch update team hierarchy (Roles and Manager/Team Assignments) from Team Map
   * Expects: { updates: [{ member_id, org_role, manager_member_id, team_id }] }
   */
  updateTeamHierarchy: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { updates } = req.body;

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error:
          "Only Admins, Founders, and Co-Founders can modify the team hierarchy.",
      });
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Invalid updates format." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const update of updates) {
        const { member_id, org_role, manager_member_id, team_id } = update;

        // 1. Fetch current target member state
        const targetResult = await client.query(
          "SELECT org_role FROM organization_members WHERE organization_member_id = $1 AND organization_id = $2",
          [member_id, orgId],
        );

        if (targetResult.rows.length === 0) continue;
        const currentTargetRole = targetResult.rows[0].org_role;

        // 2. Permission enforcement matching frontend logic
        const requestorRole = req.org_member?.role;

        // Admins cannot touch Founders or Co-Founders, nor can they promote someone to those roles
        if (requestorRole === "ADMIN") {
          if (
            currentTargetRole === "FOUNDER" ||
            currentTargetRole === "CO-FOUNDER"
          ) {
            throw new Error("Admins cannot modify Founders or Co-Founders.");
          }
          if (org_role === "FOUNDER" || org_role === "CO-FOUNDER") {
            throw new Error(
              "Admins cannot promote members to Executive Board roles.",
            );
          }
        }

        // Even Co-Founders cannot demote the True Founder (who is always first in joined_at)
        // But for simplicity here, we assume if currentTargetRole is FOUNDER, it is protected.
        if (currentTargetRole === "FOUNDER" && org_role !== "FOUNDER") {
          throw new Error("The True Founder's role cannot be changed.");
        }

        // 3. Perform update
        await client.query(
          `
          UPDATE organization_members
          SET 
            org_role = COALESCE($1, org_role),
            manager_member_id = $2,
            team_id = $3
          WHERE organization_member_id = $4 AND organization_id = $5
          `,
          [
            org_role,
            manager_member_id === undefined ? null : manager_member_id,
            team_id === undefined ? null : team_id,
            member_id,
            orgId,
          ],
        );

        // 4. Auto-clear lead status if team changed or unassigned
        // If the member was a lead of their OLD team, and now they are in a NEW team or UNASSIGNED, clear the old lead field.
        await client.query(
          `
          UPDATE organization_teams
          SET team_lead_member_id = NULL
          WHERE team_lead_member_id = $1 
            AND organization_id = $2
            AND team_id != COALESCE($3, -1)
          `,
          [member_id, orgId, team_id],
        );
      }

      await client.query("COMMIT");
      res.json({ message: "Team hierarchy updated successfully." });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error updating team hierarchy:", err);
      res.status(500).json({ error: "Failed to update team hierarchy." });
    } finally {
      client.release();
    }
  },

  /**
   * Create an explicit Team
   */
  createTeam: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { name, category, team_lead_member_id, description } = req.body;

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error:
          "Only Admins, Founders, and Co-Founders can manage explicit teams.",
      });
    }

    if (!name) {
      return res.status(400).json({ error: "Team name is required." });
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO organization_teams 
        (organization_id, name, category, team_lead_member_id, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          orgId,
          name,
          category || "General",
          team_lead_member_id || null,
          description || null,
        ],
      );

      res.status(201).json({ team: result.rows[0] });
    } catch (err) {
      console.error("Error creating team:", err);
      res.status(500).json({ error: "Failed to create team." });
    }
  },

  /**
   * Update an explicit Team
   */
  updateTeam: async (req, res) => {
    const orgId = req.org?.organization_id;
    const teamId = req.params.teamId;
    const { name, category, team_lead_member_id, description } = req.body;

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error:
          "Only Admins, Founders, and Co-Founders can manage explicit teams.",
      });
    }

    try {
      // 1. One lead rule: Check if this member is already a lead of ANOTHER team
      if (team_lead_member_id) {
        const leadCheck = await pool.query(
          "SELECT team_id, name FROM organization_teams WHERE team_lead_member_id = $1 AND organization_id = $2 AND team_id != $3",
          [team_lead_member_id, orgId, teamId],
        );

        if (leadCheck.rows.length > 0) {
          return res.status(400).json({
            error: `This member is already the team lead of "${leadCheck.rows[0].name}". A person can only lead one team.`,
          });
        }

        // 2. Filter rule: Check if this member belongs to this team
        const memberCheck = await pool.query(
          "SELECT team_id FROM organization_members WHERE organization_member_id = $1 AND organization_id = $2",
          [team_lead_member_id, orgId],
        );

        if (
          memberCheck.rows.length === 0 ||
          memberCheck.rows[0].team_id !== parseInt(teamId)
        ) {
          return res.status(400).json({
            error:
              "The team lead must be a member of this team. Please add them to the team first.",
          });
        }
      }

      const result = await pool.query(
        `
        UPDATE organization_teams
        SET 
          name = COALESCE($1, name),
          category = COALESCE($2, category),
          team_lead_member_id = $3,
          description = COALESCE($4, description),
          updated_at = CURRENT_TIMESTAMP
        WHERE team_id = $5 AND organization_id = $6
        RETURNING *
        `,
        [
          name,
          category,
          team_lead_member_id === undefined ? null : team_lead_member_id,
          description,
          teamId,
          orgId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Team not found." });
      }

      res.json({ team: result.rows[0] });
    } catch (err) {
      console.error("Error updating team:", err);
      res.status(500).json({ error: "Failed to update team." });
    }
  },

  /**
   * Delete an explicit Team
   */
  deleteTeam: async (req, res) => {
    const orgId = req.org?.organization_id;
    const teamId = req.params.teamId;

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER" &&
      req.org_member?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error:
          "Only Admins, Founders, and Co-Founders can manage explicit teams.",
      });
    }

    try {
      const result = await pool.query(
        `
        DELETE FROM organization_teams
        WHERE team_id = $1 AND organization_id = $2
        RETURNING team_id
        `,
        [teamId, orgId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Team not found." });
      }

      res.json({ message: "Team deleted successfully." });
    } catch (err) {
      console.error("Error deleting team:", err);
      res.status(500).json({ error: "Failed to delete team." });
    }
  },

  /**
   * Request OTP to delete the organization (FOUNDER only)
   */
  requestDeleteOrganizationOtp: async (req, res) => {
    const orgId = req.org?.organization_id;
    const userId = req.user.id;
    const crypto = require("crypto");
    const emailService = require("../services/emailService");

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER"
    ) {
      return res.status(403).json({
        error: "Only Founders and Co-Founders can delete the organization.",
      });
    }

    try {
      const userResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [userId],
      );
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }
      const userEmail = userResult.rows[0].email;

      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      // Delete any existing unused org_delete OTPs for this user just in case
      await pool.query(
        "DELETE FROM otps WHERE email = $1 AND type = 'org_delete'",
        [userEmail],
      );

      await pool.query(
        "INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)",
        [userEmail, otp, "org_delete", expiresAt],
      );

      // Send Email using the existing generic sendEmail if a specific one isn't made
      await emailService.sendEmail({
        to: userEmail,
        subject: "Organization Deletion Request",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #DC2626;">Organization Deletion Request</h2>
                <p>You have requested to delete your organization. This action is <strong>irreversible</strong> and will delete all associated data, projects, tasks, and members.</p>
                <p>Use the following code to confirm the deletion:</p>
                <h1 style="color: #DC2626; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 10 minutes. If you did not request this, please change your password immediately.</p>
            </div>
            `,
      });

      res.json({ message: "Verification code sent to your email." });
    } catch (err) {
      console.error("Error sending org delete OTP:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  /**
   * Confirm deletion of the organization using OTP (FOUNDER only)
   */
  deleteOrganization: async (req, res) => {
    const { otp } = req.body;
    const orgId = req.org?.organization_id;
    const userId = req.user.id;

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER"
    ) {
      return res.status(403).json({
        error: "Only Founders and Co-Founders can delete the organization.",
      });
    }

    if (!otp) {
      return res.status(400).json({ error: "OTP is required." });
    }

    const client = await pool.connect();

    try {
      const userResult = await client.query(
        "SELECT email FROM users WHERE id = $1",
        [userId],
      );
      const userEmail = userResult.rows[0].email;

      await client.query("BEGIN");

      const otpRecord = await client.query(
        "SELECT * FROM otps WHERE email = $1 AND otp = $2 AND type = 'org_delete' AND expires_at > NOW()",
        [userEmail, otp],
      );

      if (otpRecord.rows.length === 0) {
        throw new Error("Invalid or expired verification code.");
      }

      // 7-day rule and Master Password Check
      const bcrypt = require("bcrypt");
      const orgData = await client.query(
        "SELECT security_code_hash, security_code_updated_at FROM organizations WHERE organization_id = $1",
        [orgId],
      );

      const { security_code_hash, security_code_updated_at } = orgData.rows[0];

      // Check 7-day cooling period
      const coolingPeriodDays = 7;
      const coolingPeriodMs = coolingPeriodDays * 24 * 60 * 60 * 1000;
      const now = new Date();
      if (
        security_code_updated_at &&
        now - new Date(security_code_updated_at) < coolingPeriodMs
      ) {
        const timeLeftHours = Math.ceil(
          (coolingPeriodMs - (now - new Date(security_code_updated_at))) /
            (1000 * 60 * 60),
        );
        throw new Error(
          `Security block: Organization cannot be deleted within 7 days of a Master Password change. Try again in about ${timeLeftHours} hours.`,
        );
      }

      // Verify Master Password
      if (security_code_hash) {
        const { security_code } = req.body;
        if (!security_code) {
          throw new Error("Master Password is required for deletion.");
        }
        const isMatch = await bcrypt.compare(security_code, security_code_hash);
        if (!isMatch) {
          throw new Error("Incorrect Master Password.");
        }
      }

      // OTP is valid, proceed with deletion
      // Delete OTP
      await client.query("DELETE FROM otps WHERE id = $1", [
        otpRecord.rows[0].id,
      ]);

      // Delete the organization.
      // Note: Due to ON DELETE CASCADE on organization_members and organization_designations,
      // deleting the organization row should automatically clean up members and designations.
      // Make sure all foreign keys have ON DELETE CASCADE or it will throw an error.

      await client.query(
        "DELETE FROM organizations WHERE organization_id = $1",
        [orgId],
      );

      await client.query("COMMIT");

      res.json({ message: "Organization deleted successfully." });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error deleting organization:", err);
      if (
        err.message === "Invalid or expired verification code." ||
        err.message.includes("Security block") ||
        err.message === "Master Password is required for deletion." ||
        err.message === "Incorrect Master Password."
      ) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({
        error:
          "Failed to delete organization. Ensure all dependencies are cleaned up.",
      });
    } finally {
      client.release();
    }
  },

  /**
   * Request OTP to change security code (FOUNDER only)
   */
  requestChangeSecurityCodeOtp: async (req, res) => {
    const userId = req.user.id;
    const crypto = require("crypto");
    const emailService = require("../services/emailService");

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER"
    ) {
      return res.status(403).json({
        error: "Only Founders and Co-Founders can change the master password.",
      });
    }

    try {
      const userResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [userId],
      );
      const userEmail = userResult.rows[0].email;

      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await pool.query(
        "DELETE FROM otps WHERE email = $1 AND type = 'org_security_change'",
        [userEmail],
      );

      await pool.query(
        "INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)",
        [userEmail, otp, "org_security_change", expiresAt],
      );

      await emailService.sendEmail({
        to: userEmail,
        subject: "Organization Master Password Change Request",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4F46E5;">Master Password Change Request</h2>
                <p>You have requested to change the Master Password (Security Code) for your organization.</p>
                <p><strong>Warning:</strong> Once changed, organization deletion will be blocked for 7 days.</p>
                <p>Use the following code to proceed:</p>
                <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
                <p>If you did not request this, please secure your account immediately.</p>
            </div>
            `,
      });

      res.json({ message: "Verification code sent to your email." });
    } catch (err) {
      console.error("Error sending security change OTP:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  /**
   * Finalize security code change (FOUNDER only)
   */
  updateSecurityCode: async (req, res) => {
    const { otp, new_security_code } = req.body;
    const orgId = req.org?.organization_id;
    const userId = req.user.id;
    const bcrypt = require("bcrypt");

    if (
      req.org_member?.role !== "FOUNDER" &&
      req.org_member?.role !== "CO-FOUNDER"
    ) {
      return res.status(403).json({
        error: "Only Founders and Co-Founders can change the master password.",
      });
    }

    if (!otp || !new_security_code) {
      return res
        .status(400)
        .json({ error: "OTP and new security code are required." });
    }

    // Validate Password strength
    const passError =
      organizationController.validatePassword(new_security_code);
    if (passError) return res.status(400).json({ error: passError });

    const client = await pool.connect();
    try {
      const userResult = await client.query(
        "SELECT email FROM users WHERE id = $1",
        [userId],
      );
      const userEmail = userResult.rows[0].email;

      await client.query("BEGIN");

      const otpRecord = await client.query(
        "SELECT * FROM otps WHERE email = $1 AND otp = $2 AND type = 'org_security_change' AND expires_at > NOW()",
        [userEmail, otp],
      );

      if (otpRecord.rows.length === 0) {
        throw new Error("Invalid or expired verification code.");
      }

      const hashedCode = await bcrypt.hash(new_security_code, 10);

      await client.query(
        "UPDATE organizations SET security_code_hash = $1, security_code_updated_at = NOW() WHERE organization_id = $2",
        [hashedCode, orgId],
      );

      await client.query("DELETE FROM otps WHERE id = $1", [
        otpRecord.rows[0].id,
      ]);

      await client.query("COMMIT");
      res.json({
        message:
          "Master password updated successfully. Deletion is now blocked for 7 days.",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error updating security code:", err);
      if (err.message === "Invalid or expired verification code.") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Server error" });
    } finally {
      client.release();
    }
  },

  /**
   * Check if a workspace URL is available
   */
  checkWorkspaceUrlAvailability: async (req, res) => {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    try {
      const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "");
      const result = await pool.query(
        "SELECT organization_id FROM organizations WHERE workspace_url = $1",
        [sanitizedSlug],
      );

      res.json({
        available: result.rows.length === 0,
        slug: sanitizedSlug,
      });
    } catch (err) {
      console.error("Error checking URL availability:", err);
      res.status(500).json({ error: "Failed to check availability" });
    }
  },
};

module.exports = organizationController;
