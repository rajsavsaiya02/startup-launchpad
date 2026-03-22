import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import { Card } from "../../../components/ui/Card";

export function ApplicationCard({ app, onUpdateStatus, isUpdating }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow bg-white dark:bg-surface-dark border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-5">
      <Avatar
        src={
          app.applicant_avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            app.applicant_name,
          )}&background=random`
        }
        size="lg"
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="text-lg font-bold text-text-primary dark:text-white">
              {app.applicant_name}
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              {app.applicant_title || "Professional"}
            </p>
          </div>
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

        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary dark:text-gray-300 my-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Applied{" "}
            {new Date(app.created_at).toLocaleDateString()}
          </span>
          {app.proposed_rate && (
            <>
              <span className="text-border-light dark:text-border-dark">|</span>
              <span className="font-semibold text-primary">
                Bid: ${app.proposed_rate}
              </span>
            </>
          )}
        </div>

        {app.cover_letter && (
          <div className="mb-4 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-text-secondary dark:text-gray-300 line-clamp-2">
            <span className="font-medium text-text-primary dark:text-white block mb-1">
              Cover Letter:
            </span>
            {app.cover_letter}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-auto pt-2">
          <Link
            to={`/community/${app.applicant_username}`}
            className="flex-1"
          >
            <Button variant="secondary" className="w-full">
              View Profile
            </Button>
          </Link>
          <select
            className="flex-1 h-10 px-3 rounded-md border border-border-light bg-white dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:text-white transition-colors cursor-pointer"
            value={app.status}
            onChange={(e) => onUpdateStatus(app.id, e.target.value)}
            disabled={isUpdating}
          >
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlist</option>
            <option value="Interviewing">Interview</option>
            <option value="Accepted">Accept & Hire</option>
            <option value="Rejected">Reject</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
