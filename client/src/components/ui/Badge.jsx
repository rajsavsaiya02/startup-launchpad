import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-700 border-red-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  primary: "bg-primary/10 text-primary border-primary/20"
};

export function Badge({ variant = "neutral", className, children }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}