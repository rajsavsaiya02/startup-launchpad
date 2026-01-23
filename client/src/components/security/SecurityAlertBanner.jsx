import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SecurityAlertBanner({ onClose, className }) {
  return (
    <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 text-warning-dark dark:text-warning",
        className
    )}>
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
         <h4 className="font-bold text-sm">New Login Detected</h4>
         <p className="text-xs mt-1 opacity-90">
            We noticed a new login from <strong>Chrome on Windows (Mumbai, India)</strong>. If this wasn't you, please change your password immediately.
         </p>
      </div>
      <button onClick={onClose} className="text-warning-dark/70 hover:text-warning-dark transition-colors">
         <X className="h-4 w-4" />
      </button>
    </div>
  );
}
