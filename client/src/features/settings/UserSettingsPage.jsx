import React, { useState, useEffect } from "react";
import {
  Settings,
  Upload,
  Save,
  Shield,
  Key,
  LogOut,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  HardDrive,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { DeviceIcon } from "../../components/security/DeviceIcon";
import { cn } from "../../utils/cn";
import { PublicProfile } from "./PublicProfile";

const SECTION_TITLES = {
  profile: "Public Profile",
  account: "Account Security", // Legacy mapping
  security: "Account Security",
  notifications: "Notifications",
  billing: "Billing & Plans",
};

export function UserSettingsPage({ section = "profile" }) {
  const { addToast } = useToast();
  const { user } = useAuth();

  // Map 'account' to 'security' if needed, or handle as alias
  const activeSection = section === "account" ? "security" : section;

  const title = SECTION_TITLES[activeSection] || "Settings";

  // State for Security Section
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Fetch data based on active section
  useEffect(() => {
    if (activeSection === "security") {
      fetchSessions();
    }
  }, [activeSection]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await apiClient.get("/sessions");
      setSessions(res.data.sessions);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      // Fallback mock data if API fails for demo
      // setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to revoke this session?"))
      return;
    try {
      await apiClient.delete(`/sessions/${sessionId}`);
      addToast("Session revoked successfully", "success");
      fetchSessions();
    } catch (err) {
      console.error(err);
      addToast("Failed to revoke session", "error");
    }
  };

  const handleRevokeAllOther = async () => {
    if (
      !window.confirm(
        "Are you sure you want to log out from all other devices?",
      )
    )
      return;
    try {
      await apiClient.delete("/sessions");
      addToast("All other sessions signed out", "success");
      fetchSessions();
    } catch (err) {
      console.error(err);
      addToast("Failed to sign out other sessions", "error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }

    setLoadingPassword(true);
    try {
      await apiClient.put("/users/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      addToast("Password updated successfully", "success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update password";
      addToast(msg, "error");
    } finally {
      setLoadingPassword(false);
    }
  };

  // Security Redirect: If user tries to access workspace but isn't a founder
  if (activeSection === "workspace" && user?.role !== "founder") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
        <div className="pt-6 pb-2 border-b border-border-light dark:border-border-dark mb-6">
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight mb-2">
            Settings
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
          <Shield className="h-16 w-16 text-text-tertiary mb-4" />
          <h2 className="text-xl font-bold text-text-primary dark:text-white">
            Access Denied
          </h2>
          <p className="text-text-secondary mt-2">
            You do not have permission to view this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-8 animate-in fade-in duration-500 pb-20 mx-auto",
        activeSection === "profile"
          ? "w-full max-w-[1920px] px-6"
          : "max-w-5xl",
      )}
    >
      {/* Page Header */}
      <div className="pt-6 pb-2 border-b border-border-light dark:border-border-dark mb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">
          Manage your {activeSection} preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* PROFILE SETTINGS TAB */}
        {activeSection === "profile" && <PublicProfile />}

        {/* SECURITY SETTINGS TAB */}
        {activeSection === "security" && (
          <div className="space-y-6">
            {/* Change Password Card */}
            <Card className="p-8 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
              <div className="border-b border-border-light dark:border-border-dark pb-6 mb-6">
                <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" /> Change Password
                </h2>
                <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">
                  Ensure your account is secure by using a strong password.
                </p>
              </div>

              <form
                onSubmit={handlePasswordChange}
                className="space-y-4 max-w-xl"
              >
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={loadingPassword}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />{" "}
                    {loadingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Session Management Card */}
            <Card className="p-8 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border-light dark:border-border-dark pb-6 mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Active Sessions
                  </h2>
                  <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">
                    Manage devices where your account is currently logged in.
                  </p>
                </div>
                {sessions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevokeAllOther}
                    className="text-error hover:text-white hover:bg-error border-error/30 gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out All Other Devices
                  </Button>
                )}
              </div>

              <div className="overflow-hidden rounded-lg border border-border-light dark:border-border-dark">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-text-secondary border-b border-border-light dark:border-border-dark">
                    <tr>
                      <th className="px-6 py-4 font-medium">
                        Device / Browser
                      </th>
                      <th className="px-6 py-4 font-medium hidden md:table-cell">
                        Location
                      </th>
                      <th className="px-6 py-4 font-medium hidden sm:table-cell">
                        IP Address
                      </th>
                      <th className="px-6 py-4 font-medium">Last Active</th>
                      <th className="px-6 py-4 font-medium text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark bg-white dark:bg-surface-dark">
                    {loadingSessions ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-text-tertiary"
                        >
                          Loading sessions...
                        </td>
                      </tr>
                    ) : sessions.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-text-tertiary"
                        >
                          No active sessions found.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <tr
                          key={session.id}
                          className={cn(
                            "transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                            session.isCurrent &&
                              "bg-primary/5 hover:bg-primary/10",
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <DeviceIcon
                                deviceType={session.device_type}
                                os={session.os}
                                className={cn(
                                  "h-10 w-10 shrink-0",
                                  session.isCurrent
                                    ? "bg-primary/10 text-primary"
                                    : "",
                                )}
                              />
                              <div>
                                <div className="font-medium text-text-primary dark:text-white flex items-center gap-2">
                                  {session.os}{" "}
                                  <span className="text-text-tertiary font-normal">
                                    • {session.browser}
                                  </span>
                                  {session.isCurrent && (
                                    <Badge
                                      variant="success"
                                      className="h-5 px-1.5 text-[10px] uppercase tracking-wide"
                                    >
                                      Active Now
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-text-tertiary md:hidden">
                                  {session.location_city},{" "}
                                  {session.location_country}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-secondary hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-text-tertiary" />
                              <span>
                                {session.location_city},{" "}
                                {session.location_country}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-tertiary font-mono text-xs hidden sm:table-cell">
                            {session.ip_address}
                          </td>
                          <td className="px-6 py-4 text-text-secondary">
                            <div
                              className="flex items-center gap-2"
                              title={new Date(
                                session.last_active,
                              ).toLocaleString()}
                            >
                              <Clock className="h-3.5 w-3.5 text-text-tertiary" />
                              <span>
                                {session.isCurrent
                                  ? "Just now"
                                  : new Date(
                                      session.last_active,
                                    ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!session.isCurrent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                className="text-error hover:bg-error/10 hover:text-error h-8 w-8 p-0 rounded-full"
                                title="Revoke Session"
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeSection !== "profile" && activeSection !== "security" && (
          <Card className="p-16 flex flex-col items-center justify-center text-center bg-white dark:bg-surface-dark border-dashed border-2">
            <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Settings className="h-10 w-10 text-text-tertiary/50" />
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-white">
              Coming Soon
            </h3>
            <p className="text-text-secondary mt-2 max-w-md">
              The{" "}
              <span className="font-semibold text-primary">
                {SECTION_TITLES[activeSection]}
              </span>{" "}
              panel is currently under development.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
