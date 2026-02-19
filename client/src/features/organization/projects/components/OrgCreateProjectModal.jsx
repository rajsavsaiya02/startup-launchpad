import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Drawer } from "../../../../components/ui/Drawer";
import { CreatableSelect } from "../../../../components/ui/CreatableSelect";
import orgProjectService from "../../../../services/organization/orgProjectService";
import userService from "../../../../services/userService";
import { toast } from "react-toastify";

const DEFAULT_CATEGORIES = [
  "General",
  "Development",
  "Marketing",
  "Design",
  "Research",
  "Sales",
];

const DEFAULT_STATUSES = ["Active", "Planning", "Completed", "On Hold"];

// Helper to get formatted date string (YYYY-MM-DD)
const getFormattedDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

export function OrgCreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  projectToEdit,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    start_date: "",
    due_date: "",
    priority: "Medium",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Options State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);

  const isEditing = !!projectToEdit;

  // Fetch User Preferences (Categories & Statuses)
  useEffect(() => {
    if (isOpen) {
      const fetchPreferences = async () => {
        try {
          const prefs = await userService.getPreferences();
          if (prefs.project_categories && prefs.project_categories.length > 0) {
            setCategories(prefs.project_categories);
          }
          if (prefs.project_statuses && prefs.project_statuses.length > 0) {
            setStatuses(prefs.project_statuses);
          }
        } catch (err) {
          console.error("Failed to fetch user preferences:", err);
          // Fallback to defaults is already handled by initial state
        }
      };
      fetchPreferences();
    }
  }, [isOpen]);

  // Reset/Pre-fill Form
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setFormData({
          title: projectToEdit.title || "",
          description: projectToEdit.description || "",
          category: projectToEdit.category || "General",
          start_date: projectToEdit.start_date
            ? getFormattedDate(projectToEdit.start_date)
            : "",
          due_date: projectToEdit.due_date
            ? getFormattedDate(projectToEdit.due_date)
            : "",
          priority: projectToEdit.priority || "Medium",
          status: projectToEdit.status || "Active",
        });
      } else {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        setFormData({
          title: "",
          description: "",
          category: "General",
          start_date: getFormattedDate(today),
          due_date: getFormattedDate(tomorrow),
          priority: "Medium",
          status: "Active",
        });
      }
      setError(null);
    }
  }, [isOpen, projectToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Preference Handlers
  const updatePreferencesInBackend = async (type, newItems, successMessage) => {
    try {
      await userService.updatePreferences({ [type]: newItems });
      toast.success(successMessage);
    } catch (err) {
      console.error(`Failed to update ${type}:`, err);
      toast.error("Failed to save changes.");
    }
  };

  const handleCreateCategory = async (newCategory) => {
    if (categories.includes(newCategory)) return;
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    await updatePreferencesInBackend(
      "project_categories",
      newCategories,
      "Category added!",
    );
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    const newCategories = categories.filter((c) => c !== categoryToDelete);
    setCategories(newCategories);
    // If current selection is deleted, revert to default
    if (formData.category === categoryToDelete) {
      setFormData((prev) => ({
        ...prev,
        category: newCategories[0] || "General",
      }));
    }
    await updatePreferencesInBackend(
      "project_categories",
      newCategories,
      "Category deleted!",
    );
  };

  const handleCreateStatus = async (newStatus) => {
    if (statuses.includes(newStatus)) return;
    const newStatuses = [...statuses, newStatus];
    setStatuses(newStatuses);
    await updatePreferencesInBackend(
      "project_statuses",
      newStatuses,
      "Status added!",
    );
  };

  const handleDeleteStatus = async (statusToDelete) => {
    const newStatuses = statuses.filter((s) => s !== statusToDelete);
    setStatuses(newStatuses);
    // If current selection is deleted, revert to default
    if (formData.status === statusToDelete) {
      setFormData((prev) => ({ ...prev, status: newStatuses[0] || "Active" }));
    }
    await updatePreferencesInBackend(
      "project_statuses",
      newStatuses,
      "Status deleted!",
    );
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Project name is required.";
    }
    if (!formData.start_date) {
      return "Start date is required.";
    }
    if (!formData.due_date) {
      return "Due date is required.";
    }
    if (new Date(formData.due_date) < new Date(formData.start_date)) {
      return "Due date cannot be earlier than the start date.";
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      if (isEditing) {
        await orgProjectService.updateProject(projectToEdit.id, formData);
        toast.success("Organization project updated successfully!");
      } else {
        await orgProjectService.createProject(formData);
        toast.success("Organization project created successfully!");
      }

      onProjectCreated?.(); // Refresh list
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} organization project`,
      );
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} organization project`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing ? "Edit Organization Project" : "New Organization Project"
      }
      description={
        isEditing
          ? "Update the details of your organization project."
          : "Create a new organization project to track team work."
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50 flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Project Name */}
        <div className="space-y-4">
          <Input
            label="Organization Project Name"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Q4 Marketing Campaign"
            className="bg-white dark:bg-gray-800/50"
          />

          {/* Category & Status */}
          <div className="space-y-4">
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

            <CreatableSelect
              label="Status"
              name="status"
              value={formData.status}
              options={statuses}
              onChange={handleChange}
              onCreateOption={handleCreateStatus}
              onDeleteOption={handleDeleteStatus}
              placeholder="Select or create status"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 text-sm min-h-[100px] bg-white dark:bg-gray-800/50 text-text-primary dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none hover:border-gray-400 dark:hover:border-gray-600"
            placeholder="Add a short description..."
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary dark:text-gray-300">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-text-primary dark:text-white text-sm px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 dark:hover:border-gray-600"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary dark:text-gray-300">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-text-primary dark:text-white text-sm px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all hover:border-gray-400 dark:hover:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary dark:text-gray-300">
            Priority
          </label>
          <div className="relative group">
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-text-primary dark:text-white text-sm pl-3 pr-10 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer transition-all hover:border-gray-400 dark:hover:border-gray-600"
            >
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
              <option value="Critical">Critical</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-4 border-t border-border-light dark:border-border-dark flex gap-3">
          <Button
            className="flex-1 shadow-lg shadow-primary/25"
            onClick={handleSubmit}
            isLoading={loading}
          >
            {isEditing
              ? "Update Organization Project"
              : "Create Organization Project"}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
