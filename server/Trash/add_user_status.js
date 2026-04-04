require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../.env') });
const { pool } = require('../../../database');

async function main() {
  console.log('Adding status column to users table...');
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended'));
    `);
    console.log('Successfully added status column to users table.');
  } catch (error) {
    console.error('Error adding status column:', error);
  } finally {
    await pool.end();
  }
}

main();
