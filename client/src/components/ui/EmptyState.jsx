
import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils/cn';
import { Search } from 'lucide-react';

export function EmptyState({ 
  icon: Icon = Search, 
  title = "No items found", 
  description = "No results match your criteria. Try adjusting your filters.", 
  action, 
  className 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-text-tertiary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-tertiary max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
