const { pool } = require("../database");

// Get system settings (always row 1)
exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM system_settings WHERE id = 1",
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Settings not initialization. Please check server configuration.",
      });
    }

    const settings = result.rows[0];
    res.json(settings);
  } catch (err) {
    console.error("Get Settings Error:", err);
    console.log("DEBUG_ERR:", err);
    res.status(500).json({ message: "Server error fetching settings" });
  }
};

// Update Branding Settings
exports.updateBranding = async (req, res) => {
  try {
    const {
      platform_name,
      logo_url,
      favicon_url,
      primary_color,
      secondary_color,
      accent_color,
    } = req.body;

    // Basic validation
    if (!platform_name) {
      return res.status(400).json({ message: "Platform name is required" });
    }

    const result = await pool.query(
      `UPDATE system_settings 
             SET platform_name = $1, 
                 logo_url = $2,
                 favicon_url = $3,
                 primary_color = $4,
                 secondary_color = $5,
                 accent_color = $6,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = 1
             RETURNING *`,
      [
        platform_name,
        logo_url,
        favicon_url,
        primary_color,
        secondary_color,
        accent_color,
      ],
    );

    // Invalidate cache
    const systemSettingsService = require("../services/systemSettingsService");
    systemSettingsService.invalidateCache();

    res.json({
      message: "Branding settings updated successfully",
      settings: result.rows[0],
    });
  } catch (err) {
    console.error("Update Branding Error:", err);
    res
      .status(500)
      .json({ message: "Server error updating branding settings" });
  }
};

// Update General Settings
exports.updateGeneral = async (req, res) => {
  try {
    const {
      support_email,
      contact_phone,
      contact_address,
      default_timezone,
      default_currency,
      session_timeout,
      maintenance_mode,
      registration_enabled,
    } = req.body;

    const result = await pool.query(
      `UPDATE system_settings 
             SET support_email = $1, 
                 contact_phone = $2,
                 contact_address = $3,
                 default_timezone = $4, 
                 default_currency = $5,
                 session_timeout = $6,
                 maintenance_mode = $7,
                 registration_enabled = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = 1
             RETURNING *`,
      [
        support_email,
        contact_phone,
        contact_address,
        default_timezone,
        default_currency,
        session_timeout, // Do NOT parse int, preserve string like "8 hours"
        maintenance_mode === true || String(maintenance_mode) === "true",
        registration_enabled === true ||
          String(registration_enabled) === "true",
      ],
    );

    // Invalidate cache
    const systemSettingsService = require("../services/systemSettingsService");
    systemSettingsService.invalidateCache();

    res.json({
      message: "General settings updated successfully",
      settings: result.rows[0],
    });
  } catch (err) {
    console.error("Update General Settings Error:", err);
    res.status(500).json({ message: "Server error updating general settings" });
  }
};

// Update Email Settings
exports.updateEmail = async (req, res) => {
  try {
    const {
      email_provider,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_password,
      smtp_secure,
      mail_api_key,
      mail_domain,
      system_email_name,
      system_email_address,
      support_email_name,
      support_email_address,
      marketing_email_name,
      marketing_email_address,
      enable_marketing_emails,
      email_footer_text,
    } = req.body;

    // Map support_email_address to support_email if provided
    const finalSupportEmail = support_email_address || req.body.support_email;

    const result = await pool.query(
      `UPDATE system_settings 
             SET email_provider = $1,
                 smtp_host = $2,
                 smtp_port = $3,
                 smtp_user = $4,
                 smtp_password = $5,
                 smtp_secure = $6,
                 mail_api_key = $7,
                 mail_domain = $8,
                 system_email_name = $9,
                 system_email_address = $10,
                 support_email_name = $11,
                 support_email = COALESCE($12, support_email), 
                 marketing_email_name = $13,
                 marketing_email_address = $14,
                 enable_marketing_emails = $15,
                 email_footer_text = $16,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = 1
             RETURNING *`,
      [
        email_provider,
        smtp_host,
        smtp_port ? parseInt(smtp_port) : 587,
        smtp_user,
        smtp_password,
        smtp_secure === true || String(smtp_secure) === "true",
        mail_api_key,
        mail_domain,
        system_email_name,
        system_email_address,
        support_email_name,
        finalSupportEmail,
        marketing_email_name,
        marketing_email_address,
        enable_marketing_emails === true ||
          String(enable_marketing_emails) === "true",
        email_footer_text,
      ],
    );

    // Invalidate cache
    const systemSettingsService = require("../services/systemSettingsService");
    systemSettingsService.invalidateCache();

    res.json({
      message: "Email settings updated successfully",
      settings: result.rows[0],
    });
  } catch (err) {
    console.error("Update Email Settings Error:", err);
    res.status(500).json({ message: "Server error updating email settings" });
  }
};

// Update Navigation & Homepage Settings
exports.updateNavigation = async (req, res) => {
  try {
    const { navigation_menu, homepage_slug } = req.body;

    // Validation: navigation_menu should be array
    if (navigation_menu && !Array.isArray(navigation_menu)) {
      return res
        .status(400)
        .json({ message: "Navigation menu must be an array" });
    }

    const result = await pool.query(
      `UPDATE system_settings 
             SET navigation_menu = COALESCE($1, navigation_menu),
                 homepage_slug = COALESCE($2, homepage_slug),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = 1
             RETURNING *`,
      [navigation_menu ? JSON.stringify(navigation_menu) : null, homepage_slug],
    );

    // Invalidate cache
    const systemSettingsService = require("../services/systemSettingsService");
    systemSettingsService.invalidateCache();

    res.json({
      message: "Navigation settings updated",
      settings: result.rows[0],
    });
  } catch (err) {
    console.error("Update Navigation Error:", err);
    res
      .status(500)
      .json({ message: "Server error updating navigation settings" });
  }
};

// Test Email Connection
exports.testEmailConnection = async (req, res) => {
  try {
    const {
      email_provider,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_password,
      smtp_secure,
    } = req.body;

    if (email_provider === "smtp") {
      if (!smtp_host || !smtp_user || !smtp_password) {
        return res.status(400).json({ message: "Missing SMTP credentials" });
      }

      console.log(
        `[DEBUG] Testing SMTP Connection: Host=${smtp_host} Port=${smtp_port} Secure=${smtp_secure} User=${smtp_user}`,
      );

      const configPort = parseInt(smtp_port) || 587;
      const isSecure = smtp_secure === true || String(smtp_secure) === "true";

      console.log(
        `[DEBUG] Final Config: Host=${smtp_host} Port=${configPort} Secure=${isSecure}`,
      );

      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: smtp_host,
        port: configPort,
        secure: isSecure,
        auth: {
          user: smtp_user,
          pass: smtp_password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();
      return res.json({
        success: true,
        message: "SMTP connection established successfully",
      });
    }

    // Mock for other providers for now
    return res.json({
      success: true,
      message: `Connection valid for ${email_provider}`,
    });
  } catch (err) {
    console.error("Test Email Connection Error:", err);
    res.status(400).json({ message: "Connection failed: " + err.message });
  }
};
