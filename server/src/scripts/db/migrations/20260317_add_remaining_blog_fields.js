const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { pool } = require('../../../database');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('Finalizing migration: Adding missing blog fields (subtitle, author_bio)...');
        
        await client.query(`
            ALTER TABLE cms_pages 
            ADD COLUMN IF NOT EXISTS subtitle TEXT,
            ADD COLUMN IF NOT EXISTS author_bio TEXT;
        `);
        
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
    }
};

migrate();
