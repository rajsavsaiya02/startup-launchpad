import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Users, Building2, Activity, AlertCircle, Briefcase, FileText, Shield, UserPlus, Trash2, Server, Database, Clock, HardDrive, ShieldCheck, CheckCircle, Eye, X, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { adminAnalyticsService } from '../../../services/adminAnalyticsService';
import { useAuth } from '../../../context/AuthContext';

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  return isDark ? 'dark' : 'light';
}

// Quick View Modal Component (Condensed for Dashboard)
const QuickViewModal = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Audit Log Detail
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</label>
              <p className="font-mono text-xs mt-1 text-gray-700 dark:text-gray-300">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
              <div className="mt-1">
                <Badge variant={log.status === 'Success' ? 'success' : 'error'} className="px-2 py-0.5 text-[10px]">
                  {log.status}
                </Badge>
              </div>
            </div>
          </div>

          <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</label>
             <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
               {log.action}
             </p>
          </div>

          <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
             <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 whitespace-pre-wrap break-all leading-relaxed">
               {log.description || 'No additional description available.'}
             </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
             <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User / System</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar src={log.user_avatar || log.admin_avatar} size="sm" className="h-7 w-7 ring-2 ring-white dark:ring-gray-800" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {log.user_name || log.admin_name || 'System / Anonymous'}
                  </span>
                </div>
             </div>
             <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IP Address</label>
                <p className="font-mono text-xs mt-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                  {log.ip_address || 'N/A'}
                </p>
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm" className="px-6 rounded-lg font-bold">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export function AdminDashboardPage() {
  const theme = useDarkMode();
  const navigate = useNavigate();
  const { user } = useAuth(); // getting admin user details
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminAnalyticsSummary'],
    queryFn: adminAnalyticsService.getAnalyticsSummary,
    refetchInterval: 60000, 
  });

  const [chartRange, setChartRange] = useState("daily"); // 'daily' or 'weekly'
  const [pageOffset, setPageOffset] = useState(0);
  const [localUptime, setLocalUptime] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

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

  const formatUptimeDetail = (seconds) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Derived ECharts Options for User Registration vs Deletion
  const growthChartOption = useMemo(() => {
    const dataSourceRaw = chartRange === 'daily' ? data?.dailyUserGrowth : data?.weeklyUserGrowth;
    if (!dataSourceRaw) return {};
    
    // Pagination slicing
    const itemsPerPage = chartRange === 'daily' ? 7 : 8;
    const totalItems = dataSourceRaw.length;
    // Calculate slice bounds (latest data is at the end of the array)
    // Offset 0 = Last 7 items
    // Offset 1 = Items from (length - 14) to (length - 7)
    const endIndex = totalItems - (pageOffset * itemsPerPage);
    const startIndex = Math.max(0, endIndex - itemsPerPage);
    const dataSource = dataSourceRaw.slice(startIndex, endIndex);

    const dates = dataSource.map(d => d.date);
    const joined = dataSource.map(d => parseInt(d.joined, 10));
    const deleted = dataSource.map(d => parseInt(d.deleted, 10));

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        textStyle: { color: theme === 'dark' ? '#f9fafb' : '#111827' }
      },
      legend: {
        data: ['Joined', 'Deleted'],
        bottom: 0,
        textStyle: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
      },
      grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: theme === 'dark' ? '#4b5563' : '#d1d5db' } },
        axisLabel: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        minInterval: 1,
        max: (value) => value.max < 50 ? 50 : null, // Ensure Y axis minimum is 50
        splitLine: { lineStyle: { type: 'dashed', color: theme === 'dark' ? '#374151' : '#e5e7eb' } },
        axisLabel: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
      },
      series: [
        {
          name: 'Joined',
          type: 'line',
          smooth: true,
          data: joined,
          itemStyle: { color: '#10b981' }, // Emerald
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.4)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }]
            }
          }
        },
        {
          name: 'Deleted',
          type: 'line',
          smooth: true,
          data: deleted,
          itemStyle: { color: '#ef4444' }, // Red
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(239, 68, 68, 0.4)' }, { offset: 1, color: 'rgba(239, 68, 68, 0.0)' }]
            }
          }
        }
      ]
    };
  }, [data, theme, chartRange, pageOffset]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-text-primary dark:text-white">Failed to load analytics</h2>
        <p className="text-text-secondary dark:text-gray-400">Please try refreshing the page or check your connection.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  const { summary, activityFeed, health } = data;

  const STATS = [
    { label: 'Total Users', value: summary.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Organizations', value: summary.activeOrgs.toLocaleString(), icon: Building2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Total Projects', value: summary.totalProjects.toLocaleString(), icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const QUICK_LINKS = [
    { label: 'Organizations', path: '/admin/management/organizations', icon: Building2, color: 'text-violet-500', bg: 'bg-violet-500/10 hover:bg-violet-500/20' },
    { label: 'User Directory', path: '/admin/management/users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10 hover:bg-blue-500/20' },
    { label: 'Blog Posts', path: '/admin/communication/cms/blogs', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20' },
    { label: 'Security', path: '/admin/settings/security', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10 hover:bg-rose-500/20' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Premium Header */}
      <div className="flex flex-col gap-1.5 pb-2">
        <h1 className="text-4xl font-extrabold text-[#1f2937] dark:text-white tracking-tight">
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Admin'}
        </h1>
        <p className="text-lg font-medium text-text-secondary dark:text-gray-400">
          Here's a look at your productivity pulse. Let's make today count.
        </p>
      </div>

      {/* Row 1: Quick Links & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Access */}
        <Card className="lg:col-span-5 p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-border-light dark:border-border-dark flex flex-col justify-center shadow-sm hover:shadow-md transition-all">
           <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">Quick Navigation</h2>
           <div className="grid grid-cols-2 gap-3">
             {QUICK_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent dark:border-gray-800 ${link.bg}`}
                >
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                  <span className="font-semibold text-text-primary dark:text-gray-200 text-sm">{link.label}</span>
                </button>
             ))}
           </div>
        </Card>

        {/* Top Stats */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <Card key={i} className="p-6 relative overflow-hidden group flex flex-col justify-center gap-3 border-none bg-white dark:bg-gray-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-2xl">
              <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-[0.08] transition-transform group-hover:scale-110 duration-500 ${stat.bg}`}></div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${stat.bg}`}>
                 <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="relative z-10 mt-1">
                <p className="text-3xl font-extrabold text-[#1f2937] dark:text-white tabular-nums tracking-tight">{stat.value}</p>
                <p className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Row 2: Charts & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Growth */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-sm border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-text-primary dark:text-white">User Growth & Retention</h2>
                <p className="text-sm text-text-tertiary">Monitor platform adoption and churn</p>
              </div>
              <div className="flex items-center gap-6">
                {/* Pagination Controls */}
                <div className="flex items-center gap-4 text-[13px] text-text-tertiary font-medium">
                  <button 
                    disabled={pageOffset >= Math.ceil((chartRange === 'daily' ? 30 : 24) / (chartRange === 'daily' ? 7 : 8)) - 1}
                    onClick={() => setPageOffset(p => p + 1)}
                    className="hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-tertiary transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-lg leading-none">&larr;</span> Older
                  </button>
                  <button 
                    onClick={() => setPageOffset(0)}
                    className={`transition-colors ${pageOffset === 0 ? 'text-text-secondary font-semibold' : 'hover:text-text-primary'}`}
                  >
                    Latest
                  </button>
                  <button 
                    disabled={pageOffset === 0}
                    onClick={() => setPageOffset(p => p - 1)}
                    className="hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-tertiary transition-colors flex items-center gap-1.5"
                  >
                    Newer <span className="text-lg leading-none">&rarr;</span>
                  </button>
                </div>

                {/* Range Toggle */}
                <div className="flex bg-gray-50 dark:bg-gray-800/80 p-0.5 rounded-lg border border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={() => { setChartRange('daily'); setPageOffset(0); }}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartRange === 'daily' ? 'bg-white dark:bg-gray-700 text-text-primary dark:text-white shadow-sm border border-gray-200 dark:border-gray-600' : 'text-text-tertiary hover:text-text-secondary border border-transparent'}`}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => { setChartRange('weekly'); setPageOffset(0); }}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartRange === 'weekly' ? 'bg-white dark:bg-gray-700 text-text-primary dark:text-white shadow-sm border border-gray-200 dark:border-gray-600' : 'text-text-tertiary hover:text-text-secondary border border-transparent'}`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[300px] w-full mt-2">
              <ReactECharts option={growthChartOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </Card>
        </div>

        {/* System Health */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-sm border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-emerald-500/10 rounded-xl">
                 <ShieldCheck className="h-6 w-6 text-emerald-500" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-text-primary dark:text-white">System Health</h2>
                 <p className="text-sm text-text-tertiary">Real-time status & telemetry</p>
               </div>
            </div>

            <div className="space-y-7 flex-1">
               {/* Uptime */}
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary dark:text-white">
                        Server Uptime
                      </p>
                      <p className="text-xs text-text-tertiary tabular-nums">
                        {formatUptimeDetail(localUptime)}
                      </p>
                    </div>
                  </div>
                 <span className="text-emerald-500 text-xs font-bold leading-none bg-emerald-500/10 px-2 py-1 rounded">ON</span>
               </div>

               {/* Database Status */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500"><Database className="h-5 w-5"/></div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary dark:text-white">Database Status</p>
                      <p className="text-xs text-text-tertiary">Latency: {health?.serverLatency || '<10ms'}</p>
                    </div>
                 </div>
                 <span className="text-emerald-500 text-xs font-bold leading-none bg-emerald-500/10 px-2 py-1 rounded">CONNECTED</span>
               </div>

               {/* RAM Metrics */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Server className="h-5 w-5"/></div>
                     <div>
                       <p className="text-sm font-semibold text-text-primary dark:text-white">Platform RAM</p>
                       <p className="text-xs text-text-tertiary">Used / Total Sys</p>
                     </div>
                  </div>
                  <span className="text-sm font-bold text-[#1f2937] dark:text-white">{health?.ramUsage || 'Unknown'}</span>
               </div>

               {/* Storage Metrics (Consistent Row Style) */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><HardDrive className="h-5 w-5"/></div>
                     <div>
                       <p className="text-sm font-semibold text-text-primary dark:text-white">Disk Space</p>
                       <p className="text-xs text-text-tertiary">Used / {health?.storageUsage?.limitGb || '10'} GB Limit</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[#1f2937] dark:text-white">
                      {health?.storageUsage?.usedMb || '0.00'} MB
                    </span>
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                      {health?.storageUsage?.freeGb || '0.00'} GB FREE
                    </span>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Enhanced Audit & Security Log Table */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="p-6 bg-white dark:bg-gray-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border-light dark:border-border-dark flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1f2937] dark:text-white tracking-tight">Audit & Security Log</h2>
              <p className="text-sm text-text-tertiary mt-0.5">Real-time platform administrative activity</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings/security')} className="gap-2 text-text-secondary border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-4 font-bold shadow-sm">
              <Shield className="h-4 w-4 text-rose-500" /> Security Center
            </Button>
          </div>
          
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-8 py-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">User / System</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-xs font-bold text-text-tertiary uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {activityFeed?.length > 0 ? (
                  activityFeed.slice(0, 5).map((log) => (
                    <tr key={log.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                           <span className="text-sm font-semibold text-text-primary dark:text-gray-200">
                             {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                           </span>
                           <span className="text-[11px] text-text-tertiary font-medium">
                             {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            src={log.user_avatar || log.admin_avatar} 
                            size="sm" 
                            className="h-8 w-8 ring-2 ring-white dark:ring-gray-800 shadow-sm"
                            fallback={<Server className="h-4 w-4 text-text-tertiary" />}
                          />
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-text-primary dark:text-gray-200">
                              {log.user_name || log.admin_name || 'System'}
                            </p>
                            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-tighter">IP: {log.ip_address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-xs xl:max-w-md">
                        <div className="flex flex-col gap-0.5">
                           <p className="text-sm font-semibold text-text-primary dark:text-gray-200 truncate" title={log.action}>
                            {log.action}
                          </p>
                          <span className="text-xs text-text-tertiary truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             {log.description || 'No detailed description'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                         <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                           log.status === 'Success' 
                             ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                             : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                         }`}>
                           {log.status === 'Success' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                           {log.status}
                         </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                         <button 
                           onClick={() => setSelectedLog(log)}
                           className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-bold text-xs transition-colors p-2 hover:bg-primary/5 rounded-xl group"
                         >
                           <Eye className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                           Quick View
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-text-tertiary italic text-sm">
                      No recent audit events were found in the secure registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-center">
             <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings/security')} className="text-xs font-bold text-text-tertiary hover:text-primary transition-colors gap-2 group">
                Review Complete Audit History <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
             </Button>
          </div>
        </Card>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal log={selectedLog} onClose={() => setSelectedLog(null)} />

    </div>
  );
}