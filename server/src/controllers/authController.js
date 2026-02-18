const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { pool } = require("../database");
const emailService = require("../services/emailService");
const { createSession } = require("../services/sessionService");
const { parseUserAgent } = require("../utils/deviceDetector");
const { getLocationFromIp } = require("../utils/geoLocator");
const { getSystemSettings } = require("../services/systemSettingsService");
const logger = require("../utils/logger");

// Helper to generate token with sessionId
const generateToken = (user, sessionId, expiresIn = "1d") => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: sessionId,
    },
    process.env.JWT_SECRET,
    { expiresIn },
  );
};

// Helper to set cookie
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    // Secure must be true in production (HTTPS), false in dev (HTTP)
    // If you run dev on HTTPS (rare), set this manually or use NODE_ENV
    secure: isProduction,
    // Lax is good for spa on same-site (localhost ports are same-site)
    // None is needed if cross-site (different domains) AND Secure is true
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  console.log("Setting Auth Cookie:", {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    env: process.env.NODE_ENV,
  });

  res.cookie("token", token, cookieOptions);
};

exports.register = async (req, res) => {
  try {
    const settings = await getSystemSettings();
    if (settings.registration_enabled === false) {
      return res.status(403).json({
        message:
          "New registrations are currently disabled by the administrator.",
      });
    }

    let { firstName, lastName, email, password, role } = req.body;

    // Construct full name for legacy support or display
    const name = `${firstName} ${lastName}`.trim();

    // Default role logic
    if (!role) role = "normal_user";
    const validRoles = ["founder", "freelancer", "student", "normal_user"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selection" });
    }

    // check user
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique username: user_ + random hex
    let username = `user_${crypto.randomBytes(4).toString("hex")}`;

    // Ensure uniqueness (simple retry mechanism)
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const check = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username],
      );
      if (check.rows.length === 0) {
        isUnique = true;
      } else {
        username = `user_${crypto.randomBytes(4).toString("hex")}`;
        attempts++;
      }
    }

    // Create user (unverified by default)
    const newUser = await pool.query(
      "INSERT INTO users (first_name, last_name, name, email, password_hash, is_verified, provider, role, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        firstName,
        lastName,
        name,
        email,
        hashedPassword,
        false,
        "local",
        role,
        username,
      ],
    );
    const user = newUser.rows[0];

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await pool.query(
      "INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otp, "verification", expiresAt],
    );

    // Send Email
    await emailService.sendVerificationEmail(email, otp);

    res.json({
      message: "Registration successful. Please check your email for OTP.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await pool.query(
      "SELECT * FROM otps WHERE email = $1 AND otp = $2 AND type = $3 AND expires_at > NOW()",
      [email, otp, "verification"],
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Verify User
    await pool.query("UPDATE users SET is_verified = TRUE WHERE email = $1", [
      email,
    ]);

    // Delete used OTP
    await pool.query("DELETE FROM otps WHERE id = $1", [otpRecord.rows[0].id]);

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0) {
      // Security: Don't reveal if user exists or not, but for UX on resend we might want to be strict or just generic
      // For now, let's just return success to avoid enumeration, or error if client relies on it?
      // Actually, for resend flow, usually we want to ensure it works for legitimate users.
      // If user doesn't exist, we can't send OTP.
      return res.status(400).json({ message: "Email not found" });
    }

    const user = userResult.rows[0];
    if (user.is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Rate Limit Check (Optional but good) - Check last OTP sent time?
    // For now, simple implementation: DELETE old OTPs, CREATE new one.
    // Ideally update existing or delete.
    await pool.query(
      "DELETE FROM otps WHERE email = $1 AND type = 'verification'",
      [email],
    );

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await pool.query(
      "INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otp, "verification", expiresAt],
    );

    await emailService.sendVerificationEmail(email, otp);

    res.json({ message: "New verification code sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = userResult.rows[0];

    if (!user.password_hash) {
      return res
        .status(400)
        .json({ message: "Please login with your social account" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await pool.query(
        "INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)",
        [email, otp, "verification", expiresAt],
      );
      await emailService.sendVerificationEmail(email, otp);
      return res.status(403).json({
        message: "Email not verified. A new verification code has been sent.",
        requireVerification: true,
        email: user.email,
      });
    }

    // Create Session
    const sessionId = await createSession(user.id, false, req);

    // Get Settings for Timeout
    const settings = await getSystemSettings();
    let timeout = settings.session_timeout || "1d";

    // Fix for legacy numeric values stored in DB (e.g. "8" from "8 hours" or "30" from "30 minutes")
    // If purely numeric, JWT treats as milliseconds/seconds which is too short.
    if (String(timeout).match(/^\d+$/)) {
      const val = parseInt(timeout, 10);
      if (val === 30)
        timeout = "30m"; // specific fix for "30 minutes"
      else timeout = `${val}h`; // default others to hours (1->1h, 8->8h)
      logger.warn(
        `[FIX] Converted numeric session timeout '${settings.session_timeout}' to '${timeout}'`,
      );
    }

    logger.info(
      `[DEBUG] Login: Using session timeout: ${timeout} (type: ${typeof timeout})`,
    );

    // Generate Token
    const token = generateToken(user, sessionId, timeout);
    setAuthCookie(res, token);

    res.clearCookie("admin_token");
    res.json({ user, message: "Logged in successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.googleCallback = async (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }

  try {
    const settings = await getSystemSettings();
    const timeout = settings.session_timeout || "1d";

    const sessionId = await createSession(req.user.id, false, req);
    const token = generateToken(req.user, sessionId, timeout);
    setAuthCookie(res, token);

    // Update Session Login Method in background if needed, but 'local' default is okay for now or
    // we can refactor `createSession` to accept method. For now, it's fine.

    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  } catch (err) {
    console.error("Google Callback Error", err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

exports.githubCallback = exports.googleCallback;

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.json({
        message: "If that email exists, we sent a reset code.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otp, "reset", expiresAt],
    );

    await emailService.sendPasswordResetEmail(email, otp);
    res.json({ message: "Password reset code sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await pool.query(
      "SELECT * FROM otps WHERE email = $1 AND otp = $2 AND type = $3 AND expires_at > NOW()",
      [email, otp, "reset"],
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
    await pool.query("DELETE FROM otps WHERE id = $1", [otpRecord.rows[0].id]);

    res.json({ message: "Password reset successful. Please login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Deactivate Session
    const token = req.cookies.token || req.cookies.admin_token;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.sessionId) {
        await pool.query(
          "UPDATE sessions SET is_active = FALSE, revoked_at = NOW() WHERE id = $1",
          [decoded.sessionId],
        );
      }
    }
  } catch (ignore) {
    // Ignore logout errors
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("admin_token", cookieOptions);

  res.json({ message: "Logged out successfully" });
};

exports.checkSession = async (req, res) => {
  try {
    logger.info("[DEBUG] checkSession called");
    logger.info(
      `[DEBUG] Cookies received: ${req.cookies ? Object.keys(req.cookies) : "none"}`,
    );

    // 1. Check User Token
    const token = req.cookies.token;
    if (token) {
      logger.info("[DEBUG] User token found");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info(
          `[DEBUG] Token decoded: ${JSON.stringify({
            id: decoded.id,
            role: decoded.role,
            sessionId: decoded.sessionId,
          })}`,
        );

        // Verify Session Validity in DB
        if (decoded.sessionId) {
          const sessionCheck = await pool.query(
            "SELECT is_active FROM sessions WHERE id = $1 AND is_active = TRUE",
            [decoded.sessionId],
          );
          if (sessionCheck.rows.length === 0) {
            logger.warn(
              `[DEBUG] Session not found or inactive in DB: ${decoded.sessionId}`,
            );
            throw new Error("Session revoked");
          }
          // Update Last Active (Throttled?) - Can do here or middleware.
          // For now, let's just create a quick async update without awaiting
          pool
            .query("UPDATE sessions SET last_active = NOW() WHERE id = $1", [
              decoded.sessionId,
            ])
            .catch(() => {});
        }

        const userResult = await pool.query(
          "SELECT * FROM users WHERE id = $1",
          [decoded.id],
        );
        if (userResult.rows.length > 0) {
          logger.info("[DEBUG] User found, returning authenticated: true");
          return res.json({ user: userResult.rows[0], isAuthenticated: true });
        } else {
          logger.warn(
            `[DEBUG] User ID from token not found in DB: ${decoded.id}`,
          );
        }
      } catch (err) {
        logger.error(`[DEBUG] Token verification failed: ${err.message}`);
        // Token invalid
        res.clearCookie("token");
      }
    } else {
      logger.info("[DEBUG] No 'token' cookie found.");
    }

    // 2. Check Admin Token
    const adminToken = req.cookies.admin_token;
    if (adminToken) {
      logger.info("[DEBUG] Admin token found");
      try {
        const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
        if (["admin", "super_admin"].includes(decodedAdmin.role)) {
          // Verify Session
          if (decodedAdmin.sessionId) {
            const sessionCheck = await pool.query(
              "SELECT is_active FROM sessions WHERE id = $1 AND is_active = TRUE",
              [decodedAdmin.sessionId],
            );
            if (sessionCheck.rows.length === 0) {
              logger.warn(
                `[DEBUG] Admin Session revoked: ${decodedAdmin.sessionId}`,
              );
              throw new Error("Session revoked");
            }
            pool
              .query("UPDATE sessions SET last_active = NOW() WHERE id = $1", [
                decodedAdmin.sessionId,
              ])
              .catch(() => {});
          }

          const adminResult = await pool.query(
            "SELECT id, username, role, created_at, last_login FROM admins WHERE id = $1",
            [decodedAdmin.id],
          );
          if (adminResult.rows.length > 0) {
            const adminUser = adminResult.rows[0];
            logger.info("[DEBUG] Admin found, returning authenticated: true");
            return res.json({ user: adminUser, isAuthenticated: true });
          }
        }
      } catch (err) {
        logger.error(`[DEBUG] Admin token verification failed: ${err.message}`);
        res.clearCookie("admin_token");
      }
    }

    // 3. Neither
    logger.info(
      "[DEBUG] No valid session found. Returning authenticated: false",
    );
    res.json({ isAuthenticated: false });
  } catch (err) {
    logger.error("[DEBUG] checkSession Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestDeviceVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    let userEmail = email;
    if (!userEmail) {
      const table = req.user.role === "admin" ? "admins" : "users";
      const u = await pool.query(`SELECT email FROM ${table} WHERE id = $1`, [
        userId,
      ]);
      if (u.rows.length > 0) userEmail = u.rows[0].email;
    }

    if (!userEmail) {
      return res.status(400).json({ message: "No email found for this user" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await pool.query(
      "INSERT INTO otps (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)",
      [userEmail, otp, "device_verification", expiresAt],
    );

    await emailService.sendVerificationEmail(userEmail, otp);

    res.json({ message: "Verification code sent", email: userEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.confirmDeviceVerification = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Need email again to verify OTP
    let userEmail = req.user.email;
    if (!userEmail) {
      const table = isAdmin ? "admins" : "users";
      const u = await pool.query(`SELECT email FROM ${table} WHERE id = $1`, [
        userId,
      ]);
      if (u.rows.length > 0) userEmail = u.rows[0].email;
    }

    const otpRecord = await pool.query(
      "SELECT * FROM otps WHERE email = $1 AND otp = $2 AND type = $3 AND expires_at > NOW()",
      [userEmail, otp, "device_verification"],
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Get Current Device Info to Hash
    const userAgentRaw = req.headers["user-agent"];
    const { parseUserAgent } = require("../utils/deviceDetector");
    const { generateDeviceHash } = require("../services/sessionService");

    const device = parseUserAgent(userAgentRaw);
    const deviceHash = generateDeviceHash(device);
    const deviceName = `${device.os} ${device.browser} ${device.device_type}`;

    // Add to Trusted Devices
    // Check if exists first to avoid duplicate error unique constraint
    const check = await pool.query(
      `SELECT id FROM trusted_devices WHERE ${isAdmin ? "admin_id" : "user_id"} = $1 AND device_hash = $2`,
      [userId, deviceHash],
    );

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 Days

    if (check.rows.length > 0) {
      // Update
      await pool.query(
        `UPDATE trusted_devices SET expires_at = $1, last_used_at = NOW() WHERE id = $2`,
        [expiresAt, check.rows[0].id],
      );
    } else {
      // Insert
      await pool.query(
        `INSERT INTO trusted_devices (
                    user_id, admin_id, device_hash, device_name, expires_at
                ) VALUES ($1, $2, $3, $4, $5)`,
        [
          isAdmin ? null : userId,
          isAdmin ? userId : null,
          deviceHash,
          deviceName,
          expiresAt,
        ],
      );
    }

    // Delete OTP
    await pool.query("DELETE FROM otps WHERE id = $1", [otpRecord.rows[0].id]);

    // Update current session to be 90 days
    if (req.user.sessionId) {
      await pool.query(
        `UPDATE sessions SET expires_at = NOW() + INTERVAL '90 days' WHERE id = $1`,
        [req.user.sessionId],
      );
    }

    res.json({ message: "Device verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
