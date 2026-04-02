import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  UserPlus,
  Plus,
  Users,
  FolderOpen,
  CheckSquare,
  TrendingUp,
  HeartPulse,
  Loader2,
  Building2,
  RefreshCw,
} from "lucide-react";
import { DashboardStatCard } from "./components/DashboardStatCard";
import { FinanceChartWidget } from "./components/FinanceChartWidget";
import { RecentActivityFeed } from "./components/RecentActivityFeed";
import { ActiveProjectsWidget } from "./components/ActiveProjectsWidget";
import { TeamPulseWidget } from "./components/TeamPulseWidget";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../context/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};



const isFinanceAdmin = (role) => {
  const r = role?.toUpperCase();
  return r === "FOUNDER" || r === "CO-FOUNDER" || r === "ADMIN";
};

export function OrgDashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberRole, setMemberRole] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, membersRes] = await Promise.all([
        apiClient.get("/org/dashboard"),
        apiClient.get("/org/members").catch(() => null),
      ]);
      setData(dashRes.data);

      // Determine current user's role from members list
      if (membersRes?.data?.members && user?.id) {
        const me = membersRes.data.members.find((m) => m.user_id === user.id);
        if (me) setMemberRole(me.org_role);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiClient.get("/org/dashboard").then((dashRes) => {
      if (!isMounted) return;
      setData(dashRes.data);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load dashboard:", err);
      if (isMounted) {
        setError("Failed to load dashboard. Please try again.");
        setLoading(false);
      }
    });

    // Fetch member role separately (non-blocking)
    apiClient.get("/org/members").then((res) => {
      if (!isMounted || !user?.id) return;
      const me = res.data?.members?.find((m) => m.user_id === user.id);
      if (me) setMemberRole(me.org_role);
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm font-bold text-text-tertiary">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <HeartPulse className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-black text-text-primary dark:text-white">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { metrics = {}, recentActivities = [] } = data || {};
  const {
    memberCount = 0,
    membersByStatus = [],
    projectsList = [],
    tasksStats = { pending: 0, inProgress: 0, completedCount: 0 },
    financeData = null,
  } = metrics;

  // Filter projects to only show ongoing ones (Progress < 100%)
  const ongoingProjects =
    projectsList?.filter((p) => (p.progress ?? 0) < 100) || [];

  // Limit to top 5 for the dashboard display widgets, but keep full list for context
  const activeProjectsDisplay = ongoingProjects.slice(0, 5);

  const canSeeFinance = isFinanceAdmin(memberRole);
  const effectiveFinanceData = canSeeFinance ? financeData : null;

  // KPI Card definitions
  const kpiCards = [
    {
      title: "Total Members",
      value: memberCount,
      icon: Users,
      color: "indigo",
      subtitle: membersByStatus.find((s) => s.status === "On Work")
        ? `${membersByStatus.find((s) => s.status === "On Work")?.count} on work`
        : undefined,
      onClick: () => navigate("/org/management"),
    },
    {
      title: "Active Projects",
      value: ongoingProjects.length,
      icon: FolderOpen,
      color: "blue",
      subtitle: ongoingProjects.length > 0 ? `${ongoingProjects.length} projects ongoing` : "No ongoing projects",
      onClick: () => navigate("/org/projects"),
    },
    {
      title: "Pending Tasks",
      value: tasksStats.pending,
      icon: CheckSquare,
      color: "orange",
      subtitle: tasksStats.inProgress > 0 ? `${tasksStats.inProgress} in progress` : undefined,
      onClick: () => navigate("/org/tasks"),
    },
    {
      title: "Net Cashflow",
      value: effectiveFinanceData
        ? (effectiveFinanceData.netCashflow >= 0 ? "+" : "") +
          (effectiveFinanceData.netCashflow >= 100000
            ? `₹${(effectiveFinanceData.netCashflow / 100000).toFixed(1)}L`
            : `₹${Math.abs(effectiveFinanceData.netCashflow).toLocaleString()}`)
        : "—",
      icon: TrendingUp,
      color: "teal",
      restricted: !canSeeFinance,
      subtitle: effectiveFinanceData
        ? effectiveFinanceData.netCashflow >= 0
          ? "Positive cashflow"
          : "Expenses exceed income"
        : undefined,
      onClick: canSeeFinance ? () => navigate("/org/finances") : null,
    },
    {
      title: "Financial Health",
      value: effectiveFinanceData ? `${effectiveFinanceData.healthScore}%` : "—",
      icon: HeartPulse,
      color: effectiveFinanceData
        ? effectiveFinanceData.healthScore >= 80
          ? "emerald"
          : effectiveFinanceData.healthScore >= 60
          ? "amber"
          : "orange"
        : "blue",
      restricted: !canSeeFinance,
      subtitle: effectiveFinanceData
        ? effectiveFinanceData.healthScore >= 80
          ? "Excellent"
          : effectiveFinanceData.healthScore >= 60
          ? "Good"
          : "Needs attention"
        : undefined,
      onClick: canSeeFinance ? () => navigate("/org/finances") : null,
    },
  ];

  return (
    <Motion.div
      className="space-y-6 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ─── Header ─── */}
      <Motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6"
      >
        <div className="flex flex-col gap-0.5">
          <h1 className="text-4xl font-black text-text-primary dark:text-white leading-tight tracking-tighter">
            Welcome back, <span className="text-text-secondary dark:text-gray-400">{user?.first_name || "User"}</span>
          </h1>
          <p className="text-sm text-text-tertiary font-bold opacity-70">
            Here's an overview of your organization's status. Let's make a positive impact today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate("/org/management")}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-text-secondary dark:text-gray-300 border border-border-light dark:border-border-dark rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-primary transition-all"
          >
            <UserPlus size={15} />
            Invite Member
          </button>
          <button
            onClick={() => navigate("/org/projects")}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-all"
          >
            <Plus size={15} />
            New Project
          </button>
        </div>
      </Motion.div>

      {/* ─── KPI Stats Row ─── */}
      <Motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        {kpiCards.map((card, i) => (
          <DashboardStatCard
            key={i}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            subtitle={card.subtitle}
            restricted={card.restricted}
            onClick={card.onClick}
          />
        ))}
      </Motion.div>

      {/* ─── Main Content Row: Finance Chart + Activity Feed ─── */}
      <Motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <div className="lg:col-span-2">
          <FinanceChartWidget financeData={effectiveFinanceData} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed activities={recentActivities} />
        </div>
      </Motion.div>

      {/* ─── Secondary Row: Projects + Team Pulse ─── */}
      <Motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <ActiveProjectsWidget
          projects={activeProjectsDisplay}
          totalCount={ongoingProjects.length}
        />
        <TeamPulseWidget
          membersByStatus={membersByStatus}
          totalCount={memberCount}
        />
      </Motion.div>
    </Motion.div>
  );
}
