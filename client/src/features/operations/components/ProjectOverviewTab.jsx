import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import ReactECharts from "echarts-for-react";
import {
  CheckCircle2,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  Plus,
  CreditCard,
  UploadCloud,
  Layers,
  FileSpreadsheet,
  Archive,
  Image as ImageIcon,
  ExternalLink,
  Cloud,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import taskService from "../../../services/taskService";
import projectFinancialsService from "../../../services/projectFinancialsService";
import projectActivityService from "../../../services/projectActivityService";

// Helper to format INR
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export function ProjectOverviewTab({
  projectId,
  fileAssets = [],
  onActionClick,
}) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    tasks: [],
    financials: { budget: 0, totalSpent: 0, remaining: 0 },
    activities: [],
  });

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [tasksData, financialsData, activitiesData] = await Promise.all([
          taskService.getTasksByProject(projectId).catch(() => []),
          projectFinancialsService
            .getSummary(projectId)
            .catch(() => ({ budget: 0, totalSpent: 0, remaining: 0 })),
          projectActivityService.getActivities(projectId).catch(() => []),
        ]);

        if (mounted) {
          setMetrics({
            tasks: tasksData || [],
            financials: financialsData || {
              budget: 0,
              totalSpent: 0,
              remaining: 0,
            },
            activities: activitiesData || [],
          });
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (projectId) {
      fetchDashboardData();
    }
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm font-bold text-text-tertiary animate-pulse">
          Gathering Project Intelligence...
        </p>
      </div>
    );
  }

  // --- Task Analytics ---
  const totalTasks = metrics.tasks.length;
  const completedTasks = metrics.tasks.filter(
    (t) => t.kanban_status === "done",
  ).length;
  const inProgressTasks = metrics.tasks.filter(
    (t) => t.kanban_status === "in_progress",
  ).length;
  const todoTasks = metrics.tasks.filter(
    (t) => t.kanban_status === "todo",
  ).length;
  // Let's assume overdue tasks are pending tasks with due_date in the past.
  const overdueTasks = metrics.tasks.filter(
    (t) =>
      t.kanban_status !== "done" &&
      t.due_date &&
      new Date(t.due_date) < new Date(),
  ).length;

  const taskChartOption = {
    tooltip: { trigger: "item" },
    legend: {
      bottom: "0%",
      left: "center",
      icon: "circle",
      itemWidth: 10,
      itemGap: 15,
      textStyle: { fontSize: 11, fontWeight: "bold" },
    },
    color: ["#10B981", "#F59E0B", "#3B82F6", "#EF4444"], // Success, Warning, Info, Error
    series: [
      {
        name: "Tasks",
        type: "pie",
        radius: ["55%", "80%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 3,
        },
        label: { show: false, position: "center" },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "black",
            color: "inherit",
          },
          scaleSize: 5,
        },
        labelLine: { show: false },
        data: [
          { value: completedTasks, name: "Completed" },
          { value: inProgressTasks, name: "In Progress" },
          { value: todoTasks, name: "To Do" },
          { value: overdueTasks, name: "Overdue" },
        ].filter((d) => d.value > 0),
      },
    ],
  };

  if (taskChartOption.series[0].data.length === 0) {
    taskChartOption.series[0].data = [
      { value: 0, name: "No Tasks", itemStyle: { color: "#f3f4f6" } },
    ];
    taskChartOption.color = ["#f3f4f6"];
  }

  // --- Financial Analytics ---
  const { budget, totalSpent } = metrics.financials;
  const spentPercent =
    budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;

  const financeChartOption = {
    tooltip: {
      formatter: "{a} <br/>{b} : {c}%",
    },
    series: [
      {
        name: "Budget",
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        radius: "110%",
        center: ["50%", "75%"],
        progress: {
          show: true,
          width: 22,
          itemStyle: {
            color:
              spentPercent > 100
                ? "#EF4444"
                : spentPercent > 80
                  ? "#F59E0B"
                  : "#10B981",
            borderRadius: 8,
          },
        },
        pointer: {
          show: true,
          length: "40%",
          width: 5,
          itemStyle: { color: "#6b7280" },
        },
        axisLine: {
          lineStyle: { width: 22, color: [[1, "#f3f4f6"]] }, // background
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: "{value}%",
          fontSize: 22,
          fontWeight: "black",
          offsetCenter: [0, "15%"],
          color: "inherit",
        },
        data: [{ value: spentPercent.toFixed(1), name: "SPENT" }],
        title: {
          fontSize: 10,
          fontWeight: "bold",
          offsetCenter: [0, "-25%"],
          color: "#9ca3af",
        },
      },
    ],
  };

  // --- Files Formatting ---
  const recentFiles = [...fileAssets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

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

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Key Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark flex items-center gap-4 group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
              Task Progress
            </p>
            <p className="text-2xl font-black text-text-primary dark:text-white leading-tight">
              {completedTasks}{" "}
              <span className="text-sm font-medium text-text-tertiary">
                / {totalTasks}
              </span>
            </p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark flex items-center gap-4 group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-warning/5 rounded-bl-[100px] pointer-events-none group-hover:bg-warning/10 transition-colors"></div>
          <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 group-hover:bg-warning group-hover:text-white transition-all shadow-sm">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="min-w-0 pr-2 relative z-10">
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
              Budget Spent
            </p>
            <p
              className="text-2xl font-black text-text-primary dark:text-white truncate leading-tight"
              title={formatINR(totalSpent)}
            >
              {formatINR(totalSpent)}
            </p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark flex items-center gap-4 group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-[100px] pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
              Total Files
            </p>
            <p className="text-2xl font-black text-text-primary dark:text-white leading-tight">
              {fileAssets.length}
            </p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark flex items-center gap-4 group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-success/5 rounded-bl-[100px] pointer-events-none group-hover:bg-success/10 transition-colors"></div>
          <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 group-hover:bg-success group-hover:text-white transition-all shadow-sm">
            <Activity className="h-6 w-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
              Activities Logged
            </p>
            <p className="text-2xl font-black text-text-primary dark:text-white leading-tight">
              {metrics.activities.length}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Left Column: Charts & Quick Actions (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Analytics */}
            <Card className="p-0 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white">
                  Task Analytics
                </h3>
                <button
                  onClick={() => onActionClick("Work")}
                  className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
                >
                  EXPLORE{" "}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="p-5 flex-1 relative flex items-center justify-center min-h-[260px]">
                <ReactECharts
                  option={taskChartOption}
                  style={{ height: "240px", width: "100%" }}
                />
              </div>
            </Card>

            {/* Financial Health */}
            <Card className="p-0 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white">
                  Financial Health
                </h3>
                <button
                  onClick={() => onActionClick("Financials")}
                  className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
                >
                  DETAILS{" "}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="p-5 flex flex-col items-center justify-center flex-1">
                <div className="h-[200px] w-full">
                  <ReactECharts
                    option={financeChartOption}
                    style={{ height: "100%", width: "100%" }}
                  />
                </div>
                <div className="flex w-full items-center justify-between px-6 pt-2 border-t border-border-light/50 dark:border-border-dark/50 border-dashed">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-text-tertiary">
                      Budget
                    </p>
                    <p className="text-sm font-bold text-text-primary dark:text-white">
                      {formatINR(budget)}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-border-light dark:bg-border-dark"></div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-text-tertiary">
                      Remaining
                    </p>
                    <p
                      className={`text-sm font-bold ${metrics.financials.remaining < 0 ? "text-error" : "text-success"}`}
                    >
                      {formatINR(metrics.financials.remaining)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions Panel */}
          <Card className="p-6 bg-linear-to-br from-gray-50 to-white dark:from-gray-800/40 dark:to-surface-dark border-border-light dark:border-border-dark overflow-hidden relative shadow-sm">
            {/* Decorative background blur */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-6">
              Action Center
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
              <button
                onClick={() => onActionClick("NewTask")}
                className="flex flex-col items-center justify-center p-5 gap-3 bg-white dark:bg-gray-800/80 border border-border-light dark:border-border-dark rounded-2xl hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group scale-100 active:scale-95"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                  <Plus className="h-6 w-6 stroke-[3px]" />
                </div>
                <span className="text-sm font-bold text-text-primary dark:text-white">
                  Create Task
                </span>
              </button>

              <button
                onClick={() => onActionClick("NewExpense")}
                className="flex flex-col items-center justify-center p-5 gap-3 bg-white dark:bg-gray-800/80 border border-border-light dark:border-border-dark rounded-2xl hover:border-warning hover:shadow-lg hover:shadow-warning/5 transition-all group scale-100 active:scale-95"
              >
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-colors shadow-inner">
                  <CreditCard className="h-6 w-6 stroke-[2px]" />
                </div>
                <span className="text-sm font-bold text-text-primary dark:text-white">
                  Record Expense
                </span>
              </button>

              <button
                onClick={() => onActionClick("UploadFile")}
                className="flex flex-col items-center justify-center p-5 gap-3 bg-white dark:bg-gray-800/80 border border-border-light dark:border-border-dark rounded-2xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/5 transition-all group scale-100 active:scale-95"
              >
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors shadow-inner">
                  <UploadCloud className="h-6 w-6 stroke-[2px]" />
                </div>
                <span className="text-sm font-bold text-text-primary dark:text-white">
                  Upload File
                </span>
              </button>
            </div>
          </Card>

          {/* Latest Files */}
          <Card className="p-0 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white">
                Recent Files
              </h3>
              <button
                onClick={() => onActionClick("Files")}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
              >
                VIEW ALL{" "}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="p-5">
              {recentFiles.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary border-2 border-dashed border-border-light dark:border-border-dark rounded-xl bg-gray-50/30 dark:bg-gray-800/10">
                  <FileText className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-bold">No files uploaded yet.</p>
                  <p className="text-xs mt-1">
                    Files uploaded to the project will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark hover:bg-primary/5 hover:border-primary/30 transition-all group cursor-default"
                    >
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm transition-colors border border-border-light/50 dark:border-border-dark/50">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p
                          className="text-sm font-bold text-text-primary dark:text-white truncate group-hover:text-primary transition-colors"
                          title={file.fileName}
                        >
                          {file.fileName}
                        </p>
                        <p className="text-[11px] font-medium text-text-tertiary mt-0.5">
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 3. Right Column: Activity Feed (Span 1) */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="p-0 bg-white dark:bg-surface-dark border-border-light dark:border-border-dark flex-1 flex flex-col overflow-hidden max-h-[880px] shadow-sm relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-[150px] pointer-events-none"></div>

            <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center shrink-0 bg-gray-50/50 dark:bg-gray-800/20 relative z-10">
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Activity
              </h3>
              <button
                onClick={() => onActionClick("Activity")}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
              >
                Feed{" "}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
              {metrics.activities.length === 0 ? (
                <div className="text-center py-16 text-text-tertiary">
                  <Activity className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold">No recent activities.</p>
                  <p className="text-xs mt-1">
                    Project milestones will be tracked here.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-border-light dark:border-border-dark space-y-8">
                  {metrics.activities.slice(0, 6).map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-white dark:border-surface-dark bg-primary shadow-sm group-hover:scale-125 transition-transform"></div>
                      <div className="bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-2xl border border-border-light/50 dark:border-border-dark/50 group-hover:border-primary/20 group-hover:shadow-sm transition-all">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar
                            src={log.avatar}
                            alt={log.first_name || "System"}
                            fallback={log.first_name ? log.first_name[0] : "S"}
                            className="h-6 w-6 ring-2 ring-white dark:ring-surface-dark"
                          />
                          <div className="flex flex-col min-w-0">
                            <p className="text-[13px] font-bold text-text-primary dark:text-white truncate leading-tight">
                              {log.first_name
                                ? `${log.first_name} ${log.last_name}`
                                : "System Orchestrator"}
                            </p>
                            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider leading-tight">
                              {formatDistanceToNow(new Date(log.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        {/* Content Preview */}
                        <div
                          className="text-sm text-text-secondary dark:text-gray-300 line-clamp-4 prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 mt-1"
                          dangerouslySetInnerHTML={{ __html: log.content }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border-light dark:border-border-dark bg-gray-50/80 dark:bg-gray-800/50 shrink-0 relative z-10 backdrop-blur-md">
              <Button
                onClick={() => onActionClick("NewActivity")}
                className="w-full h-11 text-xs font-black uppercase tracking-widest bg-white dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 shadow-sm"
              >
                Log New Milestone
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
