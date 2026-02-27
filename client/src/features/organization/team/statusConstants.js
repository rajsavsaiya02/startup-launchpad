import {
  Zap,
  Moon,
  Coffee,
  Clock,
  Sun,
  Video,
  Home,
  Target,
  User,
  Plane,
} from "lucide-react";

export const STATUS_OPTIONS = [
  {
    label: "On Work",
    icon: Zap,
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    lightBg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    label: "Leave",
    icon: Moon,
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    lightBg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    label: "Break",
    icon: Coffee,
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400",
    lightBg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    label: "Away",
    icon: Clock,
    color: "bg-gray-500",
    textColor: "text-gray-600 dark:text-gray-400",
    lightBg: "bg-gray-50 dark:bg-gray-900/20",
  },
  {
    label: "Busy",
    icon: Sun,
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    label: "In Meeting",
    icon: Video,
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    label: "Remote",
    icon: Home,
    color: "bg-cyan-500",
    textColor: "text-cyan-600 dark:text-cyan-400",
    lightBg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    label: "Deep Work",
    icon: Target,
    color: "bg-indigo-600",
    textColor: "text-indigo-600 dark:text-indigo-400",
    lightBg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    label: "Personal",
    icon: User,
    color: "bg-pink-500",
    textColor: "text-pink-600 dark:text-pink-400",
    lightBg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    label: "Traveling",
    icon: Plane,
    color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    lightBg: "bg-amber-50 dark:bg-amber-900/20",
  },
];

export const getStatusInfo = (statusLabel) => {
  const status = STATUS_OPTIONS.find(
    (opt) =>
      opt.label.toLowerCase() === (statusLabel || "On Work").toLowerCase(),
  );
  return status || STATUS_OPTIONS[0];
};
