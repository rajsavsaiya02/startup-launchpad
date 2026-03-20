const { pool } = require('../database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const listPages = async (req, res) => {
  const { status, category, page_type } = req.query;
  try {
    let query = `
      SELECT id, slug, title, is_system_page, status, updated_at, last_published_at, category, author_name, author_image, read_time, excerpt, page_type
      FROM cms_pages
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }
    if (page_type) {
      conditions.push(`page_type = $${params.length + 1}`);
      params.push(page_type);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const getPublicIndex = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT title, slug, updated_at, last_published_at AS published_at, category, author_name, author_image, read_time, excerpt, og_image_url, tags, page_type
      FROM cms_pages 
      WHERE status = 'published' AND page_type = 'blog'
      ORDER BY last_published_at DESC NULLS LAST, created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createPage = async (req, res) => {
  const { title, slug, page_type } = req.body;
  
  if (!title || !slug) {
    return res.status(400).json({ message: 'Title and slug are required' });
  }

  // Basic slug validation
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-\/]/g, '-');
  const contentType = page_type === 'blog' ? 'blog' : 'page';

  try {
    const result = await pool.query(
      `INSERT INTO cms_pages (slug, title, is_system_page, status, page_type) 
       VALUES ($1, $2, FALSE, 'draft', $3) 
       RETURNING *`,
      [cleanSlug, title, contentType]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Page with this slug already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPagePublic = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `SELECT slug, title, published_content, seo_title, seo_description, seo_keywords, og_image_url, page_type 
       FROM cms_pages 
       WHERE slug = $1`, 
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPageAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cms_pages WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDraft = async (req, res) => {
  const { id } = req.params;
  const { 
    draft_content, title, subtitle, seo_title, seo_description, seo_keywords, og_image_url,
    category, tags, excerpt, author_name, author_image, read_time
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cms_pages 
       SET draft_content = COALESCE($1, draft_content),
           title = COALESCE($2, title),
           subtitle = COALESCE($3, subtitle),
           seo_title = COALESCE($4, seo_title),
           seo_description = COALESCE($5, seo_description),
           seo_keywords = COALESCE($6, seo_keywords),
           og_image_url = COALESCE($7, og_image_url),
           category = COALESCE($8, category),
           tags = COALESCE($9, tags),
           excerpt = COALESCE($10, excerpt),
           author_name = COALESCE($11, author_name),
           author_image = COALESCE($12, author_image),
           read_time = COALESCE($13, read_time),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        typeof draft_content === 'object' && draft_content !== null ? draft_content : JSON.stringify(draft_content || ''), 
        title, subtitle || null, seo_title || null, seo_description || null, seo_keywords || null, og_image_url || null,
        category || null, tags || [], excerpt || null, author_name || null, author_image || null, read_time || null, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const publishPage = async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get current page draft
    const pageRes = await client.query('SELECT * FROM cms_pages WHERE id = $1', [id]);
    if (pageRes.rows.length === 0) {
        throw new Error('Page not found');
    }
    const page = pageRes.rows[0];

    // 2. Calculate next version number
    // Get max version for this page
    const versionRes = await client.query('SELECT MAX(version_number) as max_ver FROM cms_history WHERE page_id = $1', [id]);
    const nextVersion = (versionRes.rows[0].max_ver || 0) + 1;

    // 3. Insert into history
    await client.query(
        `INSERT INTO cms_history 
         (page_id, content, seo_metadata, version_number, published_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
            id, 
            typeof page.draft_content === 'object' && page.draft_content !== null ? page.draft_content : JSON.stringify(page.draft_content || ''), 
            { 
                seo_title: page.seo_title || null, 
                seo_description: page.seo_description || null, 
                seo_keywords: page.seo_keywords || null, 
                og_image_url: page.og_image_url || null 
            },
            nextVersion,
            req.user?.id || null // Assuming auth middleware populates req.user
        ]
    );

    // 4. Update published_content in main table
    const updateRes = await client.query(
        `UPDATE cms_pages 
         SET published_content = draft_content,
             status = 'published',
             last_published_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    await client.query('COMMIT');
    res.json(updateRes.rows[0]);

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  } finally {
    if (client) client.release();
  }
};

const deletePage = async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent deleting system pages
        const check = await pool.query('SELECT is_system_page FROM cms_pages WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Page not found' });
        
        if (check.rows[0].is_system_page) {
            return res.status(403).json({ message: 'Cannot delete system pages' });
        }

        await pool.query('DELETE FROM cms_pages WHERE id = $1', [id]);
        res.json({ message: 'Page deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const generateSitemap = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT slug, updated_at FROM cms_pages WHERE status = 'published'`
        );

        const baseUrl = process.env.CLIENT_URL || 'https://startuplaunchpad.com';
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static routes
        const staticRoutes = ['', 'about', 'contact', 'pricing', 'features', 'blog'];
        staticRoutes.forEach(route => {
             xml += '  <url>\n';
             xml += `    <loc>${baseUrl}/${route}</loc>\n`;
             xml += `    <changefreq>weekly</changefreq>\n`;
             xml += '  </url>\n';
        });

        // Add dynamic CMS pages
        result.rows.forEach(page => {
            const slug = page.slug === 'home' ? '' : page.slug; // Handle home special case
            // Avoid duplicates if static routes overlay
            if (staticRoutes.includes(slug)) return;

            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/${slug}</loc>\n`;
            xml += `    <lastmod>${new Date(page.updated_at).toISOString()}</lastmod>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating sitemap');
    }
};

const generateRobots = (req, res) => {
    const baseUrl = process.env.CLIENT_URL || 'https://startuplaunchpad.com';
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /auth

Sitemap: ${baseUrl}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robots);
};

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const uploadDir = path.join(__dirname, '../../public/uploads/cms');
        
        // Ensure dir exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // Write buffer to disk
        fs.writeFileSync(filePath, req.file.buffer);

        // Return public URL
        const publicUrl = `/uploads/cms/${filename}`;
        res.json({ url: publicUrl });

    } catch (err) {
        console.error('Error uploading media:', err);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

module.exports = {
  listPages,
  getPublicIndex,
  createPage,
  getPagePublic,
  getPageAdmin,
  updateDraft,
  publishPage,
  deletePage,
  generateSitemap,
  generateRobots,
  uploadMedia
};
