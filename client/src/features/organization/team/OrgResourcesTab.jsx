import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Cloud,
  Layers,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Archive,
  Image as ImageIcon,
  Download,
  Trash2,
  Edit2,
  X,
  MoreVertical,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import fileAssetService from "../../../services/fileAssetService";
import { ProjectFileDrawer } from "../../operations/components/ProjectFileDrawer";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../context/AuthContext";
import { Dropdown, DropdownItem } from "../../../components/ui/Dropdown";
import { FileDetailModal } from "../../../components/files/FileDetailModal";

const MotionCard = motion.create(Card);

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

export function OrgResourcesTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState(null);
  const [myRole, setMyRole] = useState("MEMBER");

  const [fileAssets, setFileAssets] = useState([]);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [fileSortBy, setFileSortBy] = useState("newest");
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);

  const [deleteConfirmModalAsset, setDeleteConfirmModalAsset] = useState(null);
  const [selectedDetailAsset, setSelectedDetailAsset] = useState(null);
  const [assetToEdit, setAssetToEdit] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [orgRes, membersRes] = await Promise.all([
        apiClient.get("/org"),
        apiClient.get("/org/members"),
      ]);
      const currentOrgId = orgRes.data.organization.organization_id;
      setOrgId(currentOrgId);

      const me = membersRes.data.members?.find((m) => m.user_id === user?.id);
      if (me) setMyRole(me.org_role);

      const filesData = await fileAssetService.getFileAssets(
        "organization",
        currentOrgId,
      );
      setFileAssets(filesData);
    } catch {
      toast.error("Failed to load organization resources.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchFileAssets = async () => {
    if (!orgId) return;
    try {
      const data = await fileAssetService.getFileAssets("organization", orgId);
      setFileAssets(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load files");
    }
  };

  const handleDeleteFile = (e, asset) => {
    e.stopPropagation();
    setDeleteConfirmModalAsset(asset);
  };

  const _confirmDeleteFile = async () => {
    if (!deleteConfirmModalAsset) return;
    try {
      await fileAssetService.deleteFileAsset(deleteConfirmModalAsset.id);
      toast.success("File deleted");
      setDeleteConfirmModalAsset(null);
      fetchFileAssets();
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handleDownloadFile = async (e, asset) => {
    e.stopPropagation();
    if (asset.isExternal) {
      window.open(asset.storageUrl, "_blank");
      return;
    }
    try {
      const response = await apiClient.get(
        `/file-assets/${asset.id}/download`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", asset.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  const canManageFiles = myRole === "FOUNDER" || myRole === "ADMIN";

  const filteredAndSortedFiles = fileAssets
    .filter((f) =>
      f.fileName.toLowerCase().includes(fileSearchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (fileSortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (fileSortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (fileSortBy === "a-z") return a.fileName.localeCompare(b.fileName);
      return 0;
    });

  if (loading) {
    return (
      <div className="text-center text-text-tertiary mt-12">
        Loading resources...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-text-primary dark:text-white shrink-0">
            Organization Resources
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
          {canManageFiles && (
            <Button
              onClick={() => setIsUploadDrawerOpen(true)}
              className="gap-2 shadow-md shadow-primary/20 shrink-0 bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Attachment
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {canManageFiles && (
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
          )}

          {filteredAndSortedFiles.map((asset) => (
            <MotionCard
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={asset.id}
              className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group border-border-light dark:border-border-dark bg-white dark:bg-surface-dark relative min-w-[200px]"
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
                <p
                  className="text-[10px] text-text-tertiary truncate mt-0.5"
                  title={`Uploaded by ${asset.uploaderName}`}
                >
                  {new Date(asset.createdAt).toLocaleDateString()} •{" "}
                  {asset.uploaderName} •{" "}
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
                      icon={asset.isExternal ? ExternalLink : Download}
                      onClick={(e) => handleDownloadFile(e, asset)}
                    >
                      {asset.isExternal ? "Open Link" : "Download"}
                    </DropdownItem>

                    {canManageFiles && (
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
                    )}
                  </Dropdown>
                </div>
              </div>
            </MotionCard>
          ))}
        </AnimatePresence>
      </div>

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
        canManageFiles={canManageFiles}
        onDownload={handleDownloadFile}
        onEdit={(e, asset) => {
          setAssetToEdit(asset);
          setIsEditDrawerOpen(true);
        }}
        onDelete={handleDeleteFile}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">
                Delete File?
              </h3>
              <p className="text-sm text-text-secondary dark:text-gray-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text-primary dark:text-white">
                  {deleteConfirmModalAsset.fileName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmModalAsset(null)}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={_confirmDeleteFile}>
                  Delete File
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
