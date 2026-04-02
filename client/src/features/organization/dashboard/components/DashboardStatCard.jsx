import React from "react";
import { motion as Motion } from "framer-motion";
import { TrendingUp, TrendingDown, Lock } from "lucide-react";

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  color = "blue",
  restricted = false,
  onClick = null,
}) {
  const isPositive = trend === "up";

  const colorMap = {
    teal: {
      icon: "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-100/50 dark:border-teal-500/20",
      glow: "from-teal-500/10 to-transparent",
    },
    blue: {
      icon: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-500/20",
      glow: "from-blue-500/10 to-transparent",
    },
    indigo: {
      icon: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-500/20",
      glow: "from-indigo-500/10 to-transparent",
    },
    orange: {
      icon: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100/50 dark:border-orange-500/20",
      glow: "from-orange-500/10 to-transparent",
    },
    emerald: {
      icon: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-500/20",
      glow: "from-emerald-500/10 to-transparent",
    },
    amber: {
      icon: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-500/20",
      glow: "from-amber-500/10 to-transparent",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <Motion.div
      whileHover={{ scale: onClick ? 1.02 : 1.01, y: -4 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer h-full" : "h-full"}
    >
      <div className="relative h-full bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[20px] p-5 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
        {/* Premium Background Glow */}
        <div className={`absolute top-0 right-0 w-28 h-28 bg-radial-gradient ${c.glow} opacity-30 group-hover:opacity-60 transition-opacity duration-700 blur-3xl -mr-8 -mt-8 pointer-events-none`} />
        
        {/* Layout: Icon (top-left) -> Value (Center) -> Title/Subtitle (Bottom) */}
        <div className="relative flex flex-col h-full z-10">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0 mb-3 shadow-sm`}>
            <Icon className="w-4.5 h-4.5" size={18} strokeWidth={2.5} />
          </div>

          {restricted ? (
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Restricted</span>
              </div>
              <h3 className="text-xs font-bold text-text-primary dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-[9px] text-text-tertiary font-bold mt-0.5 uppercase tracking-tight">Finance Admin Only</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="text-3xl font-black text-text-primary dark:text-white leading-none tabular-nums tracking-tighter mb-1.5 group-hover:translate-x-1 transition-transform duration-500">
                {value}
              </div>
              <div className="mt-auto">
                <h3 className="text-[13px] font-black text-text-primary dark:text-gray-200 leading-tight">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[10px] text-text-tertiary font-bold mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {subtitle}
                  </p>
                )}
                
                {trendValue && (
                  <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-border-light/40 dark:border-border-dark/40">
                    <span
                      className={`flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                        isPositive
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                      {isPositive ? "+" : "-"}{trendValue}%
                    </span>
                    <span className="text-[8px] text-text-tertiary font-bold uppercase tracking-tighter">vs last month</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
}
