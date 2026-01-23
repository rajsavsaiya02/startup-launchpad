
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export function Dropdown({ 
  trigger, 
  children, 
  align = 'right', 
  width = 'w-48',
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark py-1 animate-in fade-in zoom-in-95 duration-200",
          align === 'right' ? "right-0" : "left-0",
          width,
          className
        )}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, className, icon: Icon, variant = 'default' }) {
  const variants = {
    default: "text-text-secondary hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-primary",
    danger: "text-error hover:bg-error/5"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="h-px bg-border-light dark:bg-border-dark my-1" />;
}
