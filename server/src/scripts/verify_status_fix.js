require('dotenv').config({ path: __dirname + '/../../.env' });
const { pool } = require('../database');

async function verifyStatusFix() {
  console.log('--- Starting Applicant Status Update Verification ---');
  
  try {
    // 1. Identify an application
    const appRes = await pool.query('SELECT id, status FROM opportunity_applications LIMIT 1');
    if (appRes.rows.length === 0) {
      console.log('No applications found to test.');
      return;
    }
    const app = appRes.rows[0];
    console.log(`Testing with Application ID: ${app.id}, Current Status: ${app.status}`);

    // 2. Try updating to 'Under Review'
    console.log("Attempting update to 'Under Review'...");
    try {
      await pool.query('UPDATE opportunity_applications SET status = $1 WHERE id = $2', ['Under Review', app.id]);
      console.log("Successfully updated to 'Under Review'");
    } catch (e) {
      console.log("FAILED to update to 'Under Review':", e.message);
    }

    // 3. Try updating to 'Interviewing'
    console.log("Attempting update to 'Interviewing'...");
    try {
      await pool.query('UPDATE opportunity_applications SET status = $1 WHERE id = $2', ['Interviewing', app.id]);
      console.log("Successfully updated to 'Interviewing'");
    } catch (e) {
      console.log("FAILED to update to 'Interviewing':", e.message);
    }

    // 4. Restore original status (or keep as is for testing)
    console.log(`Restoring original status: ${app.status}`);
    await pool.query('UPDATE opportunity_applications SET status = $1 WHERE id = $2', [app.status, app.id]);

    console.log('\n--- Verification Script Completed Successfully ---');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await pool.end();
  }
}

verifyStatusFix();
