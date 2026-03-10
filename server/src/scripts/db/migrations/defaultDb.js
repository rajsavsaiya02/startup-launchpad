/**
 * ============================================================
 *  defaultDb.js — Seed Default Records
 * ============================================================
 *  Run this AFTER initDb.js has created the schema.
 *  This script inserts all required default data into the
 *  freshly created database so the application starts up in a
 *  valid, fully-configured state.
 *
 *  What gets seeded:
 *    1.  system_settings  — The single platform-wide config row
 *    2.  email_templates  — welcome | password_reset | verify_email
 *    3.  cms_pages        — home | about | contact  (system pages)
 *    4.  admins           — root super-admin account
 *
 *  All inserts use ON CONFLICT … DO NOTHING so the script is
 *  safe to re-run on an already-seeded database.
 *
 *  Usage:
 *    node server/src/scripts/db/migrations/defaultDb.js
 * ============================================================
 */

"use strict";

require("dotenv").config();
const { pool } = require("../../../database");
const bcrypt = require("bcrypt");

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const log = (msg) => console.log(`  ✅  ${msg}`);
const step = (msg) => console.log(`\n📦  ${msg}`);

// ─────────────────────────────────────────────────────────────
// 1. SYSTEM SETTINGS
// ─────────────────────────────────────────────────────────────
const seedSystemSettings = async (client) => {
  step("Seeding system_settings …");

  await client.query(`
    INSERT INTO system_settings (
      id,
      platform_name,
      support_email,
      default_timezone,
      default_currency,
      session_timeout,
      maintenance_mode,
      registration_enabled,
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
      accent_color,
      navigation_menu
    ) VALUES (
      1,
      'Startup LaunchPad',
      'support@launchpad.com',
      'PST (Pacific Standard Time)',
      'USD',
      '1 hour',
      false,
      true,
      'smtp',
      '587',
      false,
      'Startup LaunchPad',
      'no-reply@launchpad.com',
      'Launchpad Support',
      'Launchpad News',
      'news@launchpad.com',
      true,
      '© 2025 Startup Launchpad. All rights reserved.',
      '#0F172A',
      '#1E293B',
      '#3B82F6',
      '[]'
    ) ON CONFLICT (id) DO NOTHING;
  `);

  log("system_settings default row seeded.");
};

// ─────────────────────────────────────────────────────────────
// 2. EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────
const seedEmailTemplates = async (client) => {
  step("Seeding email_templates …");

  const year = new Date().getFullYear();

  const styles = `
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
color: #333;
line-height: 1.6;
max-width: 600px;
margin: 0 auto;
border: 1px solid #e0e0e0;
border-radius: 8px;
overflow: hidden;
`.trim();

  const header = `
<div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
  <h2 style="margin: 0; color: #2c3e50;">{{platform_name}}</h2>
</div>`.trim();

  const footer = `
<div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0;">
  <p style="margin: 5px 0;">&copy; ${year} {{platform_name}}. All rights reserved.</p>
  <p style="margin: 5px 0;">
    <a href="#" style="color: #666; text-decoration: none;">Privacy Policy</a> |
    <a href="#" style="color: #666; text-decoration: none;">Terms of Service</a>
  </p>
</div>`.trim();

  const templates = [
    {
      name: "Welcome Email",
      type: "welcome",
      subject: "Welcome to {{platform_name}}!",
      description: "Sent to new users upon registration.",
      variables: JSON.stringify(["name", "platform_name", "link"]),
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
</div>`.trim(),
    },
    {
      name: "Password Reset",
      type: "password_reset",
      subject: "Reset your Password",
      description: "Sent when a user requests a password reset.",
      variables: JSON.stringify(["name", "otp", "platform_name"]),
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
</div>`.trim(),
    },
    {
      name: "Verify Account",
      type: "verify_email",
      subject: "Verify your Email Address",
      description: "Sent to verify user email address during registration.",
      variables: JSON.stringify(["name", "otp", "platform_name"]),
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
</div>`.trim(),
    },
  ];

  for (const tmpl of templates) {
    await client.query(
      `INSERT INTO email_templates (name, type, subject, body, description, variables)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (type) DO NOTHING;`,
      [
        tmpl.name,
        tmpl.type,
        tmpl.subject,
        tmpl.body,
        tmpl.description,
        tmpl.variables,
      ],
    );
    log(`email_template → "${tmpl.name}"`);
  }
};

// ─────────────────────────────────────────────────────────────
// 3. CMS SYSTEM PAGES
// ─────────────────────────────────────────────────────────────
const seedCmsPages = async (client) => {
  step("Seeding CMS system pages …");

  const systemPages = [
    { slug: "home", title: "Home Page" },
    { slug: "about", title: "About Us" },
    { slug: "contact", title: "Contact Us" },
  ];

  for (const page of systemPages) {
    await client.query(
      `INSERT INTO cms_pages (slug, title, is_system_page, status)
       VALUES ($1, $2, TRUE, 'draft')
       ON CONFLICT (slug) DO NOTHING;`,
      [page.slug, page.title],
    );
    log(`cms_page → "${page.slug}"`);
  }
};

// ─────────────────────────────────────────────────────────────
// 4. ROOT SUPER-ADMIN
// ─────────────────────────────────────────────────────────────
const seedRootAdmin = async (client) => {
  step("Seeding root super-admin …");

  const username = "root_admin";
  const password = "@Startup2026"; // Change this immediately after first login!

  const existing = await client.query(
    "SELECT id FROM admins WHERE username = $1",
    [username],
  );

  if (existing.rows.length > 0) {
    log(`Root admin already exists — skipped.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await client.query(
    `INSERT INTO admins (username, password_hash, role, status)
     VALUES ($1, $2, 'super_admin', 'active')`,
    [username, hashedPassword],
  );

  console.log(`  ✅  Root admin created.`);
  console.log(`  👤  Username : ${username}`);
  console.log(`  🔑  Password : ${password}`);
  console.log(`  ⚠️   Change the password immediately after first login!`);
};

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
const defaultDb = async () => {
  const client = await pool.connect();
  try {
    console.log("=".repeat(60));
    console.log("  Seeding default database records …");
    console.log("=".repeat(60));

    await client.query("BEGIN");

    await seedSystemSettings(client);
    await seedEmailTemplates(client);
    await seedCmsPages(client);
    await seedRootAdmin(client);

    await client.query("COMMIT");

    console.log("\n" + "=".repeat(60));
    console.log("  ✅  All default records seeded successfully!");
    console.log("=".repeat(60));

    process.exit(0);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌  Seeding failed — rolled back:", err);
    process.exit(1);
  } finally {
    client.release();
  }
};

defaultDb();
