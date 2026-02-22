import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";
import { CreatableSelect } from "../../../components/ui/CreatableSelect";
import taskService from "../../../services/taskService";
import fileAssetService from "../../../services/fileAssetService";
import userService from "../../../services/userService";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export function TaskDrawer({ task, onClose, isOpen, onRefresh }) {
  const { id: projectId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    kanban_status: "todo",
    priority: "Medium",
    due_date: "",
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
        is_milestone: task.is_milestone || false,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
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
      setFormData({
        title: "",
        description: "",
        category: "General",
        kanban_status: "todo",
        priority: "Medium",
        due_date: "",
        is_milestone: false,
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
      fetchPreferences();
    }
  }, [isOpen]);

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

  const handleAddSubtask = (e) => {
    if (e.key === "Enter" && newSubtask.trim()) {
      e.preventDefault();
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

  const toggleSubtask = (id) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st) =>
        st.id === id ? { ...st, is_completed: !st.is_completed } : st,
      ),
    }));
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

      const submissionData = { ...formData, attachment_ids: attachmentIds };

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-border-light dark:border-border-dark">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark shrink-0">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">
            {task?.id ? "Edit Task" : "Add Task"}
          </h2>
          <div className="flex items-center gap-2">
            {task?.id && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-md text-error hover:bg-error/10 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
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
                placeholder="e.g., Fix memory leak in worker thread"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary transition-all"
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
                placeholder="Provide task details or context..."
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary min-h-[80px] resize-y custom-scrollbar transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <CreatableSelect
                label="Category"
                name="category"
                value={formData.category}
                options={categories}
                onChange={handleChange}
                onCreateOption={handleCreateCategory}
                onDeleteOption={handleDeleteCategory}
                placeholder="Select or create category"
              />
            </div>

            {/* Grid for Due Date & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium transition-all"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                </div>
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
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium appearance-none cursor-pointer transition-all"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

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
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium appearance-none cursor-pointer transition-all"
                >
                  <option value="todo">To Do</option>
                  <option value="progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Subtasks{" "}
                <span className="text-text-tertiary font-normal">
                  (Optional)
                </span>
              </label>

              <div className="border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 min-h-[60px]">
                <div className="space-y-1">
                  {formData.subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="group flex items-center justify-between gap-3 p-2 rounded-md hover:bg-white dark:hover:bg-surface-dark transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark hover:shadow-sm"
                    >
                      <label className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1">
                        <input
                          type="checkbox"
                          checked={st.is_completed}
                          onChange={() => toggleSubtask(st.id)}
                          className="h-4 w-4 rounded border-border-light text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span
                          className={cn(
                            "text-sm truncate transition-colors",
                            st.is_completed
                              ? "text-text-tertiary line-through"
                              : "text-text-secondary dark:text-gray-200",
                          )}
                        >
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-error transition-all shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 p-2 mt-1">
                    <Plus className="h-4 w-4 text-text-tertiary shrink-0" />
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={handleAddSubtask}
                      placeholder="Add a subtask and press Enter..."
                      className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full text-text-secondary dark:text-gray-300 placeholder:text-gray-400"
                    />
                  </div>
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

                {attachmentMode === "file" && (
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

                {attachmentMode === "url" && (
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
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
      </aside>
    </>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
