import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Briefcase,
  MapPin,
  ExternalLink,
  Calendar,
  Check,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import {
  useOpportunity,
  useOpportunityApplications,
  useUpdateApplicationStatus,
} from "../../hooks/useTalent";
import { ApplicationCard } from "./components/ApplicationCard";
import { cn } from "../../utils/cn";

export function ApplicationReviewPage() {
  const { id } = useParams();
  const { data: oppData, isLoading: isOppLoading } = useOpportunity(id);
  const { data: appsData, isLoading: isAppsLoading } =
    useOpportunityApplications(id);
  const updateStatusMutation = useUpdateApplicationStatus();

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const opp = oppData?.opportunity;
  const applications = appsData?.applications || [];

  const handleUpdateStatus = (appId, newStatus) => {
    updateStatusMutation.mutate({ id: appId, statusData: { status: newStatus } });
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      app.applicant_name?.toLowerCase().includes(searchLower) ||
      app.applicant_title?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  if (isOppLoading || isAppsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="text-center text-red-500 py-12">
        Opportunity not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <Link
          to="/org/talent/postings"
          className="flex items-center gap-2 text-sm text-text-tertiary hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Manage Postings
        </Link>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-1">
              Applications for {opp.title}
            </h1>
            <p className="text-text-secondary dark:text-gray-400 text-sm">
              {applications.length} candidates applied
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to={`/org/gigs/${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="gap-2">
                <ExternalLink className="h-4 w-4" /> View Posting
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name or title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:text-white"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:text-white min-w-40"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applicants List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredApps.length === 0 ? (
            <Card className="p-8 text-center text-text-secondary bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark">
              No applications match your filters.
            </Card>
          ) : (
            filteredApps.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updateStatusMutation.isPending}
              />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <h3 className="font-black text-xs uppercase tracking-widest mb-6 px-1 text-text-tertiary">
                Pipeline Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-text-secondary font-medium">Total Candidates</span>
                  <Badge variant="neutral" className="font-black px-2.5">
                    {applications.length}
                  </Badge>
                </div>
                
                <div className="h-px bg-border-light/50 dark:bg-border-dark/50 my-2" />

                {[
                  { label: "Pending", status: "Pending", color: "text-text-tertiary", bg: "bg-gray-100" },
                  { label: "Under Review", status: "Under Review", color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Shortlisted", status: "Shortlisted", color: "text-indigo-500", bg: "bg-indigo-50" },
                  { label: "Interviewing", status: "Interviewing", color: "text-warning", bg: "bg-warning/10" },
                  { label: "Selected", status: "Accepted", color: "text-success", bg: "bg-success/10" },
                  { label: "Rejected", status: "Rejected", color: "text-error", bg: "bg-error/10" },
                ].map((item) => (
                  <div key={item.status} className="flex justify-between items-center px-1">
                    <span className="text-sm font-bold text-text-secondary">{item.label}</span>
                    <span className={cn(
                      "text-xs font-black min-w-6 h-6 flex items-center justify-center rounded-full",
                      item.bg,
                      item.color
                    )}>
                      {applications.filter((a) => a.status === item.status).length}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
