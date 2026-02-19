import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Use createPortal to render the drawer outside the current DOM hierarchy
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <Motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 right-0 z-101 w-full max-w-md bg-white dark:bg-[#1E293B] shadow-2xl flex flex-col pointer-events-auto",
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark bg-white dark:bg-[#1E293B]">
              <div>
                {title && (
                  <h2 className="text-xl font-bold text-text-primary dark:text-white">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-text-tertiary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30 dark:bg-transparent">
              {children}
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
