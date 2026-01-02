const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // If SMTP_SERVICE is set (e.g., 'gmail'), use it. Otherwise use Host/Port.
    ...(process.env.SMTP_SERVICE ? { service: process.env.SMTP_SERVICE } : {
        host: process.env.SMTP_HOST || 'smtp.gmail.com', // Default to gmail for backward compat
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    }),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendVerificationEmail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Verify your Startup LaunchPad Account',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Startup LaunchPad!</h2>
        <p>Please use the following OTP to verify your email address:</p>
        <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // In dev, we might want to throw or just log. For now, log the OTP for testing if verify fails.
        console.log(`[DEV FALLBACK] OTP for ${to}: ${otp}`);
    }
};

exports.sendPasswordResetEmail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Reset your Password',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Use the following code to reset your password:</p>
        <h1 style="color: #DC2626; letter-spacing: 5px;">${otp}</h1>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        console.log(`[DEV FALLBACK] OTP for ${to}: ${otp}`);
    }
};
