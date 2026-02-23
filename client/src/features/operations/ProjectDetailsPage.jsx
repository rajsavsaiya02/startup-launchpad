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
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { cn } from "../../utils/cn";
import taskService from "../../services/taskService";
import fileAssetService from "../../services/fileAssetService";
import { isBefore, isToday, isTomorrow, startOfDay, format } from "date-fns";
import { TaskDrawer } from "./components/TaskDrawer";
import { ProjectFileDrawer } from "./components/ProjectFileDrawer";
import { ExpenseDrawer } from "./components/ExpenseDrawer";
import { ProjectActivityLog } from "./components/ProjectActivityLog";
import { ProjectFinancials } from "./components/ProjectFinancials";
import { ProjectOverviewTab } from "./components/ProjectOverviewTab";
import projectService from "../../services/projectService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MotionCard = motion.create(Card);

// Removed Mock Data for Work

// Removed Mock Data for Financials

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  // --- Task Management Logic ---
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState("All");
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    try {
      const data = await taskService.getTasksByProject(id);
      setTasks(data);
      setSelectedTask((prevTask) => {
        if (!prevTask) return null;
        const updated = data.find((t) => t.id === prevTask.id);
        return updated ? { ...updated } : prevTask;
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "Work") {
      fetchTasks();
    }
  }, [activeTab, fetchTasks]);

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
  const [isFileDrawerOpen, setIsFileDrawerOpen] = useState(false);
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
  const [editingFileAsset, setEditingFileAsset] = useState(null);
  const [editFileNameValue, setEditFileNameValue] = useState("");

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

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data);
      } catch (error) {
        console.error("Failed to fetch project details:", error);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProjectDetails();
      fetchFileAssets(id);
    }
  }, [id]);

  const handleDeleteFile = (e, asset) => {
    e.stopPropagation();
    setDeleteConfirmModalAsset(asset);
  };

  const confirmDeleteFile = async () => {
    if (!deleteConfirmModalAsset) return;
    try {
      await fileAssetService.deleteFileAsset(deleteConfirmModalAsset.id);
      toast.success("Attachment deleted");
      fetchFileAssets(id);
      setDeleteConfirmModalAsset(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete attachment");
    }
  };

  const handleUpdateFileName = async (assetId) => {
    try {
      if (!editFileNameValue.trim()) {
        toast.error("File name cannot be empty");
        return;
      }
      await fileAssetService.updateFileAsset(assetId, editFileNameValue);
      toast.success("Attachment updated");
      setEditingFileAsset(null);
      fetchFileAssets(id);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update attachment");
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
        <Button
          onClick={() => navigate("/productivity/projects")}
          className="mt-4"
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  const handleOverviewAction = (action) => {
    switch (action) {
      case "NewTask":
        setSelectedTask(null);
        setIsTaskDrawerOpen(true);
        break;
      case "NewExpense":
        setIsExpenseDrawerOpen(true);
        break;
      case "UploadFile":
        setIsFileDrawerOpen(true);
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
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-background-dark overflow-y-auto p-6">
      {/* 1. Consolidated Project Header Area */}
      <div className="w-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark shadow-sm rounded-xl mb-6 shrink-0 sticky top-0 z-10 transition-all duration-300">
        <div className="px-6 pt-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 pb-4 border-b border-border-light dark:border-border-dark">
            <div className="flex-1 min-w-0">
              {/* Project Title & Status */}
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-text-primary dark:text-white tracking-tight">
                  {project.title || "Untitled Project"}
                </h1>
                <Badge
                  variant={
                    project.status === "Active"
                      ? "success"
                      : project.status === "Planning"
                        ? "warning"
                        : "default"
                  }
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors"
                >
                  {project.status || "Active"}
                </Badge>
              </div>

              {/* Expandable Description (Smooth Height Transition) */}
              <div className="max-w-5xl">
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    isDescExpanded
                      ? "max-h-[500px] opacity-100"
                      : "max-h-12 opacity-90",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm text-text-secondary dark:text-gray-400 leading-relaxed",
                      !isDescExpanded && "line-clamp-2",
                    )}
                  >
                    {projectDescription}
                  </p>
                </div>
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover mt-3 flex items-center gap-1.5 transition-colors group/btn"
                >
                  <span className="relative">
                    {isDescExpanded ? "Collapse Brief" : "Read Full Brief"}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left" />
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-500",
                      isDescExpanded && "rotate-180",
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Logical Meta-Data Ribbon (Stabilized & Scaled Capsule) */}
            <div className="flex flex-col gap-4 bg-white/60 dark:bg-gray-800/20 px-6 py-4 rounded-2xl border border-border-light dark:border-border-dark shadow-md backdrop-blur-md w-[320px] shrink-0">
              {/* Row 1: Dates & Priority */}
              <div className="flex items-center justify-between gap-8 pb-3 border-b border-border-light/50 dark:border-border-dark/50">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-tight font-black text-text-tertiary">
                    Start Date
                  </span>
                  <span className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2 whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5 text-primary" />{" "}
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "--"}
                  </span>
                </div>
                <div className="h-8 w-px bg-border-light/50 dark:bg-border-dark/50" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-tight font-black text-text-tertiary">
                    Due Date
                  </span>
                  <span className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2 whitespace-nowrap">
                    <Clock className="h-3.5 w-3.5 text-warning" />{" "}
                    {project.due_date
                      ? new Date(project.due_date).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "--"}
                  </span>
                </div>
              </div>

              {/* Row 2: Enhanced & Scaled Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-tight font-black text-text-tertiary">
                    Current Progress
                  </span>
                  <span className="text-xs font-black text-primary">
                    {project.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-primary to-[#60A5FA] h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(46,107,229,0.2)]"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Bar: Navigation, Tabs, and Main Action */}
          <div className="flex items-center justify-between py-3">
            <button
              onClick={() => navigate("/productivity/projects")}
              className="flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors text-xs font-bold group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              BACK TO PROJECTS
            </button>

            <nav className="inline-flex p-1 bg-gray-100/30 dark:bg-gray-800/20 rounded-full border border-border-light dark:border-border-dark overflow-x-auto no-scrollbar">
              {["Overview", "Work", "Financials", "Activity", "Files"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative flex items-center justify-center py-1.5 px-5 text-xs font-bold transition-all duration-200 rounded-full outline-none focus:outline-none whitespace-nowrap tracking-wide",
                      activeTab === tab
                        ? "bg-white dark:bg-surface-dark text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {tab}
                  </button>
                ),
              )}
            </nav>

            <button
              onClick={() => {
                setSelectedTask(null);
                setIsTaskDrawerOpen(true);
              }}
              className="group relative flex items-center gap-2 h-9 px-5 text-xs font-black tracking-widest text-white transition-all duration-300 active:scale-95 overflow-hidden rounded-lg shadow-sm shadow-primary/20"
            >
              {/* Modern Gradient Background */}
              <div className="absolute inset-0 bg-linear-to-r from-primary to-[#4F86ED] transition-transform duration-300 group-hover:scale-105" />
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                <span>NEW TASK</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content Area - Separate Container */}
      <div className="w-full mx-auto">
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
                                    onEdit={() => {
                                      setSelectedTask(task);
                                      setIsTaskDrawerOpen(true);
                                    }}
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
        {activeTab === "Financials" && <ProjectFinancials projectId={id} />}

        {/* --- ACTIVITY VIEW --- */}
        {activeTab === "Activity" && <ProjectActivityLog projectId={id} />}

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
                  onClick={() => setIsFileDrawerOpen(true)}
                  className="gap-2 shadow-md shadow-primary/20 shrink-0"
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
                        onClick={() => setIsFileDrawerOpen(true)}
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
                        className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow cursor-default group border-border-light dark:border-border-dark bg-white dark:bg-surface-dark relative min-w-[200px]"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-tertiary group-hover:bg-primary/10 transition-colors">
                          {getFileIcon(asset)}
                        </div>
                        <div className="flex-1 min-w-0 pr-28 text-left">
                          {editingFileAsset?.id === asset.id ? (
                            <input
                              type="text"
                              autoFocus
                              className="w-full text-sm font-bold text-text-primary dark:text-white bg-transparent outline-none border-b border-primary/50 focus:border-primary px-0 py-0.5"
                              value={editFileNameValue}
                              onChange={(e) =>
                                setEditFileNameValue(e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={async (e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  await handleUpdateFileName(asset.id);
                                }
                                if (e.key === "Escape") {
                                  e.stopPropagation();
                                  setEditingFileAsset(null);
                                }
                              }}
                            />
                          ) : (
                            <p
                              className="text-sm font-bold text-text-primary dark:text-white truncate"
                              title={asset.fileName}
                            >
                              {asset.fileName}
                            </p>
                          )}
                          <p className="text-[10px] text-text-tertiary truncate mt-0.5">
                            {new Date(asset.createdAt).toLocaleDateString()} •{" "}
                            {asset.isExternal
                              ? "External Link"
                              : formatBytes(asset.sizeBytes)}
                          </p>
                        </div>

                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100">
                          {editingFileAsset?.id === asset.id ? (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleUpdateFileName(asset.id);
                              }}
                              className="p-1.5 text-success hover:bg-success/10 rounded-md transition-all shrink-0 bg-white dark:bg-surface-dark shadow-xs border border-border-light dark:border-border-dark"
                              title="Save Name"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFileAsset(asset);
                                setEditFileNameValue(asset.fileName);
                              }}
                              className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-all shrink-0 bg-white dark:bg-surface-dark shadow-xs border border-border-light dark:border-border-dark"
                              title="Edit File Name"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDownloadFile(e, asset)}
                            className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-all shrink-0 bg-white dark:bg-surface-dark shadow-xs border border-border-light dark:border-border-dark"
                            title={
                              asset.isExternal ? "Open Link" : "Download File"
                            }
                          >
                            {asset.isExternal ? (
                              <ExternalLink className="h-4 w-4" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDeleteFile(e, asset)}
                            className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-all shrink-0 bg-white dark:bg-surface-dark shadow-xs border border-border-light dark:border-border-dark"
                            title="Delete File"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
          <ProjectOverviewTab
            projectId={id}
            project={project}
            fileAssets={fileAssets}
            onActionClick={handleOverviewAction}
          />
        )}
      </div>

      {/* Task Drawer Integration */}
      <TaskDrawer
        isOpen={isTaskDrawerOpen}
        task={selectedTask}
        onClose={() => setIsTaskDrawerOpen(false)}
        onRefresh={fetchTasks}
      />

      <ProjectFileDrawer
        isOpen={isFileDrawerOpen}
        onClose={() => setIsFileDrawerOpen(false)}
        contextType="project"
        contextId={id}
        onUploadSuccess={() => fetchFileAssets(id)}
      />

      <ExpenseDrawer
        isOpen={isExpenseDrawerOpen}
        onClose={() => setIsExpenseDrawerOpen(false)}
        projectId={id}
        mode="add"
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmModalAsset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-xl max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">
              Delete Attachment
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-300 mb-6 flex-wrap break-all">
              Are you sure you want to permanently delete{" "}
              <strong>{deleteConfirmModalAsset.fileName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmModalAsset(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteFile}
                className="bg-error hover:bg-error/90 text-white border-0 shadow-md"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
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
}) {
  const isDone = task.kanban_status === "done";

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
              id: crypto.randomUUID(), // Ensure a unique ID for React keys
              start_time: new Date(activeTimerStart).toISOString(),
              end_time: nowISO,
              duration_seconds: elapsed,
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
      className={cn(
        "group relative flex flex-col p-4 bg-white dark:bg-surface-dark rounded-xl border-2 transition-all min-h-[140px] h-fit",
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
            onChange={onToggleComplete}
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
                          onChange={() => handleToggleSubtask(st.id)}
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
        </div>
      </div>
    </div>
  );
}
