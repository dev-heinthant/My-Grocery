import { Check, Pencil, Trash2 } from 'lucide-react';
import { getCategoryAccentColor } from '../constants/categories';
import { getLocalizedItemName } from '../constants/groceryCatalog';
import { getTranslatedCategory, TRANSLATIONS } from '../constants/translations';
import { GroceryItem, Language, ThemeMode } from '../types/grocery';
import { formatRelativeTime } from '../utils/time';

interface GroceryItemRowProps {
  item: GroceryItem;
  language: Language;
  themeMode: ThemeMode;
  onToggleCheckbox: (item: GroceryItem) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (item: GroceryItem) => void;
}

export function GroceryItemRow({
  item,
  language,
  themeMode,
  onToggleCheckbox,
  onEdit,
  onDelete,
}: GroceryItemRowProps) {
  const t = TRANSLATIONS[language];
  const displayName = getLocalizedItemName(item, language);
  const categoryLabel = getTranslatedCategory(item.category, language);
  const categoryColor = getCategoryAccentColor(item.category, themeMode);
  const timeText = item.updatedAt
    ? `${t.edited} · ${formatRelativeTime(item.updatedAt, language)}`
    : `${t.added} · ${formatRelativeTime(item.createdAt, language)}`;

  return (
    <div className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/40">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.isPurchased}
        aria-label={
          item.isPurchased
            ? `Unmark ${displayName}`
            : `Mark ${displayName} as bought`
        }
        onClick={() => onToggleCheckbox(item)}
        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          item.isPurchased
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 hover:border-emerald-500 dark:hover:border-emerald-400'
        }`}
      >
        {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p
            className={`text-sm font-semibold leading-snug break-words ${
              item.isPurchased
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-50'
            }`}
          >
            {displayName}
          </p>
        </div>

        {item.note && (
          <p
            className={`mt-0.5 text-xs leading-relaxed break-words ${
              item.isPurchased
                ? 'text-slate-400 dark:text-slate-500'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {item.note}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span
            className="font-semibold"
            style={{ color: categoryColor }}
          >
            {categoryLabel}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            /
          </span>
          <span className="tabular-nums">{timeText}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label={`${t.edit} ${displayName}`}
          title={t.edit}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label={`${t.delete} ${displayName}`}
          title={t.delete}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
