import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  CheckSquare,
  Clock,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Calendar,
} from "lucide-react";
import { format, subDays, isSameDay, isBefore, startOfDay } from "date-fns";

import { useAuth } from "../../context/AuthContext";
import projectService from "../../services/projectService";
import taskService from "../../services/taskService";

import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// --- Helper Components ---
const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div variants={itemVariants} className="h-full">
    <Card className="relative overflow-hidden p-6 h-full flex flex-col justify-between group border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl">
      {/* Decorative gradient orb */}
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500", colorClass.replace('text-', 'bg-').split(' ')[0])} />
      
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div className={cn("p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 ring-1 ring-inset ring-gray-900/5 dark:ring-white/5", colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-4xl font-black text-text-primary dark:text-white tracking-tight leading-none mb-2">
          {value}
        </h3>
        <p className="text-sm font-bold text-text-primary dark:text-gray-200 tracking-wide">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-text-tertiary mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  </motion.div>
);

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, tasksData] = await Promise.all([
          projectService.getProjects(),
          taskService.getAllTasks(),
        ]);
        setProjects(projectsData || []);
        setTasks(tasksData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Derived Metrics ---
  const metrics = useMemo(() => {
    const now = new Date();
    
    // Project Metrics
    const activeProjectsList = projects.filter(p => {
      const isCompleted = (p.status || "Active") === "Completed" || Number(p.progress) >= 100;
      const isOverdue = p.due_date && isBefore(startOfDay(new Date(p.due_date)), startOfDay(new Date()));
      const isArchived = isCompleted && isOverdue;
      return !isArchived;
    });

    const activeProjectCount = activeProjectsList.filter(p => p.status === "Active" || p.status === "Planning").length;
    
    // Task Metrics
    const highPriorityTasks = tasks.filter(t => 
      t.kanban_status !== "done" && 
      (t.priority === "High" || t.priority === "Critical")
    );
    
    const completedTasksLast7Days = tasks.filter(t => {
      if (t.kanban_status !== "done" || !t.updated_at) return false;
      const completedDate = new Date(t.updated_at);
      const sevenDaysAgo = subDays(now, 7);
      return completedDate >= sevenDaysAgo && completedDate <= now;
    });

    // Deep Work / Time Tracking Logic
    let totalDeepWorkSeconds = 0;
    
    const parseTimeLogs = (logs) => {
      if (!logs) return [];
      if (typeof logs === "string") {
        try { return JSON.parse(logs); } catch { return []; }
      }
      return Array.isArray(logs) ? logs : [];
    };

    tasks.forEach(task => {
      const logs = parseTimeLogs(task.time_logs);
      logs.forEach(log => {
        if (log.duration_seconds && log.duration_seconds >= 3600) {
           // We define 'deep work' as any single session >= 1 hour
           totalDeepWorkSeconds += log.duration_seconds;
        }
      });
    });

    const formatHours = (seconds) => {
      const hours = (seconds / 3600).toFixed(1);
      return hours.replace('.0', '');
    };

    return {
      activeProjects: activeProjectCount,
      activeProjectsList,
      urgentTasks: highPriorityTasks.length,
      urgentTasksList: highPriorityTasks.slice(0, 5), // Top 5 for radar
      weeklyVelocity: completedTasksLast7Days.length,
      deepWorkHours: formatHours(totalDeepWorkSeconds),
    };
  }, [projects, tasks]);

  // --- Focus Heatmap Data Generation (Last 14 Days) ---
  const heatmapData = useMemo(() => {
    const days = [];
    const now = new Date();
    
    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      days.push({
        date: subDays(now, i),
        count: 0,
      });
    }

    // Populate with completed tasks
    tasks.forEach(t => {
      if (t.kanban_status === "done" && t.updated_at) {
        const completedDate = new Date(t.updated_at);
        const dayMatch = days.find(d => isSameDay(d.date, completedDate));
        if (dayMatch) {
          dayMatch.count += 1;
        }
      }
    });

    return days;
  }, [tasks]);

  const getIntensityClass = (count) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800/50";
    if (count <= 2) return "bg-primary/20";
    if (count <= 4) return "bg-primary/50";
    if (count <= 6) return "bg-primary/80";
    return "bg-primary";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-6 lg:px-8 w-full pt-6">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 tracking-tight mb-2">
            Welcome back, {user?.first_name || 'Creator'}
          </h1>
          <p className="text-lg text-text-secondary dark:text-gray-400 font-medium">
            Here's a look at your productivity pulse. Let's make today count.
          </p>
        </div>
        
        {/* Action Hub */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate('/productivity/projects')}
            variant="outline" 
            className="rounded-2xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-bold"
          >
            <Folder className="w-4 h-4 mr-2" /> View Projects
          </Button>
          <Button 
            onClick={() => navigate('/productivity/tasks')}
            className="rounded-2xl bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
      </motion.div>

      {/* Metrics Engine */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <MetricCard 
          title="Active Projects" 
          value={metrics.activeProjects} 
          subtitle="Currently in motion"
          icon={Folder} 
          colorClass="text-blue-500 dark:text-blue-400 bg-blue-500/10"
        />
        <MetricCard 
          title="Urgent Tasks" 
          value={metrics.urgentTasks} 
          subtitle="High priority pending"
          icon={Target} 
          colorClass="text-rose-500 dark:text-rose-400 bg-rose-500/10"
        />
        <MetricCard 
          title="Deep Work" 
          value={`${metrics.deepWorkHours}h`} 
          subtitle="Focused tracking sessions"
          icon={Zap} 
          colorClass="text-amber-500 dark:text-amber-400 bg-amber-500/10"
        />
        <MetricCard 
          title="Task Velocity" 
          value={metrics.weeklyVelocity} 
          subtitle="Tasks completed last 7 days"
          icon={Activity} 
          colorClass="text-emerald-500 dark:text-emerald-400 bg-emerald-500/10"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Progress & Heatmap */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Progress Pulse */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="p-6 h-full border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Progress Pulse
                  </h2>
                  <p className="text-sm text-text-tertiary mt-1">Status of your active initiatives.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/productivity/projects')} className="text-primary hover:bg-primary/10 rounded-xl font-bold">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-5">
                {loading ? (
                   <div className="animate-pulse space-y-4">
                     {[1,2,3].map(i => (
                       <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl w-full"></div>
                     ))}
                   </div>
                ) : metrics.activeProjectsList.slice(0, 4).map((proj) => (
                  <div key={proj.id} className="group relative">
                    <div className="flex justify-between text-sm mb-2 items-end">
                      <span className="font-bold text-text-primary dark:text-white truncate pr-4">
                        {proj.title}
                      </span>
                      <span className="font-black text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                        {proj.progress || 0}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${proj.progress || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full transition-colors relative",
                          (proj.progress || 0) >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-indigo-500"
                        )}
                      >
                         <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                ))}
                {!loading && metrics.activeProjectsList.length === 0 && (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <Folder className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">No projects yet. Start building!</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Focus Heatmap */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="p-6 border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-sm">
               <div className="mb-6">
                  <h2 className="text-xl font-black text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Focus Momentum
                  </h2>
                  <p className="text-sm text-text-tertiary mt-1">Tasks completed over the last 14 days.</p>
                </div>
                
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 items-end justify-between min-h-[80px]">
                  {heatmapData.map((day, idx) => (
                     <div key={idx} className="flex flex-col items-center gap-2 group relative flex-1 min-w-[24px]">
                       <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                         {format(day.date, 'MMM d')}: {day.count} tasks
                         <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                       </div>
                       
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: day.count === 0 ? 8 : Math.max(16, day.count * 8) }}
                         className={cn("w-full max-w-[32px] rounded-sm transition-colors duration-300", getIntensityClass(day.count))}
                       />
                       <span className="text-[9px] text-text-tertiary font-bold uppercase">
                         {format(day.date, 'EE').charAt(0)}
                       </span>
                     </div>
                  ))}
                </div>
            </Card>
          </motion.div>

        </div>

        {/* Right Column: Task Radar */}
        <div className="space-y-6 lg:space-y-8">
           <motion.div variants={itemVariants} initial="hidden" animate="visible" className="h-full">
            <Card className="p-6 h-full flex flex-col border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl rounded-3xl shadow-sm">
               <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-text-primary dark:text-white tracking-tight flex items-center gap-2">
                    <Target className="w-5 h-5 text-rose-500" />
                    Task Radar
                  </h2>
                  <p className="text-sm text-text-tertiary mt-1">High priority items needing attention.</p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                 {loading ? (
                   <div className="animate-pulse space-y-4">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full"></div>
                     ))}
                   </div>
                 ) : metrics.urgentTasksList.length > 0 ? (
                   metrics.urgentTasksList.map(task => (
                     <div 
                        key={task.id} 
                        onClick={() => navigate('/productivity/tasks')}
                        className="group relative p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer overflow-hidden"
                      >
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-2xl" />
                       <div className="pl-2">
                         <h4 className="font-bold text-sm text-text-primary dark:text-white truncate group-hover:text-primary transition-colors">
                           {task.title}
                         </h4>
                         <div className="flex items-center gap-3 mt-2 text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                           <span className="flex items-center gap-1 text-rose-500">
                             <Zap className="w-3 h-3" /> {task.priority}
                           </span>
                           {task.project_title && (
                             <span className="truncate max-w-[120px] px-2 py-0.5 rounded bg-gray-200/50 dark:bg-gray-700">
                               {task.project_title}
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[200px] bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 rounded-full flex items-center justify-center mb-3 ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                        <CheckSquare className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">Radar Clear</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-1 max-w-[150px]">
                        No urgent tasks pending. Great job staying on top of things!
                      </p>
                    </div>
                 )}
              </div>
            </Card>
           </motion.div>
        </div>

      </div>
    </div>
  );
}
