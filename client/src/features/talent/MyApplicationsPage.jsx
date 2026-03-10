import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, MapPin, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { useMyApplications } from "../../hooks/useTalent";

export function MyApplicationsPage() {
  const { data, isLoading, isError } = useMyApplications();

  const applications = data?.applications || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            My Applications
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Track the status of your applications for opportunities.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/opportunities">
            <Button>Find More Opportunities</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-12">
          Failed to load applications.
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl">
          <Briefcase className="h-12 w-12 text-border-dark mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">
            No applications yet
          </h3>
          <p className="text-text-secondary dark:text-gray-400 mb-6">
            You haven't applied to any opportunities yet.
          </p>
          <Link to="/dashboard/opportunities">
            <Button>Browse Board</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="p-6 hover:shadow-md transition-all flex flex-col h-full bg-white dark:bg-surface-dark border-border-light dark:border-border-dark"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <Avatar
                    src={
                      app.organization_logo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(app.organization_name || "Org")}&background=random`
                    }
                    size="md"
                  />
                  <div>
                    <h3 className="font-bold text-text-primary dark:text-white line-clamp-1">
                      {app.opportunity_title}
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400">
                      {app.organization_name || "Organization"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 grow">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-tertiary">Type</span>
                  <Badge variant="neutral" className="capitalize">
                    {app.opportunity_type}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-tertiary">Applied On</span>
                  <span className="font-medium text-text-primary dark:text-white">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border-light dark:border-border-dark">
                  <span className="text-text-tertiary font-medium">
                    Application Status
                  </span>
                  <Badge
                    variant={
                      app.status === "Accepted"
                        ? "success"
                        : app.status === "Rejected"
                          ? "error"
                          : app.status === "Interviewing"
                            ? "warning"
                            : "primary"
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-tertiary text-xs">Job Status</span>
                  <span className="text-xs text-text-secondary">
                    {app.opportunity_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-auto">
                <Link
                  to={`/dashboard/opportunities/${app.opportunity_id}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    View Opportunity
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
