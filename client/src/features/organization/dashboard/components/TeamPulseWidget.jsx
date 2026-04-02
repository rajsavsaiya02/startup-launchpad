import React from "react";
import { motion as Motion } from "framer-motion";
import { Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STATUS_OPTIONS } from "../../team/statusConstants";

const getStatusConfig = (statusLabel) => {
  const match = STATUS_OPTIONS.find(
    (o) => o.label.toLowerCase() === (statusLabel || "on work").toLowerCase()
  );
  return match || STATUS_OPTIONS[0];
};

export function TeamPulseWidget({ membersByStatus = [], totalCount = 0 }) {
  const navigate = useNavigate();

  const totalWithStatus = membersByStatus.reduce((sum, s) => sum + s.count, 0);

  // Sort: On Work first, then by count descending
  const sortedStatuses = [...membersByStatus].sort((a, b) => {
    if (a.status === "On Work") return -1;
    if (b.status === "On Work") return 1;
    return b.count - a.count;
  });

  const topStatuses = sortedStatuses.slice(0, 5);

  // Count on-work specifically
  const onWorkCount = membersByStatus.find((s) => s.status === "On Work")?.count || 0;
  const awayCount = totalCount - onWorkCount;

  return (
    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-black text-text-primary dark:text-white">Team Pulse</h3>
          {totalCount > 0 && (
            <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-black">
              {totalCount} members
            </span>
          )}
        </div>
        <button
          onClick={() => navigate("/org/management")}
          className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
        >
          View Team <ChevronRight size={12} />
        </button>
      </div>

      {/* Summary Row */}
      {totalCount > 0 && (
        <div className="px-5 py-3 border-b border-border-light/40 dark:border-border-dark/40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">{onWorkCount} Active</span>
            </div>
            {awayCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="text-[11px] font-bold text-text-tertiary">{awayCount} Away</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto custom-scrollbar">
        {membersByStatus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3 border border-border-light dark:border-border-dark">
              <Users className="w-6 h-6 text-text-tertiary opacity-50" />
            </div>
            <p className="text-sm font-bold text-text-primary dark:text-gray-200">No Members Yet</p>
            <p className="text-xs text-text-tertiary mt-1 max-w-[180px] leading-relaxed">
              Invite members to your organization to see their status here.
            </p>
          </div>
        ) : (
          topStatuses.map((item, index) => {
            const config = getStatusConfig(item.status);
            const percentage = totalWithStatus > 0 ? Math.round((item.count / totalWithStatus) * 100) : 0;
            const IconComp = config.icon;

            return (
              <Motion.div
                key={item.status || index}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.lightBg} transition-transform group-hover:scale-110`}>
                  <IconComp className={`w-3.5 h-3.5 ${config.textColor}`} />
                </div>

                {/* Bar + Label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.textColor}`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-black text-text-primary dark:text-white tabular-nums">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.06, ease: "easeOut" }}
                      className={`h-1.5 rounded-full ${config.color}`}
                    />
                  </div>
                </div>

                {/* Percentage */}
                <span className="text-[10px] font-black text-text-tertiary tabular-nums w-8 text-right shrink-0">
                  {percentage}%
                </span>
              </Motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 shrink-0">
        <button
          onClick={() => navigate("/org/management")}
          className="w-full py-2 rounded-xl border border-border-light dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary/30 transition-all flex items-center justify-center gap-1.5"
        >
          <Users size={12} /> Manage Team
        </button>
      </div>
    </div>
  );
}
