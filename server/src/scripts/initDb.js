const { pool } = require("../database");
const bcrypt = require("bcrypt");

const initDb = async () => {
  try {
    console.log("Initializing database...");

    // 1. Drop existing tables
    const tablesToDrop = [
      "sessions",
      "admin_login_history",
      "otps",
      "audit_logs",
      "system_settings",
      "email_templates",
      "file_assets",
      "files",
      "trusted_devices",
      "project_members",
      "projects",
      "cms_history",
      "cms_pages",
      "organization_members",
      "organization_designations",
      "organizations",
      "admins",
      "users",
    ];

    for (const table of tablesToDrop) {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
    console.log("Existing tables dropped.");

    // 2. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        password_hash TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        provider VARCHAR(50),
        provider_id VARCHAR(255),
        avatar VARCHAR(500),
        role VARCHAR(20) DEFAULT 'normal_user' CHECK (role IN ('founder', 'freelancer', 'student', 'normal_user')),
        bio TEXT,
        location VARCHAR(255),
        office_location VARCHAR(255),
        social_github VARCHAR(255),
        social_linkedin VARCHAR(255),
        social_website VARCHAR(255),
        job_title VARCHAR(100),
        department VARCHAR(100),
        employee_id VARCHAR(50),
        phone_number VARCHAR(20),
        skills TEXT[],
        preferences JSONB DEFAULT '{}'::jsonb,
        public_profile JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table created.");

    // 3. Create Admins Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        avatar_url TEXT,
        department VARCHAR(100),
        bio TEXT,
        phone_number VARCHAR(20),
        job_title VARCHAR(100),
        employee_id VARCHAR(50),
        office_location VARCHAR(255),
        social_linkedin VARCHAR(255),
        social_github VARCHAR(255),
        social_website VARCHAR(255),
        two_factor_enabled BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("Admins table created.");

    // 4. Create OTPs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        type VARCHAR(20) DEFAULT 'verification', -- verification, reset
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("OTPs table created.");

    // 5. Create Sessions Table (with UUID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        refresh_token_hash TEXT,
        
        -- Device Fingerprinting
        browser VARCHAR(50),
        browser_version VARCHAR(50),
        os VARCHAR(50),
        os_version VARCHAR(50),
        device_type VARCHAR(50),
        device_model VARCHAR(100),
        
        -- Network & Location
        ip_address VARCHAR(45),
        location_city VARCHAR(100),
        location_country VARCHAR(100),
        location_country_code VARCHAR(10),
        isp VARCHAR(100),
        
        -- Context
        login_method VARCHAR(50) DEFAULT 'local',
        user_agent_raw TEXT,
        
        -- Timestamps & Status
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        revoked_at TIMESTAMP,
        
        -- Constraints
        CONSTRAINT user_or_admin_check CHECK (
            (user_id IS NOT NULL AND admin_id IS NULL) OR 
            (user_id IS NULL AND admin_id IS NOT NULL)
        )
      );
      
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(refresh_token_hash);
    `);
    console.log("Sessions table created.");

    // 6. Create Admin Login History Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_login_history (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_name VARCHAR(100),
        location VARCHAR(100),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    console.log("Admin Login History table created.");

    // 7. Create Audit Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        action VARCHAR(255),
        description TEXT,
        ip_address VARCHAR(45),
        status VARCHAR(20),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    `);
    console.log("Audit logs table created.");

    // 8. Create Trusted Devices Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trusted_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        device_hash VARCHAR(255) NOT NULL,
        device_name VARCHAR(255),
        trusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_owner CHECK ( (user_id IS NOT NULL AND admin_id IS NULL) OR (user_id IS NULL AND admin_id IS NOT NULL) ),
        CONSTRAINT uniq_user_device UNIQUE (user_id, device_hash),
        CONSTRAINT uniq_admin_device UNIQUE (admin_id, device_hash)
      );
    `);
    console.log("Trusted devices table created.");

    // 9. Create Files Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        uploader_id INTEGER NOT NULL,
        uploader_type VARCHAR(20) NOT NULL, -- 'admin' or 'user'
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL UNIQUE,
        mime_type VARCHAR(100),
        size BIGINT,
        path TEXT NOT NULL,
        visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Files table created.");

    // 9.5 Create File Assets Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_assets (
          file_asset_id SERIAL PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100),
          size_bytes BIGINT,
          storage_url TEXT NOT NULL,          -- Either local relative path (e.g. '/private/projects/...', '/media/...'), or external link
          is_external BOOLEAN DEFAULT FALSE,  -- Distinguishes external links from locally hosted files
          context_type VARCHAR(50) NOT NULL,  -- e.g., 'project', 'task', 'gig', 'transaction'
          context_id INTEGER NOT NULL,        -- ID of the related entity
          uploader_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          organization_id INTEGER,            -- Captures multi-tenant isolation
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_file_assets_context ON file_assets(context_type, context_id);
    `);
    console.log("File assets table created.");

    // 10. Create System Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        platform_name VARCHAR(255) DEFAULT 'Startup LaunchPad',
        support_email VARCHAR(255) DEFAULT 'support@launchpad.com',
        contact_phone VARCHAR(50),
        contact_address TEXT,
        default_timezone VARCHAR(100) DEFAULT 'PST (Pacific Standard Time)',
        default_currency VARCHAR(10) DEFAULT 'USD',
        session_timeout VARCHAR(50) DEFAULT '1 hour',
        maintenance_mode BOOLEAN DEFAULT FALSE,
        registration_enabled BOOLEAN DEFAULT TRUE,
        email_provider VARCHAR(50) DEFAULT 'smtp',
        smtp_host VARCHAR(255),
        smtp_port VARCHAR(10) DEFAULT '587',
        smtp_user VARCHAR(255),
        smtp_password VARCHAR(255),
        smtp_secure BOOLEAN DEFAULT FALSE,
        mail_api_key VARCHAR(255),
        mail_domain VARCHAR(255),
        system_email_name VARCHAR(255) DEFAULT 'Startup LaunchPad',
        system_email_address VARCHAR(255) DEFAULT 'no-reply@launchpad.com',
        support_email_name VARCHAR(255) DEFAULT 'Launchpad Support',
        marketing_email_name VARCHAR(255) DEFAULT 'Launchpad News',
        marketing_email_address VARCHAR(255) DEFAULT 'news@launchpad.com',
        enable_marketing_emails BOOLEAN DEFAULT TRUE,
        email_footer_text VARCHAR(500) DEFAULT '© 2024 Startup Launchpad. All rights reserved.',
        logo_url VARCHAR(500),
        favicon_url VARCHAR(500),
        primary_color VARCHAR(50) DEFAULT '#0F172A',
        secondary_color VARCHAR(50) DEFAULT '#1E293B',
        accent_color VARCHAR(50) DEFAULT '#3B82F6',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("System settings table created.");

    // Seed default system settings
    await pool.query(`
        INSERT INTO system_settings (
            id, 
            platform_name, 
            support_email, 
            default_timezone, 
            session_timeout,
            maintenance_mode,
            registration_enabled,
            default_currency,
            email_provider,
            smtp_port,
            smtp_secure,
            system_email_name,
            system_email_address,
            support_email_name,
            marketing_email_name,
            marketing_email_address,
            enable_marketing_emails,
            email_footer_text,
            primary_color,
            secondary_color,
            accent_color
        )
        VALUES (
            1, 
            'Startup LaunchPad', 
            'support@launchpad.com', 
            'PST (Pacific Standard Time)', 
            '1 hour',
            false,
            true,
            'USD',
            'smtp',
            '587',
            false,
            'Startup LaunchPad',
            'no-reply@launchpad.com',
            'Launchpad Support',
            'Launchpad News',
            'news@launchpad.com',
            true,
            '© 2024 Startup Launchpad. All rights reserved.',
            '#0F172A',
            '#1E293B',
            '#3B82F6'
        ) ON CONFLICT (id) DO NOTHING;
    `);

    // 11. Create Organization Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        organization_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        timezone VARCHAR(100) DEFAULT 'UTC',
        status VARCHAR(50) DEFAULT 'active',
        subscription_plan_id INTEGER,
        logo_url TEXT,
        workspace_url VARCHAR(255) UNIQUE NOT NULL,
        org_handle UUID UNIQUE DEFAULT gen_random_uuid(),
        join_code VARCHAR(64) UNIQUE,
        security_code_hash TEXT,
        security_code_updated_at TIMESTAMP,
        public_profile JSONB DEFAULT '{}'::jsonb,
        brief_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS organization_designations (
        designation_id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        hierarchy_level INTEGER DEFAULT 0,
        base_salary_band VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS organization_members (
        organization_member_id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'On Work',
        manager_member_id INTEGER REFERENCES organization_members(organization_member_id) ON DELETE SET NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hourly_cost_rate NUMERIC(10, 2) DEFAULT 0.00,
        org_role VARCHAR(50) DEFAULT 'MEMBER' CHECK (org_role IN ('FOUNDER', 'ADMIN', 'MEMBER', 'GUEST')),
        designation_id INTEGER REFERENCES organization_designations(designation_id) ON DELETE SET NULL,
        UNIQUE(user_id) -- Ensures 1 user = 1 org
      );

      CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
      CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_org_designations_org ON organization_designations(organization_id);
    `);
    console.log("Organization tables created.");

    // 12. Create Projects tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        priority VARCHAR(50) DEFAULT 'medium',
        category VARCHAR(100) DEFAULT 'General',
        
        start_date TIMESTAMP,
        due_date TIMESTAMP,
        
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        
        owner_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        owner_org_id INTEGER, 
        
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_projects_owner_user ON projects(owner_user_id);

      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(project_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
    `);
    console.log("Projects tables created.");

    // 12. Create CMS tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL, 
        title VARCHAR(255) NOT NULL,
        is_system_page BOOLEAN DEFAULT FALSE,
        
        draft_content JSONB DEFAULT '{}',
        published_content JSONB DEFAULT '{}',
        
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT,
        og_image_url TEXT,
        
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_published_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS cms_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
        content JSONB NOT NULL,
        seo_metadata JSONB,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        published_by INTEGER,
        version_number INTEGER
      );
    `);

    // Seed system pages
    const systemPages = [
      { slug: "home", title: "Home Page" },
      { slug: "about", title: "About Us" },
      { slug: "contact", title: "Contact Us" },
    ];

    for (const page of systemPages) {
      await pool.query(
        `INSERT INTO cms_pages (slug, title, is_system_page, status) VALUES ($1, $2, TRUE, 'draft') ON CONFLICT (slug) DO NOTHING;`,
        [page.slug, page.title],
      );
    }
    console.log("CMS tables created and seeded.");

    // 13. Create Email Templates Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS email_templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL UNIQUE, 
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            variables JSONB,
            description VARCHAR(500),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Seed email templates
    const styles = `
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
color: #333;
line-height: 1.6;
max-width: 600px;
margin: 0 auto;
border: 1px solid #e0e0e0;
border-radius: 8px;
overflow: hidden;
`;

    const header = `
<div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
    <h2 style="margin: 0; color: #2c3e50;">{{platform_name}}</h2>
</div>
`;

    const footer = `
<div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0;">
    <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} {{platform_name}}. All rights reserved.</p>
    <p style="margin: 5px 0;">
        <a href="#" style="color: #666; text-decoration: none;">Privacy Policy</a> | 
        <a href="#" style="color: #666; text-decoration: none;">Terms of Service</a>
    </p>
</div>
`;

    const templates = [
      {
        name: "Welcome Email",
        type: "welcome",
        subject: "Welcome to {{platform_name}}!",
        body: `
            <div style="${styles}">
                ${header}
                <div style="padding: 30px; background-color: #ffffff;">
                    <h1 style="color: #2c3e50; font-size: 24px; margin-top: 0;">Welcome, {{name}}!</h1>
                    <p>We are thrilled to have you on board. {{platform_name}} is your place to launch and manage your innovative ideas.</p>
                    <p>Get started by exploring your dashboard and setting up your profile.</p>
                    <div style="text-align: center; margin: 30px 0;">
                         <a href="{{link}}" style="background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                    <p>If you have any questions, our support team is just a reply away.</p>
                    <p>Best regards,<br>The {{platform_name}} Team</p>
                </div>
                ${footer}
            </div>`,
        description: "Sent to new users upon registration.",
        variables: JSON.stringify(["name", "platform_name", "link"]),
      },
      {
        name: "Password Reset",
        type: "password_reset",
        subject: "Reset your Password",
        body: `
            <div style="${styles}">
                ${header}
                <div style="padding: 30px; background-color: #ffffff;">
                    <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
                    <p>We received a request to reset the password for your account associated with this email address.</p>
                    <p>Please use the following OTP (One-Time Password) to complete the process:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f1f5f9; color: #DC2626; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; border-radius: 8px; display: inline-block; border: 1px dashed #DC2626;">
                            {{otp}}
                        </div>
                    </div>
                    <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
                    <p>Best regards,<br>The {{platform_name}} Team</p>
                </div>
                ${footer}
            </div>`,
        description: "Sent when a user requests a password reset.",
        variables: JSON.stringify(["name", "otp", "platform_name"]),
      },
      {
        name: "Verify Account",
        type: "verify_email",
        subject: "Verify your Email Address",
        body: `
            <div style="${styles}">
                ${header}
                <div style="padding: 30px; background-color: #ffffff;">
                    <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Verify your Email</h2>
                    <p>Thank you for signing up with {{platform_name}}. To protect your account, please verify your email address using the code below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f0f9ff; color: #0284c7; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; border-radius: 8px; display: inline-block; border: 1px dashed #0284c7;">
                            {{otp}}
                        </div>
                    </div>
                    <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
                    <p>Best regards,<br>The {{platform_name}} Team</p>
                </div>
                ${footer}
            </div>`,
        description: "Sent to verify user email address during registration.",
        variables: JSON.stringify(["name", "otp", "platform_name"]),
      },
    ];

    for (const tmpl of templates) {
      await pool.query(
        `INSERT INTO email_templates (name, type, subject, body, description, variables) 
             VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (type) DO NOTHING;`,
        [
          tmpl.name,
          tmpl.type,
          tmpl.subject,
          tmpl.body,
          tmpl.description,
          tmpl.variables,
        ],
      );
    }
    console.log("Email templates created and seeded.");

    // 14. Seed Root Admin
    const rootAdminUsername = "root_admin";
    const rootAdminPassword = "@Startup2026";

    const adminCheck = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [rootAdminUsername],
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(rootAdminPassword, 10);
      await pool.query(
        "INSERT INTO admins (username, password_hash, role, status) VALUES ($1, $2, 'super_admin', 'active')",
        [rootAdminUsername, hashedPassword],
      );
      console.log("Root admin seeded successfully as super_admin.");
    }

    console.log("Database initialization complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
};

initDb();
