import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  IndianRupee,
  Clock,
  Briefcase,
  Trash2,
  Users,
  MessageCircle,
  RefreshCw,
  Trash,
  Edit3,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../../../utils/cn";

export function OpportunityCard({
  opp,
  onEdit,
  onClose,
  onReopen,
  onDelete,
  isOrgView = false,
}) {
  const timeAgo = opp.created_at
    ? formatDistanceToNow(new Date(opp.created_at), { addSuffix: true })
    : "Recently";

  // Compact budget formatting
  const formattedBudget =
    opp.compensation_type === "Unpaid"
      ? "Unpaid"
      : opp.compensation_type === "Hourly"
        ? `${opp.budget_min ? `₹${opp.budget_min}` : ""}${opp.budget_max ? `-₹${opp.budget_max}` : ""}/hr`
        : opp.compensation_type === "Fixed"
          ? `${opp.budget_min ? `₹${opp.budget_min}` : "Negotiable"}${opp.budget_min ? " (Fixed)" : ""}`
          : opp.budget_min
            ? `₹${opp.budget_min}${opp.budget_max ? `-₹${opp.budget_max}` : ""}`
            : "Negotiable";

  return (
    <Card className="group relative p-4 flex flex-col gap-4 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-border-light/50 dark:border-border-dark/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 overflow-hidden">
      {/* Premium Gradient Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/60 via-indigo-500/60 to-purple-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header Area */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <Avatar
            src={
              opp.organization_logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(opp.organization_name || "Org")}&background=random`
            }
            size="md"
            className="border-2 border-white dark:border-gray-800 shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-base font-black text-text-primary dark:text-white line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
              {opp.title}
            </h3>
            <p className="text-[12px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
              {opp.organization_name}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge
            variant={
              opp.type === "job"
                ? "success"
                : opp.type === "internship"
                  ? "warning"
                  : "neutral"
            }
            className="text-[9px] px-2 py-0.5 font-black uppercase tracking-tighter"
          >
            {opp.type}
          </Badge>
          {isOrgView && (
            <Badge
              variant={opp.status === "Open" ? "success" : "neutral"}
              className={cn(
                "text-[9px] px-2 py-0.5 font-black uppercase tracking-tighter border-none",
                opp.status === "Open" ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"
              )}
            >
              {opp.status}
            </Badge>
          )}
        </div>
      </div>

      {/* High-density Meta Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-y border-border-light/30 dark:border-border-dark/30 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/5 rounded-lg text-primary">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Budget</span>
            <span className="text-sm font-black text-text-primary dark:text-gray-200">
              {formattedBudget}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/5 rounded-lg text-indigo-500">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Location</span>
            <span className="text-sm font-black text-text-primary dark:text-gray-200">
              {opp.location || "Remote"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/5 rounded-lg text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Posted</span>
            <span className="text-sm font-black text-text-primary dark:text-gray-200">
              {timeAgo}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/5 rounded-lg text-purple-500">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Duration</span>
            <span className="text-sm font-black text-text-primary dark:text-gray-200">
              {opp.duration || "Permanent"}
            </span>
          </div>
        </div>
      </div>

      {/* Description - Truncated for compactness */}
      <p className="text-[12px] text-text-secondary dark:text-gray-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
        {opp.description}
      </p>

      {/* Skills / Action Area */}
      <div className="mt-auto space-y-4">
        {/* Skills - Only top 2 for compactness */}
        <div className="flex flex-wrap gap-1.5">
          {(opp.skills || []).slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-[9px] font-black uppercase tracking-widest text-text-tertiary bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-md"
            >
              {s}
            </span>
          ))}
          {opp.skills?.length > 2 && (
            <span className="text-[9px] font-bold text-text-tertiary ml-1 self-center">
              +{opp.skills.length - 2}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2 border-t border-border-light/30 dark:border-border-dark/30">
          {isOrgView ? (
            <div className="flex flex-col w-full gap-2">
              <Link 
                to={`/org/gigs/${opp.id}/applications`} 
                className="flex-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full gap-2 h-10 text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20">
                  <Users className="h-4 w-4" /> View Applicants
                </Button>
              </Link>
              <div className="flex gap-2">
                {opp.status === "Open" ? (
                  <>
                    <button
                      onClick={() => onEdit?.(opp)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-black uppercase tracking-tighter text-text-secondary border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => onClose?.(opp)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-black uppercase tracking-tighter text-error border border-error/20 hover:bg-error/5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onReopen?.(opp)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-black uppercase tracking-tighter text-success border border-success/20 hover:bg-success/5 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Reopen
                    </button>
                    <button
                      onClick={() => onDelete?.(opp)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-black uppercase tracking-tighter text-error border border-error/20 hover:bg-error/5 transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link 
              to={`/dashboard/opportunities/${opp.id}`} 
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                className="w-full h-10 text-[11px] font-black uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                View Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
