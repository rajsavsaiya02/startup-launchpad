import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { useOpportunity, useApplyForOpportunity } from "../../hooks/useTalent";

export function OpportunityDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useOpportunity(id);
  const applyMutation = useApplyForOpportunity(id);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data?.opportunity) {
    return (
      <div className="text-center text-red-500 py-20 bg-white dark:bg-surface-dark rounded-xl">
        <h2 className="text-xl font-bold mb-2">Opportunity Not Found</h2>
        <p>
          The opportunity you are looking for does not exist or has been
          removed.
        </p>
        <Link to="/dashboard/opportunities">
          <Button className="mt-6">Back to Board</Button>
        </Link>
      </div>
    );
  }

  const opp = data.opportunity;

  const handleApply = (e) => {
    e.preventDefault();
    applyMutation.mutate(
      {
        cover_letter: coverLetter,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : null,
      },
      {
        onSuccess: () => {
          setShowApplyModal(false);
          alert("Application submitted successfully!");
        },
        onError: (err) => {
          alert(err.response?.data?.message || "Failed to apply.");
        },
      },
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-tertiary">
        <Link
          to="/dashboard/opportunities"
          className="hover:text-primary flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Opportunities
        </Link>
        <span>/</span>
        <span className="capitalize">{opp.type} Details</span>
      </div>

      {/* Header */}
      <div className="border-b border-border-light dark:border-border-dark pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-text-primary dark:text-white">
                {opp.title}
              </h1>
              <Badge variant="neutral" className="capitalize">
                {opp.type}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />{" "}
                {opp.organization_name || "Organization"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Posted{" "}
                {new Date(opp.created_at).toLocaleDateString()}
              </span>
              {/* Optional: we could fetch applicant count, but let's hide if zero or not provided */}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">
              Description
            </h2>
            <div className="text-text-secondary dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {opp.description}
            </div>
          </Card>

          {/* Skills */}
          {opp.skills && opp.skills.length > 0 && (
            <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
              <h2 className="text-xl font-bold text-text-primary dark:text-white">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {opp.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="neutral"
                    className="bg-primary/5 text-primary border-primary/20 px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Project Details */}
          <Card className="p-6 space-y-4 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">
              At a Glance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">
                    Compensation: {opp.compensation_type}
                  </p>
                  <p className="font-semibold text-text-primary dark:text-white">
                    {opp.compensation_type !== "Unpaid"
                      ? opp.budget_min
                        ? `$${opp.budget_min} ${opp.budget_max ? `- $${opp.budget_max}` : ""}`
                        : "Negotiable"
                      : "Unpaid"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Duration</p>
                  <p className="font-semibold text-text-primary dark:text-white">
                    {opp.duration || "Not specified"}
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
            <Card className="p-6 space-y-6 border-primary/20 shadow-md bg-white dark:bg-surface-dark">
              <div>
                <p className="text-lg font-bold text-text-primary dark:text-white">
                  Apply for this role
                </p>
                <p className="text-xs text-text-tertiary">
                  Make sure your profile is up to date.
                </p>
              </div>
              <div className="space-y-3">
                {showApplyModal ? (
                  <form
                    onSubmit={handleApply}
                    className="space-y-4 mt-2 border-t pt-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                        Cover Letter (Optional)
                      </label>
                      <textarea
                        className="w-full h-24 p-3 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 text-sm"
                        placeholder="Why are you a great fit?"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      ></textarea>
                    </div>
                    {opp.compensation_type !== "Unpaid" && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                          Proposed Rate / Bid ($)
                        </label>
                        <input
                          type="number"
                          className="w-full h-11 px-4 rounded-lg border border-border-light bg-white dark:bg-surface-dark dark:border-border-dark focus:ring-2 focus:ring-primary/20 text-sm"
                          placeholder="e.g. 5000"
                          value={proposedRate}
                          onChange={(e) => setProposedRate(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        isLoading={applyMutation.isPending}
                      >
                        Confirm Apply
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowApplyModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <Button
                      className="w-full font-bold text-base py-6"
                      onClick={() => setShowApplyModal(true)}
                      disabled={opp.status !== "Open"}
                    >
                      {opp.status === "Open" ? "Apply Now" : "Closed / Filled"}
                    </Button>
                    <Button variant="outline" className="w-full font-semibold">
                      Save for Later
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Company / Owner Card */}
            <Card className="p-6 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wide">
                  Posted By
                </h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  src={
                    opp.owner_avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(opp.owner_name)}&background=random`
                  }
                  size="lg"
                />
                <div>
                  <h3 className="font-bold text-text-primary dark:text-white">
                    {opp.owner_name}
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    {opp.owner_job_title || "Organization Member"}
                  </p>
                </div>
              </div>
              {opp.organization_name && (
                <div className="border-t border-border-light dark:border-border-dark pt-4 mt-2">
                  <h3 className="font-medium text-sm text-text-primary dark:text-white mb-1">
                    {opp.organization_name}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-3">
                    {opp.organization_bio}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
