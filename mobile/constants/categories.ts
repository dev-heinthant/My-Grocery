import { DefaultGroceryCategory, ThemeMode } from '@/types/grocery';

export const DEFAULT_GROCERY_CATEGORIES: DefaultGroceryCategory[] = [
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

export const COMMON_UNITS: string[] = [
  'pcs',
  'kg',
  'g',
  'lb',
  'oz',
  'L',
  'ml',
  'pack',
  'box',
  'bag',
  'bottle',
  'carton',
  'dozen',
];

export function getCategoryColor(category: string, mode: ThemeMode): string {
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
