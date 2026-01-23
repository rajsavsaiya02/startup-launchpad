const { pool } = require('../database');

const createSystemSettingsTable = async () => {
  try {
    console.log('Re-creating system_settings table with enhanced schema...');

    // Drop first to ensure cleaner schema change for this iteration
    await pool.query('DROP TABLE IF EXISTS system_settings');

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

    // Check if default row exists, if not insert it
    const result = await pool.query('SELECT COUNT(*) FROM system_settings');
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      console.log('Inserting default system settings...');
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
        )
      `);
    }

    console.log('System settings table updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating system settings table:', err);
    process.exit(1);
  }
};

createSystemSettingsTable();
