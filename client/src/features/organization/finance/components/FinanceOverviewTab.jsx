import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../../components/ui/Card";
import { apiClient } from "../../../../lib/axios";
import { toast } from "react-toastify";
import { cn } from "../../../../utils/cn";
import {
  Activity,
  TrendingDown,
  TrendingUp,
  IndianRupee,
  Target,
  AlertCircle,
  Clock,
  Layers,
  Search,
} from "lucide-react";

export function FinanceOverviewTab() {
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    orgExpenses: 0,
    projExpenses: 0,
    netCashflow: 0,
    healthScore: 0,
    projectMetrics: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/org/finances/metrics");
        if (isMounted) {
          if (res.data && res.data.metrics) {
            setMetrics(res.data.metrics);
          } else {
            console.error("Metrics data missing in response:", res.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        toast.error("Failed to load financial metrics");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 -mt-2">
      {/* ─── Top Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cashflow */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md group">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Net Cashflow
            </p>
            <h3
              className={cn(
                "text-3xl font-black tracking-tight",
                (metrics?.netCashflow || 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {formatCurrency(metrics?.netCashflow || 0)}
            </h3>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-full border flex items-center justify-center transition-colors shadow-xs",
              (metrics?.netCashflow || 0) >= 0
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 text-emerald-500"
                : "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50 text-rose-500",
            )}
          >
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md group">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Total Income
            </p>
            <h3 className="text-3xl font-black text-text-primary dark:text-white tracking-tight">
              {formatCurrency(metrics?.totalIncome || 0)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-500 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Burn */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md group">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Total Burn
            </p>
            <h3 className="text-3xl font-black text-text-primary dark:text-white tracking-tight">
              {formatCurrency(metrics?.totalExpenses || 0)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 flex items-center justify-center text-rose-500 shadow-xs">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* AI Health Score */}
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md group">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
              Health Score
            </p>
            <h3 className="text-3xl font-black text-text-primary dark:text-white tracking-tight">
              {metrics?.healthScore || 0}
              <span className="text-sm text-text-tertiary font-bold">/100</span>
            </h3>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-full border flex items-center justify-center transition-colors shadow-xs",
              (metrics?.healthScore || 0) >= 80
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 text-emerald-500"
                : (metrics?.healthScore || 0) >= 50
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50 text-amber-500"
                  : "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50 text-rose-500",
            )}
          >
            {(metrics?.healthScore || 0) >= 50 ? (
              <Target className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column (Distribution & Insights) ─── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-text-primary dark:text-white font-black uppercase tracking-tight text-sm px-1">
                <div className="w-5 h-5 rounded border-2 border-primary/20 flex items-center justify-center bg-primary/5 text-primary">
                  <Activity className="w-3 h-3" />
                </div>
                Expense Distribution
              </div>
            </div>

            <div className="space-y-10">
              {/* ─── Row 1: Consolidated P&L Comparison ─── */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-base font-black text-text-primary dark:text-gray-100">
                      Consolidated P&L
                    </p>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                      Organizational Income vs Total Burn
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Burn Ratio</p>
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-md",
                      metrics.totalExpenses > metrics.totalIncome ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {Math.round((metrics.totalExpenses / (metrics.totalIncome || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full flex h-12 rounded-2xl overflow-hidden shadow-xs ring-4 ring-gray-50 dark:ring-gray-900/30">
                    <div
                      className="bg-blue-500 transition-all hover:brightness-110 relative group"
                      style={{
                        width: `${(metrics.totalIncome / (metrics.totalIncome + metrics.totalExpenses || 1)) * 100}%`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity" />
                    </div>
                    <div
                      className="bg-rose-500 transition-all hover:brightness-110 relative group"
                      style={{
                        width: `${(metrics.totalExpenses / (metrics.totalIncome + metrics.totalExpenses || 1)) * 100}%`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 px-1">
                    <div className="flex items-center gap-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                            Total Income
                          </span>
                        </div>
                        <p className="text-lg font-black text-text-primary dark:text-white">
                          {formatCurrency(metrics.totalIncome)}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                            Total Expenses
                          </span>
                        </div>
                        <p className="text-lg font-black text-text-primary dark:text-white">
                          {formatCurrency(metrics.totalExpenses)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Net Surplus</span>
                      <p className={cn(
                        "text-lg font-black",
                        metrics.netCashflow >= 0 ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {formatCurrency(metrics.netCashflow)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Row 2: Project Financials Ledger ─── */}
              <div className="space-y-6 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-base font-black text-text-primary dark:text-gray-100">
                      Project Financials
                    </p>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                      Individual Project Budget Utilization
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative group/search">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within/search:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-xl text-[11px] font-bold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-48"
                      />
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                      {metrics.projectMetrics?.length || 0} Projects
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {(metrics.projectMetrics || [])
                    .filter((p) =>
                      p.title.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .length > 0 ? (
                    (metrics.projectMetrics || [])
                      .filter((p) =>
                        p.title.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((proj) => {
                        const utilization =
                          proj.allocated > 0
                            ? (proj.expended / proj.allocated) * 100
                            : proj.expended > 0
                              ? 100
                              : 0;
                        const isOverBudget =
                          proj.expended > proj.allocated && proj.allocated > 0;
                        const isAtRisk = utilization >= 80 && utilization <= 100;
                        const isHealthy = utilization < 80;

                      return (
                        <div
                          key={proj.id}
                          className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-gray-50/30 dark:bg-gray-800/20 group hover:border-primary/30 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark flex items-center justify-center text-primary shadow-xs">
                                <Layers className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors">
                                  {proj.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      isOverBudget
                                        ? "bg-rose-500 animate-pulse"
                                        : isAtRisk
                                          ? "bg-amber-500"
                                          : "bg-emerald-500",
                                    )}
                                  />
                                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                                    {isOverBudget
                                      ? "Over Budget"
                                      : isAtRisk
                                        ? "Near Limit"
                                        : "Under Budget"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-8">
                              <div className="text-right">
                                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-60">
                                  Allocated
                                </span>
                                <p className="font-black text-text-primary dark:text-white text-sm">
                                  {formatCurrency(proj.allocated)}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-60">
                                  Expended
                                </span>
                                <p className={cn(
                                  "font-black text-sm",
                                  isOverBudget ? "text-rose-500" : "text-text-primary dark:text-white"
                                )}>
                                  {formatCurrency(proj.expended)}
                                </p>
                              </div>
                              <div className="min-w-[60px] text-right">
                                <span className={cn(
                                  "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                                  isOverBudget
                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                    : utilization > 80
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                                )}>
                                  {utilization.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-700 ease-out",
                                isOverBudget
                                  ? "bg-rose-500"
                                  : utilization > 80
                                    ? "bg-amber-400"
                                    : "bg-emerald-500",
                              )}
                              style={{ width: `${Math.min(100, utilization)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center opacity-40 border-2 border-dashed border-border-light dark:border-border-dark rounded-3xl">
                      <Search className="w-12 h-12 mb-4 text-text-tertiary" />
                      <p className="text-xs font-black uppercase tracking-widest text-text-tertiary">
                        {searchTerm
                          ? `No results for "${searchTerm}"`
                          : "No active projects identified"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column (Runway & Structure) ─── */}
        <div className="space-y-6">
          {/* Runway Estimator Card */}
          <div className="bg-linear-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white rounded-3xl p-6 shadow-xl border-t border-white/10 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-32 h-32 rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black tracking-tight">
                    Runway Estimator
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Startup Survival Metrics
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-inner">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Estimated Runway
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-6xl font-black tracking-tighter text-white">
                    {(metrics?.totalExpenses || 0) > 0
                      ? Math.max(
                          0,
                          Math.round(
                            (metrics?.netCashflow || 0) / metrics.totalExpenses,
                          ),
                        )
                      : "∞"}
                  </span>
                  <span className="text-lg font-black text-primary uppercase">
                    Months
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                  Financial health tracks both projected liabilities and liquid
                  assets. Accuracy depends on precise project-level budget
                  logging.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Insights Section */}
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-text-primary dark:text-white uppercase tracking-tight text-sm mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Cash Composition
            </h3>

            <div className="space-y-5">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary dark:text-gray-200 truncate">
                      Liquid Revenue
                    </p>
                    <p className="text-[10px] font-bold text-text-tertiary">
                      Verified Settlements
                    </p>
                  </div>
                </div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(metrics?.totalIncome || 0)}
                </div>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary dark:text-gray-200 truncate">
                      Current Liabilities
                    </p>
                    <p className="text-[10px] font-bold text-text-tertiary">
                      Accounts Payable
                    </p>
                  </div>
                </div>
                <div className="text-xs font-black text-text-primary dark:text-white">
                  {formatCurrency(metrics?.totalExpenses || 0)}
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate("/org/finances/transactions")}
              className="w-full py-2.5 mt-8 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 rounded-xl text-[11px] font-black text-text-tertiary hover:text-primary transition-all border border-border-light dark:border-border-dark shadow-xs uppercase tracking-widest cursor-pointer"
            >
              Review Master Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
