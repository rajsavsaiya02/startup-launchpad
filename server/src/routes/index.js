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
const organizationRoutes = require("./organizationRoutes");
const orgFinanceRoutes = require("./orgFinanceRoutes");

router.use("/users", userRoutes);
router.use("/org/finances", orgFinanceRoutes);
router.use("/org", organizationRoutes);
router.use("/auth", authRoutes);
router.use("/admin/audit", auditRoutes);
router.use("/admin/system", systemRoutes);
router.use("/admin", adminRoutes);
router.use("/configs", configRoutes);
router.use("/cms", cmsRoutes);
router.use("/", healthRoutes);

module.exports = router;
