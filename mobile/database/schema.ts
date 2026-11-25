import { GroceryItem } from '@/types/grocery';

export const DATABASE_NAME = 'my_grocery_list.db';
export const CURRENT_SCHEMA_VERSION = 3;

/**
 * Migration v1 SQL statements.
 * Keeps existing Supabase public.grocery_items columns compatible while storing
 * lists, custom categories, quantity, unit, tombstones, and sync queue locally.
 */
export const MIGRATION_V1_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS app_preferences (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS grocery_lists (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id
    ON grocery_lists(user_id);`,

  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_name
    ON categories(user_id, lower(name));`,

  `CREATE TABLE IF NOT EXISTS grocery_items (
    id TEXT PRIMARY KEY NOT NULL,
    remote_id TEXT,
    user_id TEXT NOT NULL,
    list_id TEXT NOT NULL,
    name TEXT NOT NULL,
    catalog_key TEXT,
    note TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Other',
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    is_purchased INTEGER NOT NULL DEFAULT 0,
    purchased_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER,
    local_updated_at INTEGER NOT NULL,
    remote_updated_at INTEGER,
    created_by_name TEXT,
    created_by_email TEXT,
    sync_status TEXT NOT NULL DEFAULT 'PENDING_INSERT',
    is_deleted_locally INTEGER NOT NULL DEFAULT 0,
    last_synced_at INTEGER,
    FOREIGN KEY (list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_grocery_items_user_list
    ON grocery_items(user_id, list_id, is_deleted_locally);`,
  `CREATE INDEX IF NOT EXISTS idx_grocery_items_user_sync
    ON grocery_items(user_id, sync_status);`,
  `CREATE INDEX IF NOT EXISTS idx_grocery_items_user_purchased
    ON grocery_items(user_id, is_purchased);`,
  `CREATE INDEX IF NOT EXISTS idx_grocery_items_user_purchased_at
    ON grocery_items(user_id, is_purchased, purchased_at);`,

  `CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    client_timestamp INTEGER NOT NULL,
    queued_at INTEGER NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_queue_user_item
    ON sync_queue(user_id, item_id);`,
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_user_queued
    ON sync_queue(user_id, queued_at);`,
];

/**
 * Maps a local GroceryItem to ONLY the columns present in Supabase public.grocery_items.
 * Local-only fields (listId, quantity, unit, tombstones, syncStatus) are intentionally excluded.
 */
export interface SupabaseGroceryItemRowPayload {
  id: string;
  name: string;
  note: string;
  category: string;
  is_purchased: boolean;
  created_at: number;
  updated_at: number | null;
  created_by_name: string | null;
  created_by_email: string | null;
  user_id: string;
}

export function buildSupabasePayload(item: GroceryItem): SupabaseGroceryItemRowPayload {
  return {
    id: item.remoteId || item.id,
    name: item.name,
    note: item.note || '',
    category: item.category || 'Other',
    is_purchased: item.isPurchased,
    created_at: Math.trunc(item.createdAt),
    updated_at: item.updatedAt != null ? Math.trunc(item.updatedAt) : null,
    created_by_name: item.createdByName ?? null,
    created_by_email: item.createdByEmail ?? null,
    user_id: item.userId,
  };
}
