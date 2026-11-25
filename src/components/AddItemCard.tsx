import React, { useState } from 'react';
import { ChevronDown, Plus, StickyNote } from 'lucide-react';
import { DEFAULT_GROCERY_CATEGORIES } from '../constants/categories';
import { getQuickAddSuggestions, guessCategoryForName } from '../constants/groceryCatalog';
import { getTranslatedCategory, TRANSLATIONS } from '../constants/translations';
import { GroceryCategory, Language } from '../types/grocery';

interface AddItemCardProps {
  language: Language;
  isSubmitting?: boolean;
  onAddItem: (params: {
    name: string;
    category: GroceryCategory;
    note: string;
  }) => Promise<boolean>;
}

export function AddItemCard({
  language,
  isSubmitting = false,
  onAddItem,
}: AddItemCardProps) {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('Other');
  const [categoryManuallySet, setCategoryManuallySet] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const quickAdds = getQuickAddSuggestions(language);

  const handleNameChange = (value: string) => {
    setName(value);
    if (validationError) setValidationError(null);
    if (!categoryManuallySet) {
      setCategory(guessCategoryForName(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError(t.pleaseEnterName);
      return;
    }

    const didClear = await onAddItem({
      name: trimmed,
      category,
      note: note.trim(),
    });

    if (didClear) {
      setName('');
      setNote('');
      setShowNote(false);
      setCategory('Other');
      setCategoryManuallySet(false);
      setValidationError(null);
    }
  };

  const handleQuickAdd = async (suggestion: {
    name: string;
    category: GroceryCategory;
  }) => {
    await onAddItem({
      name: suggestion.name,
      category: suggestion.category,
      note: '',
    });
  };

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <div>
          <label htmlFor="add-item-name" className="sr-only">
            {t.editItemName}
          </label>
          <input
            id="add-item-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t.whatToBuyPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
          />
          {validationError && (
            <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {validationError}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="add-item-category" className="sr-only">
              {t.category}
            </label>
            <select
              id="add-item-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as GroceryCategory);
                setCategoryManuallySet(true);
              }}
              className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
            >
              {DEFAULT_GROCERY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getTranslatedCategory(cat, language)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            onClick={() => setShowNote((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap ${
              showNote
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>{t.addNote}</span>
          </button>
        </div>

        {showNote && (
          <div>
            <label htmlFor="add-item-note" className="sr-only">
              {t.optionalNoteLabel}
            </label>
            <input
              id="add-item-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.optionalNotePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addItem}</span>
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          {t.quickAdd}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {quickAdds.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickAdd(item)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
