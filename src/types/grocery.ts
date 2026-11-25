export type DefaultGroceryCategory =
  | 'Produce'
  | 'Dairy'
  | 'Bakery'
  | 'Pantry'
  | 'Meat & Seafood'
  | 'Frozen'
  | 'Beverages'
  | 'Snacks'
  | 'Household'
  | 'Other';

export type GroceryCategory = DefaultGroceryCategory | (string & {});

export type Language = 'en' | 'my';

export type ThemeMode = 'light' | 'dark';

export type EmailValidationIssue = 'empty' | 'invalid' | 'non_gmail';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

export interface GroceryItem {
  id: string;
  userId: string;
  name: string;
  note: string;
  category: GroceryCategory;
  isPurchased: boolean;
  createdAt: number;
  updatedAt: number | null;
  createdByName: string;
  createdByEmail: string;
}

export interface RemoteGroceryRow {
  id: string;
  name: string;
  note: string | null;
  category: string | null;
  is_purchased: boolean | null;
  created_at: number;
  updated_at: number | null;
  created_by_name: string | null;
  created_by_email: string | null;
  user_id: string;
}

export type ConfirmAction =
  | { type: 'mark-bought'; item: GroceryItem }
  | { type: 'delete-item'; item: GroceryItem }
  | {
      type: 'duplicate-item';
      name: string;
      category: GroceryCategory;
      note: string;
    }
  | { type: 'clear-purchased'; count: number }
  | { type: 'clear-all'; count: number }
  | { type: 'sign-out' };

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
