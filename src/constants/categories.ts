import { DefaultGroceryCategory, ThemeMode } from '../types/grocery';

export const DEFAULT_GROCERY_CATEGORIES: readonly DefaultGroceryCategory[] = [
  'Produce',
  'Dairy',
  'Bakery',
  'Pantry',
  'Meat & Seafood',
  'Frozen',
  'Beverages',
  'Snacks',
  'Household',
  'Other',
];

export function getCategoryAccentColor(category: string, mode: ThemeMode): string {
  const light: Record<string, string> = {
    Produce: '#047857',
    Dairy: '#0369A1',
    Bakery: '#B45309',
    Pantry: '#44403C',
    'Meat & Seafood': '#BE123C',
    Frozen: '#0E7490',
    Beverages: '#4338CA',
    Snacks: '#C2410C',
    Household: '#7E22CE',
    Other: '#475569',
  };
  const dark: Record<string, string> = {
    Produce: '#34D399',
    Dairy: '#38BDF8',
    Bakery: '#FBBF24',
    Pantry: '#A8A29E',
    'Meat & Seafood': '#FB7185',
    Frozen: '#22D3EE',
    Beverages: '#818CF8',
    Snacks: '#FB923C',
    Household: '#C084FC',
    Other: '#94A3B8',
  };
  const palette = mode === 'dark' ? dark : light;
  return palette[category] ?? (mode === 'dark' ? '#34D399' : '#047857');
}

export function getCategorySurfaceClasses(category: string): string {
  switch (category) {
    case 'Produce':
      return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/70';
    case 'Dairy':
      return 'text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/70';
    case 'Bakery':
      return 'text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70';
    case 'Pantry':
      return 'text-stone-700 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700';
    case 'Meat & Seafood':
      return 'text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/70';
    case 'Frozen':
      return 'text-cyan-700 dark:text-cyan-300 bg-cyan-50/80 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800/70';
    case 'Beverages':
      return 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/70';
    case 'Snacks':
      return 'text-orange-700 dark:text-orange-300 bg-orange-50/80 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800/70';
    case 'Household':
      return 'text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/70';
    default:
      return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  }
}
