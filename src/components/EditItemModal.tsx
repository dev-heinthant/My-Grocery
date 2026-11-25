import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { DEFAULT_GROCERY_CATEGORIES } from '../constants/categories';
import { getLocalizedItemName } from '../constants/groceryCatalog';
import { getTranslatedCategory, TRANSLATIONS } from '../constants/translations';
import { GroceryCategory, GroceryItem, Language } from '../types/grocery';

interface EditItemModalProps {
  item: GroceryItem | null;
  language: Language;
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (params: {
    itemId: string;
    name: string;
    category: GroceryCategory;
    note: string;
  }) => Promise<void>;
}

export function EditItemModal({
  item,
  language,
  isSubmitting = false,
  onClose,
  onSave,
}: EditItemModalProps) {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('Other');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [initialLocalizedName, setInitialLocalizedName] = useState('');

  useEffect(() => {
    if (!item) return;
    const localized = getLocalizedItemName(item, language);
    setInitialLocalizedName(localized);
    setName(localized);
    setCategory(item.category || 'Other');
    setNote(item.note || '');
    setError(null);
  }, [item, language]);

  if (!item) return null;

  const categoryOptions = DEFAULT_GROCERY_CATEGORIES.includes(
    category as (typeof DEFAULT_GROCERY_CATEGORIES)[number]
  )
    ? DEFAULT_GROCERY_CATEGORIES
    : [category, ...DEFAULT_GROCERY_CATEGORIES];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.nameCannotBeEmpty);
      return;
    }

    // Preserve stored canonical item name if user did not change the localized display text
    const nextName =
      trimmed === initialLocalizedName ? item.name : trimmed;

    await onSave({
      itemId: item.id,
      name: nextName,
      category,
      note: note.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-item-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2
            id="edit-item-modal-title"
            className="text-base font-bold text-slate-900 dark:text-slate-50"
          >
            {t.editItemTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label={t.cancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="edit-item-name"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {t.editItemName}
            </label>
            <input
              id="edit-item-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-item-category"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {t.category}
            </label>
            <div className="relative">
              <select
                id="edit-item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as GroceryCategory)}
                className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {getTranslatedCategory(cat, language)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-item-note"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {t.optionalNoteLabel}
            </label>
            <input
              id="edit-item-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.optionalNotePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {t.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
