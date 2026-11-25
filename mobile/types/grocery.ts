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

export type SyncStatus =
  | 'SYNCED'
  | 'PENDING_INSERT'
  | 'PENDING_UPDATE'
  | 'PENDING_DELETE';

export type Language = 'en' | 'my';
export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
}

export interface ClaimLocalDataSummary {
  itemCount: number;
  listCount: number;
  customCategoryCount: number;
}

export type ConfirmActionType =
  | { type: 'delete-item'; item: GroceryItem }
  | { type: 'clear-purchased'; count: number }
  | { type: 'clear-all'; count: number }
  | { type: 'delete-list'; list: GroceryList }
  | {
      type: 'duplicate-item';
      pendingItem: {
        name: string;
        note: string;
        category: GroceryCategory;
        quantity: number;
        unit: string;
      };
    }
  | {
      type: 'claim-local-data';
      summary: ClaimLocalDataSummary;
      targetUserEmail: string;
    }
  | { type: 'sign-out' }
  | { type: 'mark-bought'; item: GroceryItem };

export type SyncPhaseStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncSummary {
  status: SyncPhaseStatus;
  pendingCount: number;
  lastSyncedAt: number | null;
  lastError: string | null;
  isOnline: boolean;
}

export interface GroceryList {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface CategoryRecord {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: number;
}

export interface GroceryItem {
  id: string;
  remoteId?: string | null;
  listId: string;
  name: string;
  catalogKey?: string;
  note: string;
  category: GroceryCategory;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  purchasedAt?: number;
  createdAt: number;
  updatedAt?: number;
  localUpdatedAt: number;
  remoteUpdatedAt?: number;
  userId: string;
  createdByName?: string;
  createdByEmail?: string;
  syncStatus: SyncStatus;
  isDeletedLocally: boolean;
  lastSyncedAt?: number;
}

export interface SyncQueueEntry {
  id: string;
  itemId: string;
  userId: string;
  operation: 'UPSERT' | 'DELETE';
  payloadJson: string;
  clientTimestamp: number;
  queuedAt: number;
  retryCount: number;
  lastError?: string | null;
}

export interface GroceryBackupPayload {
  version: number;
  exportedAt: number;
  app: string;
  userId?: string;
  activeListId?: string;
  lists: GroceryList[];
  categories: CategoryRecord[];
  items: GroceryItem[];
}

export type BackupRestoreMode = 'merge' | 'replace';

export interface BackupRestorePreview {
  fileName: string;
  payload: GroceryBackupPayload;
  listCount: number;
  customCategoryCount: number;
  itemCount: number;
}

export interface BackupRestoreResult {
  mode: BackupRestoreMode;
  listsRestored: number;
  categoriesRestored: number;
  itemsRestored: number;
  activeListId: string;
}
