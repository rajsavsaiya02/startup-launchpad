const express = require("express");
const router = express.Router({ mergeParams: true }); // Need mergeParams to access :id from parent router if mounted that way, but passing :id directly works too.
const {
  getFinancialSummary,
  updateBudget,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/projectFinancialsController");
const { protect } = require("../middleware/authMiddleware");

// Base route: /api/projects/:id

// Financial Summary & Budget
router.get("/:id/financials", protect, getFinancialSummary);
router.put("/:id/budget", protect, updateBudget);

// Expenses
router.get("/:id/expenses", protect, getExpenses);
router.post("/:id/expenses", protect, createExpense);
router.put("/:id/expenses/:expenseId", protect, updateExpense);
router.delete("/:id/expenses/:expenseId", protect, deleteExpense);

module.exports = router;
