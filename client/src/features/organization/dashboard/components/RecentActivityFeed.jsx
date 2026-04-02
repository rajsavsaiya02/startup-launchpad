import React from "react";
import { motion as Motion } from "framer-motion";
import { Clock, Activity, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getRelativeTime = (dateStr) => {
  if (!dateStr) return "Recently";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getInitials = (first, last) => {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";
};

const AVATAR_COLORS = [
  "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
  "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
  "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
  "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
  "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
];

export function RecentActivityFeed({ activities = [] }) {
  const navigate = useNavigate();
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-black text-text-primary dark:text-white">Recent Activity</h3>
        </div>
        <button
          onClick={() => navigate("/org/projects")}
          className="text-[10px] font-bold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1"
        >
          All <ExternalLink size={10} />
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 max-h-[360px]">
        {!hasActivities ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3 border border-border-light dark:border-border-dark">
              <Clock className="w-6 h-6 text-text-tertiary opacity-50" />
            </div>
            <p className="text-sm font-bold text-text-primary dark:text-gray-200">No Activities Yet</p>
            <p className="text-xs text-text-tertiary mt-1 max-w-[180px] leading-relaxed">
              When members perform actions, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => {
              const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const initials = getInitials(activity.first_name, activity.last_name);
              const timeLabel = getRelativeTime(activity.created_at);
              const name = activity.first_name
                ? `${activity.first_name} ${activity.last_name || ""}`.trim()
                : "System";

              return (
                <Motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 py-3 border-b border-border-light/40 dark:border-border-dark/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-xl px-1 transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${colorClass}`}>
                    {activity.avatar ? (
                      <img src={activity.avatar} alt={name} className="w-8 h-8 rounded-xl object-cover" />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-text-primary dark:text-gray-200 leading-snug">
                      <span className="font-black">{name}</span>
                      {activity.project_name && (
                        <span className="text-text-tertiary font-normal"> · {activity.project_name}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-text-tertiary mt-0.5 leading-snug line-clamp-2">
                      {activity.description}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-tight whitespace-nowrap mt-0.5 shrink-0">
                    {timeLabel}
                  </span>
                </Motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
