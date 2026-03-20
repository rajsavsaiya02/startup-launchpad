const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { pool } = require('../../../database');

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Adding page_type column to cms_pages...');

        // Add page_type column to differentiate blog posts from regular pages
        await client.query(`
            ALTER TABLE cms_pages 
            ADD COLUMN IF NOT EXISTS page_type VARCHAR(20) DEFAULT 'page'
              CHECK (page_type IN ('page', 'blog'));
        `);

        // All existing non-system pages that have author_name or category set are likely blog posts
        // Set them as 'blog', everything else stays as 'page'
        await client.query(`
            UPDATE cms_pages
            SET page_type = 'blog'
            WHERE is_system_page = FALSE
              AND (author_name IS NOT NULL OR category IS NOT NULL OR read_time IS NOT NULL);
        `);

        // Make sure system pages are 'page' type
        await client.query(`
            UPDATE cms_pages
            SET page_type = 'page'
            WHERE is_system_page = TRUE;
        `);

        console.log('Migration successful! page_type column added to cms_pages.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
    }
};

migrate();
