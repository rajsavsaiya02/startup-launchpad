/**
 * ============================================================
 *  02_UserProfiles_100_Seed.js
 * ============================================================
 *  Seeds 100 fully-populated dummy user accounts from
 *  100_Dummy_User_Data.json.
 *
 *  What this script does:
 *    1. Downloads avatar images from thispersondoesnotexist.com
 *    2. Hashes passwords with bcrypt
 *    3. Upserts user rows with all profile fields
 *    4. FORCES isPublic: true for all profiles
 *
 *  Safety: Uses ON CONFLICT (email) DO UPDATE — fully idempotent.
 *
 *  Usage (from /server directory):
 *    node src/scripts/db/seeders/02_UserProfiles_100_Seed.js
 * ============================================================
 */

"use strict";

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const https = require("https");
const bcrypt = require("bcrypt");
const { pool } = require("../../../database");
const unifiedStorage = require("../../../services/UnifiedStorageService");

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────

const SEED_AVATAR_DIR = path.join(__dirname, "avatars");
const PUBLIC_AVATAR_DIR = unifiedStorage.resolveDirPath(
  "user",
  "public",
  null,
  "uploads",
);

const AVATAR_URL = "https://thispersondoesnotexist.com/";
const BCRYPT_ROUNDS = 10;
const DATA_FILE = path.join(__dirname, "100_Dummy_User_Data.json");

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const log = (msg) => console.log(`  ✅  ${msg}`);
const warn = (msg) => console.warn(`  ⚠️   ${msg}`);
const step = (msg) => console.log(`\n📦  ${msg}`);

[SEED_AVATAR_DIR, PUBLIC_AVATAR_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function seedUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌  Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const users = data.users;

  console.log("=".repeat(60));
  console.log(`  Seeding ${users.length} dummy users (FORCING PUBLIC) …`);
  console.log(`  📁  Static dir : ${PUBLIC_AVATAR_DIR}`);
  console.log("=".repeat(60));

  const processAvatar = async (u) => {
    const filename = u.avatar_filename;
    const seedPath = path.join(SEED_AVATAR_DIR, filename);
    const publicPath = path.join(PUBLIC_AVATAR_DIR, filename);
    const relativePath = `/user/public/uploads/${filename}`;
    const publicUrl = `/public-assets${relativePath}`;

    if (!fs.existsSync(seedPath)) {
      console.log(`    🔽  Downloading: ${filename} …`);
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(seedPath);
        https
          .get(AVATAR_URL, (res) => {
            if (res.statusCode !== 200) {
              file.close();
              fs.unlinkSync(seedPath);
              return reject(new Error(`HTTP ${res.statusCode}`));
            }
            res.pipe(file);
            file.on("finish", () => file.close(resolve));
          })
          .on("error", (err) => {
            file.close();
            fs.unlinkSync(seedPath);
            reject(err);
          });
      });
    }

    if (!fs.existsSync(publicPath)) {
      fs.copyFileSync(seedPath, publicPath);
      console.log(`    📋  Staged: ${filename}`);
    }

    const stats = fs.statSync(publicPath);
    return {
      originalName: filename,
      storedName: filename,
      size: stats.size,
      mimeType: "image/jpeg",
      path: relativePath,
      publicUrl: publicUrl,
    };
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      step(`[${i + 1}/${users.length}] ${u.name} (${u.role})`);

      let avatarMeta = null;
      try {
        avatarMeta = await processAvatar(u);
        // Throttle downloads slightly
        if (i < users.length - 1) await sleep(500);
      } catch (err) {
        warn(`Avatar failed for ${u.email}: ${err.message}`);
      }

      const passwordHash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);

      // FORCE PUBLIC
      const publicProfile = { 
        ...u.public_profile,
        isPublic: "true" // Match backend query expectations (string "true" from JSONB ->> operator)
      };

      const result = await client.query(
        `INSERT INTO users (
          username, email, name, first_name, last_name,
          password_hash, role, is_verified, provider,
          avatar,
          bio, location, office_location, phone_number,
          job_title, department, employee_id,
          social_linkedin, social_github, social_website,
          skills, preferences, public_profile
        ) VALUES (
          $1,  $2,  $3,  $4,  $5,
          $6,  $7,  $8,  $9,
          $10,
          $11, $12, $13, $14,
          $15, $16, $17,
          $18, $19, $20,
          $21, $22, $23
        )
        ON CONFLICT (email) DO UPDATE SET
          username         = EXCLUDED.username,
          name             = EXCLUDED.name,
          first_name       = EXCLUDED.first_name,
          last_name        = EXCLUDED.last_name,
          password_hash    = EXCLUDED.password_hash,
          role             = EXCLUDED.role,
          is_verified      = EXCLUDED.is_verified,
          provider         = EXCLUDED.provider,
          avatar           = EXCLUDED.avatar,
          bio              = EXCLUDED.bio,
          location         = EXCLUDED.location,
          office_location  = EXCLUDED.office_location,
          phone_number     = EXCLUDED.phone_number,
          job_title        = EXCLUDED.job_title,
          department       = EXCLUDED.department,
          employee_id      = EXCLUDED.employee_id,
          social_linkedin  = EXCLUDED.social_linkedin,
          social_github    = EXCLUDED.social_github,
          social_website   = EXCLUDED.social_website,
          skills           = EXCLUDED.skills,
          preferences      = EXCLUDED.preferences,
          public_profile   = EXCLUDED.public_profile
        RETURNING id`,
        [
          u.username || `user_${i}`,
          u.email,
          u.name,
          u.first_name,
          u.last_name,
          passwordHash,
          u.role,
          u.is_verified,
          u.provider,
          avatarMeta ? avatarMeta.publicUrl : null,
          u.bio,
          u.location,
          u.office_location,
          u.phone_number,
          u.job_title,
          u.department,
          u.employee_id || null,
          u.social_linkedin,
          u.social_github,
          u.social_website || null,
          u.skills,
          JSON.stringify(u.preferences),
          JSON.stringify(publicProfile),
        ],
      );

      const userId = result.rows[0].id;

      if (avatarMeta) {
        await client.query(
          `INSERT INTO files 
          (uploader_id, uploader_type, original_name, stored_name, mime_type, size, path, visibility)
          VALUES ($1, 'user', $2, $3, $4, $5, $6, 'public')
          ON CONFLICT (stored_name) DO UPDATE SET
            uploader_id = EXCLUDED.uploader_id,
            path = EXCLUDED.path`,
          [
            userId,
            avatarMeta.originalName,
            avatarMeta.storedName,
            avatarMeta.mimeType,
            avatarMeta.size,
            avatarMeta.path,
          ],
        );

        const finalPublicProfile = {
          ...publicProfile,
          avatar_url: avatarMeta.publicUrl,
        };
        await client.query(
          "UPDATE users SET public_profile = $1 WHERE id = $2",
          [JSON.stringify(finalPublicProfile), userId],
        );
      }

      log(`${u.role.padEnd(11)} → ${u.name} (id=${userId}) | PUBLIC`);
    }

    await client.query("COMMIT");
    console.log(`\n✅  All ${users.length} users seeded successfully!`);
    process.exit(0);
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("\n❌  Seeding failed:", err);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

seedUsers();
