require('dotenv').config({ path: __dirname + '/../../../../.env' });
const { pool } = require('../../../database');

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Database Migration: Updating opportunity_applications status constraint ---');
    
    await client.query('BEGIN');

    // 1. Drop existing constraint
    console.log('Dropping existing status check constraint...');
    await client.query('ALTER TABLE opportunity_applications DROP CONSTRAINT IF EXISTS opportunity_applications_status_check');

    // 2. Add updated constraint
    console.log('Adding updated status check constraint (Pending, Under Review, Shortlisted, Interviewing, Accepted, Rejected)...');
    await client.query(`
      ALTER TABLE opportunity_applications ADD CONSTRAINT opportunity_applications_status_check 
      CHECK (status IN ('Pending', 'Under Review', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected'))
    `);

    await client.query('COMMIT');
    console.log('--- Migration Completed Successfully ---');

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigration();
