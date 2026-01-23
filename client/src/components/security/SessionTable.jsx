import React, { useState } from 'react';
import { Monitor, Smartphone, Globe, Clock, Shield, AlertTriangle, ChevronLeft, ChevronRight, Laptop } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

export function SessionTable({ sessions, currentSessionId, onRevoke }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage);

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Smartphone className="h-4 w-4" />; // Reuse smartphone for now or add tablet icon
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden bg-white dark:bg-surface-dark shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-border-light dark:border-border-dark text-xs uppercase tracking-wider text-text-tertiary">
              <th className="px-6 py-4 font-bold">Device & Browser</th>
              <th className="px-6 py-4 font-bold">Location & IP</th>
              <th className="px-6 py-4 font-bold">Active Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {currentSessions.length > 0 ? (
              currentSessions.map((session) => {
                const isCurrent = session.isCurrent || session.id === currentSessionId; // Handle both prop or ID match
                return (
                  <tr 
                    key={session.id} 
                    className={cn(
                        "group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                        isCurrent && "bg-primary/5 hover:bg-primary/5"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary",
                            isCurrent && "bg-white dark:bg-surface-dark text-primary shadow-sm"
                        )}>
                          {getDeviceIcon(session.device_type)}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary dark:text-white flex items-center gap-2">
                            {session.os} <span className="text-text-tertiary font-normal">• {session.browser}</span>
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {session.device_model || 'Desktop Device'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-text-secondary font-medium">
                          <Globe className="h-3.5 w-3.5 text-text-tertiary" />
                          {session.location_city || 'Unknown City'}, {session.location_country || 'Unknown Country'}
                        </p>
                        <p className="text-xs text-text-tertiary font-mono pl-5">
                          {session.ip_address}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isCurrent ? (
                        <div className="flex items-center gap-2">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                           </span>
                           <span className="text-xs font-bold text-success uppercase tracking-wide">Active Now</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock className="h-3.5 w-3.5 text-text-tertiary" />
                          <span className="text-xs">
                             Last active: {new Date(session.last_active).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {isCurrent ? (
                          <span className="text-xs font-medium text-text-tertiary italic px-3">Current Session</span>
                       ) : (
                          <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => onRevoke(session.id)}
                             className="text-error hover:bg-error hover:text-white border-error/20 hover:border-error opacity-0 group-hover:opacity-100 transition-all"
                          >
                             Revoke
                          </Button>
                       )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <Shield className="h-10 w-10 text-text-tertiary mb-3" />
                    <p className="text-sm font-medium text-text-secondary">No active sessions found.</p>
                    <p className="text-xs text-text-tertiary mt-1">This is unexpected if you are currently logged in.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-border-light dark:border-border-dark flex items-center justify-between">
          <p className="text-xs text-text-tertiary">
            Showing <span className="font-medium text-text-primary dark:text-white">{startIndex + 1}</span> to <span className="font-medium text-text-primary dark:text-white">{Math.min(startIndex + itemsPerPage, sessions.length)}</span> of <span className="font-medium text-text-primary dark:text-white">{sessions.length}</span> sessions
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
