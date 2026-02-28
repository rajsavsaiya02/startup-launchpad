import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import {
  X,
  Calendar,
  DollarSign,
  Tag,
  User,
  AlertCircle,
  RefreshCw,
  Paperclip,
  CheckCircle2,
  Loader2,
  FileText,
  Trash2,
  Building,
  CreditCard,
  Banknote,
  Link2,
  Save,
  Clock,
} from "lucide-react";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { CreatableSelect } from "../../../../components/ui/CreatableSelect";
import projectFinancialsService from "../../../../services/projectFinancialsService";
import fileAssetService from "../../../../services/fileAssetService";
import userService from "../../../../services/userService";
import { toast } from "react-toastify";

const DEFAULT_EXPENSE_CATEGORIES = [
  "Labor / Personnel",
  "Software / Subscriptions",
  "Marketing / Ads",
  "Infrastructure / Hosting",
  "Legal & Compliance",
  "Other Operational Cost",
];

export function OrgExpenseDrawer({
  isOpen,
  onClose,
  projectId,
  expense,
  onSuccess,
  mode = "add",
}) {
  const { user } = useAuth();
  const isOwner = !expense || expense.created_by_id === user?.id;
  const isReadOnly = mode === "view" || !isOwner;

  const [formData, setFormData] = useState({
    description: "",
    brief: "",
    category: "Labor",
    vendor_name: "",
    expense_date: new Date().toISOString().split("T")[0],
    amount: "",
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState("file"); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState("");
  const [urlTitleInput, setUrlTitleInput] = useState("");

  // Category State
  const [categories, setCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);

  const PAYMENT_OPTIONS = [
    { id: "Bank", icon: Building },
    { id: "Cash", icon: Banknote },
    { id: "Credit", icon: CreditCard },
  ];
  const [selectedModes, setSelectedModes] = useState(["Bank"]);
  const [modeAmounts, setModeAmounts] = useState({
    Bank: "",
    Cash: "",
    Credit: "",
  });

  // Auto-calculate total amount when multiple modes are selected
  useEffect(() => {
    if (selectedModes.length > 1) {
      const total = selectedModes.reduce(
        (sum, mode) => sum + (parseFloat(modeAmounts[mode]) || 0),
        0,
      );
      setFormData((prev) => {
        if (parseFloat(prev.amount || 0).toFixed(2) === total.toFixed(2))
          return prev;
        return { ...prev, amount: total > 0 ? total.toFixed(2) : "" };
      });
    }
  }, [selectedModes, modeAmounts]);

  // Fetch Categories from Backend Preferences
  useEffect(() => {
    if (isOpen) {
      const fetchPreferences = async () => {
        try {
          const prefs = await userService.getPreferences();
          if (prefs.expense_categories && prefs.expense_categories.length > 0) {
            setCategories(prefs.expense_categories);
          }
        } catch (err) {
          console.error("Failed to fetch expense category preferences:", err);
        }
      };
      fetchPreferences();
    }
  }, [isOpen]);

  useEffect(() => {
    setUrlInput("");
    setUrlTitleInput("");
    if (expense) {
      setFormData({
        description: expense.description || "",
        brief: expense.brief || "",
        category: expense.category || "Labor",
        vendor_name: expense.vendor_name || "",
        expense_date: expense.expense_date
          ? new Date(expense.expense_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        amount: expense.amount || "",
        status: expense.status || "Pending",
      });

      if (expense.payment_modes && expense.payment_modes.length > 0) {
        setSelectedModes(expense.payment_modes.map((m) => m.mode));
        const amounts = { Bank: "", Cash: "", Credit: "" };
        expense.payment_modes.forEach((m) => {
          amounts[m.mode] = m.amount;
        });
        setModeAmounts(amounts);
      } else {
        setSelectedModes(["Bank"]);
        setModeAmounts({ Bank: expense.amount || "", Cash: "", Credit: "" });
      }

      setAttachments(
        expense.attachments
          ? expense.attachments.map((att) => ({
              id: att.file_asset_id,
              name: att.attachment_name,
              url: att.attachment_url,
              type: att.attachment_type,
              isNewFile: false,
            }))
          : [],
      );
    } else {
      setFormData({
        description: "",
        brief: "",
        category: "Labor",
        vendor_name: "",
        expense_date: new Date().toISOString().split("T")[0],
        amount: "",
        status: "Pending",
      });
      setSelectedModes(["Bank"]);
      setModeAmounts({ Bank: "", Cash: "", Credit: "" });
      setAttachments([]);
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleModeToggle = (mode) => {
    if (isReadOnly) return;
    if (selectedModes.includes(mode)) {
      if (selectedModes.length === 1) return; // Prevent unselecting the last one
      setSelectedModes((prev) => prev.filter((m) => m !== mode));
    } else {
      setSelectedModes((prev) => [...prev, mode]);
    }
  };

  const handleCreateCategory = async (newCategory) => {
    if (categories.includes(newCategory)) return;
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    try {
      await userService.updatePreferences({
        expense_categories: newCategories,
      });
      toast.success("Category added!");
    } catch (err) {
      console.error("Failed to update categories:", err);
      toast.error("Failed to save new category.");
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    const newCategories = categories.filter((c) => c !== categoryToDelete);
    setCategories(newCategories);
    // If current selection is deleted, revert to first available or default
    if (formData.category === categoryToDelete) {
      setFormData((prev) => ({
        ...prev,
        category: newCategories[0] || DEFAULT_EXPENSE_CATEGORIES[0],
      }));
    }
    try {
      await userService.updatePreferences({
        expense_categories: newCategories,
      });
      toast.success("Category deleted!");
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast.error("Failed to save changes.");
    }
  };

  const handleModeAmountChange = (mode, value) => {
    setModeAmounts((prev) => ({ ...prev, [mode]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    e.target.value = null; // reset input
  };

  const handleAddUrl = async () => {
    if (!urlInput) return;
    setUploadingAttachment(true);
    try {
      const title =
        urlTitleInput || urlInput.split("/").pop() || "External Link";
      const newAsset = await fileAssetService.attachExternalLink(
        "project",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.expense_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

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
              att.file.name, // Removed prefix
            ),
          );
          const uploadedAssets = await Promise.all(uploadPromises);
          attachmentIds = [
            ...attachmentIds,
            ...uploadedAssets.map((a) => a.file_asset_id),
          ];
        } catch (uploadError) {
          console.error(uploadError);
          toast.error("Failed to upload files. Expense not saved.");
          setUploadingAttachment(false);
          setLoading(false);
          return;
        }
        setUploadingAttachment(false);
      }

      const submissionData = { ...formData, attachment_ids: attachmentIds };

      if (selectedModes.length === 1) {
        submissionData.payment_modes = [
          { mode: selectedModes[0], amount: parseFloat(formData.amount) || 0 },
        ];
      } else {
        submissionData.payment_modes = selectedModes.map((mode) => ({
          mode,
          amount: parseFloat(modeAmounts[mode]) || 0,
        }));
      }

      if (expense && expense.id) {
        await projectFinancialsService.updateExpense(
          projectId,
          expense.id,
          submissionData,
        );
        toast.success("Expense updated successfully");
      } else {
        await projectFinancialsService.createExpense(projectId, submissionData);
        toast.success("Expense added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save expense:", error);
      toast.error(error?.response?.data?.error || "Failed to save expense");
    } finally {
      setLoading(false);
      setUploadingAttachment(false);
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
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark bg-white dark:bg-background-dark sticky top-0 z-10">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">
            {isReadOnly
              ? "View Expense Record"
              : expense
                ? "Edit Expense Record"
                : "Add Expense Record"}
          </h2>
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                form="expense-form"
                disabled={loading}
                title="Save Changes"
                className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-tertiary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-border-light dark:hover:border-border-dark"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Description / Item <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Domain Renewal or Freelancer Payment"
                  className={`w-full pl-3 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary ${isReadOnly ? "opacity-70 cursor-not-allowed" : ""}`}
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>
            {/* Brief / Details */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Expense Brief{" "}
                <span className="text-text-tertiary font-normal">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <textarea
                  name="brief"
                  value={formData.brief || ""}
                  onChange={handleChange}
                  placeholder="Provide a short breakdown or reference details..."
                  className={`w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary min-h-[80px] resize-y custom-scrollbar ${isReadOnly ? "opacity-70 cursor-not-allowed" : ""}`}
                  disabled={isReadOnly}
                />
              </div>
            </div>
            {/* Payment & Amount Section */}
            <div className="space-y-5">
              {/* Payment Modes */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-2.5">
                  Payment Mode
                </label>
                <div className="flex flex-wrap gap-3">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const isSelected = selectedModes.includes(opt.id);
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleModeToggle(opt.id)}
                        disabled={isReadOnly}
                        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full border text-[13px] font-bold transition-all min-w-[100px] ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white dark:bg-surface-dark text-text-tertiary border-border-light dark:border-border-dark hover:border-text-tertiary"
                        } ${isReadOnly && !isSelected ? "opacity-50" : ""} ${isReadOnly ? "cursor-default" : ""}`}
                      >
                        <Icon className="h-4 w-4" />
                        {opt.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Breakdown (if multiple) */}
              {selectedModes.length > 1 && (
                <div className="space-y-3 p-4 border border-border-light dark:border-border-dark rounded-xl bg-gray-50/30 dark:bg-gray-800/20">
                  <p className="text-[11px] text-text-tertiary mb-3 font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Split payment
                    amounts act as grand total.
                  </p>
                  {selectedModes.map((mode) => (
                    <div key={mode} className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-text-secondary dark:text-gray-300 w-16">
                        {mode}
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={modeAmounts[mode]}
                          onChange={(e) =>
                            handleModeAmountChange(mode, e.target.value)
                          }
                          placeholder="0.00"
                          disabled={isReadOnly}
                          className={`w-full pl-8 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white transition-all ${isReadOnly ? "opacity-70 cursor-not-allowed" : "hover:border-text-tertiary/50"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grand Total Amount */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">
                    {selectedModes.length > 1
                      ? "Grand Total (INR)"
                      : "Amount (INR)"}{" "}
                    <span className="text-error">*</span>
                  </label>
                  {selectedModes.length > 1 && (
                    <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-bold">
                      Auto-calculated
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium ${isReadOnly || selectedModes.length > 1 ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
                    required
                    disabled={isReadOnly || selectedModes.length > 1}
                  />
                </div>
              </div>
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
                disabled={isReadOnly}
              />
            </div>

            {/* Payee / Vendor */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Payee / Vendor
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  placeholder="Name of person or company"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary ${isReadOnly ? "opacity-70 cursor-not-allowed" : ""}`}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Expense Date <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium ${isReadOnly ? "opacity-70 cursor-not-allowed" : "cursor-text"}`}
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Payment Status
              </label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none appearance-none text-text-primary dark:text-white font-medium ${isReadOnly ? "opacity-70 cursor-default pointer-events-none" : "cursor-pointer"}`}
                  disabled={isReadOnly}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially">Partial</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                  <option value="Recurring">Recurring</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {/* Attachment Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">
                Attachments
              </label>

              {/* Mode Toggle */}
              {!isReadOnly && (
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button
                    type="button"
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${attachmentMode === "file" ? "bg-white dark:bg-surface-dark text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                    onClick={() => setAttachmentMode("file")}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" /> Upload File
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${attachmentMode === "url" ? "bg-white dark:bg-surface-dark text-primary shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                    onClick={() => setAttachmentMode("url")}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5" /> Link URL
                    </div>
                  </button>
                </div>
              )}

              {/* Upload Input */}
              {!isReadOnly && attachmentMode === "file" && (
                <label className="relative flex flex-col items-center justify-center p-4 border border-dashed border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-all">
                  <div className="p-2 rounded-full bg-primary/10 text-primary mb-2">
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold text-text-primary dark:text-white">
                    Click to attach documents
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Multiple files allowed (PDF, Image, Doc)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
              )}

              {/* URL Input */}
              {!isReadOnly && attachmentMode === "url" && (
                <div className="space-y-2 p-3 border border-border-light dark:border-border-dark rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
                  <input
                    type="text"
                    placeholder="URL (e.g., Google Drive link)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Title (Optional)"
                    value={urlTitleInput}
                    onChange={(e) => setUrlTitleInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
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

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="space-y-2 mt-3 p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-border-light dark:border-border-dark max-h-40 overflow-y-auto custom-scrollbar">
                  {attachments.map((att, index) => (
                    <div
                      key={att.id || index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md shadow-sm"
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
                            className="text-xs font-bold text-primary dark:text-primary-light truncate cursor-pointer hover:underline"
                            onClick={() => handleAttachmentClick(att)}
                            title={`Open ${att.name}`}
                          >
                            {att.name}
                          </p>
                          <p className="text-[10px] text-text-tertiary truncate">
                            {att.type === "url"
                              ? "External Link"
                              : att.isNewFile
                                ? "New File"
                                : "Existing File"}
                          </p>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isReadOnly &&
                uploadingAttachment &&
                attachmentMode === "file" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary mt-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
                    files...
                  </div>
                )}

              {!isReadOnly && (
                <p className="text-[11px] text-text-tertiary mt-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Uploaded files are added to the Project Files repository.
                </p>
              )}
            </div>
            {/* Audit Tracking Card */}
            {expense && (expense.creator_name || expense.updater_name) && (
              <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark">
                <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl p-4 border border-border-light dark:border-border-dark ring-offset-background transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={expense.updater_avatar || expense.creator_avatar}
                      fallback={
                        (expense.updater_name || expense.creator_name || "?")[0]
                      }
                      size="sm"
                      className="ring-2 ring-primary/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-0.5">
                        {expense.updater_name ? "Last Edited By" : "Added By"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[13px] font-bold text-text-primary dark:text-white truncate">
                          {expense.updater_name || expense.creator_name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-text-tertiary shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="text-[11px] font-bold tabular-nums">
                            {new Date(
                              expense.updated_at || expense.created_at,
                            ).toLocaleString([], {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </aside>
    </>
  );
}
