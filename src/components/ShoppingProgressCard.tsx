import { TRANSLATIONS } from '../constants/translations';
import { Language } from '../types/grocery';

interface ShoppingProgressCardProps {
  total: number;
  toBuy: number;
  done: number;
  language: Language;
}

export function ShoppingProgressCard({
  total,
  toBuy,
  done,
  language,
}: ShoppingProgressCardProps) {
  const t = TRANSLATIONS[language];
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
          {t.shoppingProgress}
        </h2>
        <span className="text-sm font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
          {progress}%
        </span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 text-center">
        <div className="px-2">
          <div className="text-lg font-extrabold tabular-nums text-slate-900 dark:text-slate-50">
            {total}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.total}
          </div>
        </div>
        <div className="px-2">
          <div className="text-lg font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
            {toBuy}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.toBuy}
          </div>
        </div>
        <div className="px-2">
          <div className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            {done}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.done}
          </div>
        </div>
      </div>

      {total > 0 && toBuy === 0 && (
        <p className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-center text-emerald-600 dark:text-emerald-400">
          {t.allDone}
        </p>
      )}
    </section>
  );
}
