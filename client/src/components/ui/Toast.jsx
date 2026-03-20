
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  useEffect(() => {
    console.log("[DEBUG] ToastProvider: MOUNTED");
    return () => console.log("[DEBUG] ToastProvider: UNMOUNTED");
  }, []);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />
  };

  return (
    <div className={cn(
      "pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-lg shadow-lg border border-border-light bg-white dark:bg-surface-dark animate-in slide-in-from-right-full duration-300",
      toast.type === 'error' && "border-l-4 border-l-error"
    )}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-text-primary flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-text-tertiary hover:text-text-primary">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
