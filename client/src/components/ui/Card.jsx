import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div 
      className={cn(
        "rounded-xl border border-border-light bg-white shadow-sm overflow-hidden",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("p-6 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-semibold text-text-primary", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}