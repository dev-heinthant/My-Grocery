import { buildSupabasePayload } from '@/database/schema';
import { DatabaseRunner } from '@/database/types';
import { GroceryItem, GroceryList } from '@/types/grocery';
import { generateId } from '@/utils/id';

interface RawGroceryListRow {
  id: string;
  user_id: string;
  name: string;
  is_default: number;
  created_at: number;
  updated_at: number | null;
}

interface RawItemForDeletion {
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

function mapRowToList(row: RawGroceryListRow): GroceryList {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isDefault: Boolean(row.is_default),
    createdAt: Number(row.created_at),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function getLists(db: DatabaseRunner, userId: string): Promise<GroceryList[]> {
  assertUserId(userId);
  const rows = await db.getAllAsync<RawGroceryListRow>(
    `SELECT id, user_id, name, is_default, created_at, updated_at
     FROM grocery_lists
     WHERE user_id = ?
     ORDER BY is_default DESC, created_at ASC`,
    [userId]
  );
  return rows.map(mapRowToList);
}

export async function createList(
  db: DatabaseRunner,
  userId: string,
  name: string
): Promise<GroceryList> {
  assertUserId(userId);
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('List name cannot be empty');
  }

  const now = Date.now();
  const list: GroceryList = {
    id: generateId(),
    userId,
    name: trimmed,
    isDefault: false,
    createdAt: now,
  };

  await db.runAsync(
    `INSERT INTO grocery_lists (id, user_id, name, is_default, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, NULL)`,
    [list.id, userId, list.name, list.createdAt]
  );

  return list;
}

export async function renameList(
  db: DatabaseRunner,
  userId: string,
  listId: string,
  newName: string
): Promise<boolean> {
  assertUserId(userId);
  const trimmed = newName.trim();
  if (!trimmed) return false;

  const result = await db.runAsync(
    `UPDATE grocery_lists
     SET name = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [trimmed, Date.now(), listId, userId]
  );
  return result.changes > 0;
}

export async function deleteList(
  db: DatabaseRunner,
  userId: string,
  listId: string
): Promise<boolean> {
  assertUserId(userId);

  return db.withTransaction(async (tx) => {
    const countRow = await tx.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM grocery_lists WHERE user_id = ?`,
      [userId]
    );
    if ((countRow?.count ?? 0) <= 1) {
      return false;
    }

    const listExists = await tx.getFirstAsync<{ id: string }>(
      `SELECT id FROM grocery_lists WHERE id = ? AND user_id = ?`,
      [listId, userId]
    );
    if (!listExists) {
      return false;
    }

    // Preserve DELETE tombstones in sync_queue for any item already synced to Supabase
    const itemsInList = await tx.getAllAsync<RawItemForDeletion>(
      `SELECT * FROM grocery_items WHERE user_id = ? AND list_id = ?`,
      [userId, listId]
    );

    const now = Date.now();
    for (const raw of itemsInList) {
      const wasSyncedToRemote =
        raw.sync_status !== 'PENDING_INSERT' || Boolean(raw.remote_id);

      if (!wasSyncedToRemote) {
        await tx.runAsync(
          `DELETE FROM sync_queue WHERE user_id = ? AND item_id = ?`,
          [userId, raw.id]
        );
      } else {
        const nextTs = Math.max(
          now,
          raw.local_updated_at + 1,
          (raw.remote_updated_at ?? 0) + 1,
          (raw.updated_at ?? 0) + 1,
          raw.created_at + 1
        );
        const mappedItem: GroceryItem = {
          id: raw.id,
          remoteId: raw.remote_id,
          listId: raw.list_id,
          name: raw.name,
          note: raw.note,
          category: raw.category,
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
          syncStatus: 'PENDING_DELETE',
          isDeletedLocally: true,
          lastSyncedAt: raw.last_synced_at ?? undefined,
        };

        await tx.runAsync(
          `INSERT INTO sync_queue (
             id, user_id, item_id, operation, payload_json, client_timestamp, queued_at, retry_count, last_error
           ) VALUES (?, ?, ?, 'DELETE', ?, ?, ?, 0, NULL)
           ON CONFLICT(user_id, item_id) DO UPDATE SET
             operation = 'DELETE',
             payload_json = excluded.payload_json,
             client_timestamp = excluded.client_timestamp,
             queued_at = excluded.queued_at,
             last_error = NULL`,
          [
            generateId(),
            userId,
            raw.id,
            JSON.stringify(buildSupabasePayload(mappedItem)),
            mappedItem.localUpdatedAt,
            now,
          ]
        );
      }
    }

    // Delete the list (ON DELETE CASCADE cleans up grocery_items rows for this list)
    const delResult = await tx.runAsync(
      `DELETE FROM grocery_lists WHERE id = ? AND user_id = ?`,
      [listId, userId]
    );

    return delResult.changes > 0;
  });
}
