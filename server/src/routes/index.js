const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const configRoutes = require("./configRoutes");
const healthRoutes = require("./healthRoutes");

const auditRoutes = require("./auditRoutes");
const systemRoutes = require("./systemRoutes");
const cmsRoutes = require("./cmsRoutes");
const userRoutes = require("./userRoutes");

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/admin/audit", auditRoutes);
router.use("/admin/system", systemRoutes);
router.use("/admin", adminRoutes);
router.use("/configs", configRoutes);
router.use("/cms", cmsRoutes);
router.use("/", healthRoutes);

module.exports = router;
