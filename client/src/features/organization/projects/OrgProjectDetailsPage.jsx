import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Share2,
  Plus,
  MoreHorizontal,
  Search,
  Calendar,
  Clock,
  Paperclip,
  MessageSquare,
  Check,
  CheckSquare,
  Filter,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Download,
  Layers,
  CreditCard,
  Users,
  FileText,
  ChevronDown,
  PieChart,
  Briefcase,
  DollarSign,
  X,
  ExternalLink,
  Edit2,
  Trash2,
  Save,
  Cloud,
  FileSpreadsheet,
  Archive,
  Image as ImageIcon,
  AlertCircle,
  Flag,
  Play,
  Pause,
  MoreVertical,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";
import taskService from "../../../services/taskService";
import fileAssetService from "../../../services/fileAssetService";
import { isBefore, isToday, isTomorrow, startOfDay, format } from "date-fns";
import { OrgTaskDrawer } from "./components/OrgTaskDrawer";
import { OrgProjectFileDrawer } from "./components/OrgProjectFileDrawer";
import { OrgExpenseDrawer } from "./components/OrgExpenseDrawer";
import { OrgProjectActivityLog } from "./components/OrgProjectActivityLog";
import { OrgProjectFinancials } from "./components/OrgProjectFinancials";
import { OrgProjectOverviewTab } from "./components/OrgProjectOverviewTab";
import { OrgProjectMembersTab } from "./components/OrgProjectMembersTab";
import orgProjectService from "../../../services/organization/orgProjectService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { OrgCreateProjectModal } from "./components/OrgCreateProjectModal";
import { Dropdown, DropdownItem } from "../../../components/ui/Dropdown";
import { FileDetailModal } from "../../../components/files/FileDetailModal";
import { useAuth } from "../../../context/AuthContext";

const STATUS_STYLES = {
  Active:
    "bg-emerald-50/50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30",
  Planning:
    "bg-amber-50/50 text-amber-600 border-amber-200/50 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30",
  Completed:
    "bg-indigo-50/50 text-indigo-600 border-indigo-200/50 dark:bg-indigo-900/10 dark:text-indigo-400 dark:border-indigo-900/30",
  "On Hold":
    "bg-rose-50/50 text-rose-600 border-rose-200/50 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/30",
  DEFAULT:
    "bg-gray-50 text-gray-600 border-gray-200/60 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/50",
};

const MotionCard = motion.create(Card);

// Removed Mock Data for Work

// Removed Mock Data for Financials

export function OrgProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  // --- Task Management Logic ---
  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isOrgTaskDrawerOpen, setIsOrgTaskDrawerOpen] = useState(false);
  const [isOrgTaskDrawerReadOnly, setIsOrgTaskDrawerReadOnly] = useState(false);
  const [isOrgExpenseDrawerOpen, setIsOrgExpenseDrawerOpen] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState("All");
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  // --- Project Action States ---
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await taskService.getTasksByProject(id);
      setTasks(data);
      setSelectedTask((prevTask) => {
        if (!prevTask) return null;
        const updated = data.find((t) => t.id === prevTask.id);
        return updated ? { ...updated } : prevTask;
      });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsOrgTaskDrawerReadOnly(false);
    setIsOrgTaskDrawerOpen(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsOrgTaskDrawerReadOnly(true);
    setIsOrgTaskDrawerOpen(true);
  };

  // Determine user's role in the project
  const currentUserMember = projectMembers.find((m) => m.user_id === user?.id);
  const orgRole = currentUserMember?.org_role?.toUpperCase();
  const isManager =
    ["owner", "admin"].includes(currentUserMember?.project_role) ||
    ["FOUNDER", "CO-FOUNDER", "ADMIN", "OWNER"].includes(orgRole) ||
    !!currentUserMember?.is_team_lead;

  const fetchMembers = useCallback(async () => {
    if (!id) return;
    try {
      const res = await orgProjectService.getProjectMembers(id);
      setProjectMembers(Array.isArray(res) ? res : res.members || []);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "Work") {
      fetchTasks();
    }
  }, [activeTab, fetchTasks]);

  useEffect(() => {
    fetchMembers();
  }, [id, fetchMembers]);

  const filteredTasks = tasks
    .filter((task) => {
      const mainMatch = task.title
        .toLowerCase()
        .includes(taskSearchQuery.toLowerCase());
      const priorityMatch =
        taskPriorityFilter === "All" || task.priority === taskPriorityFilter;
      const categoryMatch =
        taskCategoryFilter === "All" || task.category === taskCategoryFilter;
      return mainMatch && priorityMatch && categoryMatch;
    })
    .sort((a, b) => {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      const aPrio = priorityOrder[a.priority] ?? 99;
      const bPrio = priorityOrder[b.priority] ?? 99;
      return aPrio - bPrio;
    });

  const uniqueCategories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean)),
  ).sort();

  // Group tasks by timeline
  const groupedTasks = () => {
    const todayStart = startOfDay(new Date());

    if (isArchiveMode) {
      // ARCHIVE MODE: strictly Yesterday and older
      const archMap = new Map();
      const archiveFiltered = filteredTasks.filter((t) => {
        const isDone = t.kanban_status === "done";
        if (!isDone) return false;

        if (t.due_date) {
          // Scheduled: Must be before today
          return isBefore(startOfDay(new Date(t.due_date)), todayStart);
        } else {
          // Unscheduled: Must have been completed before today
          const completedAt = t.updated_at ? new Date(t.updated_at) : null;
          return completedAt && isBefore(startOfDay(completedAt), todayStart);
        }
      });

      // Sort by date descending (Newest Past -> Oldest Past)
      archiveFiltered.sort((a, b) => {
        const dateA = a.due_date
          ? new Date(a.due_date)
          : new Date(a.updated_at);
        const dateB = b.due_date
          ? new Date(b.due_date)
          : new Date(b.updated_at);
        return dateB - dateA;
      });

      archiveFiltered.forEach((task) => {
        const dateKey = task.due_date
          ? format(new Date(task.due_date), "EEE, MMM dd, yyyy").toUpperCase()
          : task.updated_at
            ? format(
                new Date(task.updated_at),
                "EEE, MMM dd, yyyy",
              ).toUpperCase()
            : "NO DATE";
        if (!archMap.has(dateKey)) archMap.set(dateKey, []);
        archMap.get(dateKey).push(task);
      });

      return Array.from(archMap.entries());
    }

    // ACTIVE MODE: Today, Tomorrow, Future, and Overdue
    const groups = {
      OVERDUE: [],
      TODAY: [],
      TOMORROW: [],
    };

    const futureMap = new Map();

    // Sort active tasks by date ascending
    const activeTasks = [...filteredTasks].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

    activeTasks.forEach((task) => {
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      const isDone = task.kanban_status === "done";

      const isCompletedToday =
        isDone && task.updated_at && isToday(new Date(task.updated_at));

      // 1. If it's done and NOT completed today -> it belongs in Archive, so skip it here.
      if (isDone && !isCompletedToday) {
        return;
      }

      // At this point, task is either INCOMPLETE, or COMPLETED TODAY.

      if (!dueDate) {
        // Unscheduled go to TODAY (whether incomplete or done today)
        groups.TODAY.push(task);
        return;
      }

      const dueDateStart = startOfDay(dueDate);

      // Overdue Logic: Due date is in the past
      if (isBefore(dueDateStart, todayStart)) {
        if (isCompletedToday) {
          // It was overdue, but completed today -> Show in TODAY
          groups.TODAY.push(task);
        } else {
          // It is overdue and incomplete -> Show in OVERDUE
          groups.OVERDUE.push(task);
        }
      }
      // Today Logic: Due date is today
      else if (isToday(dueDate)) {
        groups.TODAY.push(task);
      }
      // Tomorrow Logic: Due date is tomorrow
      else if (isTomorrow(dueDate)) {
        groups.TOMORROW.push(task);
      }
      // Future Logic: Due date is further in the future
      else {
        const dateKey = format(dueDate, "EEE, MMM dd, yyyy").toUpperCase();
        if (!futureMap.has(dateKey)) futureMap.set(dateKey, []);
        futureMap.get(dateKey).push(task);
      }
    });

    return [
      ["OVERDUE", groups.OVERDUE],
      ["TODAY", groups.TODAY],
      ["TOMORROW", groups.TOMORROW],
      ...Array.from(futureMap.entries()),
    ];
  };

  const timelineGroups = groupedTasks();
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [columnCount, setColumnCount] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumnCount(1);
      else if (window.innerWidth < 1024) setColumnCount(2);
      else setColumnCount(3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // File Assets State
  const [fileAssets, setFileAssets] = useState([]);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [fileSortBy, setFileSortBy] = useState("newest");

  // UI States for File Actions
  const [deleteConfirmModalAsset, setDeleteConfirmModalAsset] = useState(null);
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [selectedDetailAsset, setSelectedDetailAsset] = useState(null);

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const getFileIcon = (asset) => {
    if (asset.isExternal) {
      const url = asset.storageUrl?.toLowerCase() || "";
      if (url.includes("drive.google.com"))
        return <Cloud className="h-5 w-5 text-blue-500" />;
      if (url.includes("dropbox.com"))
        return <Layers className="h-5 w-5 text-blue-600" />;
      return <ExternalLink className="h-5 w-5 text-text-tertiary" />;
    }
    const mime = asset.mimeType?.toLowerCase() || "";
    if (mime.includes("image"))
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    if (mime.includes("pdf"))
      return <FileText className="h-5 w-5 text-red-500" />;
    if (
      mime.includes("spreadsheet") ||
      mime.includes("excel") ||
      mime.includes("csv")
    ) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    }
    if (mime.includes("zip") || mime.includes("compressed")) {
      return <Archive className="h-5 w-5 text-yellow-500" />;
    }
    return <FileText className="h-5 w-5 text-text-tertiary" />;
  };

  const fetchFileAssets = async (projectId) => {
    try {
      const data = await fileAssetService.getFileAssets(
        "project",
        parseInt(projectId),
      );
      setFileAssets(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load project files");
    }
  };

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orgProjectService.getProjectById(id);
      setProject(data);
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchTasks();
      fetchFileAssets(id);
    }
  }, [id, fetchProjectDetails, fetchTasks]);

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await orgProjectService.deleteProject(id);
      toast.success("Project deleted successfully");
      navigate("/org/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleDeleteFile = (e, asset) => {
    e.stopPropagation();
    setDeleteConfirmModalAsset(asset);
  };

  const _confirmDeleteFile = async () => {
    if (!deleteConfirmModalAsset) return;
    try {
      await fileAssetService.deleteFileAsset(deleteConfirmModalAsset.id);
      toast.success("Attachment deleted");
      fetchFileAssets(id);
      setDeleteConfirmModalAsset(null);
      setSelectedDetailAsset(null); // Close detail modal if open for this asset
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete attachment");
    }
  };

  const handleDownloadFile = async (e, asset) => {
    e.stopPropagation();
    if (asset.isExternal) {
      window.open(asset.storageUrl, "_blank");
    } else {
      window.location.href = fileAssetService.getDownloadUrl(asset.id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-background-dark overflow-y-auto p-6 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-background-dark overflow-y-auto p-6 items-center justify-center">
        <p className="text-text-secondary">Project not found.</p>
        <Button onClick={() => navigate("/org/projects")} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }
  const handleOverviewAction = (action) => {
    switch (action) {
      case "NewTask":
        setSelectedTask(null);
        setIsOrgTaskDrawerReadOnly(false);
        setIsOrgTaskDrawerOpen(true);
        break;
      case "NewExpense":
        setIsOrgExpenseDrawerOpen(true);
        break;
      case "UploadFile":
        setIsUploadDrawerOpen(true);
        break;
      case "NewActivity":
        setActiveTab("Activity");
        // We'll let the user click 'Log Milestone' inside the activity tab for now,
        // or we could add a ref to trigger it. Just opening the tab is fine.
        break;
      default:
        setActiveTab(action); // Handles "Work", "Financials", "Files", "Activity"
    }
  };

  const projectDescription = project.description || "No description provided.";
  const canManageProjectData = true; // Placeholder for actual permission check

  // Calculate dynamic progress
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(
    (t) => t.kanban_status === "done",
  ).length;
  const dynamicProgress =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar">
      {/* ─── Project Header ─── */}
      <div className="mx-6 mt-6 mb-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm z-10 overflow-hidden shrink-0">
        {/* Top Section: Title, Status, Description, Actions */}
        <div className="flex items-start justify-between gap-4 px-8 pt-5 pb-4">
          {/* Left: Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
                {project.title || "Untitled Project"}
              </h1>
              <Badge
                variant="neutral"
                className={cn(
                  "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest shrink-0 border",
                  STATUS_STYLES[project.status] || STATUS_STYLES.DEFAULT,
                )}
              >
                {project.status || "Active"}
              </Badge>
            </div>
            <div className="mt-1.5 w-full">
              <p
                className={cn(
                  "text-sm text-text-secondary dark:text-gray-400 leading-relaxed",
                  !isDescExpanded && "line-clamp-1",
                )}
              >
                {projectDescription}
              </p>
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
              >
                {isDescExpanded ? "Show less" : "Show more"}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-300",
                    isDescExpanded && "rotate-180",
                  )}
                />
              </button>
            </div>
          </div>
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {isManager && (
              <>
                <button
                  onClick={() => setIsEditProjectModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all active:scale-95 text-xs font-bold"
                  title="Edit Project"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-tertiary hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all active:scale-95 text-xs font-bold"
                  title="Delete Project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* ─── Meta-Data Strip ─── */}
        <div className="grid grid-cols-4 border-t border-b border-border-light/60 dark:border-border-dark/60 bg-gray-50/60 dark:bg-gray-800/20">
          {/* Start Date */}
          <div className="col-span-1 flex items-center gap-3 px-8 py-3 border-r border-border-light/40 dark:border-border-dark/40">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">
                Start Date
              </p>
              <p className="text-xs font-bold text-text-primary dark:text-white mt-0.5">
                {project.start_date
                  ? new Date(project.start_date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3 px-8 py-3 border-r border-border-light/40 dark:border-border-dark/40">
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5 text-warning" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">
                Due Date
              </p>
              <p className="text-xs font-bold text-text-primary dark:text-white mt-0.5">
                {project.due_date
                  ? new Date(project.due_date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="col-span-2 flex items-center gap-3 px-8 py-3">
            <div
              className={cn(
                "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center",
                dynamicProgress === 100 ? "bg-success/10" : "bg-primary/10",
              )}
            >
              <Flag
                className={cn(
                  "h-3.5 w-3.5",
                  dynamicProgress === 100 ? "text-success" : "text-primary",
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">
                  Progress
                  {totalTasksCount === 0 && (
                    <span className="ml-1 font-normal normal-case text-text-tertiary tracking-normal text-[9px]">
                      (no tasks)
                    </span>
                  )}
                </p>
                <span
                  className={cn(
                    "text-[11px] font-black transition-colors",
                    dynamicProgress === 100 ? "text-success" : "text-primary",
                  )}
                >
                  {dynamicProgress === 100
                    ? "100% ✓ Done"
                    : `${dynamicProgress}%`}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    dynamicProgress === 100
                      ? "bg-success"
                      : "bg-linear-to-r from-primary to-blue-400",
                  )}
                  style={{ width: `${dynamicProgress}%` }}
                />
              </div>
              <p className="text-[9px] text-text-tertiary mt-1">
                {completedTasksCount} of {totalTasksCount} tasks done
              </p>
            </div>
          </div>
        </div>

        {/* ─── Control Bar: Back + Tabs + New Task ─── */}
        <div className="flex items-center justify-between px-8 py-2.5">
          <button
            onClick={() => navigate("/org/projects")}
            className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors text-[11px] font-black uppercase tracking-wider group shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back To Projects
          </button>

          <nav className="flex items-center gap-0.5">
            {[
              "Overview",
              "Work",
              "Financials",
              "Activity",
              "Files",
              "Members",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsOrgTaskDrawerReadOnly(false);
              setIsOrgTaskDrawerOpen(true);
            }}
            disabled={!isManager}
            className={cn(
              "group relative flex items-center gap-1.5 h-8 px-4 text-[11px] font-black tracking-widest text-white transition-all overflow-hidden rounded-lg shrink-0",
              isManager
                ? "shadow-sm shadow-primary/30 active:scale-95 cursor-pointer"
                : "opacity-40 grayscale cursor-not-allowed shadow-none",
            )}
            title={
              !isManager
                ? "Only Founders, Admins, and Team Leads can create tasks"
                : "Create New Task"
            }
          >
            <div
              className={cn(
                "absolute inset-0 transition-colors duration-200",
                isManager
                  ? "bg-primary group-hover:bg-primary-hover"
                  : "bg-text-tertiary",
              )}
            />
            <div className="relative flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 stroke-[3px]" />
              <span>NEW TASK</span>
            </div>
          </button>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="w-full p-6">
        {/* --- WORK VIEW --- */}
        {activeTab === "Work" && (
          <div className="flex flex-col gap-6">
            {/* Board Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2 items-center justify-between px-2">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Archive Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg border border-border-light dark:border-border-dark shrink-0">
                  <button
                    onClick={() => setIsArchiveMode(false)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all",
                      !isArchiveMode
                        ? "bg-white dark:bg-surface-dark text-primary shadow-xs"
                        : "text-text-tertiary hover:text-text-secondary",
                    )}
                  >
                    Current
                  </button>
                  <button
                    onClick={() => setIsArchiveMode(true)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all",
                      isArchiveMode
                        ? "bg-white dark:bg-surface-dark text-success shadow-xs"
                        : "text-text-tertiary hover:text-text-secondary",
                    )}
                  >
                    Archive
                  </button>
                </div>

                <div className="relative w-full sm:w-40 shrink-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <select
                    value={taskCategoryFilter}
                    onChange={(e) => setTaskCategoryFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                </div>

                <div className="relative w-full sm:w-40 shrink-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <select
                    value={taskPriorityFilter}
                    onChange={(e) => setTaskPriorityFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Critical">Critical Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8 space-y-8 mt-4">
              {timelineGroups.every(([, tasks]) => tasks.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-tertiary bg-white/40 dark:bg-surface-dark/40 rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark">
                  <Archive className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-bold">No tasks found</p>
                  <p className="text-sm">
                    Try adjusting your filters or search query.
                  </p>
                </div>
              ) : (
                timelineGroups.map(([groupName, groupTasks]) => {
                  if (groupTasks.length === 0) return null;

                  const isOverdue = groupName === "OVERDUE";
                  const isToday = groupName === "TODAY";
                  const isTomorrow = groupName === "TOMORROW";
                  const isArchiveHeader = isArchiveMode;

                  return (
                    <div key={groupName} className="space-y-4">
                      <div className="flex items-center gap-3">
                        {isOverdue && (
                          <AlertCircle className="h-5 w-5 text-error" />
                        )}
                        {isToday && (
                          <Calendar className="h-5 w-5 text-primary" />
                        )}
                        {isTomorrow && (
                          <Calendar className="h-5 w-5 text-indigo-400" />
                        )}
                        {isArchiveHeader && (
                          <Archive className="h-5 w-5 text-success" />
                        )}
                        {!isOverdue &&
                          !isToday &&
                          !isTomorrow &&
                          !isArchiveHeader && (
                            <Calendar className="h-5 w-5 text-text-tertiary" />
                          )}
                        <h3
                          className={cn(
                            "text-sm font-bold tracking-wider",
                            isOverdue
                              ? "text-error"
                              : isArchiveHeader
                                ? "text-success"
                                : isToday
                                  ? "text-text-primary dark:text-white"
                                  : "text-text-secondary dark:text-gray-400",
                          )}
                        >
                          {groupName}{" "}
                          <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-text-tertiary px-2 py-0.5 rounded-full text-xs">
                            {groupTasks.length}
                          </span>
                        </h3>
                      </div>

                      <div className="flex gap-6 items-start">
                        {Array.from({ length: columnCount }).map(
                          (_, colIdx) => {
                            const colTasks = groupTasks.filter(
                              (_, idx) => idx % columnCount === colIdx,
                            );
                            if (colTasks.length === 0) return null;

                            return (
                              <div
                                key={colIdx}
                                className="flex-1 flex flex-col gap-6"
                              >
                                {colTasks.map((task) => (
                                  <ProjectTaskListItem
                                    key={task.id}
                                    task={task}
                                    projectMembers={projectMembers}
                                    onEdit={() => handleEditTask(task)}
                                    onView={() => handleViewTask(task)}
                                    onDelete={async () => {
                                      if (window.confirm("Delete this task?")) {
                                        await taskService.deleteTask(
                                          id,
                                          task.id,
                                        );
                                        fetchTasks();
                                      }
                                    }}
                                    onToggleComplete={async () => {
                                      const newStatus =
                                        task.kanban_status === "done"
                                          ? "todo"
                                          : "done";
                                      await taskService.updateTask(
                                        id,
                                        task.id,
                                        {
                                          kanban_status: newStatus,
                                        },
                                      );
                                      fetchTasks();
                                    }}
                                    onTaskUpdate={(updatedProps) => {
                                      setTasks((prev) =>
                                        prev.map((t) =>
                                          t.id === task.id
                                            ? { ...t, ...updatedProps }
                                            : t,
                                        ),
                                      );
                                      setSelectedTask((prev) =>
                                        prev?.id === task.id
                                          ? { ...prev, ...updatedProps }
                                          : prev,
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- FINANCIALS VIEW --- */}
        {activeTab === "Financials" && <OrgProjectFinancials projectId={id} />}

        {/* --- ACTIVITY VIEW --- */}
        {activeTab === "Activity" && <OrgProjectActivityLog projectId={id} />}

        {/* --- FILES VIEW --- */}
        {activeTab === "Files" && (
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-text-primary dark:text-white shrink-0">
                  Project Files
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-40 shrink-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <select
                    value={fileSortBy}
                    onChange={(e) => setFileSortBy(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="a-z">A-Z Name</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                </div>
                <Button
                  onClick={() => setIsUploadDrawerOpen(true)}
                  className="gap-2 shadow-md shadow-primary/20 shrink-0 rounded-xl"
                >
                  <Plus className="h-4 w-4" /> Add Attachment
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(() => {
                const filteredAndSortedFiles = fileAssets
                  .filter((f) =>
                    f.fileName
                      .toLowerCase()
                      .includes(fileSearchQuery.toLowerCase()),
                  )
                  .sort((a, b) => {
                    if (fileSortBy === "newest")
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    if (fileSortBy === "oldest")
                      return new Date(a.createdAt) - new Date(b.createdAt);
                    if (fileSortBy === "a-z")
                      return a.fileName.localeCompare(b.fileName);
                    return 0;
                  });

                return (
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      key="upload-btn"
                    >
                      <button
                        onClick={() => setIsUploadDrawerOpen(true)}
                        className="w-full h-full p-3 flex items-center gap-3 rounded-xl border border-dashed border-border-light dark:border-border-dark text-text-tertiary hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group min-h-[64px]"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-surface-dark group-hover:shadow-sm transition-all ring-1 ring-border-light dark:ring-border-dark">
                          <Plus className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                            Upload File
                          </p>
                          <p className="text-[10px] text-text-tertiary">
                            or attach a link
                          </p>
                        </div>
                      </button>
                    </motion.div>

                    {filteredAndSortedFiles.map((asset) => (
                      <MotionCard
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={asset.id}
                        className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group border-border-light dark:border-border-dark bg-white dark:bg-surface-dark relative min-w-[200px]"
                        onClick={() => setSelectedDetailAsset(asset)}
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-tertiary group-hover:bg-primary/10 transition-colors">
                          {getFileIcon(asset)}
                        </div>
                        <div className="flex-1 min-w-0 pr-2 text-left">
                          <p
                            className="text-sm font-bold text-text-primary dark:text-white truncate"
                            title={asset.fileName}
                          >
                            {asset.fileName}
                          </p>
                          <p className="text-[10px] text-text-tertiary truncate mt-0.5">
                            {new Date(asset.createdAt).toLocaleDateString()} •{" "}
                            {asset.isExternal
                              ? "External Link"
                              : formatBytes(asset.sizeBytes)}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          <div
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Dropdown
                              width="w-40"
                              trigger={
                                <button className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors text-text-tertiary hover:text-text-primary">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              }
                            >
                              <DropdownItem
                                icon={
                                  asset.isExternal ? ExternalLink : Download
                                }
                                onClick={(e) => handleDownloadFile(e, asset)}
                              >
                                {asset.isExternal ? "Open Link" : "Download"}
                              </DropdownItem>

                              {canManageProjectData && (
                                <>
                                  <div className="my-1 border-t border-border-light dark:border-border-dark"></div>
                                  <DropdownItem
                                    icon={Edit2}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssetToEdit(asset);
                                      setIsEditDrawerOpen(true);
                                    }}
                                  >
                                    Rename
                                  </DropdownItem>
                                  <DropdownItem
                                    icon={Trash2}
                                    variant="danger"
                                    onClick={(e) => handleDeleteFile(e, asset)}
                                  >
                                    Delete
                                  </DropdownItem>
                                </>
                              )}
                            </Dropdown>
                          </div>
                        </div>
                      </MotionCard>
                    ))}
                  </AnimatePresence>
                );
              })()}
            </div>
          </div>
        )}

        {/* --- OVERVIEW TAB --- */}
        {activeTab === "Overview" && (
          <OrgProjectOverviewTab
            projectId={id}
            project={project}
            fileAssets={fileAssets}
            onActionClick={handleOverviewAction}
          />
        )}
        {activeTab === "Members" && <OrgProjectMembersTab projectId={id} />}
      </div>

      {/* Task Drawer Integration */}
      <OrgTaskDrawer
        isOpen={isOrgTaskDrawerOpen}
        task={selectedTask}
        onClose={() => setIsOrgTaskDrawerOpen(false)}
        onRefresh={fetchTasks}
        isReadOnly={isOrgTaskDrawerReadOnly}
      />

      <OrgProjectFileDrawer
        isOpen={isUploadDrawerOpen || isEditDrawerOpen}
        onClose={() => {
          setIsUploadDrawerOpen(false);
          setIsEditDrawerOpen(false);
          setAssetToEdit(null);
        }}
        contextType="project"
        contextId={id}
        onUploadSuccess={() => fetchFileAssets(id)}
        editAsset={assetToEdit}
      />

      <FileDetailModal
        isOpen={!!selectedDetailAsset}
        onClose={() => setSelectedDetailAsset(null)}
        asset={selectedDetailAsset}
        canManageFiles={canManageProjectData}
        onDownload={handleDownloadFile}
        onEdit={(e, asset) => {
          setAssetToEdit(asset);
          setIsEditDrawerOpen(true);
        }}
        onDelete={handleDeleteFile}
      />

      <OrgExpenseDrawer
        isOpen={isOrgExpenseDrawerOpen}
        onClose={() => setIsOrgExpenseDrawerOpen(false)}
        projectId={id}
        mode="add"
      />

      {/* Project Edit Modal */}
      <OrgCreateProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        projectToEdit={project}
        onProjectCreated={fetchProjectDetails}
      />

      {/* Delete Confirmation Modal (Premium & Sleek) */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-2xl border border-border-light dark:border-border-dark overflow-hidden"
            >
              {/* Decorative background blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-[100px] pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-error/10 flex items-center justify-center text-error mb-6 shadow-xs">
                  <AlertCircle className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-black text-text-primary dark:text-white mb-2">
                  Delete Project?
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-text-primary dark:text-white">
                    "{project.title}"
                  </span>
                  ? This action is permanent and will delete all associated
                  tasks, files, and financials.
                </p>

                <div className="flex gap-3 w-full">
                  <Button
                    variant="secondary"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="flex-1 h-11 rounded-xl font-bold dark:bg-gray-800 dark:hover:bg-gray-700"
                    disabled={isDeleting}
                  >
                    Keep Project
                  </Button>
                  <Button
                    onClick={handleDeleteProject}
                    isLoading={isDeleting}
                    className="flex-1 h-11 rounded-xl bg-error border-none text-white shadow-lg shadow-error/20 font-bold hover:bg-error/90 active:scale-95 transition-all"
                  >
                    Delete Forever
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub Components for Work ---

const CapsuleProgress = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center px-3 py-1.5 rounded-full border-2 transition-all duration-500",
        percentage === 100
          ? "border-success bg-success/5 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
          : percentage > 0
            ? "border-primary bg-primary/5 shadow-[0_0_10px_rgba(46,107,229,0.1)]"
            : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-xs font-black leading-none",
            percentage > 0
              ? "text-text-primary dark:text-white"
              : "text-text-tertiary",
          )}
        >
          {completed}
        </span>
        <div
          className={cn(
            "w-px h-3 rotate-12",
            percentage > 0 ? "bg-primary/30" : "bg-text-tertiary/20",
          )}
        />
        <span className="text-[10px] font-bold text-text-tertiary leading-none uppercase tracking-tighter">
          {total}
        </span>
      </div>
      {/* Subtle Progress Bar Background for Capsule Fill if desired, but user specifically mentioned "border" just like circle */}
    </div>
  );
};

function ProjectTaskListItem({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onRefresh,
  onTaskUpdate,
  onView,
  projectMembers,
  isManager,
}) {
  const { user } = useAuth();
  const isDone = task.kanban_status === "done";

  const assigneeId = task.assignee_ids?.[0];
  const isAssignee = assigneeId === user?.id;

  // A user can fully manage the task if they are project manager or if they created the task
  const canManageTask = isManager || task.created_by === user?.id;

  const assignee = projectMembers?.find((m) => m.user_id === assigneeId);

  const priorityColors = {
    Critical:
      "text-red-600 bg-red-600/10 border-red-600/20 shadow-sm shadow-red-500/20",
    High: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    Medium: "text-success bg-success/10 border-success/20",
    Low: "text-blue-600 bg-blue-600/10 border-blue-600/20",
  };

  // Time Tracking Logic
  const [baseTimeSpent, setBaseTimeSpent] = useState(
    parseInt(task.time_spent) || 0,
  );
  const [liveTimeSpent, setLiveTimeSpent] = useState(
    parseInt(task.time_spent) || 0,
  );
  const [isTimerRunning, setIsTimerRunning] = useState(!!task.timer_started_at);
  const [activeTimerStart, setActiveTimerStart] = useState(
    task.timer_started_at,
  );
  const [localSubtasks, setLocalSubtasks] = useState(
    Array.isArray(task.subtasks) ? task.subtasks : [],
  );
  const [prevTaskState, setPrevTaskState] = useState({
    timeSpent: task.time_spent,
    timerStartedAt: task.timer_started_at,
    subtasks: task.subtasks,
  });

  if (
    task.time_spent !== prevTaskState.timeSpent ||
    task.timer_started_at !== prevTaskState.timerStartedAt ||
    task.subtasks !== prevTaskState.subtasks
  ) {
    setPrevTaskState({
      timeSpent: task.time_spent,
      timerStartedAt: task.timer_started_at,
      subtasks: task.subtasks,
    });
    setBaseTimeSpent(parseInt(task.time_spent) || 0);
    setLiveTimeSpent(parseInt(task.time_spent) || 0);
    setIsTimerRunning(!!task.timer_started_at);
    setActiveTimerStart(task.timer_started_at);
    setLocalSubtasks(Array.isArray(task.subtasks) ? task.subtasks : []);
  }

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && activeTimerStart) {
      const start = new Date(activeTimerStart).getTime();
      if (!isNaN(start) && start > 0) {
        interval = setInterval(() => {
          const now = Date.now();
          let elapsedSeconds = Math.floor((now - start) / 1000);
          if (elapsedSeconds > 86400) {
            elapsedSeconds = 86400; // Cap visual timer at 24h
          }
          setLiveTimeSpent(baseTimeSpent + elapsedSeconds);
        }, 1000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimerStart, baseTimeSpent]);

  const handleToggleTimer = async () => {
    const nowISO = new Date().toISOString();
    let newTimeSpent = baseTimeSpent;
    let newTimerStartedAt = null;
    let parsedLogs = [];
    if (typeof task.time_logs === "string") {
      try {
        parsedLogs = JSON.parse(task.time_logs);
      } catch (err) {
        console.error("Failed to parse time_logs:", err);
      }
    } else if (Array.isArray(task.time_logs)) {
      parsedLogs = task.time_logs;
    }
    let newTimeLogs = [...parsedLogs];

    console.log("[Timer Debug] Toggling timer. Current state:", {
      isTimerRunning,
      activeTimerStart,
      newTimeSpent,
      timeLogsLength: newTimeLogs.length,
    });

    if (isTimerRunning) {
      // Stopping timer
      let elapsed = 0;
      if (activeTimerStart) {
        const startTs = new Date(activeTimerStart).getTime();
        console.log(
          "[Timer Debug] startTs:",
          startTs,
          "Date.now():",
          Date.now(),
        );
        if (!isNaN(startTs) && startTs > 0) {
          elapsed = Math.floor((Date.now() - startTs) / 1000);
          if (elapsed > 86400) elapsed = 86400; // Cap saved duration at 24h
          console.log("[Timer Debug] Calculated elapsed seconds:", elapsed);

          if (elapsed >= 0) {
            // Append new session to the beginning of the log
            const sessionLog = {
              id: `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Ensure a unique ID for React keys safely
              start_time: new Date(activeTimerStart).toISOString(),
              end_time: nowISO,
              duration_seconds: elapsed,
              user_id: user?.id,
              user_name: user
                ? `${user.first_name} ${user.last_name}`.trim()
                : "Unknown",
            };
            console.log("[Timer Debug] Appending new session log:", sessionLog);
            newTimeLogs.unshift(sessionLog);
          }
        }
      }
      newTimeSpent += Math.max(0, elapsed); // Prevent negative time
      console.log("[Timer Debug] Computed newTimeSpent:", newTimeSpent);
    } else {
      // Starting timer
      newTimerStartedAt = nowISO;
      console.log("[Timer Debug] Starting timer at:", newTimerStartedAt);
    }

    // Optimistic update
    setBaseTimeSpent(newTimeSpent);
    setIsTimerRunning(!isTimerRunning);
    setActiveTimerStart(newTimerStartedAt);
    setLiveTimeSpent(newTimeSpent);
    if (onTaskUpdate) {
      onTaskUpdate({
        time_spent: newTimeSpent,
        timer_started_at: newTimerStartedAt,
        time_logs: newTimeLogs,
      });
    }

    console.log("[Timer Debug] Sending payload to server:", {
      time_spent: newTimeSpent,
      timer_started_at: newTimerStartedAt,
      time_logs: newTimeLogs,
    });

    try {
      await taskService.updateTask(task.project_id, task.id, {
        time_spent: newTimeSpent,
        timer_started_at: newTimerStartedAt,
        time_logs: newTimeLogs,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update timer");
      setIsTimerRunning(!!task.timer_started_at);
      setActiveTimerStart(task.timer_started_at);
      setLiveTimeSpent(task.time_spent || 0);
    }
  };

  const formatTime = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleToggleSubtask = async (subtaskId) => {
    const updatedSubtasks = localSubtasks.map((st) =>
      st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st,
    );

    // Optimistic Update
    setLocalSubtasks(updatedSubtasks);

    try {
      await taskService.updateTask(task.project_id, task.id, {
        subtasks: updatedSubtasks,
      });
      // No need to refresh full list if we are confident, but might be good for total progress
    } catch (err) {
      console.error("Failed to update subtask:", err);
      toast.error("Failed to update subtask");
      setLocalSubtasks(Array.isArray(task.subtasks) ? task.subtasks : []);
    }
  };

  const completedSubtasks = localSubtasks.filter(
    (st) => st.is_completed,
  ).length;
  const totalSubtasks = localSubtasks.length;

  const timeLogged = formatTime(liveTimeSpent);

  const dueTime = task.due_date
    ? format(new Date(task.due_date), "hh:mm a")
    : "No Time";

  return (
    <div
      onDoubleClick={(e) => {
        e.preventDefault();
        onView?.();
      }}
      className={cn(
        "group relative flex flex-col p-4 bg-white dark:bg-surface-dark rounded-xl border-2 transition-all min-h-[140px] h-fit cursor-default",
        isDone
          ? "border-border-light dark:border-border-dark opacity-60"
          : "border-border-light dark:border-border-dark hover:border-primary/40 focus-within:border-primary/60",
        "hover:shadow-md",
      )}
    >
      {/* Active Left Border Accent */}
      {!isDone && (
        <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Top Row: Checkbox, Title, Priority Flag */}
      <div className="flex items-start gap-4">
        {/* Main Checkbox - Premium Custom Design */}
        <label className="relative flex items-center justify-center shrink-0 mt-1 cursor-pointer group/checkbox z-10">
          <input
            type="checkbox"
            checked={isDone}
            onChange={(e) => {
              if (canManageTask || isAssignee) {
                onToggleComplete();
              } else {
                e.preventDefault();
              }
            }}
            disabled={!(canManageTask || isAssignee)}
            className="peer sr-only"
          />
          <div
            className={cn(
              "h-5.5 w-5.5 rounded-md border-2 transition-all duration-300 flex items-center justify-center",
              "border-border-light dark:border-border-dark bg-white dark:bg-surface-dark group-hover/checkbox:border-primary/50",
              "peer-checked:bg-primary peer-checked:border-primary peer-checked:shadow-[0_0_12px_rgba(46,107,229,0.3)] shadow-xs",
            )}
          >
            <Check
              className={cn(
                "h-3.5 w-3.5 text-white transition-all duration-300 stroke-[3.5px]",
                isDone ? "scale-100 opacity-100" : "scale-50 opacity-0",
              )}
            />
          </div>
        </label>

        <div className="flex-1 min-w-0 pr-8">
          <h4
            className={cn(
              "text-[15px] font-bold text-text-primary dark:text-white leading-tight truncate mb-1 transition-all duration-300",
              isDone &&
                "text-text-tertiary decoration-text-tertiary/40 line-through",
            )}
            title={task.title}
          >
            {task.title}
          </h4>
          <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-1 leading-relaxed">
            {task.description || "No description provided."}
          </p>

          {/* Subtasks Checklist Indicator */}
          {totalSubtasks > 0 && (
            <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark/50 border-dashed flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="grid grid-cols-1 gap-1.5">
                  {localSubtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-2.5 group/st"
                    >
                      <label className="relative flex items-center justify-center shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={st.is_completed}
                          onChange={() => {
                            if (canManageTask || isAssignee) {
                              handleToggleSubtask(st.id);
                            }
                          }}
                          disabled={!(canManageTask || isAssignee)}
                          className="peer sr-only"
                        />
                        <div
                          className={cn(
                            "h-4 w-4 rounded-sm border-2 transition-all duration-200 flex items-center justify-center",
                            "border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark group-hover/st:border-primary/50",
                            "peer-checked:bg-primary peer-checked:border-primary",
                          )}
                        >
                          <Check
                            className={cn(
                              "h-2.5 w-2.5 text-white transition-all duration-200 stroke-[4px]",
                              st.is_completed
                                ? "scale-100 opacity-100"
                                : "scale-50 opacity-0",
                            )}
                          />
                        </div>
                      </label>
                      <span
                        className={cn(
                          "text-[12.5px] font-medium transition-all duration-200 truncate max-w-[200px]",
                          st.is_completed
                            ? "text-text-tertiary line-through decoration-text-tertiary/30"
                            : "text-text-secondary dark:text-gray-300 group-hover/st:text-text-primary dark:group-hover/st:text-white",
                        )}
                        title={st.title}
                      >
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center">
                <CapsuleProgress
                  completed={completedSubtasks}
                  total={totalSubtasks}
                />
              </div>
            </div>
          )}
        </div>

        <div className="absolute right-4 top-4">
          <Flag
            className={cn(
              "h-4 w-4 fill-current",
              priorityColors[task.priority]?.split(" ")[0] ||
                "text-text-tertiary",
            )}
          />
        </div>
      </div>

      {/* Bottom Row: Tags & Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light dark:border-border-dark/50 border-dashed">
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Logged Pill */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-border-light dark:border-border-dark text-[11px] font-semibold text-text-secondary">
            <Clock className="h-3 w-3 text-text-tertiary" /> {timeLogged}
          </div>

          {/* Due Time Pill */}
          {task.due_date && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-border-light dark:border-border-dark text-[11px] font-semibold text-text-secondary">
              <Calendar className="h-3 w-3 text-text-tertiary" /> {dueTime}
            </div>
          )}

          {/* Category Badge */}
          {task.category && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-md text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <Layers className="h-3 w-3 shrink-0" />
              <span className="truncate">{task.category}</span>
            </div>
          )}

          {/* Assignee Pill */}
          {assignee && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-border-light dark:border-border-dark shadow-sm"
              title={`Assigned to ${assignee.first_name} ${assignee.last_name}`}
            >
              <Avatar
                src={assignee.profile_picture_url}
                fallback={assignee.first_name?.charAt(0) || "U"}
                size="xs"
                className="h-4 w-4 text-[9px]"
              />
              <span className="text-[11px] font-semibold text-text-secondary line-clamp-1 max-w-[80px]">
                {assignee.first_name}
              </span>
            </div>
          )}
        </div>

        {/* Hover Actions */}
        <div
          className={cn(
            "flex items-center gap-1 transition-opacity pl-2",
            isTimerRunning
              ? "opacity-100 bg-white dark:bg-surface-dark"
              : "opacity-0 group-hover:opacity-100 bg-white dark:bg-surface-dark",
          )}
        >
          {isAssignee && (
            <button
              onClick={handleToggleTimer}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isTimerRunning
                  ? "text-warning hover:bg-warning/10"
                  : "text-success hover:bg-success/10",
              )}
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4 fill-warning animate-pulse" />
              ) : (
                <Play className="h-4 w-4 fill-success" />
              )}
            </button>
          )}

          <button
            onClick={onView}
            className="p-1.5 text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="View Details"
          >
            <ExternalLink className="h-4 w-4" />
          </button>

          {canManageTask && (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Edit Task"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-text-tertiary hover:bg-error/10 hover:text-error rounded-md transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
