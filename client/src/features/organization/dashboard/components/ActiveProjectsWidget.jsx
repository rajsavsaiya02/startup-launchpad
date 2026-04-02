import React from "react";
import { motion as Motion } from "framer-motion";
import { FolderOpen, Users, ChevronRight, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  active: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  in_progress: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  "in-progress": "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  planning: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  on_hold: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  at_risk: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  review: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
};

const getStatusLabel = (status) => {
  const map = {
    active: "Active",
    in_progress: "In Progress",
    "in-progress": "In Progress",
    planning: "Planning",
    on_hold: "On Hold",
    at_risk: "At Risk",
    review: "Review",
  };
  return map[status?.toLowerCase()] || status || "Active";
};

const getStatusClass = (status) =>
  STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.active;

const PROJECT_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
];

const formatCurrency = (val) => {
  if (!val || val === 0) return null;
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
};

export function ActiveProjectsWidget({ projects = [], totalCount = 0 }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-black text-text-primary dark:text-white">Active Projects</h3>
          {totalCount > 0 && (
            <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-black">
              {totalCount} total
            </span>
          )}
        </div>
        <button
          onClick={() => navigate("/org/projects")}
          className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
        >
          View All <ChevronRight size={12} />
        </button>
      </div>

      {/* Project List */}
      <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto custom-scrollbar max-h-[300px]">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3 border border-border-light dark:border-border-dark">
              <Folder className="w-6 h-6 text-text-tertiary opacity-50" />
            </div>
            <p className="text-sm font-bold text-text-primary dark:text-gray-200">No Active Projects</p>
            <p className="text-xs text-text-tertiary mt-1 max-w-[180px] leading-relaxed">
              Create your first project to get started.
            </p>
            <button
              onClick={() => navigate("/org/projects")}
              className="mt-3 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              Go to Projects →
            </button>
          </div>
        ) : (
          projects.map((project, index) => {
            const colorBar = PROJECT_COLORS[index % PROJECT_COLORS.length];
            const budget = formatCurrency(project.budget);

            // Automated status logic
            const isOverdue =
              project.dueDate &&
              new Date(project.dueDate) < new Date() &&
              (project.progress || 0) < 100;

            const statusClass = isOverdue
              ? STATUS_STYLES.at_risk
              : getStatusClass(project.status);
            const statusLabel = isOverdue
              ? "Overdue"
              : getStatusLabel(project.status);

            return (
              <Motion.div
                key={project.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/org/projects/${project.id}`)}
                className="group flex items-center gap-3 p-3 rounded-xl border border-border-light/50 dark:border-border-dark/50 hover:border-primary/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all cursor-pointer hover:shadow-sm"
              >
                {/* Color dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full ${colorBar} shrink-0`}
                />

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-text-primary dark:text-white truncate group-hover:text-primary transition-colors">
                    {project.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {budget && (
                      <span className="text-[9px] font-black text-text-tertiary uppercase tracking-tight bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        {budget}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-text-tertiary">
                      <Users size={9} /> {project.memberCount || 0}
                    </span>
                    <span className="text-[9px] font-black text-primary/70">
                      {project.progress || 0}%
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${statusClass}`}
                >
                  {statusLabel}
                </span>

                <ChevronRight
                  size={12}
                  className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </Motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
