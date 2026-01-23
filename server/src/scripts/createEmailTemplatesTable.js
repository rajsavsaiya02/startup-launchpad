const { pool } = require('../database');

const createEmailTemplatesTable = async () => {
    try {
        console.log('Creating email_templates table...');

        await pool.query('DROP TABLE IF EXISTS email_templates');

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

        console.log('Inserting default email templates...');
        
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
        name: 'Welcome Email',
        type: 'welcome',
        subject: 'Welcome to {{platform_name}}!',
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
        description: 'Sent to new users upon registration.',
        variables: JSON.stringify(['name', 'platform_name', 'link'])
    },
    {
        name: 'Password Reset',
        type: 'password_reset',
        subject: 'Reset your Password',
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
        description: 'Sent when a user requests a password reset.',
        variables: JSON.stringify(['name', 'otp', 'platform_name'])
    },
    {
        name: 'Verify Account',
        type: 'verify_email',
        subject: 'Verify your Email Address',
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
        description: 'Sent to verify user email address during registration.',
        variables: JSON.stringify(['name', 'otp', 'platform_name'])
    }
];

        for (const tmpl of templates) {
            await pool.query(
                `INSERT INTO email_templates (name, type, subject, body, description, variables) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [tmpl.name, tmpl.type, tmpl.subject, tmpl.body, tmpl.description, tmpl.variables]
            );
        }

        console.log('Email Templates table created and seeded successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Error creating email templates table:', err);
        process.exit(1);
    }
};

createEmailTemplatesTable();
