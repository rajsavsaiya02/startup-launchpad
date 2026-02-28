import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../../lib/axios";
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
  Save,
  Link2,
  Loader2,
  AlertCircle,
  ChevronDown,
  Check,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Avatar } from "../../../../components/ui/Avatar";
import { CreatableSelect } from "../../../../components/ui/CreatableSelect";
import taskService from "../../../../services/taskService";
import fileAssetService from "../../../../services/fileAssetService";
import userService from "../../../../services/userService";
import { useAuth } from "../../../../context/AuthContext";
import orgProjectService from "../../../../services/organization/orgProjectService";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CapsuleProgress = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center px-2.5 py-1 rounded-full border-1.5 transition-all duration-500",
        percentage === 100
          ? "border-success bg-success/5"
          : percentage > 0
            ? "border-primary bg-primary/5 shadow-[0_0_10px_rgba(46,107,229,0.05)]"
            : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-[11px] font-black leading-none",
            percentage > 0
              ? "text-text-primary dark:text-white"
              : "text-text-tertiary",
          )}
        >
          {completed}
        </span>
        <div
          className={cn(
            "w-px h-2.5 rotate-12",
            percentage > 0 ? "bg-primary/30" : "bg-text-tertiary/20",
          )}
        />
        <span className="text-[9px] font-bold text-text-tertiary leading-none uppercase tracking-tighter">
          {total}
        </span>
      </div>
    </div>
  );
};

export function OrgTaskDrawer({
  task,
  onClose,
  isOpen,
  onRefresh,
  isReadOnly = false,
}) {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    kanban_status: "todo",
    priority: "Medium",
    due_date: "",
    due_time: "",
    is_milestone: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([
    "General",
    "Development",
    "Design",
    "Marketing",
    "Research",
    "Sales",
  ]);

  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState("file");
  const [urlInput, setUrlInput] = useState("");
  const [urlTitleInput, setUrlTitleInput] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("");

  const [liveTotalTime, setLiveTotalTime] = useState(0);

  const fetchComments = useCallback(
    async (taskId) => {
      try {
        const res = await apiClient.get(
          `/projects/${projectId}/tasks/${taskId}/comments`,
        );
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    },
    [projectId],
  );

  useEffect(() => {
    if (!task) return;
    setLiveTotalTime(task.time_spent || 0);

    // Fetch comments
    if (task.id && isOpen) {
      fetchComments(task.id);
    }

    let interval = null;
    if (task.timer_started_at) {
      const start = new Date(task.timer_started_at).getTime();
      if (!isNaN(start) && start > 0) {
        interval = setInterval(() => {
          const now = Date.now();
          let elapsedSeconds = Math.floor((now - start) / 1000);
          if (elapsedSeconds > 86400) {
            elapsedSeconds = 86400; // Cap visual timer at 24h
          }
          setLiveTotalTime((task.time_spent || 0) + elapsedSeconds);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [task, fetchComments, isOpen]);

  useEffect(() => {
    setUrlInput("");
    setUrlTitleInput("");
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "General",
        kanban_status: task.kanban_status || "todo",
        priority: task.priority || "Medium",
        due_date: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : "",
        due_time: task.due_date
          ? new Date(task.due_date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
        is_milestone: task.is_milestone || false,
        assignee_id:
          task.assignee_ids && task.assignee_ids.length > 0
            ? task.assignee_ids[0]
            : "",
        subtasks: (() => {
          if (typeof task.subtasks === "string") {
            try {
              return JSON.parse(task.subtasks);
            } catch (err) {
              console.error("Failed to parse subtasks:", err);
              return [];
            }
          }
          return Array.isArray(task.subtasks) ? task.subtasks : [];
        })(),
      });

      // Load existing attachments for the task (if backend starts returning them)
      // For now, tasks might not return attachments array from API yet without a JOIN
      setAttachments(
        task.attachments
          ? task.attachments.map((att) => ({
              id: att.file_asset_id,
              name: att.file_name,
              url: att.storage_url,
              type: att.is_external ? "url" : "file",
              isNewFile: false,
            }))
          : [],
      );
    } else {
      const now = new Date();
      setFormData({
        title: "",
        description: "",
        category: "General",
        kanban_status: "todo",
        priority: "Medium",
        due_date: now.toISOString().split("T")[0],
        due_time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        is_milestone: false,
        assignee_id: user?.id || "",
        subtasks: [],
      });
      setAttachments([]);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchPreferences = async () => {
        try {
          const prefs = await userService.getPreferences();
          if (prefs.task_categories && prefs.task_categories.length > 0) {
            setCategories(prefs.task_categories);
          }
        } catch (err) {
          console.error("Failed to fetch user preferences:", err);
        }
      };

      const fetchMembers = async () => {
        try {
          const res = await orgProjectService.getProjectMembers(projectId);
          const membersList = Array.isArray(res)
            ? res
            : res.active_members || [];
          setProjectMembers(membersList);
        } catch (err) {
          console.error("Failed to fetch project members:", err);
        }
      };

      fetchPreferences();
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const handleCreateCategory = async (newCategory) => {
    if (categories.includes(newCategory)) return;
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    try {
      await userService.updatePreferences({ task_categories: newCategories });
    } catch {
      toast.error("Failed to save category preference");
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    const newCategories = categories.filter((c) => c !== categoryToDelete);
    setCategories(newCategories);
    if (formData.category === categoryToDelete) {
      setFormData((prev) => ({
        ...prev,
        category: newCategories[0] || "General",
      }));
    }
    try {
      await userService.updatePreferences({ task_categories: newCategories });
    } catch {
      toast.error("Failed to save category preference");
    }
  };

  if (!isOpen) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await apiClient.post(
        `/projects/${projectId}/tasks/${task.id}/comments`,
        { comment: newComment.trim() },
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleAddSubtask = (e) => {
    // If it's a keydown event, only proceed if it's "Enter"
    if (e && e.key && e.key !== "Enter") return;

    if (newSubtask.trim()) {
      if (e && e.preventDefault) e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        subtasks: [
          ...prev.subtasks,
          {
            id: Date.now().toString(),
            title: newSubtask.trim(),
            is_completed: false,
          },
        ],
      }));
      setNewSubtask("");
    }
  };

  const toggleSubtask = async (id) => {
    const updatedSubtasks = formData.subtasks.map((st) =>
      st.id === id ? { ...st, is_completed: !st.is_completed } : st,
    );

    setFormData((prev) => ({
      ...prev,
      subtasks: updatedSubtasks,
    }));

    if (isReadOnly && task) {
      try {
        await taskService.updateTask(projectId, task.id, {
          subtasks: updatedSubtasks,
        });
        if (onTaskSaved) {
          onTaskSaved();
        }
      } catch (err) {
        console.error("Failed to update subtask:", err);
        toast.error("Failed to update subtask");
        // Revert on failure
        setFormData((prev) => ({
          ...prev,
          subtasks: formData.subtasks,
        }));
      }
    }
  };

  const deleteSubtask = (id) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== id),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map((f) => ({
        name: f.name,
        file: f,
        isNewFile: true,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    e.target.value = null;
  };

  const handleAddUrl = async () => {
    if (!urlInput) return;
    setUploadingAttachment(true);
    try {
      const title =
        urlTitleInput || urlInput.split("/").pop() || "External Link";
      const newAsset = await fileAssetService.attachExternalLink(
        "project", // We attach task files to project level for now to reuse context easily.
        projectId,
        title,
        urlInput,
      );
      setAttachments((prev) => [
        ...prev,
        {
          id: newAsset.file_asset_id,
          name: newAsset.file_name,
          url: newAsset.storage_url,
          type: "url",
          isNewFile: false,
        },
      ]);
      setUrlInput("");
      setUrlTitleInput("");
    } catch {
      toast.error("Failed to attach URL");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttachmentClick = (att) => {
    if (att.isNewFile) {
      if (att.file) {
        const url = URL.createObjectURL(att.file);
        window.open(url, "_blank");
      }
      return;
    }

    if (att.type === "url") {
      window.open(att.url, "_blank", "noopener,noreferrer");
    } else {
      const downloadUrl = fileAssetService.getDownloadUrl(att.id);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", att.name || "attachment");
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setIsSaving(true);
    try {
      let attachmentIds = attachments
        .filter((a) => !a.isNewFile)
        .map((a) => a.id);

      const filesToUpload = attachments.filter((a) => a.isNewFile && a.file);

      if (filesToUpload.length > 0) {
        setUploadingAttachment(true);
        try {
          const uploadPromises = filesToUpload.map((att) =>
            fileAssetService.uploadFile(
              "project",
              projectId,
              att.file,
              att.file.name,
            ),
          );
          const uploadedAssets = await Promise.all(uploadPromises);
          attachmentIds = [
            ...attachmentIds,
            ...uploadedAssets.map((a) => a.file_asset_id),
          ];
        } catch (uploadError) {
          console.error(uploadError);
          toast.error("Failed to upload files.");
          setUploadingAttachment(false);
          setIsSaving(false);
          return;
        }
        setUploadingAttachment(false);
      }

      let finalDueDate = formData.due_date || null;
      if (formData.due_date && formData.due_time) {
        finalDueDate = `${formData.due_date}T${formData.due_time}`;
      }

      const submissionData = {
        ...formData,
        due_date: finalDueDate || null,
        attachment_ids: attachmentIds,
        assignee_ids: formData.assignee_id ? [formData.assignee_id] : [],
      };
      delete submissionData.due_time;
      delete submissionData.assignee_id;

      if (task?.id) {
        await taskService.updateTask(projectId, task.id, submissionData);
        toast.success("Task updated");
      } else {
        await taskService.createTask(projectId, submissionData);
        toast.success("Task created");
      }
      onRefresh?.();
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      toast.error("Error saving task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskService.deleteTask(projectId, task.id);
      onRefresh?.();
      onClose();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };
  const currentUserMember = projectMembers.find((m) => m.user_id === user?.id);
  const isManager =
    ["owner", "admin"].includes(currentUserMember?.project_role) ||
    ["FOUNDER", "CO-FOUNDER", "ADMIN"].includes(currentUserMember?.org_role) ||
    !!currentUserMember?.is_team_lead;
  const isAssignee = formData.assignee_id === user?.id;
  const canCompleteSubtasks = isManager || isAssignee;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-border-light dark:border-border-dark">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark shrink-0">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">
            {isReadOnly ? "Task Details" : task?.id ? "Edit Task" : "Add Task"}
          </h2>
          <div className="flex items-center gap-2">
            {!isReadOnly && task?.id && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-md text-error hover:bg-error/10 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !formData.title.trim()}
                className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save Task"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <form className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                  Task Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  placeholder="e.g., Fix memory leak in worker thread"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary transition-all disabled:opacity-75"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                  Description{" "}
                  <span className="text-text-tertiary font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  placeholder="Provide task details or context..."
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary min-h-[80px] resize-y custom-scrollbar transition-all disabled:opacity-75"
                />
              </div>

              {/* Grid for Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <CreatableSelect
                    label="Category"
                    name="category"
                    value={formData.category}
                    options={categories}
                    onChange={handleChange}
                    onCreateOption={handleCreateCategory}
                    onDeleteOption={handleDeleteCategory}
                    placeholder="Select category"
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium appearance-none cursor-pointer transition-all disabled:opacity-75"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid for Due Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                    Due Date
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full pl-4 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium transition-all disabled:opacity-75"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                    Due Time
                  </label>
                  <div className="relative group">
                    <input
                      type="time"
                      name="due_time"
                      value={formData.due_time}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full pl-4 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium transition-all disabled:opacity-75"
                    />
                  </div>
                </div>
              </div>

              {/* Grid for Status & Assignee */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="kanban_status"
                      value={formData.kanban_status}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium appearance-none cursor-pointer transition-all disabled:opacity-75"
                    >
                      <option value="todo">To Do</option>
                      <option value="progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                    Assignee{" "}
                    <span className="text-text-tertiary font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <div
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800/50 border ${isAssigneeDropdownOpen ? "border-primary ring-2 ring-primary/20" : "border-border-light dark:border-border-dark"} rounded-lg cursor-pointer transition-all ${isReadOnly ? "opacity-75 pointer-events-none" : ""}`}
                      onClick={() =>
                        !isReadOnly &&
                        setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)
                      }
                    >
                      <span className="text-text-primary dark:text-white font-medium truncate">
                        {formData.assignee_id
                          ? (() => {
                              const member = projectMembers.find(
                                (m) => m.user_id === formData.assignee_id,
                              );
                              return member
                                ? `${member.first_name} ${member.last_name}`
                                : "Unknown Member";
                            })()
                          : "Unassigned"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" />
                    </div>

                    {isAssigneeDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsAssigneeDropdownOpen(false)}
                        ></div>
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                          <div className="p-2 border-b border-border-light dark:border-border-dark flex items-center gap-2">
                            <Search className="h-4 w-4 text-text-tertiary ml-1 shrink-0" />
                            <input
                              type="text"
                              placeholder="Search members..."
                              value={assigneeSearchQuery}
                              onChange={(e) =>
                                setAssigneeSearchQuery(e.target.value)
                              }
                              autoFocus
                              className="w-full bg-transparent text-sm border-none focus:ring-0 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                            <div
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${!formData.assignee_id ? "bg-primary/10 text-primary" : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-text-secondary dark:text-gray-300"}`}
                              onClick={() => {
                                handleChange({
                                  target: { name: "assignee_id", value: "" },
                                });
                                setIsAssigneeDropdownOpen(false);
                                setAssigneeSearchQuery("");
                              }}
                            >
                              <Avatar
                                fallback="U"
                                size="xs"
                                className="h-6 w-6 opacity-50 border border-border-light"
                              />
                              Unassigned
                            </div>
                            {projectMembers
                              .filter((m) =>
                                `${m.first_name} ${m.last_name}`
                                  .toLowerCase()
                                  .includes(assigneeSearchQuery.toLowerCase()),
                              )
                              .map((member) => (
                                <div
                                  key={member.user_id}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${formData.assignee_id === member.user_id ? "bg-primary/10 text-primary" : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-text-secondary dark:text-gray-300"}`}
                                  onClick={() => {
                                    handleChange({
                                      target: {
                                        name: "assignee_id",
                                        value: member.user_id,
                                      },
                                    });
                                    setIsAssigneeDropdownOpen(false);
                                    setAssigneeSearchQuery("");
                                  }}
                                >
                                  <Avatar
                                    src={member.profile_picture_url}
                                    fallback={
                                      member.first_name?.charAt(0) || "U"
                                    }
                                    size="xs"
                                    className="h-6 w-6 shrink-0"
                                  />
                                  <span className="truncate">
                                    {member.first_name} {member.last_name}
                                  </span>
                                </div>
                              ))}
                            {projectMembers.filter((m) =>
                              `${m.first_name} ${m.last_name}`
                                .toLowerCase()
                                .includes(assigneeSearchQuery.toLowerCase()),
                            ).length === 0 && (
                              <div className="text-center py-4 text-xs font-medium text-text-tertiary">
                                No members found.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">
                    Subtasks{" "}
                    <span className="text-text-tertiary font-normal">
                      (Optional)
                    </span>
                  </label>
                  {formData.subtasks.length > 0 && (
                    <CapsuleProgress
                      completed={
                        formData.subtasks.filter((s) => s.is_completed).length
                      }
                      total={formData.subtasks.length}
                    />
                  )}
                </div>

                <div className="border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 min-h-[60px]">
                  <div className="space-y-1">
                    {formData.subtasks.map((st) => (
                      <div
                        key={st.id}
                        className="group flex items-center justify-between gap-3 p-2 rounded-md hover:bg-white dark:hover:bg-surface-dark transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark hover:shadow-sm"
                      >
                        <label className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1">
                          <div className="relative flex items-center justify-center shrink-0">
                            <input
                              type="checkbox"
                              checked={st.is_completed}
                              onChange={() => {
                                if (canCompleteSubtasks) {
                                  toggleSubtask(st.id);
                                }
                              }}
                              className="peer sr-only"
                              disabled={!canCompleteSubtasks}
                            />
                            <div
                              className={cn(
                                "h-5 w-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
                                "border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark peer-hover:border-primary/50",
                                "peer-checked:bg-primary peer-checked:border-primary",
                              )}
                            >
                              <Check
                                className={cn(
                                  "h-3 w-3 text-white transition-all duration-200 stroke-[4px]",
                                  st.is_completed
                                    ? "scale-100 opacity-100"
                                    : "scale-50 opacity-0",
                                )}
                              />
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-sm truncate transition-colors font-medium",
                              st.is_completed
                                ? "text-text-tertiary line-through"
                                : "text-text-secondary dark:text-gray-200",
                            )}
                          >
                            {st.title}
                          </span>
                        </label>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => deleteSubtask(st.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-error transition-all shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {!isReadOnly && (
                      <div className="flex items-center gap-2 p-1.5 mt-1 bg-gray-50 dark:bg-gray-800/80 rounded-md border border-border-light dark:border-border-dark focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddSubtask(e)
                          }
                          placeholder="Add a subtask..."
                          className="bg-transparent border-none p-1.5 text-sm focus:ring-0 flex-1 text-text-secondary dark:text-gray-300 placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleAddSubtask(e)}
                          disabled={!newSubtask.trim()}
                          className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-30"
                          title="Add Subtask"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                  Attachments{" "}
                  <span className="text-text-tertiary font-normal">
                    (Optional)
                  </span>
                </label>
                <div className="border border-border-light dark:border-border-dark rounded-lg p-3 bg-white dark:bg-surface-dark space-y-3 shadow-sm">
                  {!isReadOnly && (
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                      <button
                        type="button"
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${attachmentMode === "file" ? "bg-white dark:bg-surface-dark text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                        onClick={() => setAttachmentMode("file")}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Paperclip className="h-3.5 w-3.5" /> File
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${attachmentMode === "url" ? "bg-white dark:bg-surface-dark text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                        onClick={() => setAttachmentMode("url")}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Link2 className="h-3.5 w-3.5" /> URL
                        </div>
                      </button>
                    </div>
                  )}

                  {!isReadOnly && attachmentMode === "file" && (
                    <label className="relative flex flex-col items-center justify-center p-4 border border-dashed border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-all bg-gray-50/30 dark:bg-gray-800/20">
                      <div className="p-2 rounded-full bg-primary/10 text-primary mb-2">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-bold text-text-primary dark:text-white">
                        Click to attach documents
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  )}

                  {!isReadOnly && attachmentMode === "url" && (
                    <div className="space-y-2 p-3 border border-border-light dark:border-border-dark rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
                      <input
                        type="text"
                        placeholder="URL (e.g., Google Drive link)"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Title (Optional)"
                        value={urlTitleInput}
                        onChange={(e) => setUrlTitleInput(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="w-full text-xs py-1.5 h-8"
                        onClick={handleAddUrl}
                        disabled={!urlInput || uploadingAttachment}
                      >
                        {uploadingAttachment ? "Adding..." : "Add Link"}
                      </Button>
                    </div>
                  )}

                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-3 max-h-40 overflow-y-auto custom-scrollbar">
                      {attachments.map((att, index) => (
                        <div
                          key={att.id || index}
                          className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-md"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <div className="p-1.5 bg-primary/10 text-primary rounded shrink-0">
                              {att.type === "url" ? (
                                <Link2 className="h-3.5 w-3.5" />
                              ) : (
                                <Paperclip className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div className="min-w-0 pr-2">
                              <p
                                className="text-sm font-bold text-primary dark:text-primary-light truncate cursor-pointer hover:underline"
                                onClick={() => handleAttachmentClick(att)}
                                title={`Open ${att.name}`}
                              >
                                {att.name}
                              </p>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadingAttachment && attachmentMode === "file" && (
                    <div className="flex items-center gap-2 text-xs font-bold text-primary justify-center mt-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
                      files...
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 lg:border-l lg:border-border-light dark:lg:border-border-dark lg:pl-8 space-y-8 flex flex-col h-[calc(100vh-100px)] pt-2 md:pt-0">
            {/* Time Tracking Section */}
            {(() => {
              if (!task?.id || !task?.time_logs) return null;
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

              if (parsedLogs.length === 0) return null;

              return (
                <div className="text-sm shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2 tracking-wide">
                      <Clock className="h-4 w-4 text-primary" />
                      Time Tracking
                    </label>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 flex items-center rounded-md">
                      Total:{" "}
                      {(() => {
                        const h = Math.floor(liveTotalTime / 3600);
                        const m = Math.floor((liveTotalTime % 3600) / 60);
                        const s = liveTotalTime % 60;
                        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
                      })()}
                    </span>
                  </div>
                  {/* Scrollable container: Max height allows ~3 items, then it scrolls */}
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-2 space-y-2.5">
                    {parsedLogs.map((log, index) => {
                      const startDate = new Date(log.start_time);
                      const endDate = new Date(log.end_time);
                      // Calculate exactly from timestamps for maximum precision
                      const diffInSeconds = Math.max(
                        0,
                        Math.floor(
                          (endDate.getTime() - startDate.getTime()) / 1000,
                        ),
                      );

                      const h = Math.floor(diffInSeconds / 3600);
                      const m = Math.floor((diffInSeconds % 3600) / 60);
                      const s = diffInSeconds % 60;
                      const durationStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

                      // Simple format helper to avoid undefined errors if import fails
                      const simpleFormatTime = (d) => {
                        if (isNaN(d.getTime())) return "Invalid Time";
                        return d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });
                      };
                      const simpleFormatDate = (d) => {
                        if (isNaN(d.getTime())) return "Invalid Date";
                        return d.toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        });
                      };

                      return (
                        <div
                          key={log.id || index}
                          className="flex flex-col bg-gray-50/40 dark:bg-gray-800/20 rounded-xl p-3 border border-border-light dark:border-border-dark transition-all hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                              {log.user_name ? (
                                <span className="text-xs font-semibold text-text-primary dark:text-gray-200">
                                  {log.user_name}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-text-secondary dark:text-gray-400">
                                  Self
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-text-tertiary">
                              {simpleFormatDate(startDate)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 opacity-80">
                              <span className="text-[11px] text-text-secondary font-medium tracking-wide bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                {simpleFormatTime(startDate)}
                              </span>
                              <span className="text-[10px] text-text-tertiary">
                                →
                              </span>
                              <span className="text-[11px] text-text-secondary font-medium tracking-wide bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                {simpleFormatTime(endDate)}
                              </span>
                            </div>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                              {durationStr}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Comments Section */}
            {task?.id ? (
              <div className="flex flex-col flex-1 min-h-[300px] border border-border-light dark:border-border-dark rounded-xl bg-gray-50/30 dark:bg-gray-800/10 overflow-hidden">
                <div className="px-4 py-3 bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark shrink-0">
                  <label className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2 tracking-wide">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Discussion{" "}
                    <span className="text-xs font-normal text-text-tertiary bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {comments.length}
                    </span>
                  </label>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center text-sm text-text-tertiary py-8 flex flex-col items-center gap-2">
                      <MessageSquare className="h-8 w-8 text-gray-200 dark:text-gray-700" />
                      No comments yet. Start the conversation!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar
                          src={comment.profile_picture_url}
                          fallback={comment.first_name?.charAt(0) || "U"}
                          className="h-8 w-8 ring-2 ring-white dark:ring-surface-dark shadow-sm shrink-0"
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[13px] font-bold text-text-primary dark:text-gray-200 truncate">
                              {comment.first_name} {comment.last_name}
                            </span>
                            <span className="text-[10px] font-medium text-text-tertiary shrink-0 ml-2">
                              {new Date(comment.created_at).toLocaleDateString(
                                [],
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark shadow-sm rounded-2xl rounded-tl-none px-3.5 py-2.5">
                            <p className="text-[13px] text-text-secondary dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-white dark:bg-surface-dark border-t border-border-light dark:border-border-dark shrink-0">
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or post an update..."
                      className="w-full px-3 py-2 text-[13px] bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary min-h-[60px] resize-none custom-scrollbar transition-all"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddComment}
                        disabled={isPostingComment || !newComment.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-lg text-[12px] font-bold transition-all"
                      >
                        {isPostingComment ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isPostingComment ? "Posting..." : "Post Comment"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] border border-dashed border-border-light dark:border-border-dark rounded-xl bg-gray-50/20 dark:bg-gray-800/5 text-text-tertiary text-sm">
                <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                <p>Save this task to start a discussion.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
