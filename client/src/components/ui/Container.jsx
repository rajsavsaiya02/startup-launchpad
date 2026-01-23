
import React from 'react';
import { cn } from '../../utils/cn';

export function Container({ children, className, maxWidth = 'max-w-7xl' }) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidth, className)}>
      {children}
    </div>
  );
}
