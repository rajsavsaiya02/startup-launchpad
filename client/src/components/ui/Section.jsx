
import React from 'react';
import { cn } from '../../utils/cn';

export function Section({ children, className, id }) {
  return (
    <section id={id} className={cn("bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({ title, description, action, className }) {
  return (
    <div className={cn("px-6 py-5 border-b border-border-light dark:border-border-dark flex items-center justify-between gap-4", className)}>
      <div>
        <h3 className="text-base font-semibold text-text-primary dark:text-white leading-tight">{title}</h3>
        {description && <p className="text-sm text-text-tertiary mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function SectionBody({ children, className, noPadding = false }) {
  return (
    <div className={cn(noPadding ? "" : "p-6", className)}>
      {children}
    </div>
  );
}

export function SectionFooter({ children, className }) {
  return (
    <div className={cn("px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-border-light dark:border-border-dark flex items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}
