import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Eye, GripVertical, Crown } from "lucide-react";
import { cn } from "../../../utils/cn";

export function OrgTeamMapCard({ member, onQuickView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: member.organization_member_id.toString(),
      data: {
        type: "MEMBER",
        member,
      },
    });

  const style = {
    // Only translate if dragged
    transform: CSS.Translate.toString(transform),
    // Prevent the card from capturing pointer events while it's being dragged
    // so the pointer events fall through to the droppable below it
    ...(isDragging ? { zIndex: 50, pointerEvents: "none" } : {}),
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "FOUNDER":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800";
      case "ADMIN":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
      case "GUEST":
        return "bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
      default:
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-center gap-3 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.15)] hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group relative min-w-[280px]",
        isDragging &&
          "opacity-90 shadow-2xl scale-105 ring-2 ring-primary border-primary/50",
      )}
    >
      {/* Drag Handle */}
      {member.org_role !== "FOUNDER" ? (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      ) : (
        <div className="p-1 text-gray-200 dark:text-gray-800 pointer-events-none">
          <Crown className="w-4 h-4 text-purple-300 dark:text-purple-900/50" />
        </div>
      )}

      {/* Avatar */}
      <div className="shrink-0 relative">
        <img
          src={
            member.avatar ||
            `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=random`
          }
          alt={member.first_name}
          className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700"
        />
        <div
          className={cn(
            "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-surface-dark",
            member.is_active ? "bg-green-500" : "bg-gray-400",
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pointer-events-auto">
        <h4 className="text-sm font-bold text-text-primary dark:text-white truncate">
          {member.first_name} {member.last_name}
        </h4>
        <p className="text-xs text-text-secondary dark:text-gray-400 truncate">
          {member.designation_title || "No Designation"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1 shrink-0 pointer-events-auto">
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
            getRoleBadgeColor(member.org_role),
          )}
        >
          {member.org_role}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(member);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-primary bg-gray-50 dark:bg-gray-800 rounded-md"
          title="Quick View"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
