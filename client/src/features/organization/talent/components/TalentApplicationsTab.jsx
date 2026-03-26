import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Calendar, ChevronRight, User } from "lucide-react";
import { useOrgApplications } from "../../../../hooks/useTalent";
import { Badge } from "../../../../components/ui/Badge";
import { Card } from "../../../../components/ui/Card";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";

export function TalentApplicationsTab() {
  const { data, isLoading, isError } = useOrgApplications();
  const applications = data?.applications || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-12 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm">
        Failed to load applications.
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl">
        <div className="p-4 bg-primary/10 rounded-full w-max mx-auto mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-black text-text-primary dark:text-white mb-2 uppercase tracking-tight">
          No Applications Yet
        </h3>
        <p className="text-sm text-text-secondary dark:text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
          As soon as freelancers apply to your postings, they will appear here
          for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {applications.map((app) => (
          <Card
            key={app.id}
            className="p-5 hover:shadow-md transition-all border-border-light dark:border-border-dark bg-white dark:bg-surface-dark group"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={app.applicant_avatar}
                  name={app.applicant_name}
                  className="h-12 w-12 border-2 border-primary/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-text-primary dark:text-white leading-none group-hover:text-primary transition-colors">
                      {app.applicant_name}
                    </h3>
                    <Badge
                      variant={
                        app.status === "Accepted"
                          ? "success"
                          : app.status === "Rejected"
                            ? "danger"
                            : "warning"
                      }
                      className="text-[10px] uppercase font-black tracking-tighter py-0"
                    >
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                    Applied for{" "}
                    <span className="font-bold text-text-primary dark:text-gray-200">
                      {app.opportunity_title}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-text-secondary border-l border-border-light dark:border-border-dark pl-6 md:flex">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-text-tertiary font-bold tracking-widest">
                    Rate
                  </span>
                  <span className="font-bold text-text-primary dark:text-white">
                    {app.proposed_rate
                      ? `₹${app.proposed_rate}`
                      : "Not Specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-text-tertiary font-bold tracking-widest">
                    Date
                  </span>
                  <span className="flex items-center gap-1 font-bold text-text-primary dark:text-white">
                    <Calendar className="h-3 w-3" />
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto md:ml-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border-light dark:border-border-dark">
                <Link
                  to={`/org/gigs/${app.opportunity_id}/applications`}
                  className="flex-1 md:flex-none"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2 text-xs font-bold uppercase py-4"
                  >
                    Review <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
                <Link
                  to={`/org/talent/messages/${app.freelancer_id}?appId=${app.id}`}
                  className="md:ml-0"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0 flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-colors"
                    title="Send direct message"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
