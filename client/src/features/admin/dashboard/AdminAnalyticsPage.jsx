import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

import {
  Users,
  Building2,
  Activity,
  Rocket,
  Clock,
  ShieldCheck,
  Network,
  Award,
  Zap,
  ArrowRight,
  UserPlus,
  ArrowUpRight,
  Server,
  Database,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { apiClient } from "../../../lib/axios";
import { cn } from "../../../utils/cn";

export function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("daily");
  const [localUptime, setLocalUptime] = useState(0);

  const formatUptime = (seconds) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Sync local uptime when data changes
  useEffect(() => {
    if (data?.health?.uptime) {
      setLocalUptime(data.health.uptime);
    }
  }, [data?.health?.uptime]);

  // Real-time uptime increment
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/admin/analytics/summary");
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Could not load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Standardize polling (30s)
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] flex-col gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="text-text-tertiary animate-pulse font-medium">
          Synchronizing Platform Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl text-center border border-red-100 dark:border-red-900/20 max-w-2xl mx-auto mt-20">
        <ShieldCheck className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
          System Error
        </h2>
        <p className="text-red-600/80 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Retry Connection
        </Button>
      </div>
    );
  }

  // --- Real-Data Chart Options ---

  // 1. Role Distribution (Donut)
  const roleDistOption = {
    tooltip: { trigger: "item", padding: 12, borderRadius: 12 },
    legend: { bottom: "5%", icon: "circle", textStyle: { color: "#94a3b8" } },
    series: [
      {
        name: "Talent Role",
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        borderRadius: 8,
        borderColor: "transparent",
        borderWidth: 4,
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 10,
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        data:
          data?.roleDistribution?.map((r) => ({
            name: r.label.toUpperCase(),
            value: parseInt(r.value),
          })) || [],
        color: [
          "#3b82f6",
          "#6366f1",
          "#10b981",
          "#f59e0b",
          "#ec4899",
          "#8b5cf6",
        ],
      },
    ],
    graphic: [
      {
        type: "text",
        left: "center",
        top: "38%",
        style: {
          text: data?.summary?.totalUsers || "0",
          textAlign: "center",
          fill: "#1e293b",
          fontSize: 32,
          fontWeight: "900",
        },
      },
      {
        type: "text",
        left: "center",
        top: "48%",
        style: {
          text: "TOTAL NODES",
          textAlign: "center",
          fill: "#64748b",
          fontSize: 10,
          fontWeight: "bold",
          letterSpacing: 2,
        },
      },
    ],
  };

  // 2. Daily Active Users (Area Chart)
  const dauOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: { color: "#3b82f6", width: 2, type: "dashed" },
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: 12,
      padding: [10, 14],
      textStyle: { color: "#1e293b", fontWeight: "bold" },
      extraCssText: "shadow-xl border-none",
      formatter: function (params) {
        return `
            <div style="font-family: Inter, sans-serif;">
                <div style="color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${params[0].axisValue}</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></div>
                    <div style="font-size: 16px; color: #1e293b;">${params[0].value} <span style="font-size: 11px; color: #94a3b8; font-weight: normal;">${viewMode === "daily" ? "Active Users" : "Weekly Activity"}</span></div>
                </div>
            </div>
        `;
      },
    },
    grid: {
      top: "10%",
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data:
        viewMode === "daily"
          ? data?.dailyActiveUsers?.map((d) =>
              new Date(d.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
            ) || []
          : data?.weeklyActiveUsers?.map((d) => d.date) || [],
      axisLine: { lineStyle: { color: "#f1f5f9" } },
      axisTick: { show: false },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 11,
        fontWeight: 500,
        margin: 15,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: (value) => Math.max(100, Math.ceil(value.max / 50) * 50 + 50),
      splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      axisLine: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 11, fontWeight: 500 },
    },
    series: [
      {
        name:
          viewMode === "daily" ? "Daily Active Users" : "Weekly Active Users",
        type: "line",
        smooth: 0.4,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#3b82f6", borderWidth: 2, borderColor: "#fff" },
        lineStyle: {
          width: 4,
          color: "#3b82f6",
          shadowBlur: 10,
          shadowColor: "rgba(59, 130, 246, 0.3)",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(59, 130, 246, 0.15)" },
            { offset: 1, color: "rgba(59, 130, 246, 0)" },
          ]),
        },
        emphasis: { scale: 1.4 },
        data:
          viewMode === "daily"
            ? data?.dailyActiveUsers?.map((d) => parseInt(d.count)) || []
            : data?.weeklyActiveUsers?.map((d) => parseInt(d.count)) || [],
      },
    ],
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header with System Status & Platinum Insights */}
      <div className="bg-surface-white dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden min-h-[220px] flex flex-col">
        <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-6 p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Rocket className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary dark:text-white">
                Platform Command Center
              </h1>
            </div>
            <p className="text-text-tertiary max-w-2xl text-base leading-relaxed">
              Real-time synchronization of the Startup Launchpad ecosystem.
              Monitoring{" "}
              <span className="text-primary font-bold">
                {data?.summary?.totalUsers}
              </span>{" "}
              talent nodes across{" "}
              <span className="text-primary font-bold">
                {data?.dailyActiveUsers?.length || 0}
              </span>{" "}
              days of user engagement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <SystemIndicator
              icon={Server}
              label="API Cluster"
              value={data?.health?.dbStatus}
              status={
                data?.health?.dbStatus === "connected" ? "online" : "offline"
              }
            />
            <SystemIndicator
              icon={Database}
              label="Latency"
              value={data?.health?.serverLatency}
              status={
                parseFloat(data?.health?.serverLatency) < 100
                  ? "online"
                  : "warning"
              }
            />
            <SystemIndicator
              icon={Clock}
              label="Uptime"
              value={formatUptime(localUptime)}
              status="online"
            />
          </div>
        </div>

        {/* Integrated Semantic Intelligence */}
        <div className="mt-auto bg-gray-50/50 dark:bg-white/2 p-1 border-t border-border-light dark:border-border-dark grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-light dark:divide-border-dark">
          {data?.insights?.slice(0, 3).map((insight, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-5 hover:bg-white dark:hover:bg-white/5 transition-colors group cursor-default"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-text-primary dark:text-white mb-0.5">
                  {insight.title}
                </h4>
                <p className="text-[11px] text-text-tertiary leading-tight line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Data Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Talent Pool"
          value={data?.summary?.totalUsers}
          icon={Users}
          subValue="Active Nodes"
          color="blue"
        />
        <MetricCard
          label="Platform Founders"
          value={data?.summary?.totalFounders}
          icon={Rocket}
          subValue="Venture Owners"
          color="indigo"
        />
        <MetricCard
          label="Organizations"
          value={data?.summary?.totalOrgs}
          icon={Building2}
          subValue="Verified Entities"
          color="emerald"
        />
        <MetricCard
          label="Daily Active Users"
          value={
            data?.dailyActiveUsers?.length > 0
              ? parseInt(
                  data.dailyActiveUsers[data.dailyActiveUsers.length - 1].count,
                )
              : 0
          }
          icon={Activity}
          subValue="Live Today"
          color="amber"
        />
      </div>

      {/* Middle Grid: Ecosystem Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Talent Composition (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <Card className="p-8 h-full flex flex-col border-none shadow-xl bg-white dark:bg-surface-dark overflow-hidden">
            <div className="mb-8">
              <h3 className="text-xl font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" /> Talent Ecosystem
              </h3>
              <p className="text-sm text-text-tertiary">
                Role distribution across the platform
              </p>
            </div>
            <div className="flex-1 min-h-[320px]">
              <ReactECharts
                option={roleDistOption}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          </Card>
        </div>

        {/* Daily Active User Graph (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-8 border-none shadow-xl bg-white dark:bg-surface-dark h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" /> Daily Active
                  Users
                </h3>
                <p className="text-sm text-text-tertiary">
                  Real-time user engagement trends over the last 14 days
                </p>
              </div>
              <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-border-light dark:border-border-dark">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-4 font-bold rounded-lg h-8 transition-all",
                    viewMode === "daily"
                      ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
                      : "text-text-tertiary hover:bg-white/50",
                  )}
                  onClick={() => setViewMode("daily")}
                >
                  Daily
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-4 font-bold rounded-lg h-8 transition-all",
                    viewMode === "weekly"
                      ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
                      : "text-text-tertiary hover:bg-white/50",
                  )}
                  onClick={() => setViewMode("weekly")}
                >
                  Weekly
                </Button>
              </div>
            </div>
            <div className="h-[320px]">
              <ReactECharts
                option={dauOption}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid: Live Activity & Recency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Registrations Table (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border-none shadow-xl bg-white dark:bg-surface-dark overflow-hidden h-full">
            <div className="p-8 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-500" /> Recent Talent
                  Onboarding
                </h3>
                <p className="text-sm text-text-tertiary">
                  100% real-time user discovery feed
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 uppercase text-[11px] font-bold tracking-widest text-text-tertiary">
                    <th className="px-8 py-4">User Identity</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Joined</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {data?.recentUsers?.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary dark:text-white leading-tight">
                              {user.name}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            user.role === "founder"
                              ? "bg-indigo-500/10 text-indigo-600"
                              : user.role === "freelancer"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-500/10 text-amber-600",
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-text-tertiary tabular-nums">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => navigate("/admin/management/users")}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Global Organization Network (5 cols) */}
        <div className="lg:col-span-5 h-full">
          <Card className="p-8 border-none shadow-xl bg-white dark:bg-surface-dark flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-500" /> Venture
                  Network
                </h3>
                <p className="text-sm text-text-tertiary">
                  Dynamic monitoring of active entities
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-xs"
                onClick={() => navigate("/admin/management/organizations")}
              >
                View Map
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {data?.organizations?.map((org, index) => (
                <div
                  key={org.id || index}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border-light dark:border-border-dark hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate("/admin/management/organizations")}
                >
                  <div className="h-12 w-12 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-text-primary dark:text-white truncate">
                        {org.name}
                      </h4>
                      <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1 shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {org.member_count} Members
                      </span>
                      <span className="flex items-center gap-1">
                        <Rocket className="h-3 w-3" /> {org.project_count || 0}{" "}
                        Projects
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-text-tertiary group-hover:text-primary transition-colors" />
                </div>
              ))}

              {(!data?.organizations || data.organizations.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <Building2 className="h-12 w-12 text-text-tertiary opacity-20" />
                  <p className="text-sm text-text-tertiary font-medium italic">
                    No active organizations detected in the ecosystem.
                  </p>
                </div>
              )}
            </div>

            {/* Network Pulse card removed at user request */}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon: IconComponent, color }) {
  const Icon = IconComponent;
  const colorMap = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-500/10",
    indigo: "text-indigo-600 bg-indigo-100 dark:bg-indigo-500/10",
    emerald: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10",
    amber: "text-amber-600 bg-amber-100 dark:bg-amber-500/10",
  };

  return (
    <Card className="p-6 border-none shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden bg-white dark:bg-surface-dark">
      <div className="flex items-center gap-5 z-10 relative">
        <div
          className={cn(
            "p-4 rounded-2xl transition-all group-hover:scale-110 duration-500 shadow-sm",
            colorMap[color],
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-text-tertiary uppercase tracking-widest mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-text-primary dark:text-white tabular-nums tracking-tighter">
              {value || "0"}
            </h2>
            <span className="text-xs font-bold text-text-tertiary tracking-wide">
              {subValue}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] -mr-4 -mt-4 scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-700">
        <Icon className="h-24 w-24" />
      </div>
    </Card>
  );
}

function SystemIndicator({ icon: IconComponent, label, value, status }) {
  const Icon = IconComponent;
  const statusMap = {
    online: "bg-emerald-500 text-emerald-500 ring-emerald-500/20",
    warning: "bg-amber-500 text-amber-500 ring-amber-500/20",
    offline: "bg-red-500 text-red-500 ring-red-500/20",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
      <div className="p-1.5 bg-white dark:bg-surface-dark rounded-lg shadow-inner">
        <Icon className="h-4 w-4 text-text-tertiary" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full ring-4 shadow-sm",
              statusMap[status],
            )}
          ></span>
          <span className="text-xs font-extrabold text-text-primary dark:text-white tabular-nums">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}
