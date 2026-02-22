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
  Folder,
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
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All");

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    try {
      const data = await taskService.getTasksByProject(id);
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "Work") {
      fetchTasks();
    }
  }, [activeTab, fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    const mainMatch = task.title
      .toLowerCase()
      .includes(taskSearchQuery.toLowerCase());
    const priorityMatch =
      taskPriorityFilter === "All" ||
      task.priority === "All" ||
      task.priority === taskPriorityFilter;
    return mainMatch && priorityMatch;
  });

  // Group tasks by timeline
  const groupedTasks = () => {
    const groups = {
      OVERDUE: [],
      TODAY: [],
      TOMORROW: [],
    };

    // Dynamic future dates
    const futureGroups = {};

    const todayStart = startOfDay(new Date());

    filteredTasks.forEach((task) => {
      // If no due date, map to 'TODAY' as a fallback, or we can make an 'UNSCHEDULED' group.
      // The design seems to assume dates exist. Let's put no-date in TODAY for now.
      if (!task.due_date) {
        groups.TODAY.push(task);
        return;
      }

      const dueDate = new Date(task.due_date);

      if (
        isBefore(startOfDay(dueDate), todayStart) &&
        task.kanban_status !== "done"
      ) {
        groups.OVERDUE.push(task);
      } else if (isToday(dueDate)) {
        groups.TODAY.push(task);
      } else if (isTomorrow(dueDate)) {
        groups.TOMORROW.push(task);
      } else if (task.kanban_status !== "done") {
        // Future date grouping
        const dateKey = format(dueDate, "EEE, MMM dd").toUpperCase();
        if (!futureGroups[dateKey]) {
          futureGroups[dateKey] = [];
        }
        futureGroups[dateKey].push(task);
      }
    });

    return { ...groups, ...futureGroups };
  };

  const timelineGroups = groupedTasks();
  const [isFileDrawerOpen, setIsFileDrawerOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

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
                <div className="relative w-full sm:w-40 shrink-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <select
                    value={taskPriorityFilter}
                    onChange={(e) => setTaskPriorityFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8 space-y-8 mt-4">
              {Object.entries(timelineGroups).map(([groupName, groupTasks]) => {
                if (groupTasks.length === 0) return null;

                const isOverdue = groupName === "OVERDUE";
                const isToday = groupName === "TODAY";
                const isTomorrow = groupName === "TOMORROW";

                return (
                  <div key={groupName} className="space-y-4">
                    <div className="flex items-center gap-3">
                      {isOverdue && (
                        <AlertCircle className="h-5 w-5 text-error" />
                      )}
                      {isToday && <Calendar className="h-5 w-5 text-primary" />}
                      {isTomorrow && (
                        <Calendar className="h-5 w-5 text-indigo-400" />
                      )}
                      {!isOverdue && !isToday && !isTomorrow && (
                        <Calendar className="h-5 w-5 text-text-tertiary" />
                      )}
                      <h3
                        className={cn(
                          "text-sm font-bold tracking-wider",
                          isOverdue
                            ? "text-error"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {groupTasks.map((task) => (
                        <ProjectTaskListItem
                          key={task.id}
                          task={task}
                          onEdit={() => {
                            setSelectedTask(task);
                            setIsTaskDrawerOpen(true);
                          }}
                          onDelete={async () => {
                            if (window.confirm("Delete this task?")) {
                              await taskService.deleteTask(id, task.id);
                              fetchTasks();
                            }
                          }}
                          onToggleComplete={async () => {
                            const newStatus =
                              task.kanban_status === "done" ? "todo" : "done";
                            await taskService.updateTask(id, task.id, {
                              kanban_status: newStatus,
                            });
                            fetchTasks();
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
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
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Main Info) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Tasks Breakdown */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Task Breakdown
                </h3>
                <div className="flex w-full h-3 rounded-full overflow-hidden mb-4">
                  <div className="bg-success" style={{ width: "50%" }}></div>
                  <div className="bg-warning" style={{ width: "30%" }}></div>
                  <div className="bg-error" style={{ width: "20%" }}></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-text-tertiary">Total Tasks</p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      86
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-text-tertiary">
                      <span className="size-2 rounded-full bg-success"></span>
                      Completed
                    </p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      43
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-text-tertiary">
                      <span className="size-2 rounded-full bg-warning"></span>
                      In Progress
                    </p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      26
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-text-tertiary">
                      <span className="size-2 rounded-full bg-error"></span>
                      Blocked
                    </p>
                    <p className="text-lg font-bold text-text-primary dark:text-white">
                      17
                    </p>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Timeline
                </h3>
                <div className="mt-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg h-36 flex items-center justify-center border border-dashed border-border-light dark:border-border-dark">
                  <span className="text-text-tertiary text-sm flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Gantt Chart Visualization
                  </span>
                </div>
                <button className="mt-4 flex items-center text-primary text-sm font-bold hover:underline gap-1">
                  Open full Gantt <ArrowRight className="h-4 w-4" />
                </button>
              </Card>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Team Members */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Team Members
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Emily Carter",
                      role: "Project Manager",
                      img: "https://i.pravatar.cc/50?u=emily",
                    },
                    {
                      name: "Ben Adams",
                      role: "Lead Developer",
                      img: "https://i.pravatar.cc/50?u=ben",
                    },
                    {
                      name: "Chloe Davis",
                      role: "UX/UI Designer",
                      img: "https://i.pravatar.cc/50?u=chloe",
                    },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar src={m.img} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-text-primary dark:text-white">
                          {m.name}
                        </p>
                        <p className="text-xs text-text-tertiary">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 h-10 text-sm font-bold text-text-primary dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Plus className="h-4 w-4" /> Add Member
                </button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-3">
                  {["New Task", "Invite Collaborator", "Upload File"].map(
                    (action) => (
                      <button
                        key={action}
                        className="w-full text-left flex items-center h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold text-text-primary dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {action}
                      </button>
                    ),
                  )}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                  Recent Activity
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      user: "Ben Adams",
                      action: "completed task",
                      target: "Setup Database",
                      time: "2h ago",
                      img: "https://i.pravatar.cc/30?u=ben",
                    },
                    {
                      user: "Chloe Davis",
                      action: "uploaded file",
                      target: "Userflow_v3.fig",
                      time: "5h ago",
                      img: "https://i.pravatar.cc/30?u=chloe",
                    },
                  ].map((act, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Avatar src={act.img} size="xs" className="mt-0.5" />
                      <div className="text-sm">
                        <p className="text-text-primary dark:text-white leading-snug">
                          <span className="font-semibold">{act.user}</span>{" "}
                          {act.action}{" "}
                          <span className="font-semibold text-primary">
                            {act.target}
                          </span>
                          .
                        </p>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {act.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
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

function ProjectTaskListItem({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onRefresh,
}) {
  const isDone = task.kanban_status === "done";

  const priorityColors = {
    Critical:
      "text-red-600 bg-red-600/10 border-red-600/20 shadow-sm shadow-red-500/20",
    High: "text-error bg-error/10 border-error/20",
    Medium: "text-warning bg-warning/10 border-warning/20",
    Low: "text-success bg-success/10 border-success/20",
  };

  const projectTitle = task.project_title || "Project";

  // Time Tracking Logic
  const [liveTimeSpent, setLiveTimeSpent] = useState(task.time_spent || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(!!task.timer_started_at);
  const [prevTaskState, setPrevTaskState] = useState({
    timeSpent: task.time_spent,
    timerStartedAt: task.timer_started_at,
  });

  if (
    task.time_spent !== prevTaskState.timeSpent ||
    task.timer_started_at !== prevTaskState.timerStartedAt
  ) {
    setPrevTaskState({
      timeSpent: task.time_spent,
      timerStartedAt: task.timer_started_at,
    });
    setLiveTimeSpent(task.time_spent || 0);
    setIsTimerRunning(!!task.timer_started_at);
  }

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && task.timer_started_at) {
      const start = new Date(task.timer_started_at).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        setLiveTimeSpent((task.time_spent || 0) + elapsedSeconds);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, task.timer_started_at, task.time_spent]);

  const handleToggleTimer = async () => {
    const now = new Date().toISOString();
    let newTimeSpent = task.time_spent || 0;
    let newTimerStartedAt = null;

    if (isTimerRunning) {
      // Stopping timer
      const elapsed = Math.floor(
        (new Date().getTime() - new Date(task.timer_started_at).getTime()) /
          1000,
      );
      newTimeSpent += elapsed;
    } else {
      // Starting timer
      newTimerStartedAt = now;
    }

    // Optimistic update
    setIsTimerRunning(!isTimerRunning);
    setLiveTimeSpent(newTimeSpent);

    try {
      await taskService.updateTask(task.project_id, task.id, {
        time_spent: newTimeSpent,
        timer_started_at: newTimerStartedAt,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update timer");
      setIsTimerRunning(!!task.timer_started_at);
      setLiveTimeSpent(task.time_spent || 0);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const timeLogged = formatTime(liveTimeSpent);

  const dueTime = task.due_date
    ? format(new Date(task.due_date), "hh:mm a")
    : "No Time";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-4 bg-white dark:bg-surface-dark rounded-xl border-2 transition-all min-h-[140px]",
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
      <div className="flex items-start gap-3">
        <label className="cursor-pointer shrink-0 mt-0.5 relative z-10">
          <input
            type="checkbox"
            checked={isDone}
            onChange={onToggleComplete}
            className="peer sr-only"
          />
          <div className="h-5 w-5 rounded border-2 border-border-light dark:border-border-dark peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all bg-white dark:bg-surface-dark">
            <CheckSquare className="h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </label>

        <div className="flex-1 min-w-0 pr-8">
          <h4
            className={cn(
              "text-[15px] font-bold text-text-primary dark:text-white leading-tight truncate mb-1",
              isDone && "line-through text-text-tertiary",
            )}
            title={task.title}
          >
            {task.title}
          </h4>
          <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-2 leading-relaxed">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="absolute right-4 top-4">
          <Flag
            className={cn(
              "h-4 w-4",
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

          {/* Project Folder Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-md text-[11px] font-bold text-indigo-600 dark:text-indigo-400 max-w-[140px]">
            <Folder className="h-3 w-3 shrink-0" />{" "}
            <span className="truncate">{projectTitle}</span>
          </div>
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
