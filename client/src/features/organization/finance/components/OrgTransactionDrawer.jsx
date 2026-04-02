import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  AlertCircle,
  RefreshCw,
  User,
  TrendingDown,
  TrendingUp,
  Paperclip,
  Link2,
  Trash2,
  Save,
  Building,
  Banknote,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { apiClient } from "../../../../lib/axios";
import { toast } from "react-toastify";
import fileAssetService from "../../../../services/fileAssetService";

export function OrgTransactionDrawer({
  isOpen,
  onClose,
  transaction,
  categories = [],
  onSuccess,
  mode = "add",
}) {
  const isReadOnly = mode === "view";

  const [transactionType, setTransactionType] = useState("EXPENSE");
  const [formData, setFormData] = useState({
    description: "",
    category_id: "",
    vendor_name: "",
    expense_date: new Date().toISOString().split("T")[0],
    amount: "",
    status: "POSTED",
    brief: "",
  });
  const [loading, setLoading] = useState(false);
  
  // Payment Modes State
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

  // Attachments State
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState("file"); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState("");
  const [urlTitleInput, setUrlTitleInput] = useState("");

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

  useEffect(() => {
    if (transaction) {
      setTransactionType(transaction.transaction_type || "EXPENSE");
      setFormData({
        description: transaction.description || "",
        category_id: transaction.category_id || "",
        vendor_name: transaction.vendor_name || "",
        expense_date: transaction.expense_date
          ? new Date(transaction.expense_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        amount: transaction.amount || "",
        status: transaction.status || "POSTED",
        brief: transaction.brief || "",
      });

      // Handle Payment Modes
      if (transaction.payment_modes && transaction.payment_modes.length > 0) {
        setSelectedModes(transaction.payment_modes.map((m) => m.mode));
        const amounts = { Bank: "", Cash: "", Credit: "" };
        transaction.payment_modes.forEach((m) => {
          amounts[m.mode] = m.amount;
        });
        setModeAmounts(amounts);
      } else {
        setSelectedModes(["Bank"]);
        setModeAmounts({ Bank: transaction.amount || "", Cash: "", Credit: "" });
      }

      // Handle Attachments
      setAttachments(
        transaction.attachments
          ? transaction.attachments.map((att) => ({
              id: att.file_asset_id,
              name: att.attachment_name,
              url: att.attachment_url,
              type: att.attachment_type === "url" ? "url" : "file",
              isNewFile: false,
            }))
          : [],
      );
    } else {
      setTransactionType("EXPENSE");
      setFormData({
        description: "",
        category_id: "",
        vendor_name: "",
        expense_date: new Date().toISOString().split("T")[0],
        amount: "",
        status: "POSTED",
        brief: "",
      });
      setSelectedModes(["Bank"]);
      setModeAmounts({ Bank: "", Cash: "", Credit: "" });
      setAttachments([]);
    }
  }, [transaction, isOpen]);

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
      // We'll treat URLs as regular attachments but with a flag or special type
      // For now, mirroring OrgExpenseDrawer logic
      const newAsset = await fileAssetService.attachExternalLink(
        "organization_transaction",
        transaction?.id || 0,
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
      window.open(downloadUrl, "_blank");
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

      // 1. Upload new files first
      let attachmentIds = attachments
        .filter((a) => !a.isNewFile)
        .map((a) => a.id);

      const filesToUpload = attachments.filter((a) => a.isNewFile && a.file);

      if (filesToUpload.length > 0) {
        setUploadingAttachment(true);
        try {
          const uploadPromises = filesToUpload.map((att) =>
            fileAssetService.uploadFile(
              "organization_transaction",
              transaction?.id || 0,
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
          toast.error("Failed to upload files. Transaction not saved.");
          setUploadingAttachment(false);
          setLoading(false);
          return;
        }
        setUploadingAttachment(false);
      }

      // 2. Prepare submission data
      const submissionData = {
        ...formData,
        transaction_type: transactionType,
        amount: parseFloat(formData.amount),
        attachment_ids: attachmentIds,
      };

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

      if (!submissionData.category_id) delete submissionData.category_id;

      // 3. Save to backend
      if (transaction && transaction.id) {
        await apiClient.put(
          `/org/finances/transactions/${transaction.id}`,
          submissionData,
        );
        toast.success("Transaction updated successfully");
      } else {
        await apiClient.post("/org/finances/transactions", submissionData);
        toast.success("Transaction added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save transaction:", error);
      toast.error(error?.response?.data?.error || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on transaction type
  const activeCategories = categories.filter((c) => {
    if (transactionType === "INCOME") {
      return ["REVENUE", "ASSET", "LIABILITY", "EQUITY"].includes(c.type);
    } else {
      return ["EXPENSE", "ASSET", "LIABILITY", "EQUITY"].includes(c.type);
    }
  });

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
              ? "View Transaction"
              : transaction
                ? "Edit Transaction"
                : "New Transaction"}
          </h2>
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                form="transaction-form"
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
          <form
            id="transaction-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Type Toggler */}
            {!isReadOnly && (
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${transactionType === "INCOME" ? "bg-white dark:bg-surface-dark text-emerald-600 shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                  onClick={() => setTransactionType("INCOME")}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Income
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${transactionType === "EXPENSE" ? "bg-white dark:bg-surface-dark text-red-600 shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
                  onClick={() => setTransactionType("EXPENSE")}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <TrendingDown className="h-4 w-4" /> Expense
                  </div>
                </button>
              </div>
            )}

            {isReadOnly && (
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 text-sm font-bold rounded-full ${transactionType === "INCOME" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                >
                  {transactionType === "INCOME" ? "INCOME" : "EXPENSE"}
                </span>
              </div>
            )}

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
                  placeholder="e.g., Enterprise Subscription or Office Supplies"
                  className={`w-full pl-3 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary ${isReadOnly ? "opacity-70 cursor-not-allowed" : ""}`}
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Brief / Details */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Transaction Brief{" "}
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
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium ${isReadOnly ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
                disabled={isReadOnly}
              >
                <option value="">Select Category</option>
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Vendor / Internal Stakeholder
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  placeholder="Organization or Individual"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-text-primary dark:text-white font-medium placeholder:font-normal placeholder:text-text-tertiary ${isReadOnly ? "opacity-70 cursor-not-allowed" : ""}`}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Transaction Date <span className="text-error">*</span>
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
                Status
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
                  <option value="POSTED">Posted</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="DRAFT">Draft</option>
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

              {!isReadOnly && uploadingAttachment && (
                <div className="flex items-center gap-2 text-xs font-bold text-primary mt-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                  attachments...
                </div>
              )}
            </div>
          </form>
        </div>

      </aside>
    </>
  );
}
