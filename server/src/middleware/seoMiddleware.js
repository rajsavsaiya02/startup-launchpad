const fs = require("fs");
const path = require("path");
const { pool } = require("../database");

// Simple In-Memory Cache (LRU-like behavior could be added, but manual for now)
const htmlCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache for fresh content

const META_placeholder = '<meta name="seo-injection-point" content="true" />';

const getPageMetadata = async (slug) => {
  try {
    // Check for explicit page
    const result = await pool.query(
      `SELECT title, seo_title, seo_description, seo_keywords, og_image_url 
       FROM cms_pages 
       WHERE slug = $1 AND status = 'published'`,
      [slug],
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching SEO metadata:", err);
    return null;
  }
};

const seoMiddleware = async (req, res, next) => {
  // 1. skip for API routes, static assets, etc.
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    return next();
  }

  // 2. Skip App Routes (Client-side routing should handle these)
  // We must serve the index.html without SEO injection to avoid DB/timeout issues
  const appRoutes = [
    "/dashboard",
    "/admin",
    "/auth",
    "/login",
    "/signup",
    "/settings",
    "/profile",
  ];
  if (appRoutes.some((route) => req.path.startsWith(route))) {
    const indexPath = path.resolve(
      __dirname,
      "../../../client/dist/index.html",
    );
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return next();
  }

  const slug = req.path === "/" ? "home" : req.path.substring(1); // remove leading slash

  // 2. Check Cache
  const cached = htmlCache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.send(cached.html);
  }

  // 3. Read Template
  // Locate the client build index.html
  // Assuming server run from /server/ directory or similar
  const indexPath = path.resolve(__dirname, "../../../client/dist/index.html");

  if (!fs.existsSync(indexPath)) {
    // If no build, fallback to standard behavior (likely dev or API mode)
    // or just return 404/next if not handling frontend
    return next();
  }

  let template = fs.readFileSync(indexPath, "utf8");

  // 4. Fetch DB Metadata
  const metadata = await getPageMetadata(slug);

  if (metadata) {
    const title = metadata.seo_title || metadata.title || "Startup LaunchPad";
    const description =
      metadata.seo_description || "Build and scale your startup.";
    const keywords = metadata.seo_keywords || "startup, launchpad, tools";
    const image = metadata.og_image_url || "/og-default.png";

    // 5. Inject Tags
    // Replace <title>
    template = template.replace(
      /<title>.*<\/title>/,
      `<title>${title}</title>`,
    );

    // Inject Metas (Prepend to head or replace placeholder)
    const metaTags = `
      <meta name="description" content="${description}">
      <meta name="keywords" content="${keywords}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${image}">
      <meta name="twitter:card" content="summary_large_image">
    `;

    // Insert before </head>
    template = template.replace("</head>", `${metaTags}\n</head>`);

    // Save to cache
    htmlCache.set(slug, { html: template, timestamp: Date.now() });
    return res.send(template);
  }

  // If page not found in CMS, serve generic template (React handles 404)
  // Or handle specific dynamic 404 status
  // For now, serve generic but maybe clear cache?
  htmlCache.set(slug, { html: template, timestamp: Date.now() });
  res.send(template);
};

module.exports = seoMiddleware;
