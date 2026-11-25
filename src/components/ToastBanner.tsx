import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/grocery';

interface ToastBannerProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function ToastBanner({ toast, onDismiss }: ToastBannerProps) {
  if (!toast) return null;

  const icon =
    toast.type === 'success' ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
    ) : toast.type === 'error' ? (
      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
    ) : (
      <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
    );

  const toneClasses =
    toast.type === 'error'
      ? 'border-rose-200 dark:border-rose-900/70 bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100'
      : toast.type === 'success'
      ? 'border-emerald-200 dark:border-emerald-900/70 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex justify-center sm:justify-end pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-md w-full sm:w-auto ${toneClasses}`}
      >
        {icon}
        <p className="text-sm font-medium flex-1 leading-snug">{toast.text}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
