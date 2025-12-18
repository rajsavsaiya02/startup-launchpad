import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-sm border-transparent",
  secondary: "bg-white text-text-primary border-gray-200 hover:bg-gray-50 shadow-sm border",
  ghost: "bg-transparent text-text-secondary hover:bg-gray-100 border-transparent",
  destructive: "bg-error/10 text-error hover:bg-error/20 border-transparent",
  outline: "bg-transparent border-border-light text-text-primary hover:bg-gray-50 border"
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10 p-2 flex items-center justify-center"
};

export const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading = false, 
  disabled, 
  children, 
  type = "button",
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        // Base Styles
        "inline-flex items-center justify-center rounded-DEFAULT font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";