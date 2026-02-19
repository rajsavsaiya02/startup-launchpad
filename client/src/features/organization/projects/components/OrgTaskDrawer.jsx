import React from "react";
import {
  X,
  Calendar,
  Paperclip,
  MessageSquare,
  Plus,
  MoreHorizontal,
  CheckSquare,
  GripVertical,
  Trash2,
  Download,
  Send,
  Edit2,
  Share2,
  UserPlus,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Avatar } from "../../../../components/ui/Avatar";
import { Badge } from "../../../../components/ui/Badge";
import { cn } from "../../../../utils/cn";

export function OrgTaskDrawer({ task, onClose, isOpen }) {
  if (!isOpen || !task) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-border-light dark:border-border-dark">
        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* SECTION A — HEADER */}
            <div className="pb-6 border-b border-border-light dark:border-border-dark">
              <div className="flex items-start justify-between gap-4">
                <h1
                  className="text-xl font-semibold text-text-primary dark:text-white leading-snug flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded -ml-1 transition-colors outline-none focus:ring-2 focus:ring-primary/20"
                  contentEditable
                  suppressContentEditableWarning
                >
                  {task.title}
                </h1>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-md text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <UserPlus className="h-5 w-5" />
                  </button>
                  <button className="p-1.5 rounded-md text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-1.5 rounded-md text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-md text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Badge
                  variant="error"
                  className="bg-error/10 text-error border-transparent px-2.5 py-1"
                >
                  High Priority
                </Badge>

                <select className="bg-transparent text-sm font-medium text-text-primary dark:text-white border-none p-0 focus:ring-0 cursor-pointer">
                  <option>In Progress</option>
                  <option>To Do</option>
                  <option>Done</option>
                </select>

                <div className="flex items-center gap-1.5 text-text-secondary dark:text-gray-400 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Jan 31, 2024</span>
                </div>
              </div>
            </div>

            {/* SECTION B — DESCRIPTION */}
            <div className="p-5 border border-border-light dark:border-border-dark rounded-lg shadow-sm bg-white dark:bg-surface-dark">
              <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-3">
                Description
              </h3>
              <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                Design and implement the new user onboarding flow as per the
                V2.5 UI standards. This includes the welcome screen, profile
                setup, and initial project creation steps.
              </p>
              <button className="text-primary text-sm font-medium mt-3 hover:underline">
                Edit Description
              </button>
            </div>

            {/* SECTION C — SUBTASKS */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-text-primary dark:text-white">
                  Subtasks (3/5)
                </h3>
              </div>
              <div className="space-y-2">
                {[
                  { text: "Draft welcome screen copy", done: true },
                  { text: "Design profile setup UI", done: true },
                  { text: "Implement project creation steps", done: true },
                  { text: "Create user guide video", done: false },
                  { text: "QA and testing", done: false },
                ].map((sub, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={sub.done}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-sm ${sub.done ? "text-text-tertiary line-through" : "text-text-primary dark:text-white"}`}
                    >
                      {sub.text}
                    </span>
                    <GripVertical className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 cursor-grab" />
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1 text-primary text-sm font-medium mt-3 hover:underline">
                <Plus className="h-4 w-4" /> Add Subtask
              </button>
            </div>

            {/* SECTION D — ATTACHMENTS */}
            <div className="p-5 border border-border-light dark:border-border-dark rounded-lg shadow-sm bg-white dark:bg-surface-dark">
              <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-4">
                Attachments
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark group">
                  <div className="h-10 w-10 rounded bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                    FIG
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary dark:text-white truncate">
                      Onboarding_V2.fig
                    </p>
                    <p className="text-xs text-text-tertiary">2.1 MB</p>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button className="p-1.5 hover:bg-white dark:hover:bg-surface-dark rounded text-text-secondary">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 hover:bg-white dark:hover:bg-surface-dark rounded text-text-secondary">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 gap-2 border-dashed"
              >
                <Paperclip className="h-4 w-4" /> Upload File
              </Button>
            </div>

            {/* SECTION E — COMMENTS */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-4">
                Comments
              </h3>

              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <Avatar size="sm" fallback="ME" />
                <div className="flex-1">
                  <textarea
                    className="w-full rounded-md border border-border-light dark:border-border-dark p-3 text-sm min-h-20 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Add a comment..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                    <Button size="sm">Comment</Button>
                  </div>
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-6">
                <div className="flex gap-3 group">
                  <Avatar src="https://i.pravatar.cc/150?u=olivia" size="sm" />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-semibold text-text-primary dark:text-white">
                        Olivia Martin
                      </p>
                      <span className="text-xs text-text-tertiary">
                        2 hours ago
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-text-secondary dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg rounded-tl-none">
                      Great progress! I've attached the final copy deck.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION F — ACTIVITY */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-4">
                Activity
              </h3>
              <div className="space-y-4 relative pl-2">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-light dark:border-border-dark"></div>

                {[
                  {
                    text: "Alex changed status to In Progress",
                    time: "Jan 29, 10:45 AM",
                  },
                  {
                    text: "Olivia uploaded Onboarding_V2.fig",
                    time: "Jan 28, 3:12 PM",
                  },
                  { text: "You created this task", time: "Jan 28, 9:00 AM" },
                ].map((log, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-background-dark"></div>
                    <p className="text-sm text-text-secondary dark:text-gray-300">
                      {log.text}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {log.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
