import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useOpportunities } from "../../hooks/useTalent";
import { OpportunityCard } from "./components/OpportunityCard";

export function OpportunitiesBoardPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useOpportunities({
    type: activeTab === "all" ? undefined : activeTab,
    search: searchTerm || undefined,
  });

  const opportunities = data?.opportunities || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Opportunities
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1 font-medium">
            Browse and apply for gigs, internships, and full-time jobs.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/talent">
            <Button variant="secondary" className="font-bold">Find Talent</Button>
          </Link>
          <Link to="/org/talent/postings">
            <Button className="font-bold">Post an Opportunity</Button>
          </Link>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex bg-gray-100/80 dark:bg-gray-800/50 p-1 rounded-xl backdrop-blur-sm border border-border-light dark:border-border-dark/50">
          {["all", "gig", "internship", "job"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white dark:bg-surface-dark text-primary shadow-md shadow-primary/5"
                  : "text-text-tertiary hover:text-text-secondary dark:hover:text-gray-200"
              }`}
            >
              {tab === "all" ? "All" : tab + "s"}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full lg:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border-light bg-white dark:bg-surface-dark/50 dark:border-border-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Opportunity Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
          <p className="text-sm font-bold text-text-tertiary animate-pulse">Loading opportunities...</p>
        </div>
      ) : isError ? (
        <div className="text-center text-error py-24 bg-error/5 rounded-2xl border border-error/10">
          <p className="font-bold">Failed to load opportunities.</p>
          <p className="text-sm opacity-70 mt-1">Please try refreshing the page.</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center text-text-tertiary py-24 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-border-light dark:border-border-dark">
          <p className="text-lg font-bold">No opportunities found.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}
    </div>
  );
}
