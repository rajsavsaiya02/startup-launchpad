import React from 'react';
import { Construction } from 'lucide-react';
import { cn } from '../../utils/cn';

export function AdminPlaceholderPage({ title, module, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Construction className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        {title || 'Under Construction'}
      </h2>
      
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-text-tertiary mb-4 uppercase tracking-wider">
        {module || 'Admin Module'}
      </div>

      <p className="max-w-md text-text-secondary mb-8">
        {description || "This feature is currently being developed. Check back soon for the complete implementation."}
      </p>

      <button className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm shadow-primary/25">
        Return to Dashboard
      </button>
    </div>
  );
}
