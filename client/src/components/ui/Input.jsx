import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className, 
  ...props 
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-DEFAULT border border-gray-300 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-10",
            error && "border-error focus:ring-error/20 focus:border-error",
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-error animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";