import React, { useState, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { TeamPage } from "../../team/TeamPage";
import { OrgTeamManagementPage } from "../team/OrgTeamManagementPage";
import { OrgTeamMapBoard } from "./OrgTeamMapBoard";
import { Map, FileText, Loader2 } from "lucide-react";
import { apiClient } from "../../../lib/axios";

export function OrgManagementPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await apiClient.get("/org");
        setOrgData(response.data.organization);
      } catch (error) {
        console.error("Failed to fetch org data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar">
      {/* ─── Management Header ─── */}
      <div className="mx-6 mt-6 mb-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm z-10 overflow-hidden shrink-0">
        <div className="flex items-start justify-between gap-4 px-8 pt-5 pb-4 border-b border-border-light/60 dark:border-border-dark/60">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-text-primary dark:text-white tracking-tight leading-tight flex items-center gap-3">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                orgData?.name || "Organization Management"
              )}
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
              {orgData?.brief_description ||
                "Manage your organization structure, team members, resources, and operational health from a single place."}
            </p>
          </div>
        </div>

        {/* ─── Control Bar: Tabs ─── */}
        <div className="flex items-center justify-center px-8 py-2.5 bg-gray-50/60 dark:bg-gray-800/20">
          <nav className="flex items-center gap-2 bg-white dark:bg-surface-dark p-1 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            {["Overview", "Team Map", "Members", "Resource"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="w-full px-6 pb-6">
        {activeTab === "Overview" && <TeamPage hideHeader />}
        {activeTab === "Members" && <OrgTeamManagementPage hideHeader />}

        {activeTab === "Team Map" && (
          <div className="pt-2">
            <OrgTeamMapBoard />
          </div>
        )}

        {activeTab === "Resource" && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-surface-dark/40 rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark">
            <FileText className="h-12 w-12 mb-4 text-text-tertiary opacity-50" />
            <p className="text-lg font-bold text-text-primary dark:text-white">
              Resources
            </p>
            <p className="text-sm text-text-tertiary mt-2">
              Team handbooks and shared resources will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
