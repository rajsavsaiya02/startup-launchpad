import React from 'react';
import { cn } from '../../utils/cn';

export function Avatar({ src, alt, fallback, size = "md", className }) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };

  return (
    <div className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full bg-gray-100 border border-white shadow-sm",
      sizeClasses[size],
      className
    )}>
      {src ? (
        <img 
          className="aspect-square h-full w-full object-cover" 
          src={src} 
          alt={alt || "Avatar"} 
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-semibold">
          {fallback || "?"}
        </div>
      )}
    </div>
  );
}