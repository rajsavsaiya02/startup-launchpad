import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, User, ChevronDown } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";

export function ApplicationCard({ app, onUpdateStatus, isUpdating }) {
  const statusOptions = [
    { label: "Pending", value: "Pending", color: "bg-gray-100 text-gray-600" },
    { label: "Under Review", value: "Under Review", color: "bg-blue-50 text-blue-600" },
    { label: "Shortlisted", value: "Shortlisted", color: "bg-indigo-50 text-indigo-600" },
    { label: "Interview", value: "Interviewing", color: "bg-warning/10 text-warning" },
    { label: "Hire", value: "Accepted", color: "bg-success/10 text-success" },
    { label: "Reject", value: "Rejected", color: "bg-error/10 text-error" },
  ];

  return (
    <Card className="group relative p-5 bg-white dark:bg-surface-dark border-border-light/50 dark:border-border-dark/50 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border-l-4 border-l-transparent hover:border-l-primary overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Left: Avatar & Primary Info */}
        <div className="flex flex-col items-center gap-2.5 shrink-0 pt-1 w-20">
          <Avatar
            src={
              app.applicant_avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                app.applicant_name || "User",
              )}&background=random`
            }
            size="xl"
            className="ring-4 ring-gray-50 dark:ring-gray-800/50 shadow-lg"
          />
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
            className="w-full text-[9px] uppercase font-black tracking-tighter py-1 shadow-xs text-center justify-center border-none flex"
          >
            {app.status}
          </Badge>
        </div>

        {/* Middle: Name, Title, Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-black text-text-primary dark:text-white group-hover:text-primary transition-colors tracking-tight">
                {app.applicant_name}
              </h3>
              <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
                {app.applicant_title || "Professional Developer"}
              </p>
            </div>
            {app.proposed_rate && (
              <div className="text-right">
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-wider block">Bid Amount</span>
                <span className="text-lg font-black text-primary">₹{app.proposed_rate}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-text-tertiary my-4">
            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Applied {new Date(app.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-full">
              <User className="h-3.5 w-3.5 text-indigo-500" /> @{app.applicant_username || "anonymous"}
            </span>
          </div>

          {app.cover_letter && (
            <div className="relative group/letter mb-6">
              <div className="absolute -left-3 top-0 w-1 h-full bg-border-light/50 dark:bg-border-dark/50 rounded-full" />
              <p className="text-sm leading-relaxed text-text-secondary dark:text-gray-400 italic pl-2">
                "{app.cover_letter}"
              </p>
            </div>
          )}

          {/* Bottom Actions Area */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border-light/30 dark:border-border-dark/30">
            <Link
              to={`/community/${app.applicant_username}`}
              className="flex-1 min-w-[140px]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="w-full h-11 text-xs font-black uppercase tracking-wider gap-2">
                <User className="h-4 w-4" /> View Profile
              </Button>
            </Link>

            <div className="relative flex-1 min-w-[160px]">
              <select
                className={cn(
                  "w-full h-11 pl-4 pr-10 appearance-none rounded-xl border-2 border-transparent text-xs font-black uppercase tracking-wider transition-all cursor-pointer focus:ring-4 focus:ring-primary/10 outline-hidden",
                  statusOptions.find(o => o.value === app.status)?.color || "bg-gray-100 text-gray-600"
                )}
                value={app.status}
                onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                disabled={isUpdating}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-white text-gray-900 font-bold">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-50" />
            </div>

            <Link
              to={`/org/talent/messages/${app.freelancer_id}?appId=${app.id}`}
              className="flex-1 min-w-[140px]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" className="w-full h-11 text-xs font-black uppercase tracking-wider gap-2 shadow-lg shadow-primary/20">
                <MessageSquare className="h-4 w-4" /> Message
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
