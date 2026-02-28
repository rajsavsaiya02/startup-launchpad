import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import {
  TrendingUp,
  Download,
  Layers,
  Tag,
  User,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  Paperclip,
  ArrowDownToLine,
  FileText,
  Link2,
  Eye,
} from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { OrgExpenseDrawer } from "./OrgExpenseDrawer";
import projectFinancialsService from "../../../../services/projectFinancialsService";
import userService from "../../../../services/userService";
import { toast } from "react-toastify";

export function OrgProjectFinancials({ projectId }) {
  const { user } = useAuth();
  const statusOptions = {
    Paid: "Paid",
    Partially: "Partial",
    Pending: "Pending",
    Refunded: "Refunded",
    Failed: "Failed",
    Recurring: "Recurring",
    Allocated: "Allocated",
    Cancelled: "Cancelled",
  };
  // Financial Summary State
  const [summary, setSummary] = useState({
    budget: 0,
    totalSpent: 0,
    remaining: 0,
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetValue, setEditBudgetValue] = useState("");

  // Expenses Table State
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availableCategories, setAvailableCategories] = useState([
    "Labor",
    "Software",
    "Marketing",
    "Infrastructure",
    "Legal",
    "Other",
  ]);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [drawerMode, setDrawerMode] = useState("add");

  // Loading States
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // Format currency in INR
  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const loadSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const data = await projectFinancialsService.getSummary(projectId);
      setSummary(data);
      setEditBudgetValue(data.budget.toString());
    } catch (error) {
      console.error("Failed to load financial summary", error);
      toast.error("Failed to load budget details");
    } finally {
      setLoadingSummary(false);
    }
  }, [projectId]);

  const loadExpenses = useCallback(async () => {
    try {
      setLoadingExpenses(true);
      const data = await projectFinancialsService.getExpenses(
        projectId,
        pagination.currentPage,
        pagination.limit,
        searchQuery,
        statusFilter,
        categoryFilter,
      );
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load expenses", error);
      toast.error("Failed to load expense records");
    } finally {
      setLoadingExpenses(false);
    }
  }, [
    projectId,
    pagination.currentPage,
    pagination.limit,
    searchQuery,
    statusFilter,
    categoryFilter,
  ]);

  useEffect(() => {
    loadSummary();

    // Fetch categories from user preferences
    const fetchCategories = async () => {
      try {
        const prefs = await userService.getPreferences();
        if (prefs.expense_categories && prefs.expense_categories.length > 0) {
          setAvailableCategories(prefs.expense_categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [loadSummary]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Delay search to avoid rapid API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadExpenses();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loadExpenses]);

  const handleUpdateBudget = async () => {
    try {
      const parsedBudget = parseFloat(editBudgetValue);
      if (isNaN(parsedBudget) || parsedBudget < 0) {
        toast.error("Please enter a valid budget amount");
        return;
      }
      await projectFinancialsService.updateBudget(projectId, parsedBudget);
      toast.success("Budget updated successfully");
      setIsEditingBudget(false);
      loadSummary(); // Reload to recalculate remaining
    } catch (error) {
      console.error("Failed to update budget", error);
      toast.error(error?.response?.data?.error || "Failed to update budget");
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info("Preparing export data...");
      const data = await projectFinancialsService.getExpenses(
        projectId,
        1,
        "all",
        "", // search
        "", // status
        "", // category
      );

      const records = data.expenses;
      if (!records || records.length === 0) {
        toast.warn("No records found to export");
        return;
      }

      // CSV Header
      const headers = [
        "Date",
        "Item",
        "Category",
        "Description",
        "Payee/Vendor",
        "Amount",
        "Status",
        "Payment Details",
      ];

      // Format Rows
      const rows = records.map((exp) => {
        let paymentStr = "";
        try {
          if (exp.payment_modes) {
            const modes =
              typeof exp.payment_modes === "string"
                ? JSON.parse(exp.payment_modes)
                : exp.payment_modes;
            paymentStr = modes.map((m) => `${m.mode}: ${m.amount}`).join("; ");
          }
        } catch (e) {
          console.error("Error parsing payment modes for export", e);
        }

        return [
          new Date(exp.expense_date).toLocaleDateString(),
          `"${(exp.description || "").replace(/"/g, '""')}"`,
          `"${(exp.category || "").replace(/"/g, '""')}"`,
          `"${(exp.brief || "").replace(/"/g, '""')}"`,
          `"${(exp.vendor_name || "").replace(/"/g, '""')}"`,
          exp.amount,
          exp.status,
          `"${paymentStr.replace(/"/g, '""')}"`,
        ];
      });

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Expenses_${projectId}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Records exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export records. Please try again.");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (
      window.confirm("Are you sure you want to delete this expense record?")
    ) {
      try {
        await projectFinancialsService.deleteExpense(projectId, expenseId);
        toast.success("Expense deleted successfully");
        loadSummary(); // It affects the total
        loadExpenses();
      } catch (error) {
        console.error("Failed to delete expense", error);
        toast.error("Failed to delete expense");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Partially":
        return "warning";
      case "Pending":
        return "warning";
      case "Refunded":
        return "success";
      case "Failed":
        return "error";
      case "Recurring":
        return "info";
      case "Allocated":
        return "neutral";
      case "Cancelled":
        return "neutral";
      default:
        return "default";
    }
  };

  // const getCategoryIcon = (category) => {
  //   switch (category) {
  //     case "Labor":
  //       return <User className="h-4 w-4 text-primary" />;
  //     case "Software":
  //       return <Layers className="h-4 w-4 text-purple-500" />;
  //     case "Marketing":
  //       return <TrendingUp className="h-4 w-4 text-orange-500" />;
  //     case "Infrastructure":
  //       return <AlertCircle className="h-4 w-4 text-blue-500" />;
  //     default:
  //       return <Tag className="h-4 w-4 text-gray-500" />;
  //   }
  // };

  const spentPercentage =
    summary.budget > 0
      ? ((summary.totalSpent / summary.budget) * 100).toFixed(1)
      : 0;
  const isOverBudget = summary.remaining < 0;

  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Target: Top Budget & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Budget Card */}
        <Card className="px-6 py-5 border-l-[3px] border-primary bg-white dark:bg-surface-dark shadow-xs relative group flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.15em]">
              Total Project Budget
            </p>
            {!isEditingBudget && (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div>
            {isEditingBudget ? (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    className="w-full pl-6 pr-2 py-1 text-lg font-bold bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary/20 outline-none h-8"
                    value={editBudgetValue}
                    onChange={(e) => setEditBudgetValue(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleUpdateBudget}
                  className="p-1.5 bg-success/10 text-success hover:bg-success/20 rounded-md transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingBudget(false);
                    setEditBudgetValue(summary.budget.toString());
                  }}
                  className="p-1.5 bg-error/10 text-error hover:bg-error/20 rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <h3 className="text-[28px] leading-none font-black text-text-primary dark:text-white tracking-tight">
                {loadingSummary ? "..." : formatINR(summary.budget)}
              </h3>
            )}
          </div>
        </Card>

        {/* Actual Spent Card */}
        <Card className="px-6 py-5 border-l-[3px] border-warning bg-white dark:bg-surface-dark shadow-xs flex flex-col justify-center">
          <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-2">
            Actual Spent
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-[28px] leading-none font-black text-text-primary dark:text-white tracking-tight">
              {loadingSummary ? "..." : formatINR(summary.totalSpent)}
            </h3>
            <span className="text-[11px] font-bold text-text-tertiary">
              ({spentPercentage}%)
            </span>
          </div>
        </Card>

        {/* Remaining Card */}
        <Card
          className={`px-6 py-5 border-l-[3px] shadow-xs flex flex-col justify-center ${isOverBudget ? "border-error bg-error/5" : "border-success bg-white dark:bg-surface-dark"}`}
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.15em]">
              Remaining Funds
            </p>
            {!isOverBudget && summary.budget > 0 && (
              <Badge
                variant="success"
                className="px-1.5 py-0.5 text-[9px] font-bold gap-1 uppercase tracking-wider backdrop-blur-sm bg-success/10 border-none inline-flex items-center"
              >
                <TrendingUp className="h-2.5 w-2.5" /> On Track
              </Badge>
            )}
            {isOverBudget && (
              <Badge
                variant="error"
                className="px-1.5 py-0.5 text-[9px] font-bold gap-1 uppercase tracking-wider backdrop-blur-sm bg-error/10 border-none inline-flex items-center"
              >
                <AlertCircle className="h-2.5 w-2.5" /> Over Budget
              </Badge>
            )}
          </div>
          <h3
            className={`text-[28px] leading-none font-black tracking-tight ${isOverBudget ? "text-error" : "text-text-primary dark:text-white"}`}
          >
            {loadingSummary ? "..." : formatINR(summary.remaining)}
          </h3>
        </Card>
      </div>

      {/* Target: Expenses Table Section */}
      <Card className="overflow-hidden bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark flex flex-col h-[600px]">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/20">
          <div>
            <h3 className="text-lg font-bold text-text-primary dark:text-white">
              Financial Expenses Registry
            </h3>
            <p className="text-sm text-text-secondary">
              Record and track operational costs linked to this project.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mb-1 scroll-smooth">
            {/* Search */}
            <div className="relative shrink-0 w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 text-xs font-bold text-text-primary dark:text-white bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:font-normal placeholder:text-text-tertiary uppercase tracking-wider shadow-sm hover:border-primary/30"
              />
            </div>

            {/* Category Filter */}
            <div className="relative shrink-0 min-w-[120px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPagination((p) => ({ ...p, currentPage: 1 }));
                }}
                className="w-full pl-9 pr-10 h-9 text-xs font-bold text-text-primary dark:text-white bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer shadow-sm hover:border-primary/30 transition-all uppercase tracking-wider"
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary rotate-90" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative shrink-0 min-w-[120px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((p) => ({ ...p, currentPage: 1 }));
                }}
                className="w-full pl-9 pr-10 h-9 text-xs font-bold text-text-primary dark:text-white bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer shadow-sm hover:border-primary/30 transition-all uppercase tracking-wider"
              >
                <option value="">All Statuses</option>
                {Object.entries(statusOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary rotate-90" />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0 border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full font-bold text-xs uppercase tracking-wider h-9 shadow-sm"
              onClick={handleExportCSV}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>

            <Button
              size="sm"
              className="gap-2 shrink-0 shadow-md shadow-primary/20 rounded-full font-bold text-xs uppercase tracking-wider h-9"
              onClick={() => {
                setSelectedExpense(null);
                setDrawerMode("add");
                setIsDrawerOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 stroke-[3px]" /> Record Expense
            </Button>
          </div>
        </div>

        {/* Table Body - Scrollable */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-surface-dark text-text-tertiary border-b border-border-light dark:border-border-dark sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">
                  Item
                </th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">
                  Category
                </th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">
                  Description
                </th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">
                  Payee / Vendor
                </th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">
                  Expense Date
                </th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right">
                  Amount
                </th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">
                  Status
                </th>
                <th
                  className="px-2 py-3 font-bold uppercase tracking-wider text-[10px] text-center w-10"
                  title="Attachments"
                >
                  <Paperclip className="h-3.5 w-3.5 mx-auto text-text-tertiary" />
                </th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-border-light/50 dark:divide-border-dark/50 transition-opacity duration-200 ${loadingExpenses ? "opacity-50 pointer-events-none" : ""}`}
            >
              {loadingExpenses && expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-text-tertiary"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p>Loading expenses...</p>
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-16 text-center text-text-tertiary"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                        <Layers className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm font-bold text-text-primary dark:text-gray-200">
                        No expense records found.
                      </p>
                      <p className="text-xs">
                        Click 'Record Expense' to log an operational cost.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group cursor-default"
                  >
                    <td className="px-4 py-3 align-top max-w-[150px]">
                      <p
                        className="font-bold text-[13px] text-text-primary dark:text-white truncate"
                        title={expense.description}
                      >
                        {expense.description || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <Badge
                        variant="neutral"
                        className="px-2.5 py-0.5 text-[10px] uppercase tracking-wide border-gray-200 dark:border-border-dark dark:bg-gray-800/50 dark:text-gray-300"
                      >
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top max-w-[200px]">
                      <p
                        className="text-[12px] leading-tight text-text-tertiary truncate"
                        title={expense.brief}
                      >
                        {expense.brief || "-"}
                      </p>
                    </td>
                    <td
                      className="px-4 py-3 align-top text-[13px] text-text-secondary font-medium truncate max-w-[150px]"
                      title={expense.vendor_name}
                    >
                      {expense.vendor_name || "-"}
                    </td>
                    <td className="px-4 py-3 align-top text-[12px] text-text-tertiary whitespace-nowrap">
                      {new Date(expense.expense_date).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right font-mono font-bold text-[13px] text-text-primary dark:text-white whitespace-nowrap">
                      {formatINR(expense.amount)}
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <Badge
                        variant={getStatusVariant(expense.status)}
                        className="px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm"
                      >
                        {statusOptions[expense.status] || expense.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 align-top text-center">
                      {expense.attachments && expense.attachments.length > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold ring-1 ring-primary/20">
                          {expense.attachments.length}
                        </span>
                      ) : (
                        <span className="text-[12px] text-text-tertiary">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setDrawerMode("view");
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="View Expense"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {expense.created_by_id === user?.id && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setDrawerMode("edit");
                                setIsDrawerOpen(true);
                              }}
                              className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="Edit Expense"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Pagination */}
        <div className="p-4 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-surface-dark mt-auto shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <select
                value={pagination.limit}
                onChange={(e) => {
                  setPagination((p) => ({
                    ...p,
                    limit: Number(e.target.value),
                    currentPage: 1,
                  }));
                }}
                className="py-1 pl-2 pr-6 text-xs bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer text-text-primary dark:text-white font-medium relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.25rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.25em 1.25em`,
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-text-tertiary font-medium">
                per page
              </span>
            </div>
            <p className="text-sm text-text-secondary font-medium hidden sm:block">
              Showing{" "}
              <span className="font-bold text-text-primary dark:text-white">
                {expenses.length > 0
                  ? (pagination.currentPage - 1) * pagination.limit + 1
                  : 0}
              </span>{" "}
              to{" "}
              <span className="font-bold text-text-primary dark:text-white">
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalElements,
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-text-primary dark:text-white">
                {pagination.totalElements}
              </span>{" "}
              entries
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1.5 rounded-md text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="px-3 py-1 text-sm font-bold text-text-primary dark:text-white bg-gray-100 dark:bg-gray-800 rounded-md min-w-[32px] text-center">
              {pagination.currentPage}
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-1.5 rounded-md text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Drawer */}
      <OrgExpenseDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        projectId={projectId}
        expense={selectedExpense}
        mode={drawerMode}
        onSuccess={() => {
          loadSummary();
          loadExpenses();
        }}
      />
    </div>
  );
}
