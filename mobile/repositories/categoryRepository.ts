import { buildSupabasePayload } from '@/database/schema';
import { DatabaseRunner } from '@/database/types';
import { CategoryRecord, GroceryItem } from '@/types/grocery';
import { generateId } from '@/utils/id';

interface RawCategoryRow {
  id: string;
  user_id: string;
  name: string;
  is_default: number;
  created_at: number;
}

interface RawItemRow {
  id: string;
  remote_id: string | null;
  user_id: string;
  list_id: string;
  name: string;
  note: string;
  category: string;
  quantity: number;
  unit: string;
  is_purchased: number;
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

function assertUserId(userId: string): void {
  if (!userId || !userId.trim()) {
    throw new Error('Authenticated userId is required');
  }
}

export async function getCategories(
  db: DatabaseRunner,
  userId: string
): Promise<CategoryRecord[]> {
  assertUserId(userId);
  const rows = await db.getAllAsync<RawCategoryRow>(
    `SELECT id, user_id, name, is_default, created_at
     FROM categories
     WHERE user_id = ?
     ORDER BY is_default DESC, created_at ASC`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isDefault: Boolean(row.is_default),
    createdAt: Number(row.created_at),
  }));
}

export async function addCustomCategory(
  db: DatabaseRunner,
  userId: string,
  name: string
): Promise<CategoryRecord | null> {
  assertUserId(userId);
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM categories WHERE user_id = ? AND lower(name) = lower(?)`,
    [userId, trimmed]
  );
  if (existing) {
    return null;
  }

  const record: CategoryRecord = {
    id: generateId(),
    userId,
    name: trimmed,
    isDefault: false,
    createdAt: Date.now(),
  };

  await db.runAsync(
    `INSERT INTO categories (id, user_id, name, is_default, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    [record.id, userId, record.name, record.createdAt]
  );

  return record;
}

export async function deleteCustomCategory(
  db: DatabaseRunner,
  userId: string,
  categoryId: string
): Promise<string | null> {
  assertUserId(userId);

  return db.withTransaction(async (tx) => {
    const target = await tx.getFirstAsync<RawCategoryRow>(
      `SELECT id, user_id, name, is_default, created_at
       FROM categories
       WHERE id = ? AND user_id = ?`,
      [categoryId, userId]
    );

    if (!target || Boolean(target.is_default)) {
      return null;
    }

    const now = Date.now();
    const affectedItems = await tx.getAllAsync<RawItemRow>(
      `SELECT * FROM grocery_items
       WHERE user_id = ? AND category = ? AND is_deleted_locally = 0`,
      [userId, target.name]
    );

    for (const raw of affectedItems) {
      const nextTs = Math.max(
        now,
        raw.local_updated_at + 1,
        (raw.remote_updated_at ?? 0) + 1
      );
      const nextSyncStatus =
        raw.sync_status === 'PENDING_INSERT' ? 'PENDING_INSERT' : 'PENDING_UPDATE';

      await tx.runAsync(
        `UPDATE grocery_items
         SET category = 'Other', updated_at = ?, local_updated_at = ?, sync_status = ?
         WHERE id = ? AND user_id = ?`,
        [nextTs, nextTs, nextSyncStatus, raw.id, userId]
      );

      const updatedItem: GroceryItem = {
        id: raw.id,
        remoteId: raw.remote_id,
        listId: raw.list_id,
        name: raw.name,
        note: raw.note,
        category: 'Other',
        quantity: raw.quantity,
        unit: raw.unit,
        isPurchased: Boolean(raw.is_purchased),
        createdAt: raw.created_at,
        updatedAt: nextTs,
        localUpdatedAt: nextTs,
        remoteUpdatedAt: raw.remote_updated_at ?? undefined,
        userId: raw.user_id,
        createdByName: raw.created_by_name ?? undefined,
        createdByEmail: raw.created_by_email ?? undefined,
        syncStatus: nextSyncStatus,
        isDeletedLocally: false,
        lastSyncedAt: raw.last_synced_at ?? undefined,
      };

      await tx.runAsync(
        `INSERT INTO sync_queue (
           id, user_id, item_id, operation, payload_json, client_timestamp, queued_at, retry_count, last_error
         ) VALUES (?, ?, ?, 'UPSERT', ?, ?, ?, 0, NULL)
         ON CONFLICT(user_id, item_id) DO UPDATE SET
           operation = 'UPSERT',
           payload_json = excluded.payload_json,
           client_timestamp = excluded.client_timestamp,
           queued_at = excluded.queued_at,
           last_error = NULL`,
        [
          generateId(),
          userId,
          raw.id,
          JSON.stringify(buildSupabasePayload(updatedItem)),
          nextTs,
          now,
        ]
      );
    }

    await tx.runAsync(
      `DELETE FROM categories WHERE id = ? AND user_id = ? AND is_default = 0`,
      [categoryId, userId]
    );

    return target.name;
  });
}
