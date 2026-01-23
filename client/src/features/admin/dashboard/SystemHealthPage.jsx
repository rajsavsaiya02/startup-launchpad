import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';
import { 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Shield,
  Pencil,
  Save,
  X 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function SystemHealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Quota Edit State
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [quotaInput, setQuotaInput] = useState('');
  const [savingQuota, setSavingQuota] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/health');
      setHealthData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'connected':
      case 'ok':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'critical':
      case 'error':
      case 'disconnected':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'connected':
      case 'ok':
        return <CheckCircle className="h-5 w-5" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5" />;
      case 'critical':
      case 'error':
      case 'disconnected':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleSaveQuota = async () => {
    if (!quotaInput || isNaN(quotaInput) ||  parseFloat(quotaInput) <= 0) return;
    
    setSavingQuota(true);
    try {
        await apiClient.post('/health/quota', { quotaGB: parseFloat(quotaInput) });
        setIsEditingQuota(false);
        fetchHealth(); // Refresh data immediately
    } catch (err) {
        console.error('Failed to update quota:', err);
        // Optional: show toast error
    } finally {
        setSavingQuota(false);
    }
  };

  const startEditingQuota = () => {
     // Convert current quota bytes to GB for input
     const currentGB = healthData?.infrastructure?.disk?.quota 
        ? (healthData.infrastructure.disk.quota / (1024 * 1024 * 1024)).toFixed(0) 
        : '5';
     setQuotaInput(currentGB);
     setIsEditingQuota(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            System Health
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            Real-time infrastructure monitoring and status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-tertiary">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button 
            onClick={fetchHealth} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <p>Failed to connect to health service. The backend might be unreachable.</p>
        </div>
      )}

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Status */}
        <Card className={`p-6 border-l-4 ${healthData?.status === 'success' ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary font-medium">Overall Status</span>
            <Shield className="h-5 w-5 text-text-tertiary" />
          </div>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${getStatusColor(healthData?.status)}`}>
               {getStatusIcon(healthData?.status)}
             </div>
             <div>
               <p className="text-2xl font-bold text-text-primary dark:text-white capitalize">
                 {healthData?.status || 'Unknown'}
               </p>
               <p className="text-xs text-text-tertiary">All systems operational</p>
             </div>
          </div>
        </Card>

        {/* Database Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary font-medium">Database</span>
            <Database className="h-5 w-5 text-text-tertiary" />
          </div>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${getStatusColor(healthData?.infrastructure?.database?.status)}`}>
               {getStatusIcon(healthData?.infrastructure?.database?.status)}
             </div>
             <div>
               <p className="text-lg font-semibold text-text-primary dark:text-white">
                 {healthData?.infrastructure?.database?.latency ? `${healthData.infrastructure.database.latency}ms` : '--'}
               </p>
               <p className="text-xs text-text-tertiary uppercase tracking-wider">Latency</p>
             </div>
          </div>
        </Card>

        {/* Server Uptime */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary font-medium">Uptime</span>
            <Clock className="h-5 w-5 text-text-tertiary" />
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
               <Activity className="h-5 w-5" />
             </div>
             <div>
               <p className="text-lg font-semibold text-text-primary dark:text-white">
                 {formatUptime(healthData?.system?.uptime)}
               </p>
               <p className="text-xs text-text-tertiary">Since last restart</p>
             </div>
          </div>
        </Card>

        {/* Disk Usage */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary font-medium">Disk Space</span>
             <div className="flex items-center gap-2">
                 {isEditingQuota ? (
                     <>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={handleSaveQuota}
                            disabled={savingQuota}
                            aria-label="Save Quota"
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setIsEditingQuota(false)}
                            aria-label="Cancel Edit"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                     </>
                 ) : (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-text-tertiary hover:text-primary"
                        onClick={startEditingQuota}
                        aria-label="Edit Quota"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                 )}
                <HardDrive className="h-5 w-5 text-text-tertiary" />
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${getStatusColor(healthData?.infrastructure?.disk?.status || 'ok')}`}>
               <HardDrive className="h-5 w-5" />
             </div>
             <div className="flex-1">
               {isEditingQuota ? (
                   <div className="flex items-center gap-2">
                       <input 
                           type="number" 
                           value={quotaInput}
                           onChange={(e) => setQuotaInput(e.target.value)}
                           className="w-20 p-1 text-lg font-semibold border rounded bg-white dark:bg-gray-800 text-text-primary dark:text-white"
                           autoFocus
                       />
                       <span className="text-sm text-text-secondary font-medium">GB Limit</span>
                   </div>
               ) : (
                   <>
                        <div className="flex justify-between items-end">
                            <p className="text-lg font-semibold text-text-primary dark:text-white">
                                {formatBytes(healthData?.infrastructure?.disk?.used)} <span className="text-xs font-normal text-text-secondary">Used</span>
                            </p>
                            <p className="text-sm font-medium text-text-secondary">
                                {formatBytes(healthData?.infrastructure?.disk?.free)} Free
                            </p>
                        </div>
                        <p className="text-xs text-text-tertiary mt-1">
                            {formatBytes(healthData?.infrastructure?.disk?.quota)} Limit
                        </p>
                   </>
               )}
             </div>
          </div>
          {/* Visual Quota Indicator */}
          <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
             <div 
                className={`h-full transition-all duration-500 ${
                    healthData?.infrastructure?.disk?.status === 'critical' ? 'bg-red-500' : 
                    healthData?.infrastructure?.disk?.status === 'degraded' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${healthData?.infrastructure?.disk?.usagePercent || 0}%` }}
             />
          </div>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Memory & CPU */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            System Resources
          </h3>
          
          <div className="space-y-6">
            {/* Memory Usage Breakdown */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Memory Distribution</span>
                <span className="font-medium text-text-primary dark:text-white">
                  {formatBytes(healthData?.system?.memory?.total)} Total
                </span>
              </div>
              
              {/* Multi-segment Memory Bar */}
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                {/* App Memory (Process) */}
                <div 
                  className="h-full bg-blue-500"
                  style={{ 
                    width: `${(healthData?.system?.memory?.used / healthData?.system?.memory?.total) * 100}%` 
                  }}
                  title={`App: ${formatBytes(healthData?.system?.memory?.used)}`}
                />
                 {/* System/Other Memory */}
                <div 
                  className="h-full bg-gray-400 dark:bg-gray-600"
                  style={{ 
                    width: `${((healthData?.system?.memory?.total - healthData?.system?.memory?.free - healthData?.system?.memory?.used) / healthData?.system?.memory?.total) * 100}%` 
                  }}
                   title={`System: ${formatBytes(healthData?.system?.memory?.total - healthData?.system?.memory?.free - healthData?.system?.memory?.used)}`}
                />
                 {/* Free Memory (Implicitly the rest, but let's be explicit for visual if needed, or just let background show? 
                     Using flex, we can just render the used parts and let the background be 'free' or render a 'free' specific bar.
                     Let's render 'Free' as a light color for clarity if requested "multi bar" implies distinct sections.) 
                 */}
                  <div 
                  className="h-full bg-green-500/20"
                  style={{ 
                    width: `${(healthData?.system?.memory?.free / healthData?.system?.memory?.total) * 100}%` 
                  }}
                   title={`Free: ${formatBytes(healthData?.system?.memory?.free)}`}
                />
              </div>

               {/* Legend */}
               <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>App: {formatBytes(healthData?.system?.memory?.used)}</span>
                  </div>
                   <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                      <span>System: {formatBytes(healthData?.system?.memory?.total - healthData?.system?.memory?.free - healthData?.system?.memory?.used)}</span>
                  </div>
                   <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                      <span>Free: {formatBytes(healthData?.system?.memory?.free)}</span>
                  </div>
               </div>
            </div>

            {/* Storage Directory Size Breakdown */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Storage Breakdown</span>
                <span className="font-medium text-text-primary dark:text-white">
                  Total: {formatBytes(healthData?.infrastructure?.disk?.used)}
                </span>
              </div>
               {/* Multi-segment Storage Bar */}
               <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                  {healthData?.infrastructure?.disk?.breakdown?.map((item, index) => {
                      const percentage = (item.size / healthData?.infrastructure?.disk?.used) * 100;
                      // Generate consistent colors roughly
                      const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
                      const color = colors[index % colors.length];
                      
                      if (percentage < 1) return null; // Skip tiny segments visually

                      return (
                        <div 
                          key={item.name}
                          className={`h-full ${color}`}
                          style={{ width: `${percentage}%` }}
                          title={`${item.name}: ${formatBytes(item.size)}`}
                        />
                      );
                  })}
               </div>
               {/* Storage Legend (Top 3 or so) */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary">
                  {healthData?.infrastructure?.disk?.breakdown?.slice(0, 4).map((item, index) => {
                       const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
                       const color = colors[index % colors.length];
                       return (
                          <div key={item.name} className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${color}`}></div>
                              <span>{item.name}: {formatBytes(item.size)}</span>
                          </div>
                       );
                  })}
               </div>
            </div>

            {/* Load Average */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">CPU Load Average (1m, 5m, 15m)</span>
              </div>
              <div className="flex gap-2">
                {(healthData?.system?.loadavg || [0, 0, 0]).map((load, i) => (
                  <div key={i} className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-center border border-border-light dark:border-border-dark">
                    <span className="text-lg font-bold text-text-primary dark:text-white block">{load.toFixed(2)}</span>
                    <span className="text-xs text-text-tertiary">{[1, 5, 15][i]}m</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CPU Count */}
            <div>
                <div className="flex justify-between text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-border-light dark:border-border-dark">
                    <span className="text-text-secondary">CPU Cores Available</span>
                    <span className="font-bold text-text-primary dark:text-white">{healthData?.system?.cpus || 0}</span>
                </div>
            </div>

          </div>
        </Card>

        {/* Environment Info */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Environment Details
          </h3>
          
          <div className="space-y-0 divide-y divide-border-light dark:divide-border-dark">
            <div className="flex justify-between py-4">
              <span className="text-text-secondary">OS Platform</span>
              <span className="font-medium text-text-primary dark:text-white capitalize">
                {healthData?.system?.platform || '--'} <span className="text-text-tertiary text-xs">({healthData?.system?.release || ''})</span>
              </span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-text-secondary">Node Version</span>
              <span className="font-medium text-text-primary dark:text-white">{healthData?.system?.nodeVersion || '--'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-text-secondary">Backend Version</span>
              <span className="font-medium text-text-primary dark:text-white">{healthData?.system?.backendVersion || '--'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-text-secondary">Disk Path</span>
              <span className="font-medium text-text-primary dark:text-white font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
                {healthData?.infrastructure?.disk?.path || '--'}
              </span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-text-secondary">Disk Status</span>
              <span className={`font-medium px-2 py-1 rounded text-xs capitalize ${getStatusColor(healthData?.infrastructure?.disk?.status)}`}>
                {healthData?.infrastructure?.disk?.status || '--'}
              </span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
