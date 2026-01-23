
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

export function DateTime({ date, formatStr = 'MMM d, yyyy', relative = false, className }) {
  if (!date) return <span className="text-text-tertiary">-</span>;

  const dateObj = new Date(date);
  
  if (relative) {
    return (
      <span className={className} title={format(dateObj, 'PPpp')}>
        {formatDistanceToNow(dateObj, { addSuffix: true })}
      </span>
    );
  }

  return (
    <span className={className}>
      {format(dateObj, formatStr)}
    </span>
  );
}
