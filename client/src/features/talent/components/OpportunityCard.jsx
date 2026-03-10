import React from "react";
import { Link } from "react-router-dom";
import { Users, Edit3, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";

export function OpportunityCard({ opp }) {
  return (
    <Card className="p-6 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mr-2">
              {opp.title}
            </h3>
            <Badge variant={opp.status === "Open" ? "success" : "neutral"}>
              {opp.status}
            </Badge>
            <Badge variant="blue" className="capitalize">
              {opp.type === "job"
                ? "Corporate Role"
                : opp.type === "gig"
                  ? "Gig / Project"
                  : "Internship"}
            </Badge>
            {opp.compensation_type && (
              <Badge variant="neutral" className="bg-gray-100 dark:bg-gray-800">
                {opp.compensation_type}
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-secondary line-clamp-2 max-w-2xl">
            {opp.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-border-light dark:border-border-dark mt-3">
            {(opp.budget_min || opp.budget_max) && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary dark:text-gray-300">
                <span className="text-text-tertiary">Budget/Salary:</span>
                {opp.budget_min && opp.budget_max
                  ? `$${opp.budget_min} - $${opp.budget_max}`
                  : opp.budget_min
                    ? `From $${opp.budget_min}`
                    : `Up to $${opp.budget_max}`}
              </div>
            )}
            {opp.duration && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary dark:text-gray-300">
                <span className="text-text-tertiary">Duration:</span>
                {opp.duration}
              </div>
            )}
            <div className="text-[10px] text-text-tertiary ml-auto uppercase tracking-widest">
              Posted {new Date(opp.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex md:flex-col gap-3 shrink-0">
          {/* Note: In Org view, the URL is `/org/gigs/:id/...` */}
          <Link to={`/org/gigs/${opp.id}/applications`} className="w-full">
            <Button variant="primary" className="w-full gap-2">
              <Users className="h-4 w-4" /> View Applicants
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 text-text-secondary"
            >
              <Edit3 className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 text-error hover:bg-error/10 hover:border-error border-border-light dark:border-border-dark"
            >
              <Trash2 className="h-4 w-4" /> Close
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
