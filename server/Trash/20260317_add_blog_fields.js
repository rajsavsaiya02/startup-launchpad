const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { pool } = require('../../../database');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Adding blog fields to cms_pages...');
        
        await client.query(`
            ALTER TABLE cms_pages 
            ADD COLUMN IF NOT EXISTS category VARCHAR(100),
            ADD COLUMN IF NOT EXISTS tags TEXT[],
            ADD COLUMN IF NOT EXISTS excerpt TEXT,
            ADD COLUMN IF NOT EXISTS author_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS author_image TEXT,
            ADD COLUMN IF NOT EXISTS read_time VARCHAR(50);
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
