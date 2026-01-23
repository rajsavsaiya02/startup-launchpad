import React from 'react';
import { DeviceIcon } from './DeviceIcon';
import { MapPin, Clock, Shield, LogOut, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

export function SessionCard({ session, isCurrent, onRevoke, loading }) {
  return (
    <div className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
        isCurrent 
            ? "bg-primary/5 border-primary/20 shadow-sm" 
            : "bg-white dark:bg-surface-dark border-border-light dark:border-border-dark hover:border-primary/20 hover:shadow-md"
    )}>
      {/* Icon */}
      <DeviceIcon 
        deviceType={session.device_type} 
        os={session.os} 
        className={cn("h-12 w-12 shrink-0", isCurrent ? "bg-primary/10 text-primary" : "")} 
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
           <h4 className="font-bold text-text-primary dark:text-white truncate">
             {session.os} <span className="text-text-tertiary font-normal">• {session.browser}</span>
           </h4>
           {isCurrent && (
             <Badge variant="success" className="h-5 px-1.5 text-[10px] uppercase tracking-wide gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                Active Now
             </Badge>
           )}
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
           <div className="flex items-center gap-1" title="Location">
              <MapPin className="h-3 w-3 text-text-tertiary" />
              <span>{session.location_city}, {session.location_country}</span>
           </div>
           <div className="flex items-center gap-1" title="Last Active">
              <Clock className="h-3 w-3 text-text-tertiary" />
              <span>
                 {isCurrent ? 'Just now' : new Date(session.last_active).toLocaleString()}
              </span>
           </div>
           <div className="flex items-center gap-1 font-mono text-[10px] text-text-tertiary opacity-70">
              IP: {session.ip_address}
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center">
         {!isCurrent && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRevoke(session.id)}
                disabled={loading}
                className="text-error hover:bg-error/10 hover:text-error h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                title="Revoke Session"
            >
                <LogOut className="h-4 w-4" />
            </Button>
         )}
      </div>
    </div>
  );
}
