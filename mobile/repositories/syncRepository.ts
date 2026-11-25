import { resolveCatalogKey } from '@/constants/groceryCatalog';
import {
  buildSupabasePayload,
  SupabaseGroceryItemRowPayload,
} from '@/database/schema';
import { DatabaseRunner } from '@/database/types';
import { GroceryItem, SyncQueueEntry } from '@/types/grocery';

export const MAX_CLOCK_DRIFT_MS = 5_000;

export interface RemoteGroceryRow {
  id: string;
  name: string;
  note: string | null;
  category: string | null;
  is_purchased: boolean;
  created_at: number;
  updated_at: number | null;
  created_by_name: string | null;
  created_by_email: string | null;
  user_id: string;
}

export interface PendingPushOperation {
  queueId: string;
  itemId: string;
  remoteId: string;
  operation: 'UPSERT' | 'DELETE';
  payload: SupabaseGroceryItemRowPayload;
}

export interface ReconcileSummary {
  pushOperations: PendingPushOperation[];
  pulledInserted: number;
  pulledUpdated: number;
  pulledDeleted: number;
  remoteWonConflicts: number;
}

interface RawLocalItem {
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

/**
 * Normalizes a device timestamp onto the server clock timeline using clockOffsetMs
 * (= serverNowMs - Date.now()) and clamps forward drift above serverNowMs + 5s.
 */
export function normalizeClientTimestampForSync(
  rawTs: number,
  serverNowMs: number,
  clockOffsetMs: number
): number {
  const safeRaw = Number.isFinite(rawTs) && rawTs > 0 ? Math.trunc(rawTs) : serverNowMs;
  const safeOffset = Number.isFinite(clockOffsetMs) ? Math.trunc(clockOffsetMs) : 0;
  const shifted = safeRaw + safeOffset;
  const ceiling = Math.trunc(serverNowMs) + MAX_CLOCK_DRIFT_MS;
  return Math.max(1, Math.min(shifted, ceiling));
}

/**
 * Clamps remote timestamps above serverNowMs + 5s so a skewed remote device
 * cannot poison future conflict resolution with an artificial future timestamp.
 */
export function normalizeRemoteTimestampForSync(
  rawRemoteTs: number | null | undefined,
  createdAt: number,
  serverNowMs: number
): number {
  const effective =
    typeof rawRemoteTs === 'number' && Number.isFinite(rawRemoteTs) && rawRemoteTs > 0
      ? Math.trunc(rawRemoteTs)
      : Math.trunc(createdAt);
  const ceiling = Math.trunc(serverNowMs) + MAX_CLOCK_DRIFT_MS;
  return Math.max(1, Math.min(effective, ceiling));
}

function getPayloadRemoteId(entry: SyncQueueEntry): string {
  try {
    const parsed = JSON.parse(entry.payloadJson);
    if (parsed && typeof parsed.id === 'string' && parsed.id.trim()) {
      return parsed.id;
    }
  } catch {
    // Fallback to itemId
  }
  return entry.itemId;
}

/**
 * Step 1 of sync: Reconciles remote snapshot against local SQLite & sync_queue inside
 * a single atomic transaction:
 * - Resolves conflicts using server-normalized updated_at timestamps.
 * - Produces exact UPSERT/DELETE operations that still need pushing to Supabase.
 * - Applies remote wins, new remote items (preserving default list & 1 pcs), and remote deletions.
 */
export async function reconcileRemoteSnapshot(
  db: DatabaseRunner,
  userId: string,
  defaultListId: string,
  remoteRows: RemoteGroceryRow[],
  serverNowMs: number,
  clockOffsetMs: number
): Promise<ReconcileSummary> {
  if (!userId || !userId.trim()) {
    throw new Error('Authenticated userId is required for sync reconciliation');
  }

  return db.withTransaction(async (tx) => {
    const localRows = await tx.getAllAsync<RawLocalItem>(
      `SELECT * FROM grocery_items WHERE user_id = ?`,
      [userId]
    );
    const queueRows = await tx.getAllAsync<{
      id: string;
      user_id: string;
      item_id: string;
      operation: 'UPSERT' | 'DELETE';
      payload_json: string;
      client_timestamp: number;
      queued_at: number;
      retry_count: number;
      last_error: string | null;
    }>(`SELECT * FROM sync_queue WHERE user_id = ? ORDER BY queued_at ASC`, [userId]);

    const queueEntries: SyncQueueEntry[] = queueRows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      itemId: r.item_id,
      operation: r.operation,
      payloadJson: r.payload_json,
      clientTimestamp: Number(r.client_timestamp),
      queuedAt: Number(r.queued_at),
      retryCount: Number(r.retry_count),
      lastError: r.last_error,
    }));

    const localByAnyId = new Map<string, RawLocalItem>();
    for (const row of localRows) {
      localByAnyId.set(row.id, row);
      if (row.remote_id) {
        localByAnyId.set(row.remote_id, row);
      }
    }

    const remoteById = new Map<string, RemoteGroceryRow>();
    for (const remote of remoteRows) {
      remoteById.set(remote.id, remote);
    }

    const queuedByItemId = new Map<string, SyncQueueEntry>();
    const queuedByRemoteId = new Map<string, SyncQueueEntry>();
    for (const entry of queueEntries) {
      queuedByItemId.set(entry.itemId, entry);
      queuedByRemoteId.set(getPayloadRemoteId(entry), entry);
    }

    const pushOperations: PendingPushOperation[] = [];
    let pulledInserted = 0;
    let pulledUpdated = 0;
    let pulledDeleted = 0;
    let remoteWonConflicts = 0;

    // Track remote IDs resolved by queue conflict resolution so we don't double-apply
    const handledRemoteIds = new Set<string>();

    // 1) Evaluate every pending queue entry against remote snapshot
    for (const entry of queueEntries) {
      const local = localByAnyId.get(entry.itemId);
      const remoteId = local?.remote_id || getPayloadRemoteId(entry);
      const remote = remoteById.get(remoteId);
      handledRemoteIds.add(remoteId);

      const localNormTs = normalizeClientTimestampForSync(
        local ? (local.updated_at ?? local.local_updated_at) : entry.clientTimestamp,
        serverNowMs,
        clockOffsetMs
      );

      if (remote) {
        const remoteNormTs = normalizeRemoteTimestampForSync(
          remote.updated_at,
          remote.created_at,
          serverNowMs
        );

        // If remote update is strictly newer than normalized local timestamp -> Remote wins
        if (remoteNormTs > localNormTs) {
          remoteWonConflicts++;
          await tx.runAsync(`DELETE FROM sync_queue WHERE user_id = ? AND item_id = ?`, [
            userId,
            entry.itemId,
          ]);

          if (local) {
            const nextCatalogKey =
              local.name === remote.name && local.catalog_key
                ? local.catalog_key
                : resolveCatalogKey(remote.name) ?? null;
            await tx.runAsync(
              `UPDATE grocery_items
               SET remote_id = ?, name = ?, catalog_key = ?, note = ?, category = ?, is_purchased = ?, purchased_at = ?,
                   created_at = ?, updated_at = ?, local_updated_at = ?, remote_updated_at = ?,
                   created_by_name = ?, created_by_email = ?,
                   sync_status = 'SYNCED', is_deleted_locally = 0, last_synced_at = ?
               WHERE id = ? AND user_id = ?`,
              [
                remote.id,
                remote.name,
                nextCatalogKey,
                remote.note ?? '',
                remote.category || 'Other',
                remote.is_purchased ? 1 : 0,
                remote.is_purchased ? (local.purchased_at ?? null) : null,
                Math.trunc(remote.created_at),
                remoteNormTs,
                remoteNormTs,
                remoteNormTs,
                remote.created_by_name ?? null,
                remote.created_by_email ?? null,
                Math.trunc(serverNowMs),
                local.id,
                userId,
              ]
            );
            pulledUpdated++;
          } else {
            // Item had been cascaded by local deleteList, but remote edited it more recently
            const remoteCatalogKey = resolveCatalogKey(remote.name) ?? null;
            await tx.runAsync(
              `INSERT INTO grocery_items (
                 id, remote_id, user_id, list_id, name, catalog_key, note, category, quantity, unit,
                 is_purchased, purchased_at, created_at, updated_at, local_updated_at, remote_updated_at,
                 created_by_name, created_by_email, sync_status, is_deleted_locally, last_synced_at
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'pcs', ?, NULL, ?, ?, ?, ?, ?, ?, 'SYNCED', 0, ?)`,
              [
                remote.id,
                remote.id,
                userId,
                defaultListId,
                remote.name,
                remoteCatalogKey,
                remote.note ?? '',
                remote.category || 'Other',
                remote.is_purchased ? 1 : 0,
                Math.trunc(remote.created_at),
                remoteNormTs,
                remoteNormTs,
                remoteNormTs,
                remote.created_by_name ?? null,
                remote.created_by_email ?? null,
                Math.trunc(serverNowMs),
              ]
            );
            pulledInserted++;
          }
          continue;
        }
      }

      // Local change wins (or item does not exist on remote)
      if (entry.operation === 'DELETE') {
        if (!remote) {
          // Already absent on Supabase; finalize tombstone cleanup locally
          await tx.runAsync(`DELETE FROM sync_queue WHERE user_id = ? AND item_id = ?`, [
            userId,
            entry.itemId,
          ]);
          if (local) {
            await tx.runAsync(`DELETE FROM grocery_items WHERE id = ? AND user_id = ?`, [
              local.id,
              userId,
            ]);
          }
          continue;
        }

        const parsedPayload: SupabaseGroceryItemRowPayload = (() => {
          try {
            return JSON.parse(entry.payloadJson);
          } catch {
            return {
              id: remoteId,
              name: remote.name,
              note: remote.note ?? '',
              category: remote.category || 'Other',
              is_purchased: Boolean(remote.is_purchased),
              created_at: Math.trunc(remote.created_at),
              updated_at: localNormTs,
              created_by_name: remote.created_by_name ?? null,
              created_by_email: remote.created_by_email ?? null,
              user_id: userId,
            };
          }
        })();

        pushOperations.push({
          queueId: entry.id,
          itemId: entry.itemId,
          remoteId,
          operation: 'DELETE',
          payload: { ...parsedPayload, id: remoteId, user_id: userId },
        });
      } else {
        // UPSERT operation
        if (!local || Boolean(local.is_deleted_locally)) {
          // Stale UPSERT without active item; clean up
          await tx.runAsync(`DELETE FROM sync_queue WHERE user_id = ? AND item_id = ?`, [
            userId,
            entry.itemId,
          ]);
          continue;
        }

        const normalizedCreatedAt = normalizeClientTimestampForSync(
          local.created_at,
          serverNowMs,
          clockOffsetMs
        );
        const normalizedUpdatedAt = local.updated_at != null ? localNormTs : null;

        const mapped: GroceryItem = {
          id: local.id,
          remoteId: local.remote_id || local.id,
          listId: local.list_id,
          name: local.name,
          catalogKey: local.catalog_key ?? undefined,
          note: local.note ?? '',
          category: local.category || 'Other',
          quantity: local.quantity,
          unit: local.unit,
          isPurchased: Boolean(local.is_purchased),
          purchasedAt: local.purchased_at ?? undefined,
          createdAt: normalizedCreatedAt,
          updatedAt: normalizedUpdatedAt ?? undefined,
          localUpdatedAt: localNormTs,
          remoteUpdatedAt: local.remote_updated_at ?? undefined,
          userId,
          createdByName: local.created_by_name ?? undefined,
          createdByEmail: local.created_by_email ?? undefined,
          syncStatus: 'PENDING_UPDATE',
          isDeletedLocally: false,
        };

        pushOperations.push({
          queueId: entry.id,
          itemId: local.id,
          remoteId: mapped.remoteId || local.id,
          operation: 'UPSERT',
          payload: buildSupabasePayload(mapped),
        });
      }
    }

    // 2) Apply non-conflicting remote inserts and updates (preserving local list_id, quantity, unit)
    for (const remote of remoteRows) {
      if (handledRemoteIds.has(remote.id)) continue;
      if (queuedByRemoteId.has(remote.id) || queuedByItemId.has(remote.id)) continue;

      const remoteNormTs = normalizeRemoteTimestampForSync(
        remote.updated_at,
        remote.created_at,
        serverNowMs
      );
      const local = localByAnyId.get(remote.id);

      if (!local) {
        const remoteCatalogKey = resolveCatalogKey(remote.name) ?? null;
        await tx.runAsync(
          `INSERT INTO grocery_items (
             id, remote_id, user_id, list_id, name, catalog_key, note, category, quantity, unit,
             is_purchased, purchased_at, created_at, updated_at, local_updated_at, remote_updated_at,
             created_by_name, created_by_email, sync_status, is_deleted_locally, last_synced_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'pcs', ?, NULL, ?, ?, ?, ?, ?, ?, 'SYNCED', 0, ?)`,
          [
            remote.id,
            remote.id,
            userId,
            defaultListId,
            remote.name,
            remoteCatalogKey,
            remote.note ?? '',
            remote.category || 'Other',
            remote.is_purchased ? 1 : 0,
            Math.trunc(remote.created_at),
            remote.updated_at != null ? remoteNormTs : null,
            remoteNormTs,
            remoteNormTs,
            remote.created_by_name ?? null,
            remote.created_by_email ?? null,
            Math.trunc(serverNowMs),
          ]
        );
        pulledInserted++;
        continue;
      }

      if (local.sync_status === 'SYNCED' && !Boolean(local.is_deleted_locally)) {
        const remotePurchased = remote.is_purchased ? 1 : 0;
        const remoteUpdatedOrNull = remote.updated_at != null ? remoteNormTs : null;
        const changed =
          local.name !== remote.name ||
          (local.note ?? '') !== (remote.note ?? '') ||
          local.category !== (remote.category || 'Other') ||
          local.is_purchased !== remotePurchased ||
          local.updated_at !== remoteUpdatedOrNull ||
          local.remote_id !== remote.id;

        if (changed) {
          const nextCatalogKey =
            local.name === remote.name && local.catalog_key
              ? local.catalog_key
              : resolveCatalogKey(remote.name) ?? null;
          await tx.runAsync(
            `UPDATE grocery_items
             SET remote_id = ?, name = ?, catalog_key = ?, note = ?, category = ?, is_purchased = ?, purchased_at = ?,
                 updated_at = ?, local_updated_at = ?, remote_updated_at = ?,
                 created_by_name = ?, created_by_email = ?,
                 sync_status = 'SYNCED', last_synced_at = ?
             WHERE id = ? AND user_id = ?`,
            [
              remote.id,
              remote.name,
              nextCatalogKey,
              remote.note ?? '',
              remote.category || 'Other',
              remotePurchased,
              remotePurchased ? (local.purchased_at ?? null) : null,
              remoteUpdatedOrNull,
              remoteNormTs,
              remoteNormTs,
              remote.created_by_name ?? null,
              remote.created_by_email ?? null,
              Math.trunc(serverNowMs),
              local.id,
              userId,
            ]
          );
          pulledUpdated++;
        }
      }
    }

    // 3) Remove cleanly SYNCED local items that were deleted remotely (e.g., via web app)
    for (const local of localRows) {
      if (local.sync_status !== 'SYNCED' || Boolean(local.is_deleted_locally)) continue;
      if (queuedByItemId.has(local.id)) continue;
      const remoteKey = local.remote_id || local.id;
      if (!remoteById.has(remoteKey)) {
        await tx.runAsync(`DELETE FROM grocery_items WHERE id = ? AND user_id = ?`, [
          local.id,
          userId,
        ]);
        pulledDeleted++;
      }
    }

    return {
      pushOperations,
      pulledInserted,
      pulledUpdated,
      pulledDeleted,
      remoteWonConflicts,
    };
  });
}

export async function markPushUpsertSucceeded(
  db: DatabaseRunner,
  userId: string,
  itemId: string,
  remoteId: string,
  syncedCreatedAt: number,
  syncedUpdatedAt: number | null,
  serverNowMs: number
): Promise<void> {
  const effectiveRemoteTs = syncedUpdatedAt ?? syncedCreatedAt;
  await db.withTransaction(async (tx) => {
    await tx.runAsync(
      `UPDATE grocery_items
       SET remote_id = ?, created_at = ?, updated_at = ?,
           remote_updated_at = ?, local_updated_at = ?,
           sync_status = 'SYNCED', last_synced_at = ?
       WHERE id = ? AND user_id = ? AND is_deleted_locally = 0`,
      [
        remoteId,
        Math.trunc(syncedCreatedAt),
        syncedUpdatedAt != null ? Math.trunc(syncedUpdatedAt) : null,
        Math.trunc(effectiveRemoteTs),
        Math.trunc(effectiveRemoteTs),
        Math.trunc(serverNowMs),
        itemId,
        userId,
      ]
    );
    await tx.runAsync(`DELETE FROM sync_queue WHERE user_id = ? AND item_id = ?`, [
      userId,
      itemId,
    ]);
  });
}

export async function markPushDeleteSucceeded(
  db: DatabaseRunner,
  userId: string,
  itemId: string
): Promise<void> {
  await db.withTransaction(async (tx) => {
    await tx.runAsync(`DELETE FROM sync_queue WHERE user_id = ? AND item_id = ?`, [
      userId,
      itemId,
    ]);
    await tx.runAsync(`DELETE FROM grocery_items WHERE id = ? AND user_id = ?`, [
      itemId,
      userId,
    ]);
  });
}

export async function markPushFailed(
  db: DatabaseRunner,
  userId: string,
  itemId: string,
  errorMessage: string
): Promise<void> {
  await db.runAsync(
    `UPDATE sync_queue
     SET retry_count = retry_count + 1, last_error = ?
     WHERE user_id = ? AND item_id = ?`,
    [errorMessage.slice(0, 400), userId, itemId]
  );
}
