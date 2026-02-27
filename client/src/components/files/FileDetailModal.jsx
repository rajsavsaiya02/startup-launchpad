import React from "react";
import {
  X,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  Layers,
  File as FileIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/Button";

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getFileIcon = (asset, size = "large") => {
  const iconProps = {
    className:
      size === "large" ? "w-16 h-16 text-primary" : "w-10 h-10 text-primary",
  };

  if (asset.isExternal) {
    return <ExternalLink {...iconProps} />;
  }

  const ext = asset.fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
      return (
        <FileText
          {...iconProps}
          className={`${iconProps.className} text-blue-500`}
        />
      );
    case "xls":
    case "xlsx":
    case "csv":
      return (
        <FileSpreadsheet
          {...iconProps}
          className={`${iconProps.className} text-green-500`}
        />
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return (
        <ImageIcon
          {...iconProps}
          className={`${iconProps.className} text-purple-500`}
        />
      );
    case "zip":
    case "rar":
    case "tar":
    case "gz":
      return (
        <Archive
          {...iconProps}
          className={`${iconProps.className} text-orange-500`}
        />
      );
    case "fig":
    case "sketch":
      return (
        <Layers
          {...iconProps}
          className={`${iconProps.className} text-pink-500`}
        />
      );
    default:
      return (
        <FileIcon
          {...iconProps}
          className={`${iconProps.className} text-gray-500`}
        />
      );
  }
};

export function FileDetailModal({
  isOpen,
  onClose,
  asset,
  canManageFiles,
  onDownload,
  onEdit,
  onDelete,
}) {
  if (!isOpen || !asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="h-24 bg-linear-to-br from-primary/10 to-indigo-50 dark:from-primary/5 dark:to-surface-dark relative border-b border-border-light dark:border-border-dark flex items-end px-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-tertiary hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors shadow-sm bg-white/50 backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Icon */}
          <div className="absolute -bottom-10 left-8 bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-xl border border-border-light dark:border-border-dark flex items-center justify-center">
            {getFileIcon(asset, "large")}
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-16 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold text-text-primary dark:text-white leading-tight break-all">
            {asset.fileName}
          </h2>

          {/* Quick Preview Area */}
          {(asset.mimeType?.startsWith("image/") ||
            asset.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 flex items-center justify-center max-h-60">
              <img
                src={
                  asset.isExternal
                    ? asset.storageUrl
                    : `${import.meta.env.VITE_API_URL || "/api"}/uploads/${asset.storageUrl}`
                }
                alt={asset.fileName}
                className="max-w-full max-h-60 object-contain"
                onError={(e) => {
                  e.target.parentElement.style.display = "none";
                }}
              />
            </div>
          )}

          {asset.description && (
            <div className="mt-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-border-light dark:border-border-dark italic">
              <p className="text-sm text-text-secondary dark:text-gray-400">
                "{asset.description}"
              </p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-tertiary mb-1">
                Uploaded By
              </p>
              <p className="text-sm font-medium text-text-primary dark:text-gray-200">
                {asset.uploaderName}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-tertiary mb-1">
                Upload Date
              </p>
              <p className="text-sm font-medium text-text-primary dark:text-gray-200">
                {format(new Date(asset.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-tertiary mb-1">
                Type
              </p>
              <p className="text-sm font-medium text-text-primary dark:text-gray-200">
                {asset.isExternal
                  ? "External Link"
                  : asset.fileName.split(".").pop().toUpperCase() || "File"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-tertiary mb-1">
                Size
              </p>
              <p className="text-sm font-medium text-text-primary dark:text-gray-200">
                {asset.isExternal ? "—" : formatBytes(asset.sizeBytes)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/20 flex items-center justify-between gap-3">
          <Button
            onClick={(e) => {
              onDownload(e, asset);
            }}
            className="flex-1 justify-center gap-2 rounded-2xl"
          >
            {asset.isExternal ? (
              <ExternalLink className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {asset.isExternal ? "Open Link" : "Download File"}
          </Button>

          {canManageFiles && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={(e) => {
                  onClose(); // Close modal first
                  onEdit(e, asset);
                }}
                className="gap-2 px-3 rounded-2xl"
                title="Rename File"
              >
                <Edit2 className="w-4 h-4 text-text-tertiary" />
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  onClose(); // Close modal first
                  onDelete(e, asset);
                }}
                className="gap-2 px-3 hover:bg-error/10 hover:text-error hover:border-error/20 rounded-2xl"
                title="Delete File"
              >
                <Trash2 className="w-4 h-4 text-error" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
