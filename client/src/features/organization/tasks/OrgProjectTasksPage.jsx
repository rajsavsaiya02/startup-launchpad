import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Edit2,
  Flag,
  Check,
  Clock,
  Calendar,
  CheckSquare,
  Play,
  Pause,
  Trash2,
  Download,
  MoreVertical,
  Archive,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { useMemo } from "react";
import { Avatar } from "../../../components/ui/Avatar";
import { cn } from "../../../utils/cn";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Dropdown, DropdownItem } from "../../../components/ui/Dropdown";
import taskService from "../../../services/taskService";
import fileAssetService from "../../../services/fileAssetService";
import { useAuth } from "../../../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { OrgTaskDrawer } from "./OrgTaskDrawer";
import { ProjectFileDrawer } from "../../operations/components/ProjectFileDrawer";
import { FileDetailModal } from "../../../components/files/FileDetailModal";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { OrgTasksAnalytics } from "./OrgTasksAnalytics";
import { ConfirmationModal } from "../../../components/ui/ConfirmationModal";

const MotionCard = motion.create(Card);

// ─── Main Page ───────────────────────────────────────────────────────────────

export function OrgProjectTasksPage() {
  const { user } = useAuth();

  // Org ID — now correctly populated by the backend in user.organization_id
  const orgId = user?.organization_id;

  // ── Tasks state ──
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isTaskDrawerReadOnly, setIsTaskDrawerReadOnly] = useState(false);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState("Work Board");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState("All");
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  // ── Resource files state ──
  const [fileAssets, setFileAssets] = useState([]);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [fileSortBy, setFileSortBy] = useState("newest");
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [selectedDetailAsset, setSelectedDetailAsset] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null, // "task" | "file"
    item: null,
  });

  // ── Fetch tasks ──

  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskService.getAllTasks("organization");
      setTasks(data);
    } catch (err) {
      console.error("Error fetching org tasks:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await taskService.getAllTasks("organization");
        if (isMounted) setTasks(data);
      } catch (err) {
        console.error("Error fetching org tasks:", err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Fetch org file assets ──

  const fetchFileAssets = useCallback(async () => {
    if (!orgId) return;
    try {
      const data = await fileAssetService.getFileAssets("organization", orgId);
      setFileAssets(data);
    } catch (err) {
      console.error("Failed to load org task files:", err);
    }
  }, [orgId]);

  useEffect(() => {
    let isMounted = true;
    if (orgId) {
      const load = async () => {
        try {
          const data = await fileAssetService.getFileAssets(
            "organization",
            orgId,
          );
          if (isMounted) setFileAssets(data);
        } catch (err) {
          console.error("Failed to load org task files:", err);
        }
      };
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [orgId]);

  // ── Task event handlers ──

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskDrawerReadOnly(false);
    setIsTaskDrawerOpen(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsTaskDrawerReadOnly(true);
    setIsTaskDrawerOpen(true);
  };

  const handleToggleSubtask = async (task, subtaskIndex) => {
    const subtasks = (() => {
      if (typeof task.subtasks === "string") {
        try {
          return JSON.parse(task.subtasks);
        } catch {
          return [];
        }
      }
      return Array.isArray(task.subtasks) ? task.subtasks : [];
    })();

    const updatedSubtasks = subtasks.map((s, idx) =>
      idx === subtaskIndex ? { ...s, is_completed: !s.is_completed } : s,
    );

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, subtasks: updatedSubtasks } : t,
    );
    setTasks(updatedTasks);
    if (selectedTask?.id === task.id) {
      setSelectedTask((prev) => ({ ...prev, subtasks: updatedSubtasks }));
    }

    try {
      await taskService.updateTask(task.project_id, task.id, {
        subtasks: JSON.stringify(updatedSubtasks),
      });
    } catch (err) {
      console.error("Failed to update subtask:", err);
      fetchTasks();
    }
  };

  const handleTaskUpdate = (taskId, updatedProps) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updatedProps } : t)),
    );
    setSelectedTask((prev) =>
      prev?.id === taskId ? { ...prev, ...updatedProps } : prev,
    );
    // Persist kanban_status changes (e.g. restore from archive) to backend
    if (updatedProps.kanban_status !== undefined) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        taskService
          .updateTask(task.project_id, taskId, {
            kanban_status: updatedProps.kanban_status,
          })
          .catch((err) => console.error("Failed to persist task status:", err));
      }
    }
  };

  // ── Drag & Drop ──

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id.toString() === taskId ? { ...t, kanban_status: newStatus } : t,
    );
    setTasks(updatedTasks);
    if (selectedTask?.id.toString() === taskId) {
      setSelectedTask((prev) => ({ ...prev, kanban_status: newStatus }));
    }

    try {
      const task = tasks.find((t) => t.id.toString() === taskId);
      await taskService.updateTask(task.project_id, taskId, {
        kanban_status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      fetchTasks();
    }
  };

  const handleDeleteTask = (task) => {
    setDeleteConfirm({
      isOpen: true,
      type: "task",
      item: task,
    });
  };

  const confirmDelete = async () => {
    const { type, item } = deleteConfirm;
    if (!item) return;

    try {
      if (type === "task") {
        await taskService.deleteTask(item.project_id, item.id);
        toast.success("Task deleted successfully");
        setTasks((prev) => prev.filter((t) => t.id !== item.id));
        if (selectedTask?.id === item.id) setSelectedTask(null);
      } else if (type === "file") {
        await fileAssetService.deleteFileAsset(item.id);
        toast.success(item.isExternal ? "Link removed" : "File deleted");
        fetchFileAssets();
        setSelectedDetailAsset(null);
      }
    } catch (err) {
      console.error(`Failed to delete org ${type}:`, err);
      toast.error(`Failed to delete ${type}`);
    } finally {
      setDeleteConfirm({ isOpen: false, type: null, item: null });
    }
  };

  // ── File handlers ──

  const handleDeleteFile = async (e, asset) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: "file",
      item: asset,
    });
  };

  const handleDownloadFile = async (e, asset) => {
    e.stopPropagation();
    if (asset.isExternal) {
      window.open(asset.storageUrl, "_blank", "noopener,noreferrer");
    } else {
      try {
        const url = fileAssetService.getDownloadUrl(asset.id);
        window.open(url, "_blank");
      } catch {
        toast.error("Failed to download file");
      }
    }
  };

  // ── File icon helpers ──

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (asset) => {
    if (asset.isExternal)
      return <ExternalLink className="w-5 h-5 text-blue-500" />;
    const mime = asset.mimeType || "";
    if (mime.includes("image"))
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    if (mime.includes("pdf"))
      return <FileText className="w-5 h-5 text-red-500" />;
    if (
      mime.includes("spreadsheet") ||
      mime.includes("csv") ||
      mime.includes("excel")
    )
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  // ── Derived data ──

  // ── Archive & Active Logic ──
  const { activeTasks, archiveTasksGroups, isFiltered } = useMemo(() => {
    // 1. Initial filter by Search/Priority/Category
    const baseFiltered = tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(taskSearchQuery.toLowerCase());
      const matchesPriority =
        taskPriorityFilter === "All" || task.priority === taskPriorityFilter;
      const matchesCategory =
        taskCategoryFilter === "All" || task.category === taskCategoryFilter;
      return matchesSearch && matchesPriority && matchesCategory;
    });

    // 2. Separate into Active and Archive
    const active = [];
    const archived = [];

    baseFiltered.forEach((task) => {
      const isDone = task.kanban_status === "done";
      const isCompletedToday =
        isDone && task.updated_at && isToday(new Date(task.updated_at));

      const isOverdue =
        task.due_date &&
        isBefore(startOfDay(new Date(task.due_date)), startOfDay(new Date()));

      // A task is ARCHIVED if it is DONE AND (it was not completed today OR it is overdue)
      const shouldArchive = isDone && (!isCompletedToday || isOverdue);

      if (shouldArchive) {
        archived.push(task);
      } else {
        active.push(task);
      }
    });

    // 3. Group Archived tasks by date
    const archGroupsMap = new Map();
    archived.sort((a, b) => {
      const dateA = a.due_date ? new Date(a.due_date) : new Date(a.updated_at);
      const dateB = b.due_date ? new Date(b.due_date) : new Date(b.updated_at);
      return dateB - dateA; // Newest first
    });

    archived.forEach((task) => {
      const dateKey = task.due_date
        ? format(new Date(task.due_date), "EEE, MMM dd, yyyy").toUpperCase()
        : task.updated_at
          ? format(new Date(task.updated_at), "EEE, MMM dd, yyyy").toUpperCase()
          : "NO DATE";

      if (!archGroupsMap.has(dateKey)) archGroupsMap.set(dateKey, []);
      archGroupsMap.get(dateKey).push(task);
    });

    const isFiltered =
      taskSearchQuery !== "" ||
      taskPriorityFilter !== "All" ||
      taskCategoryFilter !== "All";

    return {
      activeTasks: active,
      archiveTasksGroups: Array.from(archGroupsMap.entries()),
      isFiltered,
    };
  }, [tasks, taskSearchQuery, taskPriorityFilter, taskCategoryFilter]);

  const uniqueCategories = useMemo(
    () =>
      Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))).sort(),
    [tasks],
  );

  const tasksByStatus = {
    todo: activeTasks.filter((t) => t.kanban_status === "todo"),
    progress: activeTasks.filter((t) => t.kanban_status === "progress"),
    review: activeTasks.filter((t) => t.kanban_status === "review"),
    done: activeTasks.filter((t) => t.kanban_status === "done"),
  };

  // ── Render ──

  return (
    <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark">
      {/* ── 1. Premium Header Card ── */}
      <div className="mt-6 mb-4 bg-white/70 dark:bg-surface-dark/70 border border-border-light dark:border-border-dark shadow-xl shadow-gray-200/20 dark:shadow-none rounded-[2.5rem] z-10 overflow-hidden shrink-0 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="px-12 pt-10 pb-8 flex items-start justify-between gap-4 relative z-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-gray-950 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight">
              Organization Tasks
            </h1>
            <p className="mt-2 text-base text-text-tertiary dark:text-gray-400 leading-relaxed font-medium max-w-2xl">
              Manage and track all tasks across your organization — collaborate,
              assign priorities, and drive your team to delivery.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 pt-1.5">
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsTaskDrawerReadOnly(false);
                setIsTaskDrawerOpen(true);
              }}
              className="group relative flex items-center gap-2.5 h-12 px-8 text-[12px] font-black tracking-[0.2em] text-white transition-all rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <div className="absolute rounded-2xl border inset-0 bg-linear-to-br from-primary to-indigo-600 group-hover:from-primary-hover group-hover:to-indigo-700 transition-all duration-300" />
              <div className="relative flex items-center gap-2.5">
                <Plus className="h-5 w-5 stroke-[3.5px]" />
                <span>NEW TASK</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center px-12 pb-6">
          <div className="bg-gray-100/30 dark:bg-gray-900/40 p-1 rounded-2xl border border-border-light/30 dark:border-border-dark/20 inline-flex items-center backdrop-blur-xl relative">
            {["Work Board", "Productivity", "Resources"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-7 py-2 rounded-xl text-[10px] font-black transition-colors duration-300 whitespace-nowrap uppercase tracking-[0.15em] z-10",
                  activeTab === tab
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="orgActiveTab"
                    className="absolute inset-0 bg-white dark:bg-surface-dark rounded-xl shadow-md border border-border-light/50 dark:border-border-dark/50 z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Work Board Tab ── */}
      {activeTab === "Work Board" && (
        <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4 pt-2 flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 py-2 items-center justify-between shrink-0">
            <div className="relative flex-1 w-full max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-tertiary" />
              </div>
              <input
                type="text"
                placeholder="Search org tasks across board..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-surface-dark border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all outline-none shadow-sm placeholder:text-text-tertiary dark:placeholder:text-gray-600"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Archive Toggle - New Styled Pill Design */}
              <div className="flex items-center p-1 bg-gray-100/50 dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-full shrink-0 shadow-sm">
                <button
                  onClick={() => setIsArchiveMode(false)}
                  className={cn(
                    "px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-300",
                    !isArchiveMode
                      ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                      : "text-text-tertiary hover:text-text-secondary",
                  )}
                >
                  Current
                </button>
                <button
                  onClick={() => setIsArchiveMode(true)}
                  className={cn(
                    "px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-300",
                    isArchiveMode
                      ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                      : "text-text-tertiary hover:text-text-secondary",
                  )}
                >
                  Archive
                </button>
              </div>

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block mx-1" />

              <div className="relative w-full sm:w-44 shrink-0">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <select
                  value={taskCategoryFilter}
                  onChange={(e) => setTaskCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-xs font-bold text-text-secondary dark:text-gray-400 bg-white dark:bg-surface-dark border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-44 shrink-0">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <select
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-xs font-bold text-text-secondary dark:text-gray-400 bg-white dark:bg-surface-dark border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
              </div>
            </div>
          </div>

          {isArchiveMode ? (
            /* ── Dull Premium List Archive ── */
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-20">
              {archiveTasksGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/30 dark:bg-surface-dark/30 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 backdrop-blur-sm">
                  <div className="h-20 w-20 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-6 ring-1 ring-gray-100 dark:ring-gray-700 shadow-sm">
                    <Archive className="h-10 w-10 text-text-tertiary opacity-30" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">
                    {isFiltered
                      ? "No matching archived tasks"
                      : "Archive is Empty"}
                  </h3>
                  <p className="text-text-secondary dark:text-gray-400 text-center max-w-sm px-4 mb-6">
                    {isFiltered
                      ? "Try adjusting your filters to see more archived results."
                      : "Completed tasks from previous days appear here automatically."}
                  </p>
                  {isFiltered && (
                    <button
                      onClick={() => {
                        setTaskSearchQuery("");
                        setTaskPriorityFilter("All");
                        setTaskCategoryFilter("All");
                      }}
                      className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {archiveTasksGroups.map(([date, groupTasks]) => (
                    <div key={date}>
                      {/* ── Date Group Header ── */}
                      <div className="flex items-center gap-3 mb-3 sticky top-0 z-20 pt-1 pb-2 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50 rounded-xl">
                          <Archive className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                            {date}
                          </span>
                          <span className="ml-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                            {groupTasks.length}
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-700/40" />
                      </div>

                      {/* ── Task Grid Cards ── */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence initial={false}>
                          {groupTasks.map((task, index) => (
                            <OrgTaskCard
                              key={task.id}
                              task={task}
                              index={index}
                              onEdit={() => handleEditTask(task)}
                              onView={() => handleViewTask(task)}
                              onTaskUpdate={(props) =>
                                handleTaskUpdate(task.id, props)
                              }
                              onDelete={() => handleDeleteTask(task)}
                              isArchive={true}
                              isDraggable={false}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Kanban Board — 4 columns */
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="pb-10 overflow-x-auto custom-scrollbar -mx-6 px-6">
                <div className="flex gap-4 min-h-[calc(100vh-450px)] items-stretch mt-2 w-full">
                  <OrgWorkColumn
                    id="todo"
                    title="To Do"
                    count={tasksByStatus.todo.length}
                    color="border-yellow-400"
                  >
                    {tasksByStatus.todo.map((task, index) => (
                      <OrgTaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={() => handleEditTask(task)}
                        onView={() => handleViewTask(task)}
                        onToggleSubtask={handleToggleSubtask}
                        onTaskUpdate={(props) =>
                          handleTaskUpdate(task.id, props)
                        }
                        onDelete={() => handleDeleteTask(task)}
                      />
                    ))}
                  </OrgWorkColumn>

                  <OrgWorkColumn
                    id="progress"
                    title="In Progress"
                    count={tasksByStatus.progress.length}
                    color="border-primary"
                  >
                    {tasksByStatus.progress.map((task, index) => (
                      <OrgTaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={() => handleEditTask(task)}
                        onView={() => handleViewTask(task)}
                        onToggleSubtask={handleToggleSubtask}
                        onTaskUpdate={(props) =>
                          handleTaskUpdate(task.id, props)
                        }
                        onDelete={() => handleDeleteTask(task)}
                      />
                    ))}
                  </OrgWorkColumn>

                  <OrgWorkColumn
                    id="review"
                    title="In Review"
                    count={tasksByStatus.review.length}
                    color="border-purple-500"
                  >
                    {tasksByStatus.review.map((task, index) => (
                      <OrgTaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={() => handleEditTask(task)}
                        onView={() => handleViewTask(task)}
                        onToggleSubtask={handleToggleSubtask}
                        onTaskUpdate={(props) =>
                          handleTaskUpdate(task.id, props)
                        }
                        onDelete={() => handleDeleteTask(task)}
                      />
                    ))}
                  </OrgWorkColumn>

                  <OrgWorkColumn
                    id="done"
                    title="Done"
                    count={tasksByStatus.done.length}
                    color="border-green-500"
                  >
                    {tasksByStatus.done.map((task, index) => (
                      <OrgTaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={() => handleEditTask(task)}
                        onView={() => handleViewTask(task)}
                        onToggleSubtask={handleToggleSubtask}
                        onTaskUpdate={(props) =>
                          handleTaskUpdate(task.id, props)
                        }
                        onDelete={() => handleDeleteTask(task)}
                      />
                    ))}
                  </OrgWorkColumn>
                </div>
              </div>
            </DragDropContext>
          )}
        </div>
      )}

      {/* ── 3. Productivity Tab ── */}
      {activeTab === "Productivity" && <OrgTasksAnalytics tasks={tasks} />}

      {/* ── 4. Resources Tab ── */}
      {activeTab === "Resources" && (
        <div className="flex-1 w-full overflow-visible px-4 pb-32 pt-2">
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-text-primary dark:text-white shrink-0">
                  Org Task Resources
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
                const filteredAndSorted = fileAssets
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
                    {/* Upload button card */}
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

                    {/* File cards */}
                    {filteredAndSorted.map((asset) => (
                      <MotionCard
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={asset.id}
                        className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group border-border-light dark:border-border-dark bg-white dark:bg-surface-dark relative min-w-[200px] hover:z-50 overflow-visible"
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
                              <>
                                <div className="my-1 border-t border-border-light dark:border-border-dark" />
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
        </div>
      )}

      {/* ── Drawers & Modals ── */}

      <OrgTaskDrawer
        task={selectedTask}
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        onRefresh={fetchTasks}
        isReadOnly={isTaskDrawerReadOnly}
      />

      {/* Reuse the shared ProjectFileDrawer with org context */}
      <ProjectFileDrawer
        isOpen={isUploadDrawerOpen || isEditDrawerOpen}
        onClose={() => {
          setIsUploadDrawerOpen(false);
          setIsEditDrawerOpen(false);
          setAssetToEdit(null);
        }}
        contextType="organization"
        contextId={orgId}
        onUploadSuccess={fetchFileAssets}
        editAsset={assetToEdit}
      />

      <FileDetailModal
        isOpen={!!selectedDetailAsset}
        onClose={() => setSelectedDetailAsset(null)}
        asset={selectedDetailAsset}
        canManageFiles={true}
        onDownload={handleDownloadFile}
        onEdit={(e, asset) => {
          setAssetToEdit(asset);
          setIsEditDrawerOpen(true);
        }}
        onDelete={handleDeleteFile}
      />

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, type: null, item: null })
        }
        onConfirm={confirmDelete}
        title={deleteConfirm.type === "task" ? "Delete Task" : "Delete File"}
        message={
          deleteConfirm.type === "task"
            ? `Are you sure you want to delete the task "${deleteConfirm.item?.title}"? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteConfirm.item?.fileName}"? This action cannot be undone.`
        }
      />
    </div>
  );
}

// ─── OrgWorkColumn ────────────────────────────────────────────────────────────

function OrgWorkColumn({ id, title, count, color, children }) {
  let bgDot = color.replace("border-", "bg-");
  if (bgDot.includes("yellow")) bgDot = "bg-yellow-500";
  if (bgDot.includes("primary")) bgDot = "bg-primary";
  if (bgDot.includes("green")) bgDot = "bg-green-500";
  if (bgDot.includes("purple")) bgDot = "bg-purple-500";

  return (
    <div className="flex flex-1 min-w-[280px] flex-col bg-slate-50/50 dark:bg-slate-900/30 border border-border-light dark:border-border-dark rounded-[1.5rem] shadow-sm overflow-visible">
      <div className="bg-white/80 dark:bg-surface-dark/80 border-b border-border-light dark:border-border-dark px-5 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]",
              bgDot,
            )}
          />
          <h2 className="text-[11px] font-black text-text-primary dark:text-white uppercase tracking-[0.15em]">
            {title}
          </h2>
        </div>
        <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg tabular-nums">
          {count}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "flex flex-1 flex-col gap-3 p-3 transition-colors rounded-b-2xl h-full min-h-[500px]",
              snapshot.isDraggingOver
                ? "bg-gray-100/80 dark:bg-gray-800/40"
                : "",
            )}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ─── OrgTaskCard ──────────────────────────────────────────────────────────────

function OrgTaskCard({
  task,
  index,
  onEdit,
  onView,
  onToggleSubtask = () => {},
  onDelete,
  onTaskUpdate,
  isDraggable = true,
  isArchive = false,
}) {
  const priorityColors = {
    Critical: "text-error",
    High: "text-orange-500",
    Medium: "text-warning",
    Low: "text-success",
  };

  // Subtask progress
  const subtasks = (() => {
    if (typeof task.subtasks === "string") {
      try {
        return JSON.parse(task.subtasks);
      } catch {
        return [];
      }
    }
    return Array.isArray(task.subtasks) ? task.subtasks : [];
  })();
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;

  // ── Timer & Time Tracking ──
  const baseTimeSpent = parseInt(task.time_spent) || 0;
  const isTimerRunning = !!task.timer_started_at;
  const activeTimerStart = task.timer_started_at;

  const [tickNow, setTickNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isTimerRunning || !activeTimerStart) {
      return;
    }
    const interval = setInterval(() => {
      setTickNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerStart]);

  let liveTimeSpent = baseTimeSpent;
  if (isTimerRunning && activeTimerStart && tickNow) {
    const startTs = new Date(activeTimerStart).getTime();
    if (!isNaN(startTs) && startTs > 0) {
      const elapsed = Math.floor((tickNow - startTs) / 1000);
      liveTimeSpent = baseTimeSpent + Math.max(0, elapsed);
    }
  }

  const handleToggleTimer = async (e) => {
    e.stopPropagation();
    const nowISO = new Date().toISOString();
    let newTimeSpent = baseTimeSpent;
    let newTimerStartedAt = null;

    let parsedLogs = [];
    if (typeof task.time_logs === "string") {
      try {
        parsedLogs = JSON.parse(task.time_logs);
      } catch {
        parsedLogs = [];
      }
    } else if (Array.isArray(task.time_logs)) {
      parsedLogs = task.time_logs;
    }
    let newTimeLogs = [...parsedLogs];

    if (isTimerRunning) {
      if (activeTimerStart) {
        const startTs = new Date(activeTimerStart).getTime();
        if (!isNaN(startTs) && startTs > 0) {
          const elapsed = Math.floor((Date.now() - startTs) / 1000);
          const cappedElapsed = Math.min(Math.max(0, elapsed), 86400); // Max 24 hours
          if (cappedElapsed > 0) {
            const endTs = startTs + cappedElapsed * 1000;
            newTimeLogs.unshift({
              id: crypto.randomUUID(),
              start_time: activeTimerStart,
              end_time: new Date(endTs).toISOString(),
              duration_seconds: cappedElapsed,
            });
            newTimeSpent += cappedElapsed;
          }
        }
      }
    } else {
      newTimerStartedAt = nowISO;
    }

    if (onTaskUpdate) {
      onTaskUpdate({
        time_spent: newTimeSpent,
        timer_started_at: newTimerStartedAt,
        time_logs: newTimeLogs,
      });
    }

    try {
      await taskService.updateTask(task.project_id, task.id, {
        time_spent: newTimeSpent,
        timer_started_at: newTimerStartedAt,
        time_logs: newTimeLogs,
      });
    } catch (err) {
      console.error("Failed to toggle org task timer:", err);
      toast.error("Timer update failed");
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const cardContent = (provided = {}, snapshot = {}) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onDoubleClick={onView}
      style={{ ...provided.draggableProps?.style }}
      className={cn(
        "group relative bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden shrink-0",
        isArchive ? "p-4 opacity-80 border-dashed" : "p-4",
        snapshot.isDragging
          ? "shadow-2xl ring-2 ring-primary/50 rotate-1 z-9999"
          : "hover:shadow-md transition-all",
        isArchive
          ? "grayscale-[0.4] hover:grayscale-0 transition-all duration-300"
          : "",
      )}
    >
      <div className="flex gap-4 items-start flex-col">
        {/* Checkbox / Done indicator */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isArchive) {
              onTaskUpdate({ kanban_status: "review" });
            } else {
              onTaskUpdate({
                kanban_status: task.kanban_status === "done" ? "todo" : "done",
              });
            }
          }}
          className={cn(
            "shrink-0 h-5 w-5 mt-[2px] rounded-full border-2 transition-all flex items-center justify-center",
            task.kanban_status === "done"
              ? "border-primary bg-primary"
              : "border-text-tertiary hover:border-primary",
          )}
        >
          {task.kanban_status === "done" && (
            <Check className="h-3 w-3 text-white" strokeWidth={4} />
          )}
        </button>

        <div className="flex gap-4 flex-1 flex-col w-full">
          <div className="flex flex-col gap-3.5 min-w-0 flex-1">
            <div className="flex justify-between items-start gap-3">
              <div className="flex gap-3 items-start min-w-0">
                <div className="min-w-0">
                  <h4
                    className={cn(
                      "text-[14px] font-black leading-tight tracking-tight",
                      isArchive
                        ? "text-gray-400 dark:text-gray-500 line-through"
                        : "text-text-primary dark:text-white",
                    )}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p
                      className={cn(
                        "text-[11px] leading-relaxed line-clamp-2 mt-1.5",
                        isArchive
                          ? "text-gray-300 dark:text-gray-600 italic"
                          : "text-text-tertiary",
                      )}
                    >
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Flag
                  className={cn(
                    "h-4 w-4 fill-current",
                    priorityColors[task.priority] || "text-emerald-500",
                    isArchive ? "opacity-30" : "",
                  )}
                  strokeWidth={2}
                />
              </div>
            </div>

            {totalSubtasks > 0 && (
              <div
                className={cn(
                  "flex items-center transition-colors border-border-light/40 dark:border-border-dark/40",
                  isArchive
                    ? "gap-4 py-2 mt-2 border-t border-dashed"
                    : "flex-col gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border",
                )}
              >
                {!isArchive && (
                  <div className="flex items-center justify-between mb-1 w-full">
                    <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                      Subtasks
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary">
                      <CheckSquare className="h-3 w-3" />
                      {completedSubtasks}/{totalSubtasks}
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    "flex",
                    isArchive
                      ? "flex-row gap-4 items-center flex-1"
                      : "flex-col gap-1.5 w-full",
                  )}
                >
                  {isArchive ? (
                    <>
                      <div className="flex flex-1 gap-2 overflow-hidden items-center">
                        {subtasks.slice(0, 2).map((subtask, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-1 shrink-0"
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                subtask.is_completed
                                  ? "bg-primary"
                                  : "bg-gray-200 dark:bg-gray-700",
                              )}
                            />
                            <span
                              className={cn(
                                "text-[9px] font-bold truncate max-w-[60px]",
                                subtask.is_completed
                                  ? "text-gray-400"
                                  : "text-text-secondary",
                              )}
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                        {subtasks.length > 2 && (
                          <span className="text-[9px] text-text-tertiary">
                            +{subtasks.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded text-[9px] font-black text-primary border border-primary/10">
                        {completedSubtasks}/{totalSubtasks}
                      </div>
                    </>
                  ) : (
                    subtasks.map((subtask, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 group/sub"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSubtask(task, sIdx);
                          }}
                          className={cn(
                            "h-3.5 w-3.5 rounded border flex items-center justify-center transition-all",
                            subtask.is_completed
                              ? "bg-primary border-primary"
                              : "bg-white dark:bg-surface-dark border-text-tertiary group-hover/sub:border-primary",
                          )}
                        >
                          {subtask.is_completed && (
                            <Check
                              className="h-2.5 w-2.5 text-white"
                              strokeWidth={4}
                            />
                          )}
                        </button>
                        <span
                          className={cn(
                            "text-[10px] font-bold transition-all",
                            subtask.is_completed
                              ? "text-text-tertiary line-through"
                              : "text-text-secondary dark:text-gray-300",
                          )}
                        >
                          {subtask.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border-light/40 dark:border-border-dark/40 w-full mt-auto">
            <div
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-lg transition-colors",
                isTimerRunning && !isArchive
                  ? "bg-warning/10 text-warning animate-pulse"
                  : "text-text-tertiary bg-gray-50/50 dark:bg-gray-800/20",
                isArchive ? "bg-gray-50 dark:bg-gray-800/20 opacity-50" : "",
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {isArchive
                ? formatTime(Number(task.time_spent || 0))
                : formatTime(liveTimeSpent)}
            </div>
            <div className="flex items-center gap-0.5">
              {!isArchive && (
                <>
                  <button
                    onClick={handleToggleTimer}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      isTimerRunning
                        ? "text-warning hover:bg-warning/5"
                        : "text-success hover:bg-success/5",
                    )}
                  >
                    {isTimerRunning ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </button>
                  <div className="w-px h-3 bg-border-light dark:bg-border-dark mx-1" />
                </>
              )}
              <button
                onClick={onView}
                className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/5 rounded-lg transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isArchive && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-border-light dark:border-border-dark mt-2">
              {task.due_date && (
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark px-2 py-1 rounded flex items-center gap-1.5 text-[9px] font-bold text-text-tertiary">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), "MMM dd, yyyy")}
                </div>
              )}
              <div className="bg-warning/5 dark:bg-warning/10 border border-warning/10 px-2 py-1 rounded text-[9px] font-black text-warning uppercase tracking-wider">
                {task.category || "General"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isDraggable) return cardContent();

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => cardContent(provided, snapshot)}
    </Draggable>
  );
}

// OrgArchiveCard is no longer used; OrgTaskCard (isArchive={true}) is used instead.
