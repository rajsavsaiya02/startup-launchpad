import React, { useState, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { OrgOverviewTab } from "./OrgOverviewTab";
import { OrgTeamManagementPage } from "../team/OrgTeamManagementPage";
import { OrgTeamMapBoard } from "./OrgTeamMapBoard";
import { OrgResourcesTab } from "../team/OrgResourcesTab";
import { Map, FileText, Loader2, Edit2, Check, X } from "lucide-react";
import { apiClient } from "../../../lib/axios";
import { toast } from "react-toastify";

export function OrgManagementPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await apiClient.get("/org");
        setOrgData(response.data.organization);
        setEditName(response.data.organization.name || "");
        setEditDescription(response.data.organization.brief_description || "");
      } catch (error) {
        console.error("Failed to fetch org data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleSaveHeader = async () => {
    try {
      setIsSaving(true);
      // Update Name
      if (editName !== orgData.name) {
        await apiClient.put("/org", { name: editName });
      }
      // Update Description
      if (editDescription !== orgData.brief_description) {
        await apiClient.put("/org/profile", {
          brief_description: editDescription,
        });
      }

      setOrgData({
        ...orgData,
        name: editName,
        brief_description: editDescription,
      });
      setIsEditingHeader(false);
      toast.success("Organization details updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setEditName(orgData?.name || "");
    setEditDescription(orgData?.brief_description || "");
    setIsEditingHeader(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar">
      {/* ─── Management Header ─── */}
      <div className="mx-6 mt-6 mb-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm z-10 shrink-0">
        <div className="p-6 border-b border-border-light/60 dark:border-border-dark/60 relative">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-full max-w-3xl">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-text-tertiary mx-auto" />
              ) : isEditingHeader ? (
                <div className="space-y-3 flex flex-col items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full max-w-md px-3 py-1.5 text-xl font-black text-text-primary text-center dark:text-white bg-gray-50 dark:bg-gray-800 border border-primary/50 focus:border-primary rounded-lg outline-none"
                    placeholder="Organization Name"
                    autoFocus
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full max-w-2xl px-3 py-2 text-sm text-text-secondary text-center dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-primary/30 focus:border-primary/60 rounded-lg outline-none resize-none"
                    placeholder="Add a brief description about your organization..."
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
                    {orgData?.name || "Organization Management"}
                  </h1>
                  <p className="mt-2 text-sm text-text-secondary dark:text-gray-400 leading-relaxed mx-auto">
                    {orgData?.brief_description ||
                      "Manage your organization structure, team members, resources, and operational health from a single place."}
                  </p>
                </>
              )}
            </div>

            {/* Actions (Absolute Positioning for top-right) */}
            {!loading && (
              <div className="absolute top-6 right-6 flex items-center gap-2">
                {isEditingHeader ? (
                  <>
                    <button
                      onClick={handleSaveHeader}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleDiscard}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" /> Discard
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingHeader(true)}
                    className="p-2 text-text-tertiary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Edit Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Control Bar: Tabs ─── */}
        <div className="flex items-center justify-center py-3 bg-gray-50/30 dark:bg-gray-900/10">
          <nav className="flex items-center gap-1 bg-gray-100/80 dark:bg-surface-dark/80 p-1 rounded-xl border border-border-light/50 dark:border-border-dark/50 shadow-xs backdrop-blur-sm">
            {["Overview", "Team Map", "Members", "Resource"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-gray-200/50 dark:hover:bg-gray-800/50",
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
        {activeTab === "Overview" && <OrgOverviewTab />}
        {activeTab === "Members" && <OrgTeamManagementPage hideHeader />}

        {activeTab === "Team Map" && (
          <div className="pt-2">
            <OrgTeamMapBoard />
          </div>
        )}

        {activeTab === "Resource" && (
          <div className="pt-2">
            <OrgResourcesTab />
          </div>
        )}
      </div>
    </div>
  );
}
