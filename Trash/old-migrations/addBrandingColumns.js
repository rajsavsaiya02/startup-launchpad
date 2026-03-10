const { pool } = require('../../../database');

const addBrandingColumns = async () => {
  try {
    console.log('Checking for missing branding columns...');

    const columnsToAdd = [
      { name: 'logo_url', type: 'TEXT' },
      { name: 'favicon_url', type: 'TEXT' },
      { name: 'primary_color', type: 'VARCHAR(50)' },
      { name: 'secondary_color', type: 'VARCHAR(50)' },
      { name: 'accent_color', type: 'VARCHAR(50)' }
    ];

    for (const col of columnsToAdd) {
      try {
        await pool.query(`ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        console.log(`Added column: ${col.name}`);
      } catch (e) {
        console.log(`Column ${col.name} might already exist or error: ${e.message}`);
      }
    }

    console.log('Schema update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  }
};

addBrandingColumns();
