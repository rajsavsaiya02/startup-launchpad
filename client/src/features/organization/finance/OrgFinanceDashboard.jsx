import React from "react";
import {
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Wallet,
  LineChart,
  ListOrdered,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "../../../utils/cn";

// Sub-components (to be implemented)
import { FinanceOverviewTab } from "./components/FinanceOverviewTab";
import { FinanceTransactionsTab } from "./components/FinanceTransactionsTab";
import { FinanceSettingsTab } from "./components/FinanceSettingsTab";
import { FinanceResourcesTab } from "./components/FinanceResourcesTab";

const TABS = [
  { id: "overview", label: "Overview", path: "overview" },
  {
    id: "transactions",
    label: "Transactions",
    path: "transactions",
  },
  {
    id: "settings",
    label: "Compliance",
    path: "settings",
  },
  {
    id: "resources",
    label: "Resource",
    path: "resources",
  },
];

export function OrgFinanceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from URL, defaulting to 'overview'
  const currentPath = location.pathname.split("/").pop();
  const activeTabId =
    TABS.find((t) => t.path === currentPath)?.id || "overview";

  const handleTabChange = (tab) => {
    navigate(`/org/finances/${tab.path}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar">
      <Helmet>
        <title>Organization Finances | Startup LaunchPad</title>
      </Helmet>

      {/* ─── Finance Header ─── */}
      <div className="mx-6 mt-6 mb-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm z-10 shrink-0 overflow-hidden">
        <div className="p-6 border-b border-border-light/60 dark:border-border-dark/60 relative">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Wallet className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
                  Financial <span className="text-primary">Command</span> Center
                </h1>
              </div>
              <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Track burn rate, manage startup capital, and configure financial
                compliance rules from a single pane of glass.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Control Bar: Tabs ─── */}
        <div className="flex items-center justify-center py-3 bg-gray-50/30 dark:bg-gray-900/10">
          <nav className="flex items-center gap-1 bg-gray-100/80 dark:bg-surface-dark/80 p-1 rounded-xl border border-border-light/50 dark:border-border-dark/50 shadow-xs backdrop-blur-sm">
            {TABS.map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap outline-none",
                    isActive
                      ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-gray-200/50 dark:hover:bg-gray-800/50",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="w-full px-6 pb-6 mt-2">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<FinanceOverviewTab />} />
            <Route path="transactions" element={<FinanceTransactionsTab />} />
            <Route path="settings" element={<FinanceSettingsTab />} />
            <Route path="resources" element={<FinanceResourcesTab />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
