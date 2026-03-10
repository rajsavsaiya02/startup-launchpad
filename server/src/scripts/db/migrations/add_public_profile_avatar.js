/**
 * ============================================================
 *  add_public_profile_avatar.js — Migration
 * ============================================================
 *  Adds `public_profile_avatar` column to the users table so
 *  My Profile and Public Profile can have independent images.
 *
 *  - When NULL (default), the public profile falls back to
 *    the shared `avatar` column (backward-compatible).
 *  - Safe to run multiple times (IF NOT EXISTS guard via
 *    column existence check).
 *
 *  Usage:
 *    node server/src/scripts/db/migrations/add_public_profile_avatar.js
 * ============================================================
 */

"use strict";

require("dotenv").config();
const { pool } = require("../../../database");

const run = async () => {
  const client = await pool.connect();
  try {
    console.log("=".repeat(60));
    console.log("  Migration: add public_profile_avatar column");
    console.log("=".repeat(60));

    // Check if column already exists
    const check = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'public_profile_avatar'
    `);

    if (check.rows.length > 0) {
      console.log(
        "  ⚠️  Column public_profile_avatar already exists. Skipping.",
      );
      return;
    }

    await client.query(`
      ALTER TABLE users
        ADD COLUMN public_profile_avatar VARCHAR(500) DEFAULT NULL;
    `);

    console.log("  ✅  Added public_profile_avatar column to users table.");
    console.log("=".repeat(60));
  } catch (err) {
    console.error("  ❌  Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();
