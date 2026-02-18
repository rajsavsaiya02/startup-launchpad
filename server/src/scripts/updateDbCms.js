const { pool } = require('../database');

const updateDbCms = async () => {
  try {
    console.log('Updating database with CMS tables...');

    // 1. Create CMS Pages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'home', 'about', 'services/marketing'
        title VARCHAR(255) NOT NULL,
        is_system_page BOOLEAN DEFAULT FALSE, -- If true, slug cannot be changed (e.g. home)
        
        -- Content Storage
        draft_content JSONB DEFAULT '{}', -- Flexible structure: { sections: [], ... }
        published_content JSONB DEFAULT '{}',
        
        -- SEO Metadata (Draft/Live split can be in JSONB, but top-level helpful for queries)
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT,
        og_image_url TEXT,
        
        -- Status & Auditing
        status VARCHAR(20) DEFAULT 'draft', -- draft, published
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_published_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('cms_pages table created or already exists.');

    // 2. Create CMS History Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
        content JSONB NOT NULL, -- Snapshot of published_content
        seo_metadata JSONB, -- Snapshot of SEO data
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        published_by INTEGER, -- User ID
        version_number INTEGER -- Calculated programmatically (MAX+1) per page
      );
    `);
    console.log('cms_history table created or already exists.');

    // 3. Seed System Pages (Home, About, Contact) if not exist
    const systemPages = [
      { slug: 'home', title: 'Home Page' },
      { slug: 'about', title: 'About Us' },
      { slug: 'contact', title: 'Contact Us' }
    ];

    for (const page of systemPages) {
      const check = await pool.query('SELECT id FROM cms_pages WHERE slug = $1', [page.slug]);
      if (check.rows.length === 0) {
        await pool.query(
          `INSERT INTO cms_pages (slug, title, is_system_page, status) VALUES ($1, $2, TRUE, 'draft')`,
          [page.slug, page.title]
        );
        console.log(`Seeded system page: ${page.slug}`);
      }
    }

    console.log('CMS Database update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating CMS database:', err);
    process.exit(1);
  }
};

updateDbCms();
