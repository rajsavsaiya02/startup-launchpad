import React from "react";
import {
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users, Search, ClipboardList, MessageSquare } from "lucide-react";
import { cn } from "../../../utils/cn";

// Sub-components
import { TalentPostingsTab } from "./components/TalentPostingsTab";
import { FindTalentTab } from "./components/FindTalentTab";
import { TalentApplicationsTab } from "./components/TalentApplicationsTab";
import { TalentMessagesTab } from "./components/TalentMessagesTab";

const TABS = [
  { id: "postings", label: "Postings", path: "postings", icon: ClipboardList },
  { id: "find", label: "Find Talent", path: "find", icon: Search },
  {
    id: "applications",
    label: "Applications",
    path: "applications",
    icon: Users,
  },
  { id: "messages", label: "Messages", path: "messages", icon: MessageSquare },
];

export function OrgTalentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from URL, handle deep links (e.g. /messages/123)
  const activeTabId =
    TABS.find((t) => location.pathname.includes(`/org/talent/${t.path}`))?.id ||
    "postings";

  const handleTabChange = (tab) => {
    navigate(`/org/talent/${tab.path}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar">
      <Helmet>
        <title>Talent Command Center | Startup LaunchPad</title>
      </Helmet>

      {/* ─── Talent Header ─── */}
      <div className="mx-6 mt-6 mb-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm z-10 shrink-0 overflow-hidden">
        <div className="p-6 border-b border-border-light/60 dark:border-border-dark/60 relative bg-linear-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-black text-text-primary dark:text-white tracking-tight leading-tight uppercase">
                  Talent <span className="text-primary">Command</span> Center
                </h1>
              </div>
              <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Manage postings, find top talent, and communicate with
                applicants from a single pane of glass.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Control Bar: Tabs ─── */}
        <div className="flex items-center justify-center py-3 bg-gray-50/30 dark:bg-gray-900/10">
          <nav className="flex items-center gap-1 bg-gray-100/80 dark:bg-surface-dark/80 p-1 rounded-xl border border-border-light/50 dark:border-border-dark/50 shadow-xs backdrop-blur-sm">
            {TABS.map((tab) => {
              const isActive = activeTabId === tab.id;
              const Icon = tab.icon;
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
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : "text-text-tertiary",
                    )}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="w-full px-6 pb-6 mt-2 flex-1 flex flex-col">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="postings" replace />} />
            <Route path="postings" element={<TalentPostingsTab />} />
            <Route path="find" element={<FindTalentTab />} />
            <Route path="applications" element={<TalentApplicationsTab />} />
            <Route
              path="messages/:candidateId"
              element={<TalentMessagesTab />}
            />
            <Route path="messages" element={<TalentMessagesTab />} />
            <Route path="*" element={<Navigate to="postings" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
