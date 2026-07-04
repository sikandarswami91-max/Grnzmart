import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${
            t.type === 'success'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : t.type === 'error'
              ? 'bg-rose-50/90 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-blue-50/90 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}
        >
          <div className="mt-0.5">
            {t.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
            {t.type === 'error' && <AlertTriangle className="h-5 w-5 text-rose-500" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          </div>
          <div className="flex-1 text-sm font-medium">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
