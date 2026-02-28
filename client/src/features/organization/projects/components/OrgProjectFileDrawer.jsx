import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { toast } from "react-toastify";

import fileAssetService from "../../../../services/fileAssetService";

export function OrgProjectFileDrawer({
  isOpen,
  onClose,
  contextType = "project",
  contextId,
  onUploadSuccess,
  editAsset = null,
}) {
  const [activeTab, setActiveTab] = useState(
    editAsset?.isExternal ? "link" : "upload",
  );
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState(editAsset?.fileName || "");
  const [description, setDescription] = useState(editAsset?.description || "");

  // Link state
  const [linkUrl, setLinkUrl] = useState(
    editAsset?.isExternal ? editAsset.storageUrl : "",
  );
  const [linkTitle, setLinkTitle] = useState(
    editAsset?.isExternal ? editAsset.fileName : "",
  );
  const [linkDescription, setLinkDescription] = useState(
    editAsset?.isExternal ? editAsset.description || "" : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if editAsset changes
  React.useEffect(() => {
    if (editAsset) {
      setActiveTab(editAsset.isExternal ? "link" : "upload");
      setFileTitle(editAsset.fileName);
      setDescription(editAsset.description || "");
      if (editAsset.isExternal) {
        setLinkUrl(editAsset.storageUrl);
        setLinkTitle(editAsset.fileName);
        setLinkDescription(editAsset.description || "");
      }
    } else {
      // Reset for new attachment
      setActiveTab("upload");
      setFileTitle("");
      setDescription("");
      setLinkUrl("");
      setLinkTitle("");
      setLinkDescription("");
      setSelectedFile(null);
    }
  }, [editAsset]);

  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Check 10MB limit (10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds the 10MB limit.");
      return;
    }
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contextId) {
      toast.error("Missing context ID for upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === "upload") {
        if (editAsset) {
          await fileAssetService.updateFileAsset(editAsset.id, {
            fileName: fileTitle,
            description: description,
          });
          toast.success("File updated successfully.");
        } else {
          if (!selectedFile) {
            toast.error("Please select a file to upload.");
            setIsSubmitting(false);
            return;
          }
          await fileAssetService.uploadFile(
            contextType,
            contextId,
            selectedFile,
            fileTitle,
            description,
          );
          toast.success("File uploaded successfully.");
        }
        removeFile();
        setFileTitle("");
        setDescription("");
      } else {
        if (editAsset) {
          await fileAssetService.updateFileAsset(editAsset.id, {
            fileName: linkTitle,
            description: linkDescription,
          });
          toast.success("External link updated successfully.");
        } else {
          if (!linkUrl || !linkTitle) {
            toast.error("Please provide both a URL and a title.");
            setIsSubmitting(false);
            return;
          }
          await fileAssetService.attachExternalLink(
            contextType,
            contextId,
            linkTitle,
            linkUrl,
            linkDescription,
          );
          toast.success("External link attached successfully.");
        }
        setLinkUrl("");
        setLinkTitle("");
        setLinkDescription("");
      }
      if (onUploadSuccess) onUploadSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to process attachment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-[450px] bg-white dark:bg-background-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-border-light dark:border-border-dark">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-white">
              {editAsset ? "Update Attachment" : "Add Attachment"}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {editAsset
                ? "Refine details for your attachment."
                : "Upload a file or link an external resource."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-tertiary hover:bg-white dark:hover:bg-gray-800 hover:text-text-primary transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark shadow-sm hover:shadow"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          {!editAsset && (
            <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === "upload"
                    ? "bg-white dark:bg-surface-dark text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <UploadCloud className="h-4 w-4" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("link")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === "link"
                    ? "bg-white dark:bg-surface-dark text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                External Link
              </button>
            </div>
          )}

          {editAsset && (
            <div className="mb-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary dark:text-white">
                    Editing {editAsset.isExternal ? "Link" : "File"}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Only title and description can be modified.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form id="attachment-form" onSubmit={handleSubmit}>
            {activeTab === "upload" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {!selectedFile ? (
                  <div
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border-light dark:border-border-dark hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleChange}
                    />
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-text-primary dark:text-white mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-text-tertiary">
                      SVG, PNG, JPG, PDF or ZIP (max. 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="border border-border-light dark:border-border-dark rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary dark:text-white truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-text-tertiary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-success bg-success/10 p-2 rounded-lg">
                      <CheckCircle2 className="h-4 w-4" />
                      Ready to upload
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 text-xs text-text-tertiary bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Ensure your files are not larger than 10MB. For larger
                    assets, please use the External Link option to attach a
                    Google Drive or Dropbox link.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text-primary dark:text-white flex items-center gap-2">
                      Friendly Title{" "}
                      <span className="text-text-tertiary text-xs font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Q4 Budget"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text-primary dark:text-white flex items-center gap-2">
                      Description{" "}
                      <span className="text-text-tertiary text-xs font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      placeholder="Add more details about this file..."
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "link" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-text-primary dark:text-white flex items-center gap-2">
                    Link URL <span className="text-error">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    required
                    disabled={!!editAsset}
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className={`w-full h-11 px-3 rounded-lg border focus:ring-2 focus:ring-primary/20 text-sm ${
                      editAsset
                        ? "bg-gray-100 dark:bg-gray-800/50 border-transparent cursor-not-allowed"
                        : "bg-gray-50 dark:bg-surface-dark border-border-light dark:border-border-dark"
                    }`}
                  />
                  <p className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                    <ExternalLink className="h-3 w-3" /> Connect Google Drive,
                    Dropbox, Figma, etc.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text-primary dark:text-white flex items-center gap-2">
                      Friendly Title <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Q4 Budget"
                      required
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text-primary dark:text-white flex items-center gap-2">
                      Description{" "}
                      <span className="text-text-tertiary text-xs font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      placeholder="Add more details about this link..."
                      rows={3}
                      value={linkDescription}
                      onChange={(e) => setLinkDescription(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-5">
            Cancel
          </Button>
          <Button
            form="attachment-form"
            type="submit"
            className="px-6 shadow-md shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : editAsset
                ? "Update Attachment"
                : activeTab === "upload"
                  ? "Upload File"
                  : "Attach Link"}
          </Button>
        </div>
      </aside>
    </>
  );
}
