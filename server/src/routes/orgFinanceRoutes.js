const express = require("express");
const router = express.Router();
const orgFinanceController = require("../controllers/orgFinanceController");
const { protect } = require("../middleware/authMiddleware");
const { requireOrgMember, requireOrgRole } = require("../middleware/orgAuthMiddleware");

// All finance routes require standard authentication, org membership, and FOUNDER/ADMIN role
router.use(protect, requireOrgMember, requireOrgRole(['FOUNDER', 'CO-FOUNDER', 'ADMIN']));

// Overview Metrics
router.get("/metrics", orgFinanceController.getOverviewMetrics);

// Ledger Transactions
router.get("/transactions", orgFinanceController.getTransactions);
router.post("/transactions", orgFinanceController.addTransaction);
router.put("/transactions/:id", orgFinanceController.updateTransaction);
router.delete("/transactions/:id", orgFinanceController.deleteTransaction);

// CSV Export
router.get("/export", orgFinanceController.exportFinancialData);

// Financial Settings & Configuration
router.get("/config", orgFinanceController.getConfig);
router.put("/config", orgFinanceController.updateConfig);

// Chart of Accounts (COA) Categories
router.post("/categories", orgFinanceController.addCategory);
router.delete("/categories/:id", orgFinanceController.deleteCategory);

// Chart of Accounts (COA) Classifications
router.post("/classifications", orgFinanceController.addClassification);
router.delete("/classifications/:id", orgFinanceController.deleteClassification);

module.exports = router;
