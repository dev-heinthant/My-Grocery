import { resolveCatalogKey } from '@/constants/groceryCatalog';
import { buildSupabasePayload } from '@/database/schema';
import { DatabaseRunner, SQLQueryExecutor } from '@/database/types';
import {
  GroceryCategory,
  GroceryItem,
  SyncQueueEntry,
  SyncStatus,
} from '@/types/grocery';
import { generateId } from '@/utils/id';

interface RawGroceryItemRow {
  id: string;
  remote_id: string | null;
  user_id: string;
  list_id: string;
  name: string;
  catalog_key: string | null;
  note: string;
  category: string;
  quantity: number;
  unit: string;
  is_purchased: number;
  purchased_at: number | null;
  created_at: number;
  updated_at: number | null;
  local_updated_at: number;
  remote_updated_at: number | null;
  created_by_name: string | null;
  created_by_email: string | null;
  sync_status: string;
  is_deleted_locally: number;
  last_synced_at: number | null;
}

interface RawSyncQueueRow {
  id: string;
  user_id: string;
  item_id: string;
  operation: 'UPSERT' | 'DELETE';
  payload_json: string;
  client_timestamp: number;
  queued_at: number;
  retry_count: number;
  last_error: string | null;
}

export interface CreateGroceryItemInput {
  listId: string;
  name: string;
  catalogKey?: string | null;
  note: string;
  category: GroceryCategory;
  quantity: number;
  unit: string;
  createdByName?: string;
  createdByEmail?: string;
}

export interface UpdateGroceryItemInput {
  id: string;
  name: string;
  catalogKey?: string | null;
  note: string;
  category: GroceryCategory;
  quantity: number;
  unit: string;
}

function assertUserId(userId: string): void {
  if (!userId || !userId.trim()) {
    throw new Error('Authenticated userId is required');
  }
}

function mapRowToItem(row: RawGroceryItemRow): GroceryItem {
  return {
    id: row.id,
    remoteId: row.remote_id,
    listId: row.list_id,
    name: row.name,
    catalogKey: row.catalog_key ?? undefined,
    note: row.note ?? '',
    category: row.category || 'Other',
    quantity: Number(row.quantity) > 0 ? Number(row.quantity) : 1,
    unit: row.unit || 'pcs',
    isPurchased: Boolean(row.is_purchased),
    purchasedAt: row.purchased_at != null ? Number(row.purchased_at) : undefined,
    createdAt: Number(row.created_at),
    updatedAt: row.updated_at ?? undefined,
    localUpdatedAt: Number(row.local_updated_at),
    remoteUpdatedAt: row.remote_updated_at ?? undefined,
    userId: row.user_id,
    createdByName: row.created_by_name ?? undefined,
    createdByEmail: row.created_by_email ?? undefined,
    syncStatus: row.sync_status as SyncStatus,
    isDeletedLocally: Boolean(row.is_deleted_locally),
    lastSyncedAt: row.last_synced_at ?? undefined,
  };
}

function computeNextTimestamp(existing: RawGroceryItemRow): number {
  const now = Date.now();
  const floor = Math.max(
    existing.local_updated_at ?? 0,
    existing.remote_updated_at ?? 0,
    existing.updated_at ?? 0,
    existing.created_at ?? 0
  );
  return Math.max(now, floor + 1);
}

async function upsertQueueEntry(
  tx: SQLQueryExecutor,
  userId: string,
  item: GroceryItem,
  operation: 'UPSERT' | 'DELETE',
  timestamp: number
): Promise<void> {
  await tx.runAsync(
    `INSERT INTO sync_queue (
       id, user_id, item_id, operation, payload_json, client_timestamp, queued_at, retry_count, last_error
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)
     ON CONFLICT(user_id, item_id) DO UPDATE SET
       operation = excluded.operation,
       payload_json = excluded.payload_json,
       client_timestamp = excluded.client_timestamp,
       queued_at = excluded.queued_at,
       last_error = NULL`,
    [
      generateId(),
      userId,
      item.id,
      operation,
      JSON.stringify(buildSupabasePayload(item)),
      timestamp,
      Date.now(),
    ]
  );
}

export async function getItems(
  db: DatabaseRunner,
  userId: string,
  listId?: string
): Promise<GroceryItem[]> {
  assertUserId(userId);
  if (listId) {
    const rows = await db.getAllAsync<RawGroceryItemRow>(
      `SELECT * FROM grocery_items
       WHERE user_id = ? AND list_id = ? AND is_deleted_locally = 0
       ORDER BY created_at DESC`,
      [userId, listId]
    );
    return rows.map(mapRowToItem);
  }

  const rows = await db.getAllAsync<RawGroceryItemRow>(
    `SELECT * FROM grocery_items
     WHERE user_id = ? AND is_deleted_locally = 0
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(mapRowToItem);
}

export async function getPurchasedItemsInRange(
  db: DatabaseRunner,
  userId: string,
  startMs: number,
  endMs: number
): Promise<GroceryItem[]> {
  assertUserId(userId);
  const rows = await db.getAllAsync<RawGroceryItemRow>(
    `SELECT * FROM grocery_items
     WHERE user_id = ?
       AND is_deleted_locally = 0
       AND is_purchased = 1
       AND purchased_at IS NOT NULL
       AND purchased_at >= ?
       AND purchased_at <= ?
     ORDER BY purchased_at DESC`,
    [userId, Math.trunc(startMs), Math.trunc(endMs)]
  );
  return rows.map(mapRowToItem);
}

export async function searchItems(
  db: DatabaseRunner,
  userId: string,
  options: { listId?: string; query?: string; category?: string }
): Promise<GroceryItem[]> {
  assertUserId(userId);
  const clauses: string[] = ['user_id = ?', 'is_deleted_locally = 0'];
  const params: (string | number)[] = [userId];

  if (options.listId) {
    clauses.push('list_id = ?');
    params.push(options.listId);
  }
  if (options.category && options.category !== 'All') {
    clauses.push('category = ?');
    params.push(options.category);
  }
  if (options.query && options.query.trim()) {
    const like = `%${options.query.trim().toLowerCase()}%`;
    clauses.push('(lower(name) LIKE ? OR lower(note) LIKE ? OR lower(category) LIKE ?)');
    params.push(like, like, like);
  }

  const rows = await db.getAllAsync<RawGroceryItemRow>(
    `SELECT * FROM grocery_items WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  return rows.map(mapRowToItem);
}

export async function getItemById(
  db: DatabaseRunner,
  userId: string,
  itemId: string
): Promise<GroceryItem | null> {
  assertUserId(userId);
  const row = await db.getFirstAsync<RawGroceryItemRow>(
    `SELECT * FROM grocery_items WHERE id = ? AND user_id = ?`,
    [itemId, userId]
  );
  return row ? mapRowToItem(row) : null;
}

export async function addItem(
  db: DatabaseRunner,
  userId: string,
  input: CreateGroceryItemInput
): Promise<GroceryItem> {
  assertUserId(userId);
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error('Item name cannot be empty');
  }

  const now = Date.now();
  const resolvedCatalogKey =
    input.catalogKey !== undefined
      ? input.catalogKey
      : resolveCatalogKey(trimmedName) ?? null;
  const newItem: GroceryItem = {
    id: generateId(),
    remoteId: null,
    listId: input.listId,
    name: trimmedName,
    catalogKey: resolvedCatalogKey ?? undefined,
    note: input.note.trim(),
    category: input.category || 'Other',
    quantity: Number.isFinite(input.quantity) && input.quantity > 0 ? input.quantity : 1,
    unit: input.unit.trim() || 'pcs',
    isPurchased: false,
    purchasedAt: undefined,
    createdAt: now,
    updatedAt: undefined,
    localUpdatedAt: now,
    remoteUpdatedAt: undefined,
    userId,
    createdByName: input.createdByName,
    createdByEmail: input.createdByEmail,
    syncStatus: 'PENDING_INSERT',
    isDeletedLocally: false,
    lastSyncedAt: undefined,
  };

  await db.withTransaction(async (tx) => {
    const listRow = await tx.getFirstAsync<{ id: string }>(
      `SELECT id FROM grocery_lists WHERE id = ? AND user_id = ?`,
      [input.listId, userId]
    );
    if (!listRow) {
      throw new Error('Target grocery list does not belong to this account');
    }

    await tx.runAsync(
      `INSERT INTO grocery_items (
         id, remote_id, user_id, list_id, name, catalog_key, note, category, quantity, unit,
         is_purchased, purchased_at, created_at, updated_at, local_updated_at, remote_updated_at,
         created_by_name, created_by_email, sync_status, is_deleted_locally, last_synced_at
       ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, NULL, ?, NULL, ?, ?, 'PENDING_INSERT', 0, NULL)`,
      [
        newItem.id,
        userId,
        newItem.listId,
        newItem.name,
        resolvedCatalogKey,
        newItem.note,
        newItem.category,
        newItem.quantity,
        newItem.unit,
        newItem.createdAt,
        newItem.localUpdatedAt,
        newItem.createdByName ?? null,
        newItem.createdByEmail ?? null,
      ]
    );

    await upsertQueueEntry(tx, userId, newItem, 'UPSERT', newItem.localUpdatedAt);
  });

  return newItem;
}

export async function updateItem(
  db: DatabaseRunner,
  userId: string,
  input: UpdateGroceryItemInput
): Promise<GroceryItem | null> {
  assertUserId(userId);
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error('Item name cannot be empty');
  }

  return db.withTransaction(async (tx) => {
    const raw = await tx.getFirstAsync<RawGroceryItemRow>(
      `SELECT * FROM grocery_items
       WHERE id = ? AND user_id = ? AND is_deleted_locally = 0`,
      [input.id, userId]
    );
    if (!raw) return null;

    const nextTs = computeNextTimestamp(raw);
    const nextSyncStatus: SyncStatus =
      raw.sync_status === 'PENDING_INSERT' ? 'PENDING_INSERT' : 'PENDING_UPDATE';
    const nextQty = Number.isFinite(input.quantity) && input.quantity > 0 ? input.quantity : 1;
    const nextUnit = input.unit.trim() || 'pcs';
    const nextNote = input.note.trim();
    const nextCatalogKey =
      input.catalogKey !== undefined
        ? input.catalogKey
        : resolveCatalogKey(trimmedName) ?? null;

    await tx.runAsync(
      `UPDATE grocery_items
       SET name = ?, catalog_key = ?, note = ?, category = ?, quantity = ?, unit = ?,
           updated_at = ?, local_updated_at = ?, sync_status = ?
       WHERE id = ? AND user_id = ?`,
      [
        trimmedName,
        nextCatalogKey,
        nextNote,
        input.category || 'Other',
        nextQty,
        nextUnit,
        nextTs,
        nextTs,
        nextSyncStatus,
        raw.id,
        userId,
      ]
    );

    const updated: GroceryItem = {
      ...mapRowToItem(raw),
      name: trimmedName,
      catalogKey: nextCatalogKey ?? undefined,
      note: nextNote,
      category: input.category || 'Other',
      quantity: nextQty,
      unit: nextUnit,
      updatedAt: nextTs,
      localUpdatedAt: nextTs,
      syncStatus: nextSyncStatus,
    };

    await upsertQueueEntry(tx, userId, updated, 'UPSERT', nextTs);
    return updated;
  });
}

export async function togglePurchased(
  db: DatabaseRunner,
  userId: string,
  itemId: string
): Promise<GroceryItem | null> {
  assertUserId(userId);

  return db.withTransaction(async (tx) => {
    const raw = await tx.getFirstAsync<RawGroceryItemRow>(
      `SELECT * FROM grocery_items
       WHERE id = ? AND user_id = ? AND is_deleted_locally = 0`,
      [itemId, userId]
    );
    if (!raw) return null;

    const nextPurchased = !Boolean(raw.is_purchased);
    const nextPurchasedAt = nextPurchased ? Date.now() : null;
    const nextTs = computeNextTimestamp(raw);
    const nextSyncStatus: SyncStatus =
      raw.sync_status === 'PENDING_INSERT' ? 'PENDING_INSERT' : 'PENDING_UPDATE';

    await tx.runAsync(
      `UPDATE grocery_items
       SET is_purchased = ?, purchased_at = ?, updated_at = ?, local_updated_at = ?, sync_status = ?
       WHERE id = ? AND user_id = ?`,
      [
        nextPurchased ? 1 : 0,
        nextPurchasedAt,
        nextTs,
        nextTs,
        nextSyncStatus,
        raw.id,
        userId,
      ]
    );

    const updated: GroceryItem = {
      ...mapRowToItem(raw),
      isPurchased: nextPurchased,
      purchasedAt: nextPurchasedAt ?? undefined,
      updatedAt: nextTs,
      localUpdatedAt: nextTs,
      syncStatus: nextSyncStatus,
    };

    await upsertQueueEntry(tx, userId, updated, 'UPSERT', nextTs);
    return updated;
  });
}

async function deleteRawItemTransactional(
  tx: SQLQueryExecutor,
  userId: string,
  raw: RawGroceryItemRow
): Promise<void> {
  const neverSyncedToRemote =
    raw.sync_status === 'PENDING_INSERT' && !raw.remote_id;

  if (neverSyncedToRemote) {
    await tx.runAsync(
      `DELETE FROM sync_queue WHERE user_id = ? AND item_id = ?`,
      [userId, raw.id]
    );
    await tx.runAsync(
      `DELETE FROM grocery_items WHERE id = ? AND user_id = ?`,
      [raw.id, userId]
    );
    return;
  }

  const nextTs = computeNextTimestamp(raw);
  await tx.runAsync(
    `UPDATE grocery_items
     SET is_deleted_locally = 1, sync_status = 'PENDING_DELETE',
         updated_at = ?, local_updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [nextTs, nextTs, raw.id, userId]
  );

  const tombstone: GroceryItem = {
    ...mapRowToItem(raw),
    isDeletedLocally: true,
    syncStatus: 'PENDING_DELETE',
    updatedAt: nextTs,
    localUpdatedAt: nextTs,
  };

  await upsertQueueEntry(tx, userId, tombstone, 'DELETE', nextTs);
}

export async function deleteItem(
  db: DatabaseRunner,
  userId: string,
  itemId: string
): Promise<boolean> {
  assertUserId(userId);

  return db.withTransaction(async (tx) => {
    const raw = await tx.getFirstAsync<RawGroceryItemRow>(
      `SELECT * FROM grocery_items
       WHERE id = ? AND user_id = ? AND is_deleted_locally = 0`,
      [itemId, userId]
    );
    if (!raw) return false;

    await deleteRawItemTransactional(tx, userId, raw);
    return true;
  });
}

export async function clearPurchased(
  db: DatabaseRunner,
  userId: string,
  listId: string
): Promise<number> {
  assertUserId(userId);

  return db.withTransaction(async (tx) => {
    const targets = await tx.getAllAsync<RawGroceryItemRow>(
      `SELECT * FROM grocery_items
       WHERE user_id = ? AND list_id = ? AND is_purchased = 1 AND is_deleted_locally = 0`,
      [userId, listId]
    );
    for (const raw of targets) {
      await deleteRawItemTransactional(tx, userId, raw);
    }
    return targets.length;
  });
}

export async function clearListItems(
  db: DatabaseRunner,
  userId: string,
  listId: string
): Promise<number> {
  assertUserId(userId);

  return db.withTransaction(async (tx) => {
    const targets = await tx.getAllAsync<RawGroceryItemRow>(
      `SELECT * FROM grocery_items
       WHERE user_id = ? AND list_id = ? AND is_deleted_locally = 0`,
      [userId, listId]
    );
    for (const raw of targets) {
      await deleteRawItemTransactional(tx, userId, raw);
    }
    return targets.length;
  });
}

export async function getPendingSyncQueue(
  db: DatabaseRunner,
  userId: string
): Promise<SyncQueueEntry[]> {
  assertUserId(userId);
  const rows = await db.getAllAsync<RawSyncQueueRow>(
    `SELECT * FROM sync_queue WHERE user_id = ? ORDER BY queued_at ASC`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    operation: row.operation,
    payloadJson: row.payload_json,
    clientTimestamp: Number(row.client_timestamp),
    queuedAt: Number(row.queued_at),
    retryCount: Number(row.retry_count),
    lastError: row.last_error,
  }));
}

export async function getDeletedTombstones(
  db: DatabaseRunner,
  userId: string
): Promise<GroceryItem[]> {
  assertUserId(userId);
  const rows = await db.getAllAsync<RawGroceryItemRow>(
    `SELECT * FROM grocery_items
     WHERE user_id = ? AND is_deleted_locally = 1 AND sync_status = 'PENDING_DELETE'`,
    [userId]
  );
  return rows.map(mapRowToItem);
}
