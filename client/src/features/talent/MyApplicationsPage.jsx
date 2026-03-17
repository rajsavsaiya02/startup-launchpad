import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, MapPin, Search, Calendar, DollarSign, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { useMyApplications } from "../../hooks/useTalent";
import { formatDistanceToNow, format } from "date-fns";

export function MyApplicationsPage() {
  const { data, isLoading, isError } = useMyApplications();

  const applications = data?.applications || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return <Badge variant="neutral" className="bg-green-500/10 text-green-600 border-green-200">Accepted</Badge>;
      case 'Rejected':
        return <Badge variant="neutral" className="bg-red-500/10 text-red-600 border-red-200">Rejected</Badge>;
      case 'Interviewing':
        return <Badge variant="neutral" className="bg-purple-500/10 text-purple-600 border-purple-200">Interviewing</Badge>;
      case 'Shortlisted':
        return <Badge variant="neutral" className="bg-blue-500/10 text-blue-600 border-blue-200">Shortlisted</Badge>;
      case 'Pending':
      case 'New':
      default:
        return <Badge variant="neutral" className="bg-amber-500/10 text-amber-600 border-amber-200">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border-light dark:border-border-dark pb-8">
        <div className="max-w-2xl">
          <Badge variant="neutral" className="mb-3 bg-primary/10 text-primary border-transparent">
            Freelancer Hub
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-text-primary dark:text-white mb-2 leading-tight">
            My Applications
          </h1>
          <p className="text-text-secondary dark:text-gray-400 text-base leading-relaxed">
            Track your sent proposals, monitor status updates from organizations, and communicate with potential clients all in one place.
          </p>
        </div>
        <div className="flex shrink-0">
          <Link to="/dashboard/gigs">
            <Button className="shadow-lg shadow-primary/20 py-5 px-6 font-bold">
              Find More Gigs <Search className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 h-64 animate-pulse bg-surface-light dark:bg-surface-dark/50" />
           ))}
        </div>
      ) : isError ? (
        <div className="text-center bg-red-50 dark:bg-red-500/10 text-red-600 py-16 rounded-2xl border border-red-100 dark:border-red-500/20">
          <h3 className="text-xl font-bold mb-2">Error Loading Applications</h3>
          <p className="opacity-80">There was a problem fetching your application history. Please try again later.</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-24 bg-gradient-to-br from-white to-gray-50 dark:from-surface-dark dark:to-surface-dark border border-border-light dark:border-border-dark rounded-3xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-tr-[80px] pointer-events-none" />
          
          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
              <Briefcase className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-text-primary dark:text-white mb-3">
              No Applications Yet
            </h3>
            <p className="text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
              You haven't sent any proposals to organizations yet. Browse the opportunity board to find your next great project!
            </p>
            <Link to="/dashboard/gigs">
              <Button className="w-full sm:w-auto shadow-md shadow-primary/20">
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="p-6 xl:p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white dark:bg-surface-dark/90 backdrop-blur border-border-light dark:border-border-dark rounded-3xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/dashboard/gigs/${app.opportunity_id}`}>
                  <ExternalLink className="w-5 h-5 text-text-tertiary hover:text-primary transition-colors" />
                </Link>
              </div>

              <div className="flex items-start gap-4 mb-6 relative z-10">
                <Avatar
                  src={
                    app.organization_logo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(app.organization_name || "Org")}&background=random`
                  }
                  size="xl"
                  className="border-2 border-white dark:border-surface-dark shadow-sm bg-gray-50 dark:bg-gray-800"
                />
                <div className="pt-1 pr-8">
                  <h3 className="font-bold text-text-primary dark:text-white text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {app.opportunity_title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary dark:text-gray-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{app.organization_name || "Confidential Org"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 grow relative z-10">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Status</p>
                    {getStatusBadge(app.status)}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Type</p>
                    <Badge variant="neutral" className="bg-white dark:bg-surface-dark border-border-light dark:border-border-dark text-text-primary dark:text-gray-300 capitalize shadow-sm">
                      {app.opportunity_type}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 px-1 text-sm text-text-secondary dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-text-tertiary" />
                    <span>Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-text-tertiary" />
                    <span>Rate: {app.proposed_rate ? app.proposed_rate : "Negotiable"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-light dark:border-border-dark mt-auto flex gap-3 relative z-10">
                {['Shortlisted', 'Interviewing', 'Accepted'].includes(app.status) ? (
                  <Link to={`/dashboard/applications/${app.id}/messages`} className="flex-1">
                    <Button className="w-full font-bold shadow-md shadow-primary/20 bg-primary hover:bg-primary-dark">
                      <MessageSquare className="w-4 h-4 mr-2" /> Message Org
                    </Button>
                  </Link>
                ) : (
                   <Link to={`/dashboard/gigs/${app.opportunity_id}`} className="flex-1">
                      <Button variant="secondary" className="w-full font-bold">
                        View Posting
                      </Button>
                   </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
