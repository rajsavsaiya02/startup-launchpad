const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const logger = require("./utils/logger");

const app = express();
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded from other origins if needed, or by client
  }),
);
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use(passport.initialize());

// Static Files
app.use(express.static(path.join(__dirname, "../public")));

// Maintenance Mode Middleware
const maintenanceMiddleware = require("./middleware/maintenanceMiddleware");
app.use(maintenanceMiddleware);

const seoMiddleware = require("./middleware/seoMiddleware");
const cmsController = require("./controllers/cmsController");

// Global SEO Routes (Robots & Sitemap)
app.get("/robots.txt", cmsController.generateRobots);
app.get("/sitemap.xml", cmsController.generateSitemap);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/file-assets", require("./routes/fileAssetRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/projects", require("./routes/projectActivityRoutes")); // Must be before projectRoutes to catch /:projectId/activities
app.use("/api/projects", require("./routes/projectFinancialsRoutes")); // Mount financials routes
app.use("/api/projects", require("./routes/projectTaskRoutes")); // Mount task routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api", routes);

// Serve React Static Files (JS/CSS/Images) - Avoid index.html to allow SEO Injection
app.use(
  express.static(path.join(__dirname, "../../client/dist"), { index: false }),
);

// SEO Middleware for Frontend Routes (SSR-like behavior)
app.use("*", seoMiddleware);

// 404 Handler (Falls through here if API route matches nothing or SEO middleware skips)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("Unhandled Error", err);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
