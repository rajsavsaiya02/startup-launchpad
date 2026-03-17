import React, { useState, useEffect } from "react";
import {
  Share2,
  Plus,
  MoreHorizontal,
  Search,
  MessageSquare,
  Paperclip,
  Filter,
  ChevronDown,
  ExternalLink,
  Edit2,
  Flag,
  Check,
  Clock,
  Calendar,
  Layers,
  Play,
  Trash2,
  CheckSquare,
  Download,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Pause,
} from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { cn } from "../../utils/cn";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Dropdown, DropdownItem } from "../../components/ui/Dropdown";
import taskService from "../../services/taskService";
import fileAssetService from "../../services/fileAssetService";
import { useAuth } from "../../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskDrawer } from "./components/TaskDrawer";
import { ProjectFileDrawer } from "./components/ProjectFileDrawer";
import { FileDetailModal } from "../../components/files/FileDetailModal";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { TasksAnalytics } from "./components/TasksAnalytics";

const MotionCard = motion.create(Card);

export function ProjectTasksPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isTaskDrawerReadOnly, setIsTaskDrawerReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("Work Board");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState("All");

  // --- Resource Files State ---
  const [fileAssets, setFileAssets] = useState([]);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [fileSortBy, setFileSortBy] = useState("newest");
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [selectedDetailAsset, setSelectedDetailAsset] = useState(null);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

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

    // Optimistic Update
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
      console.error("Failed to update subtask status:", err);
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
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await taskService.getAllTasks();
        if (isMounted) setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchFileAssets = async (userId) => {
    try {
      const data = await fileAssetService.getFileAssets("user", userId);
      setFileAssets(data);
    } catch (err) {
      console.error("Failed to load generic task files:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      const load = async () => {
        try {
          const data = await fileAssetService.getFileAssets("user", user.id);
          if (isMounted) setFileAssets(data);
        } catch (err) {
          console.error("Failed to load generic task files:", err);
        }
      };
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleDeleteFile = async (e, asset) => {
    e.stopPropagation();
    try {
      if (asset.isExternal) {
        if (!window.confirm("Remove this link?")) return;
        await fileAssetService.deleteFileAsset(asset.id);
        toast.success("Link removed");
      } else {
        if (!window.confirm("Delete this file permanently?")) return;
        await fileAssetService.deleteFileAsset(asset.id);
        toast.success("File deleted");
      }
      setSelectedDetailAsset(null);
      if (user?.id) fetchFileAssets(user.id);
    } catch {
      toast.error("Failed to delete attachment");
    }
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

    // Optimistic Update
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(taskSearchQuery.toLowerCase());
    const matchesPriority =
      taskPriorityFilter === "All" || task.priority === taskPriorityFilter;
    const matchesCategory =
      taskCategoryFilter === "All" || task.category === taskCategoryFilter;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const uniqueCategories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean)),
  ).sort();

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.kanban_status === "todo"),
    progress: filteredTasks.filter((t) => t.kanban_status === "progress"),
    review: filteredTasks.filter((t) => t.kanban_status === "review"),
    done: filteredTasks.filter((t) => t.kanban_status === "done"),
  };

  return (
    <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark">
      {/* 1. Project Header Card */}
      <div className="mt-6 mb-4 bg-white/70 dark:bg-surface-dark/70 border border-border-light dark:border-border-dark shadow-xl shadow-gray-200/20 dark:shadow-none rounded-[2.5rem] z-10 overflow-hidden shrink-0 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="px-12 pt-10 pb-8 flex items-start justify-between gap-4 relative z-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-gray-950 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight">
              Task Setup & Management
            </h1>
            <p className="mt-2 text-base text-text-tertiary dark:text-gray-400 leading-relaxed font-medium max-w-2xl">
              Configure your workspace, track productivity metrics, and manage
              your project tasks with elite-level precision.
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
              <div className="absolute rounded-2xl border inset-0 bg-gradient-to-br from-primary to-indigo-600 group-hover:from-primary-hover group-hover:to-indigo-700 transition-all duration-300" />
              <div className="relative flex items-center gap-2.5">
                <Plus className="h-5 w-5 stroke-[3.5px]" />
                <span>NEW TASK</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tabs Control Bar */}
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
                    layoutId="activeTab"
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

      {/* 2. Main Board Area */}
      {activeTab === "Work Board" && (
        <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4 pt-2 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 py-2 items-center justify-between shrink-0">
            <div className="relative flex-1 w-full max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-tertiary" />
              </div>
              <input
                type="text"
                placeholder="Search tasks across board..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-surface-dark border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all outline-none shadow-sm placeholder:text-text-tertiary dark:placeholder:text-gray-600"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
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
                  className="w-full pl-10 pr-10 py-3 text-xs font-bold text-text-secondary dark:text-gray-400 bg-white dark:bg-surface-dark border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded-2xl focus:ring-2 focus:ring-primary/40 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
              </div>
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="pb-10">
              <div className="flex gap-4 min-h-full items-stretch">
                <WorkColumn
                  id="todo"
                  title="To Do"
                  count={tasksByStatus.todo.length}
                  color="border-yellow-400"
                >
                  {tasksByStatus.todo.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={() => handleEditTask(task)}
                      onView={() => handleViewTask(task)}
                      onToggleSubtask={handleToggleSubtask}
                      onTaskUpdate={(props) => handleTaskUpdate(task.id, props)}
                    />
                  ))}
                </WorkColumn>
                <WorkColumn
                  id="progress"
                  title="In Progress"
                  count={tasksByStatus.progress.length}
                  color="border-primary"
                >
                  {tasksByStatus.progress.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={() => handleEditTask(task)}
                      onView={() => handleViewTask(task)}
                      onToggleSubtask={handleToggleSubtask}
                      onTaskUpdate={(props) => handleTaskUpdate(task.id, props)}
                    />
                  ))}
                </WorkColumn>
                <WorkColumn
                  id="review"
                  title="In Review"
                  count={tasksByStatus.review.length}
                  color="border-purple-500"
                >
                  {tasksByStatus.review.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={() => handleEditTask(task)}
                      onView={() => handleViewTask(task)}
                      onToggleSubtask={handleToggleSubtask}
                      onTaskUpdate={(props) => handleTaskUpdate(task.id, props)}
                    />
                  ))}
                </WorkColumn>
                <WorkColumn
                  id="done"
                  title="Done"
                  count={tasksByStatus.done.length}
                  color="border-green-500"
                >
                  {tasksByStatus.done.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={() => handleEditTask(task)}
                      onView={() => handleViewTask(task)}
                      onToggleSubtask={handleToggleSubtask}
                      onTaskUpdate={(props) => handleTaskUpdate(task.id, props)}
                    />
                  ))}
                </WorkColumn>
              </div>
            </div>
          </DragDropContext>
        </div>
      )}

      {activeTab === "Productivity" && <TasksAnalytics tasks={tasks} />}

      {activeTab === "Resources" && (
        <div className="flex-1 w-full overflow-visible px-4 pb-32 pt-2">
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-0 md:px-0">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-text-primary dark:text-white shrink-0">
                  Task Resources
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

      <TaskDrawer
        task={selectedTask}
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        onRefresh={fetchTasks}
        isReadOnly={isTaskDrawerReadOnly}
      />

      <ProjectFileDrawer
        isOpen={isUploadDrawerOpen || isEditDrawerOpen}
        onClose={() => {
          setIsUploadDrawerOpen(false);
          setIsEditDrawerOpen(false);
          setAssetToEdit(null);
        }}
        contextType="user"
        contextId={user?.id}
        onUploadSuccess={() => user?.id && fetchFileAssets(user.id)}
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
    </div>
  );
}

// --- Shared Components for Work ---

function WorkColumn({ id, title, count, color, children }) {
  let bgDot = color.replace("border-", "bg-");
  if (bgDot.includes("yellow")) bgDot = "bg-yellow-500";
  if (bgDot.includes("primary")) bgDot = "bg-primary";
  if (bgDot.includes("green")) bgDot = "bg-green-500";
  if (bgDot.includes("purple")) bgDot = "bg-purple-500";

  return (
    <div className="flex flex-1 min-w-[300px] flex-col bg-slate-50/50 dark:bg-slate-900/30 border border-border-light dark:border-border-dark rounded-[1.5rem] shadow-sm overflow-hidden backdrop-blur-sm">
      <div className="bg-white/80 dark:bg-surface-dark/80 border-b border-border-light dark:border-border-dark px-5 py-4 flex justify-between items-center shrink-0 backdrop-blur-md">
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

function TaskCard({
  task,
  index,
  onEdit,
  onView,
  onToggleSubtask = () => {},
  onTaskUpdate,
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

  // --- Timer & Time Tracking Logic ---
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

  // Sync state if task prop changes (e.g. from parent re-fetch)
  const [prevTaskTimer, setPrevTaskTimer] = useState({
    ts: task.time_spent,
    tsa: task.timer_started_at,
  });

  if (
    task.time_spent !== prevTaskTimer.ts ||
    task.timer_started_at !== prevTaskTimer.tsa
  ) {
    setPrevTaskTimer({
      ts: task.time_spent,
      tsa: task.timer_started_at,
    });
    setBaseTimeSpent(parseInt(task.time_spent) || 0);
    setLiveTimeSpent(parseInt(task.time_spent) || 0);
    setIsTimerRunning(!!task.timer_started_at);
    setActiveTimerStart(task.timer_started_at);
  }

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && activeTimerStart) {
      const start = new Date(activeTimerStart).getTime();
      if (!isNaN(start) && start > 0) {
        interval = setInterval(() => {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - start) / 1000);
          setLiveTimeSpent(baseTimeSpent + Math.max(0, elapsedSeconds));
        }, 1000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimerStart, baseTimeSpent]);

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
      // Stopping
      if (activeTimerStart) {
        const startTs = new Date(activeTimerStart).getTime();
        if (!isNaN(startTs) && startTs > 0) {
          const elapsed = Math.floor((Date.now() - startTs) / 1000);
          if (elapsed > 0) {
            newTimeLogs.unshift({
              id: crypto.randomUUID(),
              start_time: activeTimerStart,
              end_time: nowISO,
              duration_seconds: elapsed,
            });
            newTimeSpent += elapsed;
          }
        }
      }
    } else {
      // Starting
      newTimerStartedAt = nowISO;
    }

    // Update Local UI State
    setBaseTimeSpent(newTimeSpent);
    setLiveTimeSpent(newTimeSpent);
    setIsTimerRunning(!isTimerRunning);
    setActiveTimerStart(newTimerStartedAt);

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
      console.error("Failed to toggle timer:", err);
      toast.error("Timer update failed");
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={onView}
          style={{ ...provided.draggableProps.style }}
          className={cn(
            "group relative bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all p-4 cursor-default overflow-hidden shrink-0",
            snapshot.isDragging
              ? "shadow-2xl ring-2 ring-primary/50 rotate-1 z-50"
              : "",
          )}
        >
          {/* Main content area */}
          <div className="flex flex-col gap-3.5">
            {/* Top row: Check circle + Title + Tag + Flag */}
            <div className="flex justify-between items-start gap-3">
              <div className="flex gap-3 items-start min-w-0">
                <button
                  className={cn(
                    "shrink-0 mt-[2px] h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center",
                    task.kanban_status === "done"
                      ? "border-primary bg-primary"
                      : "border-text-tertiary hover:border-primary",
                  )}
                >
                  {task.kanban_status === "done" && (
                    <Check className="h-3 w-3 text-white" strokeWidth={4} />
                  )}
                </button>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-black text-text-primary dark:text-white leading-tight tracking-tight">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-[11px] text-text-tertiary mt-1.5 leading-relaxed line-clamp-2">
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
                  )}
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* Subtasks Section - Modern & Interactive */}
            {totalSubtasks > 0 && (
              <div className="flex flex-col gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-border-light/40 dark:border-border-dark/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                    Subtasks
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary">
                    <CheckSquare className="h-3 w-3" />
                    {completedSubtasks}/{totalSubtasks}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {subtasks.map((subtask, sIdx) => (
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
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Section - Elevated Style */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Project Tag */}
              {task.project_title && (
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[9px] font-black text-primary uppercase tracking-wider">
                  {task.project_title}
                </div>
              )}
              {/* Category Pill */}
              <div className="bg-warning/5 dark:bg-warning/10 border border-warning/10 px-2 py-0.5 rounded text-[9px] font-black text-warning uppercase tracking-wider">
                {task.category || "General"}
              </div>
              {/* Date Pill */}
              {task.due_date &&
                (() => {
                  const isOverdue =
                    new Date(task.due_date) < new Date() &&
                    task.kanban_status !== "done";
                  return (
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded flex items-center gap-1.5 text-[9px] font-bold transition-all",
                        isOverdue
                          ? "bg-error/10 border border-error/20 text-error"
                          : "bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark text-text-secondary",
                      )}
                    >
                      <Calendar
                        className={cn(
                          "h-2.5 w-2.5",
                          isOverdue ? "text-error" : "text-text-tertiary",
                        )}
                      />
                      {new Date(task.due_date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  );
                })()}
            </div>

            {/* Bottom Row: Actions & Timer */}
            <div className="flex items-center justify-between pt-1 border-t border-border-light/40 dark:border-border-dark/40">
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-lg transition-colors",
                  isTimerRunning
                    ? "bg-warning/10 text-warning animate-pulse"
                    : "text-text-tertiary bg-gray-50/50 dark:bg-gray-800/20",
                )}
              >
                <Clock className="h-3.3" />
                {formatTime(liveTimeSpent)}
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleToggleTimer}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isTimerRunning
                      ? "text-warning hover:bg-warning/5"
                      : "text-success hover:bg-success/5",
                  )}
                  title={isTimerRunning ? "Pause Timer" : "Track Time"}
                >
                  {isTimerRunning ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                </button>
                <div className="w-px h-3 bg-border-light dark:bg-border-dark mx-1" />
                <button
                  onClick={onView}
                  className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  title="View Details"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={onEdit}
                  className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  title="Edit Task"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/5 rounded-lg transition-all"
                  title="Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
