import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { getCategoryAccentColor } from '../constants/categories';
import { getLocalizedItemName } from '../constants/groceryCatalog';
import { getTranslatedCategory, TRANSLATIONS } from '../constants/translations';
import { GroceryItem, Language, ThemeMode } from '../types/grocery';
import {
  formatClockTime,
  getLastSevenDaysOptions,
  getLocalDateKey,
} from '../utils/time';

interface HistoryViewProps {
  items: GroceryItem[];
  language: Language;
  themeMode: ThemeMode;
}

export function HistoryView({ items, language, themeMode }: HistoryViewProps) {
  const t = TRANSLATIONS[language];
  const dayOptions = useMemo(() => getLastSevenDaysOptions(language), [language]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    () => dayOptions[0]?.dateKey ?? getLocalDateKey(Date.now())
  );

  const purchasedByDate = useMemo(() => {
    const map = new Map<string, GroceryItem[]>();
    for (const day of dayOptions) {
      map.set(day.dateKey, []);
    }
    for (const item of items) {
      if (!item.isPurchased) continue;
      const boughtTs = item.updatedAt ?? item.createdAt;
      const key = getLocalDateKey(boughtTs);
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(item);
      }
    }
    for (const bucket of map.values()) {
      bucket.sort(
        (a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
      );
    }
    return map;
  }, [items, dayOptions]);

  const activeItems = purchasedByDate.get(selectedDateKey) ?? [];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
              {t.historyTitle}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {t.historySubtitle}
            </p>
          </div>
          <span className="text-xs font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            {t.historyItemsCount.replace('{count}', String(activeItems.length))}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {dayOptions.map((day) => {
            const count = purchasedByDate.get(day.dateKey)?.length ?? 0;
            const isSelected = day.dateKey === selectedDateKey;
            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  isSelected
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div
                  className={`text-xs font-bold truncate ${
                    isSelected
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {day.label}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {day.subLabel}
                </div>
                <div className="mt-2 text-xs font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {activeItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
              {t.historyEmptyTitle}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {t.historyEmptySubtitle}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeItems.map((item) => {
              const displayName = getLocalizedItemName(item, language);
              const boughtTs = item.updatedAt ?? item.createdAt;
              const categoryColor = getCategoryAccentColor(item.category, themeMode);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-4"
                >
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 break-words">
                      {displayName}
                    </p>
                    {item.note && (
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 break-words">
                        {item.note}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span className="font-semibold" style={{ color: categoryColor }}>
                        {getTranslatedCategory(item.category, language)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        /
                      </span>
                      <span className="tabular-nums">
                        {t.historyBoughtAt.replace(
                          '{time}',
                          formatClockTime(boughtTs, language)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
