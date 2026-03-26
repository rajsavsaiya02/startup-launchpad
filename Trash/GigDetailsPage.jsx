import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Building2,
  MapPin,
  Globe,
  Share2,
  Bookmark,
  CheckCircle2
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import opportunityService from "../../services/opportunityService";
import { useMyApplications } from "../../hooks/useTalent";
import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

export function GigDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyState, setApplyState] = useState({
    coverLetter: "",
    proposedRate: "",
    submitting: false,
    success: false,
    error: null,
  });

  const { data: myAppsData } = useMyApplications();
  const myApp = myAppsData?.applications?.find(app => String(app.opportunity_id) === String(id));
  const isApplied = !!myApp;

  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        setLoading(true);
        const res = await opportunityService.getOpportunityById(id);
        if (res.success) {
          setGig(res.opportunity);
        } else {
          setError(res.message);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load gig details");
      } finally {
        setLoading(false);
      }
    };
    fetchGigDetails();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyState((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const res = await opportunityService.applyForOpportunity(id, {
        cover_letter: applyState.coverLetter,
        proposed_rate: applyState.proposedRate,
      });
      if (res.success) {
        setApplyState((prev) => ({ ...prev, submitting: false, success: true }));
      } else {
        setApplyState((prev) => ({ ...prev, submitting: false, error: res.message }));
      }
    } catch (err) {
      setApplyState((prev) => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.message || "Failed to submit application",
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Opportunity</h2>
        <p className="text-text-secondary">{error || "Opportunity not found"}</p>
        <Link to="/dashboard/gigs" className="mt-4 inline-block">
          <Button variant="secondary">Back to Gigs</Button>
        </Link>
      </div>
    );
  }

  const timeAgo = gig.created_at ? formatDistanceToNow(new Date(gig.created_at), { addSuffix: true }) : 'Recently';
  const startDate = gig.created_at ? format(new Date(gig.created_at), 'MMM dd, yyyy') : 'Immediate';
  const priceText = gig.compensation_type === 'Hourly' ? `${gig.budget_min}-${gig.budget_max}/hr` 
                  : gig.compensation_type === 'Fixed' ? `${gig.budget_min} (Fixed)`
                  : gig.compensation_type === 'Unpaid' ? 'Unpaid'
                  : gig.compensation_type || "Negotiable";

  const isOrgMember = ["founder", "admin"].includes(user?.role);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-tertiary">
        <Link
          to="/dashboard/gigs"
          className="hover:text-primary flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Gigs
        </Link>
        <span>/</span>
        <span className="text-text-primary dark:text-gray-300 font-medium truncate max-w-[200px] sm:max-w-xs">{gig.title}</span>
      </div>

      {/* Header */}
      <div className="border-b border-border-light dark:border-border-dark pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="neutral" className="bg-primary/10 text-primary border-transparent capitalize">
                {gig.type}
              </Badge>
              {gig.status === 'Open' ? (
                 <Badge variant="neutral" className="bg-green-500/10 text-green-600 border-transparent">Open</Badge>
              ) : (
                 <Badge variant="neutral" className="bg-red-500/10 text-red-600 border-transparent">{gig.status}</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-text-primary dark:text-white mb-4 leading-tight">
              {gig.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-text-secondary dark:text-gray-400">
              <span className="flex items-center gap-1.5 border border-border-light dark:border-border-dark px-3 py-1.5 rounded-full bg-white dark:bg-surface-dark shadow-sm">
                <Building2 className="h-4 w-4 text-primary" /> {gig.organization_name || "Confidential"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-text-tertiary" /> Posted {timeAgo}
              </span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:text-primary hover:border-primary">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:text-primary hover:border-primary">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="p-8 space-y-6 bg-white dark:bg-surface-dark/80 backdrop-blur border-border-light dark:border-border-dark shadow-sm rounded-2xl">
            <h2 className="text-xl font-bold text-text-primary dark:text-white border-b border-border-light dark:border-border-dark pb-4">
              Role Description
            </h2>
            <div className="prose dark:prose-invert max-w-none text-text-secondary dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {gig.description}
            </div>
          </Card>

          {/* Skills */}
          {gig.skills && gig.skills.length > 0 && (
            <Card className="p-8 space-y-6 bg-white dark:bg-surface-dark/80 backdrop-blur border-border-light dark:border-border-dark shadow-sm rounded-2xl">
              <h2 className="text-xl font-bold text-text-primary dark:text-white border-b border-border-light dark:border-border-dark pb-4">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {gig.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="neutral"
                    className="bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-light border-primary/20 hover:bg-primary hover:text-white transition-colors px-4 py-1.5 text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Project Details (Grid) */}
          <Card className="p-8 space-y-6 bg-white dark:bg-surface-dark/80 backdrop-blur border-border-light dark:border-border-dark shadow-sm rounded-2xl">
            <h2 className="text-xl font-bold text-text-primary dark:text-white border-b border-border-light dark:border-border-dark pb-4">
              Opportunity Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-text-tertiary mb-1">Budget / Comp</p>
                  <p className="font-bold text-text-primary dark:text-gray-100 text-lg">
                    {priceText}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-text-tertiary mb-1">Duration</p>
                  <p className="font-bold text-text-primary dark:text-gray-100 text-lg">
                    {gig.duration || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-text-tertiary mb-1">Posted Date</p>
                  <p className="font-bold text-text-primary dark:text-gray-100 text-lg">
                    {startDate}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Action Card */}
            <Card className="p-6 space-y-6 border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-br from-white to-gray-50 dark:from-surface-dark dark:to-surface-dark relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">
                  {isApplied ? "Application Status" : "Interested?"}
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-400 mb-6 leading-relaxed">
                  {isApplied
                    ? "Track your application status or communicate with the organization directly."
                    : "Submit your proposal early to increase your chances of being noticed by the organization."}
                </p>

                {!isOrgMember ? (
                  isApplied ? (
                    <div className="space-y-3 mt-4">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Status</span>
                        <Badge variant="neutral" className="capitalize text-primary bg-primary/10 border-transparent">
                          {myApp.status}
                        </Badge>
                      </div>
                      {['Shortlisted', 'Interviewing', 'Accepted'].includes(myApp.status) ? (
                        <Link to={`/dashboard/applications/${myApp.id}/messages`} className="w-full block mt-4">
                          <Button className="w-full font-bold text-base py-6 bg-primary hover:bg-primary-dark shadow-md shadow-primary/20">
                            <MessageSquare className="w-5 h-5 mr-2" /> Message Org
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/dashboard/applications" className="w-full block mt-4">
                          <Button variant="secondary" className="w-full font-bold text-base py-6">
                            Manage Applications
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Button 
                      className="w-full font-bold text-base py-6 shadow-md shadow-primary/20"
                      onClick={() => setIsApplyModalOpen(true)}
                      disabled={gig.status !== 'Open'}
                    >
                      {gig.status === 'Open' ? "Apply Now" : "Currently Closed"}
                    </Button>
                  )
                ) : (
                  <Link to={`/dashboard/opportunities/manage`}>
                    <Button variant="secondary" className="w-full font-bold text-base py-6">
                      Manage Gigs
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Company Card */}
            <Card className="p-6 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <Avatar 
                  src={gig.organization_logo || "https://i.pravatar.cc/150?u=company"} 
                  size="xl" 
                  className="border-2 border-border-light dark:border-border-dark shadow-sm bg-white"
                />
                <div>
                  <h3 className="font-bold text-text-primary dark:text-white text-lg leading-tight">
                    {gig.organization_name || "Confidential"}
                  </h3>
                  <a
                    href="#"
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5 mt-1"
                  >
                    Visit Profile <Globe className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed mb-5">
                {gig.organization_bio || "Innovation driven organization looking for top talent."}
              </p>
              
              {gig.owner_name && (
                 <div className="mt-5 pt-5 border-t border-border-light dark:border-border-dark">
                    <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Posted By</p>
                    <div className="flex items-center gap-3">
                       <Avatar src={gig.owner_avatar} size="md" />
                       <div>
                          <p className="font-bold text-sm text-text-primary dark:text-white">{gig.owner_name}</p>
                          <p className="text-xs text-text-secondary">{gig.owner_job_title}</p>
                       </div>
                    </div>
                 </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border-light dark:border-border-dark animate-in zoom-in-95 duration-200">
            {applyState.success ? (
              <div className="p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary dark:text-white">Application Submitted!</h2>
                <p className="text-text-secondary dark:text-gray-400">
                  Your proposal has been sent to {gig.organization_name}. You can track its status in your applications dashboard.
                </p>
                <div className="pt-6">
                  <Link to="/dashboard/applications" className="w-full">
                    <Button className="w-full py-6 text-base">View My Applications</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                  <h2 className="text-xl font-bold text-text-primary dark:text-white">Submit Proposal</h2>
                  <button 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors p-2"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleApply} className="p-6 space-y-6">
                  {applyState.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-500/20">
                      {applyState.error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-primary dark:text-gray-200 block">
                      Cover Letter / Message
                    </label>
                    <textarea 
                      required
                      placeholder="Explain why you're a great fit for this opportunity..."
                      value={applyState.coverLetter}
                      onChange={(e) => setApplyState(prev => ({ ...prev, coverLetter: e.target.value }))}
                      className="w-full h-32 p-4 rounded-xl border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-primary dark:text-gray-200 block">
                      Proposed Rate <span className="text-text-tertiary font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                      <input 
                        type="text"
                        placeholder="e.g. $50/hr or $2000 total"
                        value={applyState.proposedRate}
                        onChange={(e) => setApplyState(prev => ({ ...prev, proposedRate: e.target.value }))}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsApplyModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 shadow-md shadow-primary/20"
                      disabled={applyState.submitting}
                    >
                      {applyState.submitting ? "Submitting..." : "Send Proposal"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

