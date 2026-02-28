import React, { useState, useEffect } from "react";
import {
  Download,
  Search,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { apiClient } from "../../../../lib/axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { cn } from "../../../../utils/cn";

export function FinanceTransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const rowsPerPage = 10;

  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(
        `/org/finances/transactions?page=${currentPage}&limit=${rowsPerPage}&type=${typeFilter}`,
      );
      if (res.data && res.data.transactions) {
        setTransactions(res.data.transactions);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalElements(res.data.pagination?.totalElements || 0);
      } else {
        console.error("Transactions data missing in response:", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await apiClient.get("/org/finances/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "startup_financial_export.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Export downloaded successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export financial data");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function for currency formatting
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ─── Filter & Action Bar ─── */}
      <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search ledger..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark text-xs font-semibold text-text-primary bg-gray-50 focus:bg-white dark:bg-gray-800/50 outline-none w-full sm:w-64 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark text-xs font-bold text-text-secondary bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expense Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark hover:border-primary/50 text-text-primary dark:text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-sm disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-primary" />
            )}
            Export CSV
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            New Transaction
          </button>
        </div>
      </div>

      {/* ─── Transactions Table ─── */}
      <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-black text-text-tertiary uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/20">
              <tr>
                <th className="px-5 py-4">Transaction Date</th>
                <th className="px-5 py-4">Entity / Vendor</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4 text-right">Amount</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    <p className="text-xs font-bold text-text-tertiary mt-4 uppercase tracking-widest">
                      Syncing ledger...
                    </p>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "w-1.5 h-6 rounded-full shrink-0",
                            tx.transaction_type === "INCOME"
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
                          )}
                        />
                        <span className="font-bold text-text-primary dark:text-gray-200">
                          {format(new Date(tx.expense_date), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-text-primary dark:text-white truncate max-w-[180px]">
                          {tx.vendor_name || "Internal Transfer"}
                        </span>
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
                          {tx.transaction_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-300 text-[10px] font-black uppercase tracking-tight">
                        {tx.category_name || "General"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-text-tertiary truncate max-w-[200px]">
                      {tx.description}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-4 text-right font-black text-sm",
                        tx.transaction_type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-text-primary dark:text-white",
                      )}
                    >
                      {tx.transaction_type === "EXPENSE" ? "-" : "+"}₹
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-20 text-center text-text-tertiary"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 opacity-20" />
                      </div>
                      <p className="text-sm font-bold">No transactions found</p>
                      <p className="text-xs mt-1">
                        Try adjusting your filters or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        <div className="p-4 border-t border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/10">
          <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
            Showing {transactions.length} of {totalElements} Transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-7 h-7 rounded-lg text-[10px] font-black transition-all",
                    currentPage === i + 1
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
