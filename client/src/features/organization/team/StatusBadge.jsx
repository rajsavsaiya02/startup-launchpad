import React from "react";
import { cn } from "../../../utils/cn";
import { getStatusInfo } from "./statusConstants";

export function StatusIcon({ statusLabel, size = "w-3 h-3", className = "" }) {
  const info = getStatusInfo(statusLabel);
  const Icon = info.icon;
  return <Icon className={`${size} ${className}`} />;
}

export function StatusBadge({ statusLabel, showLabel = true, className = "" }) {
  const info = getStatusInfo(statusLabel);
  const Icon = info.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-transparent transition-all",
        info.lightBg,
        className,
      )}
    >
      <div
        className={cn("p-0.5 rounded-full text-white shadow-sm", info.color)}
      >
        <Icon className="w-2.5 h-2.5" />
      </div>
      {showLabel && (
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-tight",
            info.textColor,
          )}
        >
          {info.label}
        </span>
      )}
    </div>
  );
}
