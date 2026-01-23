import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Download, Eye, Server, ChevronDown, Shield, AlertTriangle, Activity, User, X, CheckCircle, XCircle, Terminal, RefreshCw, Network, Globe, Database, Lock, Cpu } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { auditService } from './auditService';
import { useToast } from '../../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

// Terminal View Component for Logs
// Server Logs Table Component
const ServerLogsTable = ({ logs, type, onRefresh, onRowClick }) => {
  // Parse logs into structured data
  const parsedLogs = logs.map((log, index) => {
    // 1. Attempt to parse standard custom logger format: [LEVEL] TIMESTAMP: Message
    // Example: [INFO] 2026-01-20T16:26:31.419Z: Request received...
    const standardMatch = log.match(/^\[(INFO|ERROR|WARN|DEBUG)\]\s+([^:]+):\s+(.+)$/);
    if (standardMatch) {
      return {
        id: `log-${index}`,
        level: standardMatch[1],
        timestamp: standardMatch[2],
        message: standardMatch[3],
        raw: log
      };
    }
    
    // 2. Attempt to parse Morgan HTTP logs
    // Example: ::1 - - [20/Jan/2026:16:02:07 +0000] "GET /api... HTTP/1.1" 500 40 ...
    const httpMatch = log.match(/^(\S+) - - \[(.*?)\] "(.*?)" (\d+) (\d+)/);
    if (httpMatch) {
       const status = parseInt(httpMatch[4], 10);
       let level = 'INFO';
       if (status >= 500) level = 'ERROR';
       else if (status >= 400) level = 'WARN';
       
       return {
           id: `log-${index}`,
           level: level,
           timestamp: httpMatch[2], // Keep original format or parse? Original is fine for display
           message: `HTTP ${status}: ${httpMatch[3]}`,
           raw: log
       };
    }

    return {
      id: `log-${index}`,
      level: type === 'error' ? 'ERROR' : 'INFO',
      timestamp: new Date().toISOString(), // Fallback if no timestamp found
      message: log,
      raw: log
    };
  }).reverse(); // Show newest first usually, or keep server order if it's already sorted. Assuming append-only server files, standard is ASC. Let's keep input order or reverse? Terminal was usually bottom-up. Let's stick to input order but maybe scroll to bottom? 
  // Tables usually show content Top-Down. Let's render Top-Down (Newest at bottom) or standard logs?
  // Let's reverse to show Newest at Top for Table View to match Activity Logs.
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 dark:bg-gray-800/20 dark:border-gray-800 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-500" />
                    {type === 'error' ? 'Server Error Logs' : 'Application Server Logs'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Structured view of system output streams.</p>
            </div>
            <button onClick={onRefresh} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <RefreshCw className="h-3.5 w-3.5" /> 
                Refresh Logs
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                        {['Level', 'Timestamp', 'Message', 'Actions'].map((header) => (
                            <th key={header} className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {parsedLogs.length === 0 ? (
                         <tr><td colSpan="4" className="p-12 text-center text-gray-500 italic">No logs available...</td></tr>
                    ) : (
                        parsedLogs.map((log) => (
                            <tr 
                                key={log.id} 
                                onClick={() => onRowClick && onRowClick({
                                    id: log.id,
                                    event_type: type === 'error' ? 'Error Log' : 'System Log',
                                    description: log.message,
                                    created_at: log.timestamp,
                                    status: log.level === 'ERROR' ? 'Failure' : 'Success',
                                    details: { raw_content: log.raw }
                                })}
                                className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <Badge variant={log.level === 'ERROR' ? 'error' : log.level === 'WARN' ? 'warning' : log.level === 'DEBUG' ? 'default' : 'success'} className="font-mono">
                                        {log.level}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                                    {log.timestamp}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono">
                                    <div className="line-clamp-2 break-all">{log.message}</div>
                                </td>
                                <td className="px-6 py-4">
                                     <button className="text-gray-400 hover:text-blue-500 transition-colors">
                                        <Eye className="h-4 w-4" />
                                     </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

// Quick View Modal
const QuickViewModal = ({ log, onClose }) => {
  if (!log) return null;

  const isNetworkLog = log.event_type === 'Network Monitoring';
  const isSystemLog = ['System Log', 'Error Log'].includes(log.event_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
            {isNetworkLog ? <Network className="h-5 w-5 text-primary" /> : isSystemLog ? <Terminal className="h-5 w-5 text-primary" /> : <Shield className="h-5 w-5 text-primary" />}
            {isNetworkLog ? 'Port Detail' : isSystemLog ? 'Log Entry' : 'Audit Log Detail'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event ID</label>
              <p className="font-mono text-sm mt-1 text-gray-900 dark:text-gray-200">{log.id}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</label>
              <p className="font-mono text-sm mt-1 text-gray-900 dark:text-gray-200">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Type</label>
              <p className="font-medium text-sm mt-1 text-gray-900 dark:text-gray-200">{log.event_type}</p>
            </div>
             <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
              <div className="mt-1">
                <Badge variant={log.status === 'Success' || log.status === 'Secured' ? 'success' : log.status === 'Failure' || log.status === 'Risk' ? 'error' : 'default'} className="inline-flex px-2 py-0.5 text-xs">
                  {log.status}
                </Badge>
              </div>
            </div>
          </div>

          <div>
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
             <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 whitespace-pre-wrap break-all font-mono">
               {log.description || log.action}
             </p>
          </div>

          {!isNetworkLog && !isSystemLog && (
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User</label>
                  <div className="flex items-center gap-2 mt-1">
                    {log.user_name ? (
                       <>
                          <Avatar src={log.user_avatar} size="sm" className="h-6 w-6" />
                          <span className="text-sm font-medium dark:text-gray-200">{log.user_name} (User)</span>
                       </>
                    ) : log.admin_name ? (
                       <>
                          <Avatar src={log.admin_avatar} size="sm" className="h-6 w-6" />
                          <span className="text-sm font-medium dark:text-gray-200">{log.admin_name} (Admin)</span>
                       </>
                    ) : (
                      <span className="text-sm text-gray-500 italic">System / Anonymous</span>
                    )}
                  </div>
               </div>
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</label>
                  <p className="font-mono text-sm mt-1 text-gray-900 dark:text-gray-200">{log.ip_address || 'N/A'}</p>
               </div>
            </div>
          )}

          {log.details && Object.keys(log.details).length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Technical Details</label>
              <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export function AuditLogsPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total_events: 0, security_events: 0, failed_events: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState('All Events'); 
  const [filters, setFilters] = useState({ search: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [systemLogs, setSystemLogs] = useState([]);
  const [activePorts, setActivePorts] = useState(null);
  const LIMIT = 10;

  useEffect(() => {
    fetchData();
  }, [page, activeTab, filters.date]); // Trigger on date change too

  // Fetch active ports on mount for the header
  useEffect(() => {
      const fetchPorts = async () => {
          try {
              const ports = await auditService.getActivePorts();
              setActivePorts(Array.isArray(ports) ? ports : []);
          } catch (err) {
              console.error("Failed to fetch active ports:", err);
              setActivePorts([]); // Fallback to 0 on error
          }
      };
      fetchPorts();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'RealLogs') {
          const data = await auditService.getSystemLogs('app', page, LIMIT, filters.search, filters.date);
          setSystemLogs(data.logs);
          setTotalPages(data.pages || 1);
      } else if (activeTab === 'ErrorLogs') {
          const data = await auditService.getSystemLogs('error', page, LIMIT, filters.search, filters.date);
          setSystemLogs(data.logs);
          setTotalPages(data.pages || 1);
       } else if (activeTab === 'Network') {
          try {
              const ports = await auditService.getActivePorts();
              setActivePorts(Array.isArray(ports) ? ports : []);
          } catch (e) {
              console.error(e);
              setActivePorts([]);
          }
          setTotalPages(1); 
      } else {
        const statsData = await auditService.getStats();
        setStats(statsData);

        const queryParams = { page, limit: LIMIT, search: filters.search };
        if (activeTab === 'User') queryParams.event_type = 'User';
        if (activeTab === 'System') queryParams.event_type = 'System';
        if (activeTab === 'Security') queryParams.event_type = 'Security';
        
        if (filters.date) {
            queryParams.start_date = `${filters.date} 00:00:00`;
            queryParams.end_date = `${filters.date} 23:59:59`;
        }

        const logsData = await auditService.getLogs(queryParams);
        setLogs(logsData.logs);
        setTotalPages(logsData.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleExportCSV = async () => {
    try {
        const queryParams = { limit: 1000, search: filters.search };
        if (filters.date) {
            queryParams.start_date = `${filters.date} 00:00:00`;
            queryParams.end_date = `${filters.date} 23:59:59`;
        }
        
        // Determine what to export based on active tab
        let dataToExport = [];
        let filename = 'audit-logs';

        if (activeTab === 'RealLogs' || activeTab === 'ErrorLogs') {
            const type = activeTab === 'ErrorLogs' ? 'error' : 'app';
            const res = await auditService.getSystemLogs(type, 1, 1000);
            dataToExport = res.logs.map(log => ({ Log: log }));
            filename = `${type}-logs`;
        } else if (activeTab === 'Network') {
            const ports = await auditService.getActivePorts();
            dataToExport = ports;
            filename = 'network-ports';
        } else {
             if (activeTab === 'User') queryParams.event_type = 'User';
             if (activeTab === 'System') queryParams.event_type = 'System';
             if (activeTab === 'Security') queryParams.event_type = 'Security';
             const res = await auditService.getLogs(queryParams);
             
             // Format for CSV readability
             dataToExport = res.logs.map(log => ({
                 Timestamp: new Date(log.created_at).toLocaleString(),
                 Type: log.event_type,
                 Action: log.action,
                 User: log.user_name || log.admin_name || 'System',
                 IP: log.ip_address,
                 Status: log.status,
                 Description: log.description
             }));
        }

        if (dataToExport.length === 0) {
            addToast("No data available to export for the current selection.", 'info');
            return;
        }

        // Convert to CSV
        const headers = Object.keys(dataToExport[0]).join(',');
        const csvContent = [
            headers,
            ...dataToExport.map(row => Object.values(row).map(value => `"${value}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        addToast("Log export completed successfully!", 'success');

    } catch (error) {
        console.error("Export failed:", error);
        addToast("Failed to export logs. Please try again.", 'error');
    }
  };

  const tabs = [
    { id: 'All Events', label: 'Activity Logs', icon: Activity },
    { id: 'Security', label: 'Security Events', icon: Shield },
    { id: 'RealLogs', label: 'Live Server Logs', icon: Terminal },
    { id: 'ErrorLogs', label: 'Error Logs', icon: AlertTriangle },
    { id: 'Network', label: 'Active Ports', icon: Network },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      {/* Header */}
      <div className="pt-6 relative">
      <div className="absolute top-0 right-0 p-4 opacity-50 pointer-events-none">
          <Shield className="w-64 h-64 text-blue-50/50 dark:text-blue-900/10 -rotate-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight mb-4">
          Audit & System Logs
        </h1>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-6 flex items-start gap-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
           <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
           <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-300 shrink-0 shadow-inner">
             <Shield className="h-8 w-8" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Security Monitoring Active
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
             </h3>
             <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed max-w-2xl">
               Real-time surveillance of system ports (Active: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{activePorts ? activePorts.length : '...'}</span>) and access logs. 
               All administrative actions are immutable and recorded for compliance.
             </p>
           </div>
        </div>
      </div>

      {/* Stats Cards - Only logic when in Activity Mode */}
      {/* Stats Cards - Only logic when in Activity Mode */}
      {/* Stats Overview - Polished */}
      {!['RealLogs', 'ErrorLogs', 'Network'].includes(activeTab) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">24h Activity</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                  {stats.total_events}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
               Total recorded events
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-3px_rgba(234,179,8,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(234,179,8,0.1)] transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Alerts</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                  {stats.security_events}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Potential security incidents</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(239,68,68,0.1)] transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed Actions</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                   {stats.failed_events}
                </h3>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 group-hover:rotate-12 transition-transform">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Unsuccessful operations</p>
          </motion.div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-border-light dark:border-gray-800">
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <div className="flex px-4 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setPage(1); }}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-0">
             {/* Action Bar (Visible for ALL tabs except Network) */}
            {activeTab !== 'Network' && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                        <Search className="h-4 w-4" />
                      </div>
                      <input 
                        type="search" 
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        placeholder={activeTab === 'RealLogs' || activeTab === 'ErrorLogs' ? "Search logs by content..." : "Search by action, description..."} 
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <input 
                        type="date" 
                        value={filters.date}
                        onChange={(e) => setFilters({...filters, date: e.target.value})}
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      />
                    </div>
                    <button 
                        type="button" 
                        onClick={handleExportCSV}
                        className="h-10 px-4 flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </form>
                </div>
            )}

            {/* Server Logs Table View */}
            {(activeTab === 'RealLogs' || activeTab === 'ErrorLogs') && (
                <div className="p-6">
                    <ServerLogsTable 
                        logs={systemLogs} 
                        type={activeTab === 'ErrorLogs' ? 'error' : 'info'} 
                        onRefresh={fetchData} 
                        onRowClick={setSelectedLog}
                    />
                     {/* Pagination for Server/Error Logs */}
                    {totalPages > 1 && (
                        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-center">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Network View */}
            {activeTab === 'Network' && (
                <div className="overflow-x-auto">
                    <div className="p-6 bg-gray-50/50 border-b border-gray-200 dark:bg-gray-800/20 dark:border-gray-800 flex justify-between items-center">
                        <div>
                           <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                             <Network className="h-5 w-5 text-blue-500" />
                             Platform Network Map
                           </h3>
                           <p className="text-sm text-gray-500 mt-1">Real-time scan of active listeners and bound ports.</p>
                        </div>
                        <button onClick={fetchData} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <RefreshCw className="h-3.5 w-3.5" /> 
                          Scan Now
                        </button>
                    </div>
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            {['Service', 'Process ID', 'Protocol', 'Binding', 'Port', 'Risk Assessment'].map((header) => (
                            <th key={header} className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                {header}
                            </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                            {loading ? (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-500 italic">Initiating port scan sequence...</td></tr>
                            ) : (!activePorts || activePorts.length === 0) ? (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-500">No exposed platform ports detected.</td></tr>
                            ) : (
                                activePorts.map((port, idx) => {
                                  const getServiceIcon = (p) => {
                                      if (p === '5432') return Database;
                                      if (p === '6379') return Database; // Redis
                                      if (['80', '443', '3000', '5173'].includes(p)) return Globe;
                                      if (p === '5000') return Server;
                                      if (p === '22') return Lock;
                                      return Cpu;
                                  };
                                  const ServiceIcon = getServiceIcon(port.port);
                                  
                                  return (
                                    <tr key={idx} 
                                      onClick={() => setSelectedLog({
                                          id: `port-${port.pid}`,
                                          event_type: 'Network Monitoring',
                                          action: `Port Scan Detected: ${port.service}`,
                                          description: `Active service detected on port ${port.port}. Process: ${port.command} (PID: ${port.pid})`,
                                          created_at: new Date().toISOString(),
                                          status: port.status,
                                          details: port
                                      })}
                                      className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-all duration-200"
                                    >
                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${port.status === 'Risk' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                               <ServiceIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                              <p className="font-semibold text-gray-900 dark:text-gray-100">{port.service}</p>
                                              <p className="text-xs text-gray-500 font-mono">{port.command}</p>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-500 text-sm">
                                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{port.pid}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                          <Badge variant="outline" className="font-mono text-xs">{port.protocol}</Badge>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">{port.address}</td>
                                        <td className="px-6 py-4">
                                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                            :{port.port}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                              {port.status === 'Risk' ? (
                                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-100 dark:border-red-800">
                                                  <AlertTriangle className="h-3.5 w-3.5" />
                                                  Potential Risk
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-800">
                                                  <Lock className="h-3.5 w-3.5" />
                                                  Secured
                                                </div>
                                              )}
                                            </div>
                                        </td>
                                    </tr>
                                  );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Activity Logs Table */}
            {!['RealLogs', 'ErrorLogs', 'Network'].includes(activeTab) && (
                <>

                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/50">
                      <tr>
                        {['Timestamp', 'User/System', 'Event Type', 'Description', 'IP Address', 'Status', 'Actions'].map((header) => (
                          <th key={header} className="px-6 py-3 text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {loading ? (
                        <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">Loading events...</td></tr>
                      ) : logs.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Server className="h-8 w-8 text-gray-300" />
                                    <p className="text-gray-500 font-medium">No activity logs found</p>
                                    <p className="text-gray-400 text-sm">Actions performed by admins and users will appear here.</p>
                                </div>
                            </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-gray-300">
                              {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {log.user_name || log.admin_name ? (
                                   <Avatar src={log.user_avatar || log.admin_avatar} size="xs" className="h-6 w-6" />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                    <Server className="h-3 w-3" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-text-primary dark:text-white">
                                  {log.user_name || log.admin_name || 'System'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                {log.event_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-text-secondary dark:text-gray-300 max-w-sm truncate" title={log.description}>
                              {log.action}
                              {log.description && <span className="text-gray-400 ml-1">- {log.description}</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary font-mono">
                              {log.ip_address || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex items-center gap-1.5">
                                  {log.status === 'Success' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                  <span className={`text-sm ${log.status === 'Success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {log.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button onClick={() => setSelectedLog(log)} className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-full hover:bg-primary/10 flex items-center gap-1 text-sm font-medium">
                                <Eye className="h-4 w-4" /> Quick View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                  <p className="text-sm text-text-tertiary">Page {page} of {totalPages || 1}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
                </>
            )}
        </div>
      </div>

      <QuickViewModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}