const express = require("express");
const router = express.Router();
const orgFinanceController = require("../controllers/orgFinanceController");
const { protect } = require("../middleware/authMiddleware");
const { requireOrgMember } = require("../middleware/orgAuthMiddleware");

// All finance routes require standard authentication and org membership
router.use(protect, requireOrgMember);

// Overview Metrics
router.get("/metrics", orgFinanceController.getOverviewMetrics);

// Ledger Transactions
router.get("/transactions", orgFinanceController.getTransactions);
router.post("/transactions", orgFinanceController.addTransaction);

// CSV Export
router.get("/export", orgFinanceController.exportFinancialData);

// Financial Settings & Configuration
router.get("/config", orgFinanceController.getConfig);
router.put("/config", orgFinanceController.updateConfig);

// Chart of Accounts (COA) Categories
router.post("/categories", orgFinanceController.addCategory);

module.exports = router;
