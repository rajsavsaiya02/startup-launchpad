/**
 * ============================================================
 *  initDb.js — Full Database Initialization
 * ============================================================
 *  Run this once to create (or recreate) the entire DB schema.
 *  This script DROPS all existing tables then re-creates them
 *  in the correct dependency order.
 *
 *  After running this script, run defaultDb.js to seed all
 *  required default data (system settings, email templates,
 *  CMS pages, root admin, etc.).
 *
 *  Usage:
 *    node server/src/scripts/db/migrations/initDb.js
 * ============================================================
 */

"use strict";

require("dotenv").config();
const { pool } = require("../../../database");

// ─────────────────────────────────────────────────────────────
// DROP ORDER  (children → parents to avoid FK constraint errors)
// ─────────────────────────────────────────────────────────────
const DROP_ORDER = [
  // Leaf / junction tables first
  "expense_attachments",
  "task_comments",
  "task_associations",
  "task_assignees",
  "tasks",
  "project_expenses",
  "project_activities",
  "project_members",
  "projects",

  // Opportunity / talent marketplace
  "opportunity_archives",
  "opportunity_messages",
  "opportunity_applications",
  "opportunities",

  // CMS
  "cms_history",
  "cms_pages",

  // Finance
  "fin_tax_mandate",
  "fin_capital_tranche",
  "fin_approval_rule",
  "financial_transactions",
  "fin_coa_category",
  "fin_config_profile",

  // Org
  "organization_talent_messages",
  "organization_shortlisted_talent",
  "organization_invitations",
  "organization_members",
  "organization_teams",
  "organization_designations",
  "organization_departments",
  "organizations",

  // Auth / files
  "trusted_devices",
  "audit_logs",
  "admin_login_history",
  "sessions",
  "otps",
  "file_assets",
  "files",

  // Config
  "email_templates",
  "system_settings",

  // Core principals (drop last)
  "admins",
  "users",
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const log = (msg) => console.log(`  ✅  ${msg}`);
const step = (msg) => console.log(`\n📦  ${msg}`);

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log("=".repeat(60));
    console.log("  Starting full database initialization …");
    console.log("=".repeat(60));

    // ── 0. Drop all tables ──────────────────────────────────
    step("Dropping existing tables …");
    for (const table of DROP_ORDER) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
    log("All existing tables dropped.");

    // ── 1. users ────────────────────────────────────────────
    step("Creating users table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                SERIAL PRIMARY KEY,
        username          VARCHAR(50) UNIQUE,
        email             VARCHAR(255) UNIQUE NOT NULL,
        name              VARCHAR(255),
        first_name        VARCHAR(100),
        last_name         VARCHAR(100),
        password_hash     TEXT,
        is_verified       BOOLEAN DEFAULT FALSE,
        provider          VARCHAR(50),
        provider_id       VARCHAR(255),
        avatar            VARCHAR(500),
        public_profile_avatar VARCHAR(500) DEFAULT NULL,
        role              VARCHAR(20) DEFAULT 'normal_user'
                            CHECK (role IN ('founder','freelancer','student','normal_user')),
        -- Profile fields
        bio               TEXT,
        location          VARCHAR(255),
        office_location   VARCHAR(255),
        social_github     VARCHAR(255),
        social_linkedin   VARCHAR(255),
        social_website    VARCHAR(255),
        job_title         VARCHAR(100),
        department        VARCHAR(100),
        employee_id       VARCHAR(50),
        phone_number      VARCHAR(20),
        skills            TEXT[],
        -- Preferences & public profile
        preferences       JSONB DEFAULT '{}'::jsonb,
        public_profile    JSONB DEFAULT '{}'::jsonb,
        status            VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("users");

    // ── 2. admins ───────────────────────────────────────────
    step("Creating admins table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id                  SERIAL PRIMARY KEY,
        username            VARCHAR(50) UNIQUE NOT NULL,
        password_hash       TEXT NOT NULL,
        full_name           VARCHAR(255),
        email               VARCHAR(255),
        role                VARCHAR(50) DEFAULT 'admin',
        status              VARCHAR(20) DEFAULT 'active',
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login          TIMESTAMP,
        avatar_url          TEXT,
        department          VARCHAR(100),
        bio                 TEXT,
        phone_number        VARCHAR(20),
        job_title           VARCHAR(100),
        employee_id         VARCHAR(50),
        office_location     VARCHAR(255),
        social_linkedin     VARCHAR(255),
        social_github       VARCHAR(255),
        social_website      VARCHAR(255),
        two_factor_enabled  BOOLEAN DEFAULT FALSE
      );
    `);
    log("admins");

    // ── 3. system_settings ──────────────────────────────────
    step("Creating system_settings table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id                      SERIAL PRIMARY KEY,
        platform_name           VARCHAR(255) DEFAULT 'Startup LaunchPad',
        support_email           VARCHAR(255) DEFAULT 'support@launchpad.com',
        contact_phone           VARCHAR(50),
        contact_address         TEXT,
        default_timezone        VARCHAR(100) DEFAULT 'PST (Pacific Standard Time)',
        default_currency        VARCHAR(10) DEFAULT 'USD',
        session_timeout         VARCHAR(50) DEFAULT '1 hour',
        maintenance_mode        BOOLEAN DEFAULT FALSE,
        registration_enabled    BOOLEAN DEFAULT TRUE,
        -- Email provider
        email_provider          VARCHAR(50) DEFAULT 'smtp',
        smtp_host               VARCHAR(255),
        smtp_port               VARCHAR(10) DEFAULT '587',
        smtp_user               VARCHAR(255),
        smtp_password           VARCHAR(255),
        smtp_secure             BOOLEAN DEFAULT FALSE,
        mail_api_key            VARCHAR(255),
        mail_domain             VARCHAR(255),
        -- Email identity
        system_email_name       VARCHAR(255) DEFAULT 'Startup LaunchPad',
        system_email_address    VARCHAR(255) DEFAULT 'no-reply@launchpad.com',
        support_email_name      VARCHAR(255) DEFAULT 'Launchpad Support',
        marketing_email_name    VARCHAR(255) DEFAULT 'Launchpad News',
        marketing_email_address VARCHAR(255) DEFAULT 'news@launchpad.com',
        enable_marketing_emails BOOLEAN DEFAULT TRUE,
        email_footer_text       VARCHAR(500) DEFAULT '© 2025 Startup Launchpad. All rights reserved.',
        -- Branding
        logo_url                VARCHAR(500),
        favicon_url             VARCHAR(500),
        primary_color           VARCHAR(50) DEFAULT '#0F172A',
        secondary_color         VARCHAR(50) DEFAULT '#1E293B',
        accent_color            VARCHAR(50) DEFAULT '#3B82F6',
        -- Navigation / CMS
        navigation_menu         JSONB DEFAULT '[]',
        homepage_slug           VARCHAR(255) DEFAULT NULL,
        updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("system_settings");

    // ── 4. email_templates ──────────────────────────────────
    step("Creating email_templates table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        type        VARCHAR(50) NOT NULL UNIQUE,
        subject     VARCHAR(255) NOT NULL,
        body        TEXT NOT NULL,
        variables   JSONB,
        description VARCHAR(500),
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("email_templates");

    // ── 5. otps ─────────────────────────────────────────────
    step("Creating otps table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR(255) NOT NULL,
        otp        VARCHAR(6) NOT NULL,
        type       VARCHAR(20) DEFAULT 'verification',  -- verification | reset
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("otps");

    // ── 6. sessions ─────────────────────────────────────────
    step("Creating sessions table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id               INTEGER REFERENCES users(id) ON DELETE CASCADE,
        admin_id              INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        refresh_token_hash    TEXT,
        -- Device fingerprinting
        browser               VARCHAR(50),
        browser_version       VARCHAR(50),
        os                    VARCHAR(50),
        os_version            VARCHAR(50),
        device_type           VARCHAR(50),
        device_model          VARCHAR(100),
        -- Network & location
        ip_address            VARCHAR(45),
        location_city         VARCHAR(100),
        location_country      VARCHAR(100),
        location_country_code VARCHAR(10),
        isp                   VARCHAR(100),
        -- Context
        login_method          VARCHAR(50) DEFAULT 'local',
        user_agent_raw        TEXT,
        -- Timestamps & status
        created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at            TIMESTAMP NOT NULL,
        is_active             BOOLEAN DEFAULT TRUE,
        revoked_at            TIMESTAMP,
        CONSTRAINT user_or_admin_check CHECK (
          (user_id IS NOT NULL AND admin_id IS NULL) OR
          (user_id IS NULL   AND admin_id IS NOT NULL)
        )
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user_id   ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_admin_id  ON sessions(admin_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(refresh_token_hash);
    `);
    log("sessions");

    // ── 7. admin_login_history ──────────────────────────────
    step("Creating admin_login_history table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_login_history (
        id          SERIAL PRIMARY KEY,
        admin_id    INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        ip_address  VARCHAR(45),
        user_agent  TEXT,
        device_name VARCHAR(100),
        location    VARCHAR(100),
        login_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active   BOOLEAN DEFAULT TRUE
      );
    `);
    log("admin_login_history");

    // ── 8. audit_logs ───────────────────────────────────────
    step("Creating audit_logs table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
        admin_id    INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        event_type  VARCHAR(50) NOT NULL,
        action      VARCHAR(255),
        description TEXT,
        ip_address  VARCHAR(45),
        status      VARCHAR(20),
        details     JSONB,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type  ON audit_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id     ON audit_logs(user_id);
    `);
    log("audit_logs");

    // ── 9. trusted_devices ──────────────────────────────────
    step("Creating trusted_devices table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS trusted_devices (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER REFERENCES users(id)  ON DELETE CASCADE,
        admin_id     INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        device_hash  VARCHAR(255) NOT NULL,
        device_name  VARCHAR(255),
        trusted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at   TIMESTAMP NOT NULL,
        last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_owner       CHECK (
          (user_id IS NOT NULL AND admin_id IS NULL) OR
          (user_id IS NULL   AND admin_id IS NOT NULL)
        ),
        CONSTRAINT uniq_user_device  UNIQUE (user_id,  device_hash),
        CONSTRAINT uniq_admin_device UNIQUE (admin_id, device_hash)
      );
    `);
    log("trusted_devices");

    // ── 10. files ───────────────────────────────────────────
    step("Creating files table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id            SERIAL PRIMARY KEY,
        uploader_id   INTEGER NOT NULL,
        uploader_type VARCHAR(20) NOT NULL,   -- 'admin' | 'user'
        original_name VARCHAR(255) NOT NULL,
        stored_name   VARCHAR(255) NOT NULL UNIQUE,
        mime_type     VARCHAR(100),
        size          BIGINT,
        path          TEXT NOT NULL,
        visibility    VARCHAR(20) DEFAULT 'private'
                        CHECK (visibility IN ('public','private')),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("files");

    // ── 11. file_assets ─────────────────────────────────────
    step("Creating file_assets table …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_assets (
        file_asset_id    SERIAL PRIMARY KEY,
        file_name        VARCHAR(255) NOT NULL,
        mime_type        VARCHAR(100),
        size_bytes       BIGINT,
        storage_url      TEXT NOT NULL,        -- local path or external URL
        is_external      BOOLEAN DEFAULT FALSE,
        context_type     VARCHAR(50) NOT NULL, -- 'project' | 'task' | 'transaction' …
        context_id       INTEGER NOT NULL,
        description      TEXT,
        uploader_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        organization_id  INTEGER,              -- multi-tenant isolation
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_file_assets_context ON file_assets(context_type, context_id);
    `);
    log("file_assets");

    // ── 12. organizations ───────────────────────────────────
    step("Creating organization tables …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        organization_id         SERIAL PRIMARY KEY,
        name                    VARCHAR(255) NOT NULL,
        timezone                VARCHAR(100) DEFAULT 'UTC',
        status                  VARCHAR(50) DEFAULT 'active',
        subscription_plan_id    INTEGER,
        logo_url                TEXT,
        workspace_url           VARCHAR(255) UNIQUE NOT NULL,
        org_handle              UUID UNIQUE DEFAULT gen_random_uuid(),
        join_code               VARCHAR(64) UNIQUE,
        security_code_hash      TEXT,
        security_code_updated_at TIMESTAMP,
        public_profile          JSONB DEFAULT '{}'::jsonb,
        brief_description       TEXT,
        created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("organizations");

    // ── 13. organization_departments ────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_departments (
        department_id   SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        name            VARCHAR(100) NOT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (organization_id, name)
      );

      CREATE INDEX IF NOT EXISTS idx_org_departments_org ON organization_departments(organization_id);
    `);
    log("organization_departments");

    // ── 14. organization_designations ───────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_designations (
        designation_id   SERIAL PRIMARY KEY,
        organization_id  INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        title            VARCHAR(100) NOT NULL,
        department_id    INTEGER REFERENCES organization_departments(department_id) ON DELETE SET NULL,
        hierarchy_level  INTEGER DEFAULT 0,
        base_salary_band VARCHAR(100),
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_org_designations_org ON organization_designations(organization_id);
    `);
    log("organization_designations");

    // ── 15. organization_teams ──────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_teams (
        team_id             SERIAL PRIMARY KEY,
        organization_id     INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        name                VARCHAR(255) NOT NULL,
        category            VARCHAR(100) DEFAULT 'General',
        team_lead_member_id INTEGER,  -- FK added after organization_members is created
        description         TEXT,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_org_teams_org ON organization_teams(organization_id);
    `);
    log("organization_teams");

    // ── 16. organization_members ────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_members (
        organization_member_id SERIAL PRIMARY KEY,
        organization_id        INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        user_id                INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_active              BOOLEAN DEFAULT TRUE,
        status                 VARCHAR(50) DEFAULT 'On Work',
        manager_member_id      INTEGER REFERENCES organization_members(organization_member_id) ON DELETE SET NULL,
        team_id                INTEGER REFERENCES organization_teams(team_id) ON DELETE SET NULL,
        joined_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hourly_cost_rate       NUMERIC(10, 2) DEFAULT 0.00,
        org_role               VARCHAR(50) DEFAULT 'MEMBER'
                                 CHECK (org_role IN ('FOUNDER','CO-FOUNDER','ADMIN','MEMBER','GUEST')),
        designation_id         INTEGER REFERENCES organization_designations(designation_id) ON DELETE SET NULL,
        UNIQUE (user_id)  -- 1 user => 1 org
      );

      CREATE INDEX IF NOT EXISTS idx_org_members_org  ON organization_members(organization_id);
      CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_org_members_team ON organization_members(team_id);
    `);
    log("organization_members");

    // Back-fill the team_lead FK now that organization_members exists
    await client.query(`
      ALTER TABLE organization_teams
        ADD CONSTRAINT fk_team_lead
          FOREIGN KEY (team_lead_member_id)
          REFERENCES organization_members(organization_member_id)
          ON DELETE SET NULL;
    `);

    // ── 17. organization_invitations ────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_invitations (
        invitation_id       SERIAL PRIMARY KEY,
        organization_id     INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        created_by          INTEGER REFERENCES users(id) ON DELETE CASCADE,
        invitation_code     VARCHAR(64) UNIQUE NOT NULL,
        security_code_hash  TEXT NOT NULL,
        email               VARCHAR(255),
        status              VARCHAR(20) DEFAULT 'pending'
                              CHECK (status IN ('pending','used','expired')),
        expires_at          TIMESTAMP NOT NULL,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at             TIMESTAMP,
        used_by             INTEGER REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_org_invitations_code ON organization_invitations(invitation_code);
      CREATE INDEX IF NOT EXISTS idx_org_invitations_org  ON organization_invitations(organization_id);
    `);
    log("organization_invitations");

    // ── 18. organization_shortlisted_talent ─────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_shortlisted_talent (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id, user_id)
      );
    `);
    log("organization_shortlisted_talent");

    // ── 19. organization_talent_messages ────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_talent_messages (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("organization_talent_messages");

    // ── 20. projects ────────────────────────────────────────
    step("Creating project tables …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id            SERIAL PRIMARY KEY,
        title         VARCHAR(255) NOT NULL,
        description   TEXT,
        status        VARCHAR(50) DEFAULT 'active',
        priority      VARCHAR(50) DEFAULT 'medium',
        category      VARCHAR(100) DEFAULT 'General',
        start_date    TIMESTAMP,
        due_date      TIMESTAMP,
        progress      INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        budget        DECIMAL(15, 2) DEFAULT 0.00,
        owner_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        owner_org_id  INTEGER REFERENCES organizations(organization_id) ON DELETE SET NULL,
        created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_projects_owner_user ON projects(owner_user_id);
      CREATE INDEX IF NOT EXISTS idx_projects_owner_org  ON projects(owner_org_id);
    `);
    log("projects");

    // ── 18. project_members ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id         SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id)    ON DELETE CASCADE,
        role       VARCHAR(50) DEFAULT 'member',  -- owner | admin | member | viewer
        joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (project_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_user    ON project_members(user_id);
    `);
    log("project_members");

    // ── 19. project_expenses ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_expenses (
        id            SERIAL PRIMARY KEY,
        project_id    INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        description   VARCHAR(255) NOT NULL,
        category      VARCHAR(100) NOT NULL,
        vendor_name   VARCHAR(255),
        expense_date  TIMESTAMP NOT NULL,
        amount        DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        status        VARCHAR(50) DEFAULT 'Pending',
        brief         TEXT,
        payment_modes JSONB DEFAULT '[]'::jsonb,
        created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        updated_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_project_expenses_project_id ON project_expenses(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_expenses_date       ON project_expenses(expense_date);
      CREATE INDEX IF NOT EXISTS idx_project_expenses_category   ON project_expenses(category);
      CREATE INDEX IF NOT EXISTS idx_project_expenses_status     ON project_expenses(status);
    `);
    log("project_expenses");

    // ── 20. expense_attachments ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS expense_attachments (
        expense_id    INTEGER REFERENCES project_expenses(id)     ON DELETE CASCADE,
        file_asset_id INTEGER REFERENCES file_assets(file_asset_id) ON DELETE CASCADE,
        PRIMARY KEY (expense_id, file_asset_id)
      );
    `);
    log("expense_attachments");

    // ── 21. project_activities ──────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_activities (
        id         SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id)    ON DELETE SET NULL,
        content    TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_project_activities_project    ON project_activities(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON project_activities(created_at);
    `);
    log("project_activities");

    // ── 22. Organization Finance tables ─────────────────────
    step("Creating finance tables …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS fin_config_profile (
        id                        SERIAL PRIMARY KEY,
        organization_id           INTEGER UNIQUE REFERENCES organizations(organization_id) ON DELETE CASCADE,
        base_currency             VARCHAR(10) DEFAULT 'INR',
        gst_registered            BOOLEAN DEFAULT FALSE,
        gstin                     VARCHAR(50),
        financial_year_start_month INTEGER DEFAULT 4,  -- April
        created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("fin_config_profile");

    await client.query(`
      CREATE TABLE IF NOT EXISTS fin_coa_category (
        id              SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        name            VARCHAR(255) NOT NULL,
        type            VARCHAR(50) NOT NULL
                          CHECK (type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')),
        description     TEXT,
        is_system       BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("fin_coa_category");

    await client.query(`
      CREATE TABLE IF NOT EXISTS fin_approval_rule (
        id              SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        category_id     INTEGER REFERENCES fin_coa_category(id) ON DELETE CASCADE,
        min_amount      NUMERIC(15, 2) DEFAULT 0,
        max_amount      NUMERIC(15, 2),
        approver_role   VARCHAR(50) NOT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("fin_approval_rule");

    await client.query(`
      CREATE TABLE IF NOT EXISTS fin_capital_tranche (
        id              SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        title           VARCHAR(255) NOT NULL,
        amount          NUMERIC(15, 2) NOT NULL,
        currency        VARCHAR(10) DEFAULT 'INR',
        received_date   DATE NOT NULL,
        investor_name   VARCHAR(255),
        description     TEXT,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("fin_capital_tranche");

    await client.query(`
      CREATE TABLE IF NOT EXISTS fin_tax_mandate (
        id              SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        category_id     INTEGER REFERENCES fin_coa_category(id) ON DELETE CASCADE,
        tax_type        VARCHAR(50) NOT NULL,  -- 'GST' | 'TDS'
        tax_rate        NUMERIC(5, 2) NOT NULL,
        description     TEXT,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("fin_tax_mandate");

    await client.query(`
      CREATE TABLE IF NOT EXISTS financial_transactions (
        id               SERIAL PRIMARY KEY,
        organization_id  INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        project_id       INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('INCOME','EXPENSE')),
        category_id      INTEGER REFERENCES fin_coa_category(id) ON DELETE RESTRICT,
        amount           NUMERIC(15, 2) NOT NULL,
        currency         VARCHAR(10) DEFAULT 'INR',
        description      TEXT NOT NULL,
        vendor_name      VARCHAR(255),
        status           VARCHAR(50) DEFAULT 'POSTED',
        receipt_url      TEXT,
        expense_date     DATE NOT NULL,
        created_by_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_fin_tx_org     ON financial_transactions(organization_id);
      CREATE INDEX IF NOT EXISTS idx_fin_tx_project ON financial_transactions(project_id);
    `);
    log("financial_transactions");

    // ── 23. Talent Marketplace ──────────────────────────────
    step("Creating talent marketplace tables …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id                SERIAL PRIMARY KEY,
        project_id        INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        organization_id   INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
        owner_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type              VARCHAR(50) NOT NULL CHECK (type IN ('gig','internship','job')),
        title             VARCHAR(255) NOT NULL,
        description       TEXT NOT NULL,
        skills            TEXT[],
        compensation_type VARCHAR(50) CHECK (compensation_type IN ('Fixed','Hourly','Unpaid','Stipend','Salary')),
        budget_min        NUMERIC(15, 2),
        budget_max        NUMERIC(15, 2),
        media_urls        TEXT[],
        external_links    TEXT[],
        status            VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open','Closed','Filled')),
        duration          VARCHAR(100),
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_opportunities_type   ON opportunities(type);
      CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
      CREATE INDEX IF NOT EXISTS idx_opportunities_org    ON opportunities(organization_id);
    `);
    log("opportunities");

    await client.query(`
      CREATE TABLE IF NOT EXISTS opportunity_applications (
        id             SERIAL PRIMARY KEY,
        opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
        freelancer_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cover_letter   TEXT,
        proposed_rate  NUMERIC(15, 2),
        status         VARCHAR(50) DEFAULT 'Pending'
                         CHECK (status IN ('Pending','Shortlisted','Accepted','Rejected')),
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (opportunity_id, freelancer_id)
      );

      CREATE INDEX IF NOT EXISTS idx_opp_applications_opp       ON opportunity_applications(opportunity_id);
      CREATE INDEX IF NOT EXISTS idx_opp_applications_freelancer ON opportunity_applications(freelancer_id);
    `);
    log("opportunity_applications");

    await client.query(`
      CREATE TABLE IF NOT EXISTS opportunity_messages (
        id             SERIAL PRIMARY KEY,
        application_id INTEGER REFERENCES opportunity_applications(id) ON DELETE CASCADE,
        sender_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content        TEXT NOT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_opp_messages_app ON opportunity_messages(application_id);
    `);
    log("opportunity_messages");

    await client.query(`
      CREATE TABLE IF NOT EXISTS opportunity_archives (
        id                      SERIAL PRIMARY KEY,
        application_id          INTEGER REFERENCES opportunity_applications(id) ON DELETE CASCADE,
        archived_by_founder     BOOLEAN DEFAULT TRUE,
        archived_by_freelancer  BOOLEAN DEFAULT TRUE,
        founder_deleted         BOOLEAN DEFAULT FALSE,
        freelancer_deleted      BOOLEAN DEFAULT FALSE,
        archived_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("opportunity_archives");

    // ── 24. CMS ─────────────────────────────────────────────
    step("Creating CMS tables …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug             VARCHAR(100) UNIQUE NOT NULL,
        title            VARCHAR(255) NOT NULL,
        is_system_page   BOOLEAN DEFAULT FALSE,
        draft_content    JSONB DEFAULT '{}',
        published_content JSONB DEFAULT '{}',
        seo_title        VARCHAR(255),
        seo_description  TEXT,
        seo_keywords     TEXT,
        og_image_url     TEXT,
        status           VARCHAR(20) DEFAULT 'draft',
        created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_published_at TIMESTAMP WITH TIME ZONE
      );
    `);
    log("cms_pages");

    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_history (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page_id        UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
        content        JSONB NOT NULL,
        seo_metadata   JSONB,
        published_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        published_by   INTEGER,
        version_number INTEGER
      );
    `);
    log("cms_history");

    // ── 25. Tasks ────────────────────────────────────────────
    step("Creating task tables …");
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id               SERIAL PRIMARY KEY,
        project_id       INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        organization_id  INTEGER,
        parent_task_id   INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
        title            VARCHAR(255) NOT NULL,
        description      TEXT,
        kanban_status    VARCHAR(50) DEFAULT 'todo',
        priority         VARCHAR(50) DEFAULT 'Medium',
        category         VARCHAR(100) DEFAULT 'General',
        due_date         TIMESTAMP,
        is_milestone     BOOLEAN DEFAULT FALSE,
        health_score_ai  DECIMAL DEFAULT 100,
        subtasks         JSONB DEFAULT '[]'::JSONB,
        time_spent       INTEGER DEFAULT 0,        -- minutes
        timer_started_at TIMESTAMP,
        assigned_member_id INTEGER,
        created_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_project       ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_kanban_status ON tasks(kanban_status);
    `);
    log("tasks");

    // Add time_logs for detailed timer sessions
    await client.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS time_logs JSONB DEFAULT '[]'::JSONB;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_assignees (
        id          SERIAL PRIMARY KEY,
        task_id     INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (task_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON task_assignees(task_id);
    `);
    log("task_assignees");

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_associations (
        id               SERIAL PRIMARY KEY,
        source_task_id   INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        target_task_id   INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        association_type VARCHAR(50),  -- 'blocks' | 'related_to'
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log("task_associations");

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id         SERIAL PRIMARY KEY,
        task_id    INTEGER REFERENCES tasks(id)  ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id)  ON DELETE CASCADE,
        comment    TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id);
    `);
    log("task_comments");

    // ── Done ────────────────────────────────────────────────
    console.log("\n" + "=".repeat(60));
    console.log("  ✅  Database schema initialized successfully!");
    console.log("  👉  Run defaultDb.js next to seed default data.");
    console.log("=".repeat(60));

    process.exit(0);
  } catch (err) {
    console.error("\n❌  Error initializing database:", err);
    process.exit(1);
  } finally {
    client.release();
  }
};

initDb();
