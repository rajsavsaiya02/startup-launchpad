import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info'
  isLoading = false,
}) {
  if (typeof window === "undefined") return null;

  const iconConfig = {
    danger: {
      bg: "bg-red-100 dark:bg-red-500/10",
      text: "text-red-600 dark:text-red-400",
      btn: "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-red-900/20",
      icon: AlertTriangle,
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-amber-900/20",
      icon: AlertTriangle,
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/20",
      icon: AlertTriangle, // Replace with Info if needed
    },
  };

  const config = iconConfig[type];
  const Icon = config.icon;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/5 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 pt-10 text-center">
              {/* Icon Section */}
              <div
                className={cn(
                  "inline-flex p-4 rounded-3xl mb-6 shadow-sm",
                  config.bg,
                )}
              >
                <Icon className={cn("w-8 h-8", config.text)} />
              </div>

              {/* Text Section */}
              <h3 className="text-xl font-black text-gray-950 dark:text-white mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                {message}
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-14 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none",
                    config.btn,
                  )}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    confirmText
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
