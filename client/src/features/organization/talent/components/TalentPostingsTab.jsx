import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { useOpportunities } from "../../../../hooks/useTalent";
import { useAuth } from "../../../../context/AuthContext";
import { OpportunityCard } from "../../../talent/components/OpportunityCard";
import { CreateOpportunityDrawer } from "../../../talent/components/CreateOpportunityDrawer";
import { apiClient } from "../../../../lib/axios";

export function TalentPostingsTab() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await apiClient.get("/org");
        if (res.data?.organization?.organization_id) {
          setOrganizationId(res.data.organization.organization_id);
        }
      } catch (err) {
        console.error("Failed to fetch organization data:", err);
      }
    }
    fetchOrg();
  }, []);

  const { data, isLoading, isError, refetch } = useOpportunities({
    owner_id: user?.id,
    status:
      activeFilter === "all"
        ? undefined
        : activeFilter === "open"
          ? "Open"
          : "Closed",
  });

  const opportunities = data?.opportunities || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-max shadow-inner">
          {["all", "open", "closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all duration-200 ${
                activeFilter === tab
                  ? "bg-white dark:bg-surface-dark text-primary shadow-sm scale-[1.02]"
                  : "text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button
          className="gap-2 shadow-sm"
          onClick={() => setIsCreateDrawerOpen(true)}
        >
          <Plus className="h-4 w-4" /> Post New Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-12 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm">
          Failed to load your postings.
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm bg-linear-to-b from-white to-gray-50/50 dark:from-surface-dark dark:to-gray-900/10">
          <div className="p-4 bg-primary/10 rounded-full w-max mx-auto mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-black text-text-primary dark:text-white mb-2 uppercase tracking-tight">
            Elevate Your Startup
          </h3>
          <p className="text-sm text-text-secondary dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            You haven't posted any open roles or gigs yet. Find the perfect
            talent to scale your operations today.
          </p>
          <Button
            className="gap-2 px-8 py-6 text-base font-bold shadow-lg shadow-primary/20"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            <Plus className="h-5 w-5" /> Create Your First Posting
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}

      <CreateOpportunityDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          refetch();
        }}
        organizationId={organizationId}
      />
    </div>
  );
}
