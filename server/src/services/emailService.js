const nodemailer = require("nodemailer");
const systemSettingsService = require("./systemSettingsService");

// Helper to create transporter based on current settings
const getTransporter = async () => {
  const settings = await systemSettingsService.getSystemSettings();

  // Default config if not fully set up
  const configPort =
    parseInt(settings.smtp_port) || process.env.SMTP_PORT || 465;

  // Fix: Port 587 is usually STARTTLS (secure: false), Port 465 is SSL (secure: true)
  // We respect the DB setting "smtp_secure" if it's explicitly true/false, BUT
  // we override it for standard ports where the protocol is strict to avoid "wrong version number".
  let isSecure =
    settings.smtp_secure === true || String(settings.smtp_secure) === "true";

  if (configPort === 587) {
    isSecure = false;
    // console.log("[DEBUG] Enforcing secure: false for Port 587 (STARTTLS)");
  } else if (configPort === 465) {
    isSecure = true;
    // console.log("[DEBUG] Enforcing secure: true for Port 465 (SSL)");
  }

  // Log AFTER variables are ready
  console.log(
    `[DEBUG] Email Service Config: Host=${settings.smtp_host} Port=${configPort} Secure=${isSecure}`,
  );

  let transportConfig = {
    host:
      settings.smtp_host || process.env.SMTP_HOST || "mail.cyberinfospace.com",
    port: configPort,
    secure: isSecure,
    auth: {
      user: settings.smtp_user || process.env.EMAIL_USER,
      pass: settings.smtp_password || process.env.EMAIL_PASS,
    },
    debug: true,
    logger: true,
  };

  // Future: Handle other providers (SendGrid, SES) here based on settings.email_provider

  const transporter = nodemailer.createTransport(transportConfig);
  return { transporter, settings };
};

const sendVerificationEmail = async (to, otp) => {
  try {
    const { transporter, settings } = await getTransporter();

    const fromName = settings.system_email_name || "Startup LaunchPad";
    let fromEmail = settings.system_email_address || "no-reply@launchpad.com";

    // Deliverability Fix: Use authenticated user if system email is default/missing
    if (
      (!fromEmail || fromEmail.includes("no-reply@launchpad.com")) &&
      settings.smtp_user
    ) {
      fromEmail = settings.smtp_user;
    }

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: "Verify your Startup LaunchPad Account",
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to ${settings.platform_name || "Startup LaunchPad"}!</h2>
                <p>Please use the following OTP to verify your email address:</p>
                <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">${settings.email_footer_text || ""}</p>
            </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to} from ${fromEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
    console.log(`[DEV FALLBACK] OTP for ${to}: ${otp}`);
  }
};

const sendPasswordResetEmail = async (to, otp) => {
  try {
    const { transporter, settings } = await getTransporter();

    const fromName = settings.system_email_name || "Startup LaunchPad";
    let fromEmail = settings.system_email_address || "no-reply@launchpad.com";

    // Deliverability Fix: Use authenticated user if system email is default/missing
    if (
      (!fromEmail || fromEmail.includes("no-reply@launchpad.com")) &&
      settings.smtp_user
    ) {
      fromEmail = settings.smtp_user;
    }

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: "Reset your Password",
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Use the following code to reset your password:</p>
                <h1 style="color: #DC2626; letter-spacing: 5px;">${otp}</h1>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">${settings.email_footer_text || ""}</p>
            </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${to} from ${fromEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
    console.log(`[DEV FALLBACK] OTP for ${to}: ${otp}`);
  }
};

const sendNewDeviceAlert = async (to, deviceDetails) => {
  try {
    const { transporter, settings } = await getTransporter();

    const fromName = settings.system_email_name || "Startup LaunchPad";
    let fromEmail = settings.system_email_address || "no-reply@launchpad.com";

    // Deliverability Fix: Use authenticated user if system email is default/missing
    if (
      (!fromEmail || fromEmail.includes("no-reply@launchpad.com")) &&
      settings.smtp_user
    ) {
      fromEmail = settings.smtp_user;
    }

    const { deviceType, browser, os, location, time } = deviceDetails;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: "Security Alert: New Device Login",
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #DC2626;">New Login Detected</h2>
                <p>We detected a login to your account from a new device.</p>
                
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p><strong>Device:</strong> ${deviceType} (${os} - ${browser})</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Time:</strong> ${time}</p>
                </div>

                <p>If this was you, you can ignore this email. If not, please <strong>reset your password immediately</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">${settings.email_footer_text || ""}</p>
            </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`New device alert sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/**
 * Generic send email function
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { transporter, settings } = await getTransporter();

    // Deliverability Check: If using SMTP, ensure FROM matches auth user
    // Otherwise, some servers reject it.
    let fromAddress = settings.system_email_address;

    // If system address is default "no-reply" but we have a real smtp_user, use smtp_user
    if (
      (!fromAddress || fromAddress.includes("no-reply@launchpad.com")) &&
      settings.smtp_user
    ) {
      fromAddress = settings.smtp_user;
    }

    const mailOptions = {
      from: `"${settings.system_email_name}" <${fromAddress}>`,
      to,
      subject,
      html,
      text,
    };

    console.log(`[DEBUG] Sending email FROM: ${mailOptions.from} TO: ${to}`);

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewDeviceAlert,
  sendEmail,
};
