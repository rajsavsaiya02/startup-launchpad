import React from 'react';
import { Laptop, Smartphone, Tablet, Monitor, HelpCircle, HardDrive } from 'lucide-react';
import { cn } from '../../utils/cn';

export function DeviceIcon({ deviceType, os, className }) {
  const getIcon = () => {
    const type = deviceType?.toLowerCase();
    const osName = os?.toLowerCase();

    if (type === 'mobile') return Smartphone;
    if (type === 'tablet') return Tablet;
    if (type === 'desktop') {
        if (osName?.includes('mac')) return Laptop; // Mac usually laptop/desktop, Laptop icon looks good
        if (osName?.includes('windows')) return Monitor;
        return Laptop;
    }
    return HardDrive;
  };

  const Icon = getIcon();

  return (
    <div className={cn("flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800", className)}>
      <Icon className="h-6 w-6 text-text-secondary dark:text-gray-300" />
    </div>
  );
}
