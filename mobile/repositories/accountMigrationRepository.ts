import { DatabaseRunner } from '@/database/types';
import {
  getLastAuthenticatedUserId,
  getPendingLocalClaimedBy,
  setPendingLocalClaimedBy,
} from '@/repositories/preferencesRepository';
import { ClaimLocalDataSummary } from '@/types/grocery';

export const LEGACY_PENDING_ACCOUNT_ID = 'pending-auth-local-account';

export interface ClaimableInspectionResult extends ClaimLocalDataSummary {
  canOfferClaim: boolean;
}

/**
 * Inspects whether unowned pre-auth Phase 5 local data exists under
 * 'pending-auth-local-account' and may safely be offered for import into incomingUserId.
 *
 * Strictly prevents auto-assigning another authenticated user's device data.
 */
export async function inspectClaimablePendingData(
  db: DatabaseRunner,
  incomingUserId: string
): Promise<ClaimableInspectionResult> {
  if (!incomingUserId || incomingUserId === LEGACY_PENDING_ACCOUNT_ID) {
    return { canOfferClaim: false, itemCount: 0, listCount: 0, customCategoryCount: 0 };
  }

  const [claimedBy, lastAuthUser, otherAccountItems, otherAccountLists] = await Promise.all([
    getPendingLocalClaimedBy(db),
    getLastAuthenticatedUserId(db),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM grocery_items
       WHERE user_id != ? AND user_id != ?`,
      [LEGACY_PENDING_ACCOUNT_ID, incomingUserId]
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM grocery_lists
       WHERE user_id != ? AND user_id != ?`,
      [LEGACY_PENDING_ACCOUNT_ID, incomingUserId]
    ),
  ]);

  // Never allow claiming if already claimed or if another authenticated user has used this device
  if (
    claimedBy ||
    (lastAuthUser && lastAuthUser !== incomingUserId) ||
    (otherAccountItems?.count ?? 0) > 0 ||
    (otherAccountLists?.count ?? 0) > 0
  ) {
    return { canOfferClaim: false, itemCount: 0, listCount: 0, customCategoryCount: 0 };
  }

  const [pendingItemsRow, pendingCustomListsRow, pendingCustomCatsRow] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM grocery_items
       WHERE user_id = ? AND is_deleted_locally = 0`,
      [LEGACY_PENDING_ACCOUNT_ID]
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM grocery_lists
       WHERE user_id = ? AND is_default = 0`,
      [LEGACY_PENDING_ACCOUNT_ID]
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM categories
       WHERE user_id = ? AND is_default = 0`,
      [LEGACY_PENDING_ACCOUNT_ID]
    ),
  ]);

  const itemCount = pendingItemsRow?.count ?? 0;
  const listCount = pendingCustomListsRow?.count ?? 0;
  const customCategoryCount = pendingCustomCatsRow?.count ?? 0;
  const hasMeaningfulData = itemCount > 0 || listCount > 0 || customCategoryCount > 0;

  return {
    canOfferClaim: hasMeaningfulData,
    itemCount,
    listCount,
    customCategoryCount,
  };
}

/**
 * Atomically migrates unowned pre-auth data from 'pending-auth-local-account'
 * into targetUserId (only after explicit user confirmation on first sign-in).
 */
export async function claimPendingLocalData(
  db: DatabaseRunner,
  targetUserId: string,
  targetDefaultListId: string
): Promise<number> {
  if (!targetUserId || targetUserId === LEGACY_PENDING_ACCOUNT_ID) {
    return 0;
  }

  const movedItemsCount = await db.withTransaction(async (tx) => {
    const legacyLists = await tx.getAllAsync<{ id: string; is_default: number }>(
      `SELECT id, is_default FROM grocery_lists WHERE user_id = ?`,
      [LEGACY_PENDING_ACCOUNT_ID]
    );

    const legacyDefaultList = legacyLists.find((l) => Boolean(l.is_default));
    const legacyCustomLists = legacyLists.filter((l) => !Boolean(l.is_default));

    // Reassign custom lists directly to targetUserId
    for (const list of legacyCustomLists) {
      await tx.runAsync(
        `UPDATE grocery_lists SET user_id = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
        [targetUserId, Date.now(), list.id, LEGACY_PENDING_ACCOUNT_ID]
      );
    }

    // Reassign custom categories that do not conflict case-insensitively with targetUserId
    const legacyCustomCats = await tx.getAllAsync<{ id: string; name: string }>(
      `SELECT id, name FROM categories WHERE user_id = ? AND is_default = 0`,
      [LEGACY_PENDING_ACCOUNT_ID]
    );
    for (const cat of legacyCustomCats) {
      const conflict = await tx.getFirstAsync<{ id: string }>(
        `SELECT id FROM categories WHERE user_id = ? AND lower(name) = lower(?)`,
        [targetUserId, cat.name]
      );
      if (conflict) {
        await tx.runAsync(`DELETE FROM categories WHERE id = ? AND user_id = ?`, [
          cat.id,
          LEGACY_PENDING_ACCOUNT_ID,
        ]);
      } else {
        await tx.runAsync(
          `UPDATE categories SET user_id = ? WHERE id = ? AND user_id = ?`,
          [targetUserId, cat.id, LEGACY_PENDING_ACCOUNT_ID]
        );
      }
    }

    // Move items in legacy default list into targetUserId's default list
    let defaultMovedCount = 0;
    if (legacyDefaultList) {
      const defaultRes = await tx.runAsync(
        `UPDATE grocery_items
         SET user_id = ?, list_id = ?
         WHERE user_id = ? AND list_id = ?`,
        [targetUserId, targetDefaultListId, LEGACY_PENDING_ACCOUNT_ID, legacyDefaultList.id]
      );
      defaultMovedCount = defaultRes.changes;
    }

    // Move items in remaining migrated custom lists
    const itemRes = await tx.runAsync(
      `UPDATE grocery_items SET user_id = ? WHERE user_id = ?`,
      [targetUserId, LEGACY_PENDING_ACCOUNT_ID]
    );

    // Rewrite sync_queue entries (both user_id column and payload_json.user_id)
    const legacyQueue = await tx.getAllAsync<{
      id: string;
      item_id: string;
      payload_json: string;
    }>(`SELECT id, item_id, payload_json FROM sync_queue WHERE user_id = ?`, [
      LEGACY_PENDING_ACCOUNT_ID,
    ]);

    for (const q of legacyQueue) {
      let nextPayload = q.payload_json;
      try {
        const parsed = JSON.parse(q.payload_json);
        parsed.user_id = targetUserId;
        nextPayload = JSON.stringify(parsed);
      } catch {
        // Keep original JSON if unparseable
      }
      await tx.runAsync(
        `UPDATE sync_queue
         SET user_id = ?, payload_json = ?
         WHERE id = ? AND user_id = ?`,
        [targetUserId, nextPayload, q.id, LEGACY_PENDING_ACCOUNT_ID]
      );
    }

    // Clean up remaining legacy default seed rows
    await tx.runAsync(`DELETE FROM categories WHERE user_id = ?`, [
      LEGACY_PENDING_ACCOUNT_ID,
    ]);
    await tx.runAsync(`DELETE FROM grocery_lists WHERE user_id = ?`, [
      LEGACY_PENDING_ACCOUNT_ID,
    ]);

    return defaultMovedCount + itemRes.changes;
  });

  await setPendingLocalClaimedBy(db, targetUserId);
  return movedItemsCount;
}

/**
 * Discards unowned 'pending-auth-local-account' data when the signed-in user
 * declines importing pre-auth device items.
 */
export async function discardPendingLocalData(
  db: DatabaseRunner,
  declinedByUserId: string
): Promise<void> {
  await db.withTransaction(async (tx) => {
    await tx.runAsync(`DELETE FROM sync_queue WHERE user_id = ?`, [
      LEGACY_PENDING_ACCOUNT_ID,
    ]);
    await tx.runAsync(`DELETE FROM grocery_items WHERE user_id = ?`, [
      LEGACY_PENDING_ACCOUNT_ID,
    ]);
    await tx.runAsync(`DELETE FROM categories WHERE user_id = ?`, [
      LEGACY_PENDING_ACCOUNT_ID,
    ]);
    await tx.runAsync(`DELETE FROM grocery_lists WHERE user_id = ?`, [
      LEGACY_PENDING_ACCOUNT_ID,
    ]);
  });
  await setPendingLocalClaimedBy(db, `declined:${declinedByUserId}`);
}
