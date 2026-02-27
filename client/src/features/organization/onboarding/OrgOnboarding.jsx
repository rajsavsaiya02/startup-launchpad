import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../lib/axios";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import {
  Building2,
  Plus,
  LogIn,
  ArrowRight,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Users2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "../../../utils/cn";

export function OrgOnboarding({ onComplete }) {
  const { user } = useAuth();
  const isFounder = user?.role?.toLowerCase() === "founder";
  const [activeTab, setActiveTab] = useState(isFounder ? "create" : "join");

  const [orgName, setOrgName] = useState("");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [isUrlAvailable, setIsUrlAvailable] = useState(null); // null, true, false
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);

  const [securityCode, setSecurityCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const [joinId, setJoinId] = useState("");
  const [joinSecurityCode, setJoinSecurityCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEO: Update document title
  useEffect(() => {
    document.title = "Startup Hub Onboarding | Startup Launchpad";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Launch your professional startup workspace and scale your productivity with Startup Launchpad Hubs.",
      );
    }
  }, []);

  // Auto-generate URL from Startup Name
  useEffect(() => {
    // Only auto-generate if the user hasn't manually touched/cleared the field
    if (!urlTouched && activeTab === "create" && orgName.trim()) {
      const slug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "")
        .replace(/^-+|-+$/g, "");
      setWorkspaceUrl(slug);
    }
  }, [orgName, urlTouched, activeTab]);

  // Debounced URL Availability Check
  useEffect(() => {
    if (!workspaceUrl) {
      setIsUrlAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUrl(true);
      try {
        const res = await apiClient.get(`/org/check-url?slug=${workspaceUrl}`);
        setIsUrlAvailable(res.data.available);
      } catch (err) {
        console.error("Availability check failed", err);
      } finally {
        setIsCheckingUrl(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [workspaceUrl]);

  // Password validation logic
  const passwordRequirements = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Contains number", test: (p) => /[0-9]/.test(p) },
    {
      label: "Contains special character",
      test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    },
  ];

  const validatePassword = (code) => {
    return passwordRequirements.filter((req) => req.test(code)).length;
  };

  const getPasswordStrength = () => {
    const score = validatePassword(securityCode);
    if (score === 0) return { label: "None", color: "bg-gray-200" };
    if (score <= 2) return { label: "Weak", color: "bg-error" };
    if (score <= 4) return { label: "Medium", color: "bg-secondary" };
    return { label: "Strong", color: "bg-primary" };
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName) return toast.error("Startup name is required");
    if (!workspaceUrl) return toast.error("Hub URL is required");
    if (isUrlAvailable === false)
      return toast.error("This Hub URL is already taken");

    // Check password strength
    if (validatePassword(securityCode) < 5) {
      return toast.error("Please meet all security requirements");
    }

    if (securityCode !== confirmCode) {
      return toast.error("Passwords do not match");
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/org", {
        name: orgName,
        workspace_url: workspaceUrl,
        security_code: securityCode,
      });
      toast.success("Startup Hub created successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to launch Startup Hub");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    if (!joinId) return toast.error("Hub Access Code is required");
    if (!joinSecurityCode) return toast.error("Security Password is required");

    setIsSubmitting(true);
    try {
      await apiClient.post("/org/join", {
        join_code: joinId,
        security_code: joinSecurityCode,
      });
      toast.success("Joined Startup Hub successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join Startup Hub");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 isolate"
      aria-labelledby="onboarding-title"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden blur-[120px]">
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full animate-pulse delay-700" />
      </div>

      <header className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl mb-6 group transition-all duration-300 hover:scale-110">
          <Building2
            className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform duration-300"
            aria-hidden="true"
          />
        </div>
        <h1
          id="onboarding-title"
          className="text-4xl md:text-5xl font-black text-text-primary dark:text-white mb-4 tracking-tight"
        >
          Launch your <span className="text-primary">Startup Hub</span>
        </h1>
        <p className="text-text-secondary dark:text-gray-400 max-w-[500px] mx-auto text-lg leading-relaxed font-medium">
          Scale your startup with a professional workspace. Centralize your
          team, projects, and budgets in one high-performance environment.
        </p>
      </header>

      <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
        <article className="grid grid-cols-1 md:grid-cols-12 bg-white/40 dark:bg-surface-dark/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-4xl overflow-hidden min-h-[550px]">
          {/* Sidebar / Tabs - Narrowed (col-span-3) */}
          <nav
            className="md:col-span-3 bg-primary/5 dark:bg-primary/10 border-r border-white/10 p-10 flex flex-col justify-between"
            aria-label="Onboarding Options"
          >
            <div className="space-y-4 font-bold">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-6">
                Choose path
              </p>

              {isFounder && (
                <button
                  onClick={() => setActiveTab("create")}
                  aria-pressed={activeTab === "create"}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                    activeTab === "create"
                      ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                      : "text-text-secondary hover:bg-primary/10 dark:hover:bg-primary/20",
                  )}
                >
                  <Plus
                    className={cn(
                      "w-5 h-5",
                      activeTab === "create"
                        ? "scale-110"
                        : "group-hover:rotate-90 transition-transform",
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm">Create New Hub</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("join")}
                aria-pressed={activeTab === "join"}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                  activeTab === "join"
                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                    : "text-text-secondary hover:bg-primary/10 dark:hover:bg-primary/20",
                )}
              >
                <LogIn
                  className={cn(
                    "w-5 h-5",
                    activeTab === "join"
                      ? "scale-110"
                      : "group-hover:translate-x-1 transition-transform",
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm">Join Existing</span>
              </button>
            </div>

            <div className="hidden md:block">
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-primary font-bold text-xs mb-3">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Startup Pro Tip</span>
                </div>
                <p className="text-xs leading-relaxed text-text-tertiary">
                  Startup Hubs allow you to manage multiple projects, teams, and
                  growth metrics in a single professional dashboard.
                </p>
              </div>
            </div>
          </nav>

          {/* Form Content - Widened (col-span-9) */}
          <div className="md:col-span-9 p-12 flex flex-col">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-text-primary dark:text-white mb-2 tracking-tight">
                {activeTab === "create"
                  ? "Build your Workspace"
                  : "Access your Startup Hub"}
              </h2>
              <p className="text-sm font-medium text-text-tertiary mb-10">
                {activeTab === "create"
                  ? "Launch your professional startup environment in seconds."
                  : "Enter your hub credentials to resume collaboration."}
              </p>

              {activeTab === "create" ? (
                <form onSubmit={handleCreateOrg} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label
                        htmlFor="startup-name"
                        className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-widest flex items-center gap-2"
                      >
                        <Building2
                          className="w-4 h-4 text-primary"
                          aria-hidden="true"
                        />{" "}
                        Startup Name
                      </label>
                      <Input
                        id="startup-name"
                        placeholder="e.g. Starship Tech"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 h-14 md:text-lg focus:ring-primary focus:border-primary px-5 rounded-2xl"
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>

                    <div className="space-y-3">
                      <label
                        htmlFor="workspace-url"
                        className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-widest flex items-center gap-2"
                      >
                        <Globe
                          className="w-4 h-4 text-primary"
                          aria-hidden="true"
                        />{" "}
                        Unique URL
                      </label>
                      <div className="relative group">
                        <div className="flex">
                          <span className="inline-flex items-center px-5 rounded-l-2xl border border-r-0 border-white/20 dark:border-white/10 bg-gray-100/50 dark:bg-gray-800/50 text-text-tertiary text-xs font-bold font-mono">
                            /org/
                          </span>
                          <input
                            id="workspace-url"
                            type="text"
                            value={workspaceUrl}
                            onChange={(e) => {
                              setUrlTouched(true);
                              setWorkspaceUrl(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, ""),
                              );
                            }}
                            disabled={isSubmitting}
                            placeholder="startup-hub"
                            className="flex-1 block w-full rounded-none rounded-r-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-white/5 text-text-primary px-5 py-4 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all group-hover:border-primary/50"
                          />
                        </div>

                        {/* URL Availability Check UI */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {isCheckingUrl ? (
                            <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                          ) : (
                            workspaceUrl &&
                            isUrlAvailable !== null && (
                              <div
                                className={cn(
                                  "flex items-center justify-center w-6 h-6 rounded-full animate-in fade-in zoom-in duration-300 shadow-sm",
                                  isUrlAvailable
                                    ? "bg-primary text-white"
                                    : "bg-error text-white",
                                )}
                              >
                                {isUrlAvailable ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-text-tertiary font-medium">
                        This URL is{" "}
                        <span className="text-primary font-bold">unique</span>{" "}
                        and cannot be changed later.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />{" "}
                        Security Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Create workspace password"
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        className="bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 h-14 focus:ring-primary focus:border-primary px-5 rounded-2xl"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" /> Confirm
                        Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Repeat your password"
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value)}
                        className="bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 h-14 focus:ring-primary focus:border-primary px-5 rounded-2xl"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Password Requirements UI */}
                  <div className="p-6 rounded-3xl bg-white/30 dark:bg-white/5 border border-white/10 space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase text-text-tertiary tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary" /> Password
                        Strength:
                        <span
                          className={cn(
                            "font-bold",
                            getPasswordStrength().color.replace("bg-", "text-"),
                          )}
                        >
                          {getPasswordStrength().label}
                        </span>
                      </span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={cn(
                              "w-10 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-500",
                              validatePassword(securityCode) >= lvl &&
                                getPasswordStrength().color,
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {passwordRequirements.map((req, idx) => {
                        const isMet = req.test(securityCode);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-[11px] font-medium"
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300",
                                isMet
                                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                  : "border-gray-300 text-transparent",
                              )}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <span
                              className={cn(
                                "transition-colors duration-300",
                                isMet
                                  ? "text-text-primary"
                                  : "text-text-tertiary",
                              )}
                            >
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full h-16 bg-primary text-white hover:bg-primary/90 text-lg font-black rounded-2xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative"
                      disabled={isSubmitting}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isSubmitting
                          ? "Launching Hub..."
                          : "Launch Startup Workspace"}
                        {!isSubmitting && (
                          <ArrowRight
                            className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </Button>
                    <p className="text-[11px] text-center text-text-tertiary font-medium mt-5">
                      By launching, you automatically become the{" "}
                      <span className="text-primary font-bold italic">
                        Founder & CEO
                      </span>
                      .
                    </p>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={handleJoinOrg}
                  className="space-y-8 max-w-2xl mx-auto md:mx-0"
                  aria-label="Join Form"
                >
                  <div className="space-y-3">
                    <label
                      htmlFor="join-code"
                      className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-widest flex items-center gap-2"
                    >
                      <Users2
                        className="w-4 h-4 text-primary"
                        aria-hidden="true"
                      />{" "}
                      Hub Access Code
                    </label>
                    <Input
                      id="join-code"
                      placeholder="Paste the unique access code"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      className="bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 h-14 md:text-lg focus:ring-primary focus:border-primary px-5 rounded-2xl"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Security
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter verification password"
                      value={joinSecurityCode}
                      onChange={(e) => setJoinSecurityCode(e.target.value)}
                      className="bg-white/50 dark:bg-white/5 border-white/20 dark:border-white/10 h-14 focus:ring-primary focus:border-primary px-5 rounded-2xl"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full h-16 bg-primary text-white hover:bg-primary/90 text-lg font-black rounded-2xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Authenticating..." : "Join Workspace"}
                      {!isSubmitting && <ArrowRight className="w-6 h-6 ml-3" />}
                    </Button>
                  </div>

                  <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/20 flex gap-4 mt-10">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary mb-1">
                        Collaborative Access
                      </h4>
                      <p className="text-xs text-text-tertiary leading-relaxed">
                        Ask your Hub administrator for the{" "}
                        <span className="text-primary font-bold">
                          Access Code
                        </span>{" "}
                        and security password to get access.
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
