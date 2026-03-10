import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Briefcase,
  DollarSign,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { useOpportunities } from "../../hooks/useTalent";

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
            Find Opportunities
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Browse and apply for gigs, internships, and full-time jobs.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/talent">
            <Button variant="secondary">Find Talent</Button>
          </Link>
          <Link to="/dashboard/opportunities/manage">
            <Button>Post an Opportunity</Button>
          </Link>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {["all", "gig", "internship", "job"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-surface-dark text-text-primary dark:text-white shadow-sm"
                  : "text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white"
              }`}
            >
              {tab === "all" ? "All" : tab + "s"}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Opportunity Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-12">
          Failed to load opportunities.
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center text-text-secondary py-12">
          No opportunities found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <Card
              key={opp.id}
              className="p-6 hover:shadow-md transition-all flex flex-col h-full bg-white dark:bg-surface-dark border-border-light dark:border-border-dark"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <Avatar
                    src={
                      opp.organization_logo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(opp.organization_name || "Org")}&background=random`
                    }
                    size="md"
                  />
                  <div>
                    <h3 className="font-bold text-text-primary dark:text-white line-clamp-1">
                      {opp.title}
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400">
                      {opp.organization_name}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    opp.type === "job"
                      ? "success"
                      : opp.type === "internship"
                        ? "warning"
                        : "neutral"
                  }
                  className="shrink-0 capitalize"
                >
                  {opp.type}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 h-14 overflow-hidden">
                {opp.skills &&
                  opp.skills.slice(0, 3).map((s) => (
                    <Badge
                      key={s}
                      variant="neutral"
                      className="bg-gray-100 dark:bg-gray-800 border-transparent text-xs"
                    >
                      {s}
                    </Badge>
                  ))}
                {opp.skills?.length > 3 && (
                  <Badge
                    variant="neutral"
                    className="bg-gray-100 dark:bg-gray-800 border-transparent text-xs"
                  >
                    +{opp.skills.length - 3}
                  </Badge>
                )}
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between text-sm text-text-secondary dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {opp.compensation_type === "Unpaid"
                      ? "Unpaid"
                      : opp.budget_min
                        ? `$${opp.budget_min}${opp.budget_max ? ` - $${opp.budget_max}` : ""}`
                        : "Negotiable"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {opp.duration || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Link
                    to={`/dashboard/opportunities/${opp.id}`}
                    className="w-full"
                  >
                    <Button variant="primary" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
