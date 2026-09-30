import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, ShieldX, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 4000;
    const newToast: ToastItem = { ...toast, id };

    setToasts(prev => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string) => showToast({ type: 'success', title, message }),
    warning: (title: string, message?: string) => showToast({ type: 'warning', title, message }),
    error: (title: string, message?: string) => showToast({ type: 'error', title, message }),
    info: (title: string, message?: string) => showToast({ type: 'info', title, message })
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, toast }}>
      {children}
      {/* Toast Notification Container (Mobile & Desktop Accessible) */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map(t => {
          let borderClass = 'border-zinc-750 bg-zinc-900';
          let icon = <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
          let titleColor = 'text-zinc-100';

          if (t.type === 'success') {
            borderClass = 'border-emerald-500/40 bg-zinc-950/95 shadow-lg shadow-emerald-950/30';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
            titleColor = 'text-emerald-300';
          } else if (t.type === 'warning') {
            borderClass = 'border-amber-500/40 bg-zinc-950/95 shadow-lg shadow-amber-950/30';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
            titleColor = 'text-amber-300';
          } else if (t.type === 'error') {
            borderClass = 'border-rose-500/40 bg-zinc-950/95 shadow-lg shadow-rose-950/30';
            icon = <ShieldX className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
            titleColor = 'text-rose-300';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 flex items-start justify-between gap-3 ${borderClass}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {icon}
                <div className="min-w-0">
                  <div className={`text-xs font-semibold ${titleColor}`}>{t.title}</div>
                  {t.message && (
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      {t.message}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 shrink-0 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
