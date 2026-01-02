const path = require('path');
// Add server/node_modules to module search path
module.paths.push(path.join(__dirname, '../../server/node_modules'));

const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

const sendTestEmail = async () => {
    console.log('📧 Initializing Email Test...');

    // 1. Validate Env Vars
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing EMAIL_USER or EMAIL_PASS in .env file.');
        process.exit(1);
    }

    console.log(`📡 Connecting to SMTP Server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT, // 465
        secure: process.env.SMTP_SECURE === 'true', // true for 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 3. Define Email Content (Support Team Style)
    const recipient = 'raj2122002@gmail.com';
    const subject = 'Welcome to Startup Launchpad - Support Team';

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Startup Launchpad</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333333;">Hello Raj,</h2>
            <p style="color: #555555; line-height: 1.6;">
                This is a test message from the <strong>Startup Launchpad Support Team</strong>.
            </p>
            <p style="color: #555555; line-height: 1.6;">
                We are verifying that your email configuration is working correctly. If you are reading this, the SMTP connection is successful!
            </p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                <p style="margin: 0; color: #555555;"><strong>System Status:</strong> All systems operational.<br><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #555555; line-height: 1.6;">
                If you have any questions, feel free to reply to this email.
            </p>
            <p style="color: #555555; line-height: 1.6;">
                Best regards,<br>
                <strong>The Startup Launchpad Team</strong>
            </p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
            &copy; ${new Date().getFullYear()} Startup Launchpad. All rights reserved.
        </div>
    </div>
    `;

    // 4. Send Email
    try {
        console.log(`📨 Sending email to ${recipient}...`);
        const info = await transporter.sendMail({
            from: `"Startup Launchpad Support" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: subject,
            html: htmlContent,
        });

        console.log('✅ Email sent successfully!');
        console.log(`🆔 Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
};

sendTestEmail();
