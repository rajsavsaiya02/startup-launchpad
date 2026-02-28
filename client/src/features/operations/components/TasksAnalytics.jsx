import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  differenceInSeconds,
  getHours,
  getDay,
  startOfDay,
  subDays,
  isWithinInterval,
} from "date-fns";
import {
  Clock,
  CheckSquare,
  Target,
  Activity,
  Info,
  ChevronDown,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";

const KPICard = ({ title, value, icon: Icon, colorClass, tooltip }) => (
  <Card className="p-4 flex items-center gap-4 border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-sm group relative overflow-visible">
    <div
      className={cn(
        "p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300",
        colorClass,
      )}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-0.5">
        <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest truncate">
          {title}
        </p>
        <div className="group/tip relative">
          <Info className="w-3 h-3 text-text-tertiary/50 hover:text-primary cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>
      <h4 className="text-xl font-black text-text-primary dark:text-white leading-none tracking-tight">
        {value}
      </h4>
    </div>
  </Card>
);

export function TasksAnalytics({ tasks }) {
  const [timeScale, setTimeScale] = useState("Hours"); // Minutes, Hours, Days, Week
  const [taskScale, setTaskScale] = useState("Weekly"); // Daily, Weekly

  const metrics = useMemo(() => {
    let totalTasks = tasks.length;
    let completedTasks = tasks.filter((t) => t.kanban_status === "done").length;

    // Time metrics
    let totalSecondsTracked = 0;
    let completedSecondsToFinish = 0;
    let completedWithLogsCount = 0;

    // Data for Time Engagement Chart
    const hourlyDistribution = Array(24).fill(0);
    const minuteDistribution = Array(60).fill(0);
    const dailyDistribution = Array(7).fill(0);
    const weeklyDistribution = Array(4).fill(0);

    // Data for Task Activity Chart
    const dailyPriorityStats = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const weeklyPriorityStats = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    const parseTimeLogs = (logs) => {
      if (!logs) return [];
      if (typeof logs === "string") {
        try {
          return JSON.parse(logs);
        } catch {
          return [];
        }
      }
      return Array.isArray(logs) ? logs : [];
    };

    const now = new Date();
    const startOfCurrentDay = startOfDay(now);
    const startOfHourBoundary = new Date(now.getTime());
    startOfHourBoundary.setMinutes(0, 0, 0);
    const endOfHourBoundary = new Date(now.getTime());
    endOfHourBoundary.setMinutes(59, 59, 999);

    tasks.forEach((task) => {
      const logs = parseTimeLogs(task.time_logs);
      const isDone = task.kanban_status === "done";
      const priority = task.priority || "Medium";

      if (isDone) {
        if (task.updated_at) {
          const finishDate = new Date(task.updated_at);
          if (
            isWithinInterval(finishDate, { start: startOfCurrentDay, end: now })
          ) {
            dailyPriorityStats[priority]++;
          }
          if (
            isWithinInterval(finishDate, { start: subDays(now, 7), end: now })
          ) {
            weeklyPriorityStats[priority]++;
          }
        }
      }

      logs.forEach((log) => {
        if (!log.start_time || !log.end_time) return;
        try {
          const start = new Date(log.start_time);
          const end = new Date(log.end_time);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

          const seconds =
            log.duration_seconds || differenceInSeconds(end, start);
          if (seconds > 0) {
            totalSecondsTracked += seconds;
            const hour = getHours(start);
            const day = getDay(start);
            hourlyDistribution[hour] += Math.round(seconds / 60);
            dailyDistribution[day] += Math.round(seconds / 3600);

            const weeksAgo = Math.floor(
              differenceInSeconds(now, start) / (7 * 24 * 3600),
            );
            if (weeksAgo >= 0 && weeksAgo < 4) {
              weeklyDistribution[3 - weeksAgo] += Math.round(seconds / 3600);
            }

            if (
              isWithinInterval(start, {
                start: startOfHourBoundary,
                end: endOfHourBoundary,
              })
            ) {
              minuteDistribution[start.getMinutes()] += Math.round(seconds);
            }
          }
        } catch {
          // Ignore invalid dates
        }
      });

      if (task.timer_started_at) {
        try {
          const start = new Date(task.timer_started_at);
          if (!isNaN(start.getTime())) {
            const elapsed = Math.floor(
              (now.getTime() - start.getTime()) / 1000,
            );
            if (elapsed > 0) {
              totalSecondsTracked += elapsed;
              hourlyDistribution[getHours(now)] += Math.round(elapsed / 60);
              dailyDistribution[getDay(now)] += Math.round(elapsed / 3600);
            }
          }
        } catch {
          // Ignore invalid dates
        }
      }

      if (isDone) {
        if (task.created_at && task.updated_at) {
          const start = new Date(task.created_at);
          const end = new Date(task.updated_at);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const seconds = differenceInSeconds(end, start);
            if (seconds >= 0) {
              completedSecondsToFinish += seconds;
              completedWithLogsCount++;
            }
          }
        }
      }
    });

    const avgSecondsToComplete =
      completedWithLogsCount > 0
        ? Math.round(completedSecondsToFinish / completedWithLogsCount)
        : 0;

    return {
      totalTasks,
      completedTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalSecondsTracked,
      avgSecondsToComplete,
      hourlyDistribution,
      minuteDistribution,
      dailyDistribution,
      weeklyDistribution,
      dailyPriorityStats,
      weeklyPriorityStats,
    };
  }, [tasks]);

  const formatDurationLong = (totalSeconds) => {
    totalSeconds = Math.round(totalSeconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || (h === 0 && m === 0)) parts.push(`${s}s`);
    return parts.join(" ");
  };

  const timeEngagementOption = useMemo(() => {
    let data = [],
      xAxisData = [],
      seriesName = "";
    if (timeScale === "Minutes") {
      data = metrics.minuteDistribution;
      xAxisData = Array.from({ length: 60 }, (_, i) => `${i}m`);
      seriesName = "Seconds Tracked (This Hour)";
    } else if (timeScale === "Hours") {
      data = metrics.hourlyDistribution;
      xAxisData = Array.from(
        { length: 24 },
        (_, i) => `${i % 12 || 12} ${i >= 12 ? "PM" : "AM"}`,
      );
      seriesName = "Minutes Tracked";
    } else if (timeScale === "Days") {
      data = metrics.dailyDistribution;
      xAxisData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      seriesName = "Hours Tracked";
    } else {
      data = metrics.weeklyDistribution;
      xAxisData = ["3 Weeks", "2 Weeks", "Last Week", "This Week"];
      seriesName = "Hours Tracked";
    }

    return {
      tooltip: { trigger: "axis" },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xAxisData,
        boundaryGap: timeScale === "Days" || timeScale === "Week",
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: {
          color: "#6b7280",
          interval: timeScale === "Hours" ? 3 : 0,
          fontSize: 10,
        },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "#f3f4f6" } },
        axisLabel: { color: "#6b7280", fontSize: 10 },
      },
      series: [
        {
          name: seriesName,
          type: timeScale === "Days" || timeScale === "Week" ? "bar" : "line",
          smooth: 0.4,
          areaStyle:
            timeScale === "Days" || timeScale === "Week"
              ? null
              : {
                  color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: "rgba(99, 102, 241, 0.4)" },
                      { offset: 1, color: "rgba(99, 102, 241, 0.05)" },
                    ],
                  },
                },
          data: data,
          itemStyle: { color: "#6366f1", borderRadius: [4, 4, 0, 0] },
          lineStyle: { width: 2, color: "#6366f1" },
        },
      ],
    };
  }, [metrics, timeScale]);

  const taskActivityOption = useMemo(() => {
    const stats =
      taskScale === "Daily"
        ? metrics.dailyPriorityStats
        : metrics.weeklyPriorityStats;
    const priorityColors = {
      Critical: "#ef4444",
      High: "#f97316",
      Medium: "#f59e0b",
      Low: "#10b981",
    };
    return {
      tooltip: { trigger: "axis" },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["Crit", "High", "Med", "Low"],
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#6b7280", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "#f3f4f6" } },
        axisLabel: { color: "#6b7280", fontSize: 10 },
      },
      series: [
        {
          name: taskScale === "Daily" ? "Finished Today" : "Finished This Week",
          type: "bar",
          data: [
            {
              value: stats.Critical,
              itemStyle: { color: priorityColors.Critical },
            },
            { value: stats.High, itemStyle: { color: priorityColors.High } },
            {
              value: stats.Medium,
              itemStyle: { color: priorityColors.Medium },
            },
            { value: stats.Low, itemStyle: { color: priorityColors.Low } },
          ],
          barWidth: "40%",
          label: {
            show: true,
            position: "top",
            color: "#6b7280",
            fontSize: 10,
          },
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [metrics, taskScale]);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
      {/* Top Section: Status and KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution 2x2 */}
        <Card className="p-5 border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-sm h-full">
          <h3 className="text-sm font-black text-text-primary dark:text-white mb-4 tracking-tight uppercase">
            Current Status
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "To Do", key: "todo", color: "bg-yellow-400" },
              { label: "In Progress", key: "progress", color: "bg-blue-500" },
              { label: "In Review", key: "review", color: "bg-purple-500" },
              { label: "Done", key: "done", color: "bg-emerald-500" },
            ].map((status) => {
              const count = tasks.filter(
                (t) => t.kanban_status === status.key,
              ).length;
              const percentage =
                tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
              return (
                <div
                  key={status.key}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-border-light dark:border-border-dark"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", status.color)} />
                    <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-text-primary dark:text-white">
                      {count}
                    </span>
                    <span className="text-[10px] font-bold text-text-tertiary">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* KPI Cards 2x2 */}
        <div className="grid grid-cols-2 gap-4 h-full">
          <KPICard
            title="Total Tasks"
            value={metrics.totalTasks}
            icon={Target}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            tooltip="Total tasks created across projects."
          />
          <KPICard
            title="Task Velocity"
            value={`${metrics.completionRate}%`}
            icon={CheckSquare}
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            tooltip="Efficiency score: completed percentage."
          />
          <KPICard
            title="Focused Time"
            value={
              metrics.totalSecondsTracked === 0
                ? "0s"
                : formatDurationLong(metrics.totalSecondsTracked)
            }
            icon={Clock}
            colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            tooltip="Total time manually/auto tracked."
          />
          <KPICard
            title="Avg Cycle Time"
            value={
              metrics.completedTasks === 0
                ? "N/A"
                : formatDurationLong(metrics.avgSecondsToComplete)
            }
            icon={Activity}
            colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            tooltip="Avg time from creation to finish."
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Engagement */}
        <Card className="p-5 border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-text-primary dark:text-white tracking-tight">
                Time Engagement
              </h3>
              <p className="text-[10px] text-text-tertiary mt-0.5 font-medium uppercase">
                Productivity Patterns
              </p>
            </div>
            <div className="relative group">
              <select
                value={timeScale}
                onChange={(e) => setTimeScale(e.target.value)}
                className="appearance-none bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-3 py-1.5 pr-8 text-[10px] font-bold text-text-primary dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary/20"
              >
                {["Minutes", "Hours", "Days", "Week"].map((s) => (
                  <option key={s} value={s}>
                    {s} View
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            {metrics.totalSecondsTracked === 0 ? (
              <div className="flex flex-col items-center justify-center text-text-tertiary bg-gray-50/50 dark:bg-gray-800/30 w-full h-full rounded-2xl border border-dashed border-border-light dark:border-border-dark p-6">
                <Clock className="w-6 h-6 mb-2 opacity-50" />
                <p className="font-medium text-xs">No time tracked.</p>
              </div>
            ) : (
              <ReactECharts
                option={timeEngagementOption}
                style={{ height: "100%", width: "100%" }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </div>
        </Card>

        {/* Task Activity */}
        <Card className="p-5 border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-text-primary dark:text-white tracking-tight">
                Task Activity
              </h3>
              <p className="text-[10px] text-text-tertiary mt-0.5 font-medium uppercase">
                Priority Breakdown
              </p>
            </div>
            <div className="relative group">
              <select
                value={taskScale}
                onChange={(e) => setTaskScale(e.target.value)}
                className="appearance-none bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-3 py-1.5 pr-8 text-[10px] font-bold text-text-primary dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary/20"
              >
                {["Daily", "Weekly"].map((s) => (
                  <option key={s} value={s}>
                    {s} Period
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            {metrics.completedTasks === 0 ? (
              <div className="flex flex-col items-center justify-center text-text-tertiary bg-gray-50/50 dark:bg-gray-800/30 w-full h-full rounded-2xl border border-dashed border-border-light dark:border-border-dark p-6">
                <CheckSquare className="w-6 h-6 mb-2 opacity-50" />
                <p className="font-medium text-xs">No tasks done.</p>
              </div>
            ) : (
              <ReactECharts
                option={taskActivityOption}
                style={{ height: "100%", width: "100%" }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
