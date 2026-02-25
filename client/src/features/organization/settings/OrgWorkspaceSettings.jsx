import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { apiClient } from "../../../lib/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  AlertTriangle,
  X,
  ShieldCheck,
  Lock,
  Building2,
  Globe,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { OrgPublicProfileSettings } from "./OrgPublicProfileSettings";

export function OrgWorkspaceSettings() {
  const { user } = useAuth();
  const isFounder = user?.role?.toLowerCase() === "founder";

  const [name, setName] = useState("");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteSecurityCode, setDeleteSecurityCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Password Change State
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [newOrgPassword, setNewOrgPassword] = useState("");
  const [confirmOrgPassword, setConfirmOrgPassword] = useState("");
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/org");
      if (res.data.organization) {
        setName(res.data.organization.name || "");
        setWorkspaceUrl(res.data.organization.workspace_url || "");
      }
    } catch {
      toast.error("Failed to load workspace settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await apiClient.put("/org", {
        name,
        // workspace_url is now immutable on backend, sending it won't change anything
        // but we keep it here for data consistency OR remove it.
        // Let's just send name as per the new controller logic.
      });
      toast.success("Workspace settings updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.post("/org/delete-otp");
      toast.success("Verification code sent to your email.");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to send verification code",
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteOtp) return toast.error("Please enter the verification code.");
    if (!deleteSecurityCode)
      return toast.error("Security Password is required for deletion.");

    try {
      setIsDeleting(true);
      await apiClient.delete("/org", {
        data: {
          otp: deleteOtp,
          security_code: deleteSecurityCode,
        },
      });
      toast.success("Startup Hub deleted successfully.");
      window.location.href = "/org/dashboard";
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete Startup Hub");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    try {
      setIsPasswordChanging(true);
      await apiClient.post("/org/security-code-otp");
      setPasswordOtpSent(true);
      toast.success("Verification code sent to your email.");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to send verification code",
      );
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleConfirmPasswordChange = async () => {
    if (!passwordOtp || !newOrgPassword)
      return toast.error("OTP and new password are required.");

    if (newOrgPassword !== confirmOrgPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      setIsPasswordChanging(true);
      await apiClient.put("/org/security-code", {
        otp: passwordOtp,
        new_security_code: newOrgPassword,
      });
      toast.success(
        "Security password updated successfully. Deletion blocked for 7 days.",
      );
      setShowPasswordChangeModal(false);
      setPasswordOtpSent(false);
      setPasswordOtp("");
      setNewOrgPassword("");
      setConfirmOrgPassword("");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to update security password",
      );
    } finally {
      setIsPasswordChanging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-8 pt-10">
      <div className="border-b border-border-light dark:border-border-dark pb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-white">
          Workspace Settings
        </h1>
        <p className="text-text-secondary dark:text-gray-400 mt-1">
          Manage your workspace preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Startup Identity Card */}
        <Card className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm rounded-xl overflow-hidden p-6">
          <div className="mb-6 border-b border-border-light dark:border-border-dark pb-4">
            <h2 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Startup Identity
            </h2>
            <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
              Manage your startup's branding and workspace identity.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">
                  Workspace Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="LaunchPad Inc."
                  disabled={isSaving}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">
                  Workspace URL
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-[10px] border border-r-0 border-border-light dark:border-border-dark bg-gray-100/50 dark:bg-white/5 text-text-tertiary text-sm">
                    /org/
                  </span>
                  <input
                    type="text"
                    value={workspaceUrl}
                    readOnly
                    disabled
                    className="flex-1 block w-full rounded-none rounded-r-[10px] border border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5 text-text-tertiary px-3 py-2 text-sm outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-text-tertiary italic mt-1">
                  Workspace URL is immutable and cannot be changed.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Updating..." : "Update Workspace"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Master Password Card */}
        {isFounder && (
          <Card className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm rounded-xl overflow-hidden p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Security
                  Password
                </h2>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1 max-w-xl">
                  Security Password is required for critical actions like
                  startup hub deletion. Changing it will block deletion for 7
                  days.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordChangeModal(true);
                  handleRequestPasswordChange();
                }}
                disabled={isPasswordChanging}
              >
                {isPasswordChanging && !showPasswordChangeModal
                  ? "Requesting..."
                  : "Change Security Password"}
              </Button>
            </div>
          </Card>
        )}

        {/* Danger Zone Card */}
        {isFounder && (
          <Card className="bg-white dark:bg-surface-dark border border-error/50 shadow-sm rounded-xl overflow-hidden p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-error flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1 max-w-xl">
                  Permanently delete this startup hub, all of its projects,
                  tasks, and member data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                className="bg-error hover:bg-error/90 text-white"
                onClick={() => {
                  setShowDeleteModal(true);
                  handleRequestDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting && !showDeleteModal
                  ? "Requesting..."
                  : "Delete Startup Hub"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative border border-border-light dark:border-border-dark">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                Confirm Deletion
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteOtp("");
                  setDeleteSecurityCode("");
                }}
                className="p-2 rounded-lg text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mb-6 border border-error/20 mx-auto">
                <ShieldAlert className="w-7 h-7 text-error" />
              </div>

              <div className="text-center mb-8">
                <h4 className="text-xl font-black text-text-primary dark:text-white mb-2">
                  Terminate Startup Hub?
                </h4>
                <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                  This action is <strong>irreversible</strong>. Enter the source
                  code sent to your email and your Security Password to proceed.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary ml-1">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    className="w-full text-center text-xl font-mono tracking-[0.5em] h-12 bg-gray-50 dark:bg-white/5 border-border-light dark:border-border-dark"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary ml-1">
                    Security Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showDeletePassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={deleteSecurityCode}
                      onChange={(e) => setDeleteSecurityCode(e.target.value)}
                      className="w-full h-12 bg-gray-50 dark:bg-white/5 border-border-light dark:border-border-dark pr-10"
                      disabled={isDeleting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {showDeletePassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-white/5 font-bold"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-[1.5] h-12 bg-error hover:bg-error/90 text-white shadow-lg shadow-error/20 font-bold"
                    onClick={handleConfirmDelete}
                    disabled={
                      isDeleting ||
                      !deleteOtp ||
                      deleteOtp.length < 6 ||
                      !deleteSecurityCode
                    }
                  >
                    {isDeleting ? "Wiping Data..." : "Confirm Termination"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative border border-border-light dark:border-border-dark">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                Update Security Key
              </h3>
              <button
                onClick={() => {
                  setShowPasswordChangeModal(false);
                  setPasswordOtpSent(false);
                  setPasswordOtp("");
                  setNewOrgPassword("");
                  setConfirmOrgPassword("");
                }}
                className="p-2 rounded-lg text-text-tertiary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 mx-auto">
                <Lock className="w-7 h-7 text-primary" />
              </div>

              <div className="text-center mb-8">
                <h4 className="text-xl font-black text-text-primary dark:text-white mb-2">
                  Reset Security Access
                </h4>
                <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed font-medium">
                  Verify your identity with the OTP sent to your email.
                  <span className="text-primary block mt-1 italic font-bold">
                    7-day cooling period applies.
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary ml-1">
                    Verification OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value)}
                    className="w-full text-center text-xl font-mono tracking-[0.5em] h-12 bg-gray-50 dark:bg-white/5 border-border-light dark:border-border-dark"
                    maxLength={6}
                    disabled={!passwordOtpSent || isPasswordChanging}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newOrgPassword}
                        onChange={(e) => setNewOrgPassword(e.target.value)}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border-border-light dark:border-border-dark pr-10"
                        disabled={!passwordOtpSent || isPasswordChanging}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary ml-1">
                      Confirm
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmOrgPassword}
                      onChange={(e) => setConfirmOrgPassword(e.target.value)}
                      className="w-full h-12 bg-gray-50 dark:bg-white/5 border-border-light dark:border-border-dark"
                      disabled={!passwordOtpSent || isPasswordChanging}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-white/5 font-bold"
                    onClick={() => setShowPasswordChangeModal(false)}
                    disabled={isPasswordChanging}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-[1.5] h-12 bg-primary text-white shadow-lg shadow-primary/20 font-bold"
                    onClick={handleConfirmPasswordChange}
                    disabled={
                      isPasswordChanging ||
                      !passwordOtp ||
                      !newOrgPassword ||
                      !confirmOrgPassword ||
                      passwordOtp.length < 6
                    }
                  >
                    {isPasswordChanging ? "Updating..." : "Authorize Update"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
