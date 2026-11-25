import { AlertTriangle, CheckCircle2, CopyPlus, LogOut, Trash2, X } from 'lucide-react';
import { getLocalizedItemName } from '../constants/groceryCatalog';
import { TRANSLATIONS } from '../constants/translations';
import { ConfirmAction, Language } from '../types/grocery';

interface ConfirmModalProps {
  action: ConfirmAction | null;
  language: Language;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  action,
  language,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!action) return null;

  const t = TRANSLATIONS[language];

  let title = '';
  let description = '';
  let confirmLabel = '';
  let tone: 'emerald' | 'danger' | 'amber' = 'emerald';
  let Icon = CheckCircle2;

  switch (action.type) {
    case 'mark-bought': {
      const displayName = getLocalizedItemName(action.item, language);
      title = t.markBoughtTitle;
      description = t.markBoughtDesc.replace('{name}', displayName);
      confirmLabel = t.markBoughtConfirm;
      tone = 'emerald';
      Icon = CheckCircle2;
      break;
    }
    case 'delete-item': {
      const displayName = getLocalizedItemName(action.item, language);
      title = t.deleteItemTitle.replace('{name}', displayName);
      description = t.deleteItemDesc;
      confirmLabel = t.deleteItemConfirm;
      tone = 'danger';
      Icon = Trash2;
      break;
    }
    case 'duplicate-item': {
      const displayName = getLocalizedItemName({ name: action.name }, language);
      title = t.duplicateTitle;
      description = t.duplicateDesc.replace('{name}', displayName);
      confirmLabel = t.duplicateConfirm;
      tone = 'amber';
      Icon = CopyPlus;
      break;
    }
    case 'clear-purchased': {
      title = t.clearPurchasedTitle;
      description = t.clearPurchasedDesc.replace('{count}', String(action.count));
      confirmLabel = t.clearPurchasedConfirm;
      tone = 'danger';
      Icon = Trash2;
      break;
    }
    case 'clear-all': {
      title = t.clearAllTitle;
      description = t.clearAllDesc.replace('{count}', String(action.count));
      confirmLabel = t.clearAllConfirm;
      tone = 'danger';
      Icon = AlertTriangle;
      break;
    }
    case 'sign-out': {
      title = t.signOutConfirmTitle;
      description = t.signOutConfirmDesc;
      confirmLabel = t.signOutConfirmButton;
      tone = 'danger';
      Icon = LogOut;
      break;
    }
  }

  const iconBoxClasses =
    tone === 'emerald'
      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
      : tone === 'amber'
      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900'
      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900';

  const confirmBtnClasses =
    tone === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500'
      : tone === 'amber'
      ? 'bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-500'
      : 'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBoxClasses}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="confirm-modal-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-50 leading-snug"
                >
                  {title}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label={t.cancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 ${confirmBtnClasses}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
