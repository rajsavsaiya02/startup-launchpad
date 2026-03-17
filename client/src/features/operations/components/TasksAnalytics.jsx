import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  differenceInSeconds,
  getHours,
  getDay,
  startOfDay,
  subDays,
  isWithinInterval,
  format,
} from "date-fns";
import {
  Clock,
  CheckSquare,
  Target,
  Activity,
  Info,
  ChevronDown,
  Zap,
  TrendingUp,
  BrainCircuit,
  PieChart
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";
import { motion } from "framer-motion";

const KPICard = ({ title, value, icon: Icon, colorClass, tooltip, subtext }) => (
  <Card className="relative overflow-hidden p-5 flex flex-col justify-between border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 group rounded-3xl h-full">
    {/* Decorative orb */}
    <div className={cn("absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500", colorClass.replace('text-', 'bg-').split(' ')[0])} />

    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={cn("p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 ring-1 ring-inset ring-gray-900/5 dark:ring-white/5", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="group/tip relative flex justify-end">
        <Info className="w-4 h-4 text-text-tertiary hover:text-primary cursor-help transition-colors" />
        <div className="absolute top-full right-0 mt-2 w-48 p-2.5 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10 font-medium">
          {tooltip}
        </div>
      </div>
    </div>
    
    <div className="relative z-10">
      <h4 className="text-3xl font-black text-text-primary dark:text-white leading-none tracking-tight mb-1">
        {value}
      </h4>
      <p className="text-xs font-bold text-text-secondary dark:text-gray-300 uppercase tracking-widest">
        {title}
      </p>
      {subtext && (
        <p className="text-[10px] text-text-tertiary mt-1 font-medium">{subtext}</p>
      )}
    </div>
  </Card>
);

export function TasksAnalytics({ tasks }) {
  const [timeScale, setTimeScale] = useState("Hours"); 
  const [taskScale, setTaskScale] = useState("Weekly");

  const metrics = useMemo(() => {
    let totalTasks = tasks.length;
    let completedTasks = tasks.filter((t) => t.kanban_status === "done").length;

    let totalSecondsTracked = 0;
    let deepWorkSeconds = 0;
    
    // Time Engagement Distributions
    const hourlyDistribution = Array(24).fill(0);
    const minuteDistribution = Array(60).fill(0);
    const dailyDistribution = Array(7).fill(0); // 0 = Sunday
    const weeklyDistribution = Array(4).fill(0);

    // Productivity Heatmap (Day vs Hour)
    // 7 rows (days), 24 cols (hours)
    const heatmapMatrix = Array.from({ length: 7 }, () => Array(24).fill(0));

    // Task Activity Distributions (Priorities)
    const dailyPriorityStats = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const weeklyPriorityStats = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    let completedSecondsToFinish = 0;
    let completedWithLogsCount = 0;

    const parseTimeLogs = (logs) => {
      if (!logs) return [];
      if (typeof logs === "string") {
        try { return JSON.parse(logs); } catch { return []; }
      }
      return Array.isArray(logs) ? logs : [];
    };

    const now = new Date();
    const startOfCurrentDay = startOfDay(now);
    
    tasks.forEach((task) => {
      const logs = parseTimeLogs(task.time_logs);
      const isDone = task.kanban_status === "done";
      const priority = task.priority || "Medium";

      // Populate Priority Stats
      if (isDone && task.updated_at) {
        const finishDate = new Date(task.updated_at);
        if (isWithinInterval(finishDate, { start: startOfCurrentDay, end: now })) {
          if(dailyPriorityStats[priority] !== undefined) dailyPriorityStats[priority]++;
        }
        if (isWithinInterval(finishDate, { start: subDays(now, 7), end: now })) {
          if(weeklyPriorityStats[priority] !== undefined) weeklyPriorityStats[priority]++;
        }
      }

      // Process Time Logs
      logs.forEach((log) => {
        if (!log.start_time || !log.end_time) return;
        try {
          const start = new Date(log.start_time);
          const end = new Date(log.end_time);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

          const seconds = log.duration_seconds || differenceInSeconds(end, start);
          if (seconds > 0) {
            totalSecondsTracked += seconds;
            
            // Deep work defined as sessions >= 1 Hour
            if (seconds >= 3600) {
                deepWorkSeconds += seconds;
            }

            const hour = getHours(start);
            const day = getDay(start); 
            
            heatmapMatrix[day][hour] += Math.round(seconds / 60); // minutes spent in this day/hour combo
            
            hourlyDistribution[hour] += Math.round(seconds / 60);
            dailyDistribution[day] += Math.round(seconds / 3600);

            const weeksAgo = Math.floor(differenceInSeconds(now, start) / (7 * 24 * 3600));
            if (weeksAgo >= 0 && weeksAgo < 4) {
              weeklyDistribution[3 - weeksAgo] += Math.round(seconds / 3600);
            }
          }
        } catch {}
      });

      // Active Timer Logic
      if (task.timer_started_at) {
        try {
          const start = new Date(task.timer_started_at);
          if (!isNaN(start.getTime())) {
            const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
            if (elapsed > 0) {
              totalSecondsTracked += elapsed;
              const h = getHours(now);
              const d = getDay(now);
              hourlyDistribution[h] += Math.round(elapsed / 60);
              dailyDistribution[d] += Math.round(elapsed / 3600);
              heatmapMatrix[d][h] += Math.round(elapsed / 60);
              if (elapsed >= 3600) deepWorkSeconds += elapsed;
            }
          }
        } catch {}
      }

      // Lead time logic
      if (isDone && task.created_at && task.updated_at) {
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
    });

    const avgLeadTimeSeconds = completedWithLogsCount > 0 ? Math.round(completedSecondsToFinish / completedWithLogsCount) : 0;
    
    // Find Peak Performance Time
    let maxMins = 0;
    let peakDay = 0;
    let peakHour = 0;
    for(let d=0; d<7; d++){
        for(let h=0; h<24; h++){
            if(heatmapMatrix[d][h] > maxMins) {
                maxMins = heatmapMatrix[d][h];
                peakDay = d;
                peakHour = h;
            }
        }
    }

    const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const peakInsight = maxMins > 0 
        ? `You perform best on ${daysMap[peakDay]}s around ${peakHour % 12 || 12} ${peakHour >= 12 ? 'PM' : 'AM'}.`
        : "Start tracking time to discover your peak performance hours.";

    return {
      totalTasks,
      completedTasks,
      efficiencyScore: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalSecondsTracked,
      deepWorkSeconds,
      deepWorkRatio: totalSecondsTracked > 0 ? Math.round((deepWorkSeconds / totalSecondsTracked) * 100) : 0,
      avgLeadTimeSeconds,
      hourlyDistribution,
      minuteDistribution,
      dailyDistribution,
      weeklyDistribution,
      dailyPriorityStats,
      weeklyPriorityStats,
      heatmapMatrix,
      peakInsight
    };
  }, [tasks]);

  const formatDurationLong = (totalSeconds) => {
    if(!totalSeconds) return "0h 0m";
    totalSeconds = Math.round(totalSeconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const getHeatmapOption = useMemo(() => {
    const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
        '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const data = [];
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
            data.push([h, d, metrics.heatmapMatrix[d][h] || '-']);
        }
    }

    return {
        tooltip: {
            position: 'top',
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            textStyle: { color: '#fff', fontSize: 10 },
            borderWidth: 0,
            formatter: function (params) {
                const val = params.data[2] === '-' ? 0 : params.data[2];
                return `${days[params.data[1]]} ${hours[params.data[0]]}<br/><b>${val}</b> mins focused`;
            }
        },
        grid: { left: '5%', right: '5%', top: '5%', bottom: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            data: hours,
            splitArea: { show: true },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#9ca3af', fontSize: 9 }
        },
        yAxis: {
            type: 'category',
            data: days,
            splitArea: { show: true },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold' }
        },
        visualMap: {
            min: 0,
            max: Math.max(60, ...metrics.heatmapMatrix.flat()), // Assume 60 mins is a high
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%',
            inRange: {
                color: ['#f3f4f6', '#c7d2fe', '#818cf8', '#4f46e5', '#312e81'] // Indigo scale
            },
            textStyle: { color: '#9ca3af', fontSize: 10 },
            show: false // Hide legend to save space
        },
        series: [{
            name: 'Focus Heatmap',
            type: 'heatmap',
            data: data,
            label: { show: false },
            emphasis: {
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
            },
            itemStyle: {
                borderRadius: 4,
                borderWidth: 2,
                borderColor: 'transparent'
            }
        }]
    };
  }, [metrics.heatmapMatrix]);


  const timeEngagementOption = useMemo(() => {
    let data = [], xAxisData = [], seriesName = "";
    if (timeScale === "Hours") {
      data = metrics.hourlyDistribution;
      xAxisData = Array.from({ length: 24 }, (_, i) => `${i % 12 || 12}${i >= 12 ? "p" : "a"}`);
      seriesName = "Minutes Tracked";
    } else if (timeScale === "Days") {
      data = metrics.dailyDistribution;
      xAxisData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      seriesName = "Hours Tracked";
    } else {
      data = metrics.weeklyDistribution;
      xAxisData = ["3w ago", "2w ago", "Last w", "This w"];
      seriesName = "Hours Tracked";
    }

    return {
      tooltip: { 
          trigger: "axis",
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          textStyle: { color: '#fff', fontSize: 10 },
          borderWidth: 0,
      },
      grid: { left: "3%", right: "4%", bottom: "5%", top: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: xAxisData,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#9ca3af", fontSize: 10, interval: timeScale === 'Hours' ? 3 : 0 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "rgba(107, 114, 128, 0.1)" } },
        axisLabel: { color: "#9ca3af", fontSize: 10 },
      },
      series: [
        {
          name: seriesName,
          type: "line",
          smooth: 0.4,
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(99, 102, 241, 0.5)" },
                { offset: 1, color: "rgba(99, 102, 241, 0.01)" },
              ],
            },
          },
          data: data,
          itemStyle: { color: "#6366f1" },
          lineStyle: { width: 3, color: "#6366f1", shadowColor: 'rgba(99, 102, 241, 0.3)', shadowBlur: 10 },
          symbolSize: 6,
          showSymbol: false,
        },
      ],
    };
  }, [metrics, timeScale]);

  const taskActivityOption = useMemo(() => {
    const stats = taskScale === "Daily" ? metrics.dailyPriorityStats : metrics.weeklyPriorityStats;
    return {
      tooltip: { 
          trigger: "axis",
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          textStyle: { color: '#fff', fontSize: 10 },
          borderWidth: 0,
      },
      grid: { left: "3%", right: "4%", bottom: "5%", top: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: ["Critical", "High", "Medium", "Low"],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#9ca3af", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "rgba(107, 114, 128, 0.1)" } },
        axisLabel: { color: "#9ca3af", fontSize: 10 },
      },
      series: [
        {
          name: "Tasks Finished",
          type: "bar",
          data: [
            { value: stats.Critical, itemStyle: { color: "#ef4444" } },
            { value: stats.High, itemStyle: { color: "#f97316" } },
            { value: stats.Medium, itemStyle: { color: "#f59e0b" } },
            { value: stats.Low, itemStyle: { color: "#10b981" } },
          ],
          barWidth: "30%",
          label: { show: false },
          itemStyle: { 
              borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };
  }, [metrics, taskScale]);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 space-y-8 bg-transparent w-full pb-20">
        
      {/* Top Banner Insight */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
      >
          <div className="bg-indigo-500/20 p-2 rounded-xl shrink-0">
             <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
              <h4 className="font-bold text-sm tracking-wide">Intelligent Insight</h4>
              <p className="text-xs font-medium opacity-80 mt-0.5">{metrics.peakInsight}</p>
          </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <KPICard
          title="Efficiency Score"
          value={`${metrics.efficiencyScore}%`}
          icon={Target}
          colorClass="text-emerald-500 dark:text-emerald-400 bg-emerald-500/10"
          tooltip="Percentage of total tasks marked as done."
          subtext={`${metrics.completedTasks} / ${metrics.totalTasks} Tasks`}
        />
         <KPICard
          title="Focused Time"
          value={formatDurationLong(metrics.totalSecondsTracked)}
          icon={Clock}
          colorClass="text-blue-500 dark:text-blue-400 bg-blue-500/10"
          tooltip="Total time actively tracked using the timer."
          subtext="Manually & Auto-tracked"
        />
        <KPICard
          title="Deep Work Ratio"
          value={`${metrics.deepWorkRatio}%`}
          icon={Zap}
          colorClass="text-amber-500 dark:text-amber-400 bg-amber-500/10"
          tooltip="Percentage of total tracked time spent in uninterrupted sessions >= 1 hour."
          subtext={`${formatDurationLong(metrics.deepWorkSeconds)} in Flow State`}
        />
        <KPICard
          title="Avg Lead Time"
          value={formatDurationLong(metrics.avgLeadTimeSeconds)}
          icon={Activity}
          colorClass="text-purple-500 dark:text-purple-400 bg-purple-500/10"
          tooltip="Average time taken from task creation to completion."
          subtext="Speed of delivery"
        />
      </motion.div>

      {/* Secondary Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Heatmap Section (Spans 2 cols) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2">
            <Card className="p-6 border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-sm flex flex-col h-full min-h-[350px]">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Productivity Heatmap
                        </h3>
                        <p className="text-sm text-text-tertiary mt-1 font-medium">Discover your optimal focus periods.</p>
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                     <ReactECharts option={getHeatmapOption} style={{ height: "100%", width: "100%", position: 'absolute' }} notMerge={true} lazyUpdate={true} />
                </div>
            </Card>
        </motion.div>

        {/* Status Distribution (1 col) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-6 border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-sm h-full flex flex-col">
                <div className="mb-6">
                    <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-rose-500" />
                        Task Load
                    </h3>
                    <p className="text-sm text-text-tertiary mt-1 font-medium">Current distribution of your tasks.</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-4">
                    {[
                        { label: "Done", key: "done", color: "bg-emerald-500" },
                        { label: "In Review", key: "review", color: "bg-purple-500" },
                        { label: "In Progress", key: "progress", color: "bg-blue-500" },
                        { label: "To Do", key: "todo", color: "bg-yellow-400" },
                    ].map((status) => {
                        const count = tasks.filter((t) => t.kanban_status === status.key).length;
                        const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                        return (
                            <div key={status.key} className="group">
                                <div className="flex justify-between text-xs mb-1.5 font-bold">
                                    <span className="text-text-secondary dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", status.color)} />
                                        {status.label}
                                    </span>
                                    <span className="text-text-primary dark:text-white">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1 }}
                                        className={cn("h-full rounded-full transition-colors", status.color)} 
                                     />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </motion.div>

        {/* Two smaller charts at the bottom */}
        {/* Time Tracking Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card className="p-6 border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-sm flex flex-col h-[300px]">
                <div className="flex items-center justify-between mb-4 z-10 relative">
                    <div>
                        <h3 className="text-base font-black text-text-primary dark:text-white tracking-tight">Time Engagement</h3>
                        <p className="text-[10px] text-text-tertiary mt-0.5 font-bold uppercase tracking-wider">Tracking Trends</p>
                    </div>
                    <div className="relative">
                        <select 
                            value={timeScale} 
                            onChange={(e) => setTimeScale(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-1.5 pr-8 text-xs font-bold text-text-primary dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary/20 appearance-none transition-colors"
                        >
                            {["Hours", "Days", "Week"].map(s => <option key={s} value={s}>{s} View</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <ReactECharts option={timeEngagementOption} style={{ height: "100%", width: "100%", position: 'absolute' }} notMerge={true} lazyUpdate={true} />
                </div>
            </Card>
        </motion.div>

        {/* Task Velocity per Priority */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="p-6 border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-sm flex flex-col h-[300px]">
                <div className="flex items-center justify-between mb-4 z-10 relative">
                    <div>
                        <h3 className="text-base font-black text-text-primary dark:text-white tracking-tight">Output By Priority</h3>
                        <p className="text-[10px] text-text-tertiary mt-0.5 font-bold uppercase tracking-wider">Completion Velocity</p>
                    </div>
                    <div className="relative">
                        <select 
                            value={taskScale} 
                            onChange={(e) => setTaskScale(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-1.5 pr-8 text-xs font-bold text-text-primary dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary/20 appearance-none transition-colors"
                        >
                            {["Daily", "Weekly"].map(s => <option key={s} value={s}>{s} Peak</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <ReactECharts option={taskActivityOption} style={{ height: "100%", width: "100%", position: 'absolute' }} notMerge={true} lazyUpdate={true} />
                </div>
            </Card>
        </motion.div>
      </div>

    </div>
  );
}
