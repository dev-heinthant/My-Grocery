import { DatabaseRunner } from '@/database/types';
import {
  getLastSyncedAtPreference,
  getServerClockOffsetMs,
  setLastSyncedAtPreference,
  setServerClockOffsetMs,
} from '@/repositories/preferencesRepository';
import {
  markPushDeleteSucceeded,
  markPushFailed,
  markPushUpsertSucceeded,
  reconcileRemoteSnapshot,
  RemoteGroceryRow,
} from '@/repositories/syncRepository';
import { checkIsOnline } from '@/services/authService';
import {
  getLastObservedServerClock,
  getSupabaseClient,
} from '@/services/supabaseClient';

export interface SyncRunResult {
  status: 'synced' | 'offline' | 'error';
  pushedCount: number;
  pulledCount: number;
  failedCount: number;
  lastSyncedAt: number | null;
  error: string | null;
}

const inFlightSyncByUser = new Map<string, Promise<SyncRunResult>>();

async function executeSynchronize(
  db: DatabaseRunner,
  userId: string,
  defaultListId: string
): Promise<SyncRunResult> {
  const online = await checkIsOnline();
  if (!online) {
    const lastSyncedAt = await getLastSyncedAtPreference(db, userId);
    return {
      status: 'offline',
      pushedCount: 0,
      pulledCount: 0,
      failedCount: 0,
      lastSyncedAt,
      error: null,
    };
  }

  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.id !== userId) {
    const lastSyncedAt = await getLastSyncedAtPreference(db, userId);
    return {
      status: 'error',
      pushedCount: 0,
      pulledCount: 0,
      failedCount: 0,
      lastSyncedAt,
      error: 'Authentication session is missing or does not match account.',
    };
  }

  try {
    // 1. Pull authoritative remote snapshot scoped strictly by user_id
    const { data, error: fetchError } = await supabase
      .from('grocery_items')
      .select(
        'id, name, note, category, is_purchased, created_at, updated_at, created_by_name, created_by_email, user_id'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      const lastSyncedAt = await getLastSyncedAtPreference(db, userId);
      return {
        status: 'error',
        pushedCount: 0,
        pulledCount: 0,
        failedCount: 0,
        lastSyncedAt,
        error: fetchError.message,
      };
    }

    // 2. Compute server-normalized clock offset from HTTP Date header
    const observed = getLastObservedServerClock();
    let clockOffsetMs = await getServerClockOffsetMs(db);
    if (observed.offsetMs != null && observed.serverDateMs != null) {
      clockOffsetMs = observed.offsetMs;
      await setServerClockOffsetMs(db, clockOffsetMs);
    }
    const serverNowMs =
      observed.serverDateMs != null
        ? observed.serverDateMs
        : Date.now() + clockOffsetMs;

    const remoteRows = (data || []) as RemoteGroceryRow[];

    // 3. Reconcile remote snapshot against local SQLite & sync_queue atomically
    const reconciled = await reconcileRemoteSnapshot(
      db,
      userId,
      defaultListId,
      remoteRows,
      serverNowMs,
      clockOffsetMs
    );

    // 4. Push local-winning UPSERT / DELETE operations sequentially, preserving failures
    let pushedCount = 0;
    let failedCount = 0;
    let lastError: string | null = null;

    for (const op of reconciled.pushOperations) {
      if (op.operation === 'DELETE') {
        const { error: deleteErr } = await supabase
          .from('grocery_items')
          .delete()
          .eq('id', op.remoteId)
          .eq('user_id', userId);

        if (deleteErr) {
          failedCount++;
          lastError = deleteErr.message;
          await markPushFailed(db, userId, op.itemId, deleteErr.message);
        } else {
          pushedCount++;
          await markPushDeleteSucceeded(db, userId, op.itemId);
        }
      } else {
        const { error: upsertErr } = await supabase
          .from('grocery_items')
          .upsert(op.payload, { onConflict: 'id' });

        if (upsertErr) {
          failedCount++;
          lastError = upsertErr.message;
          await markPushFailed(db, userId, op.itemId, upsertErr.message);
        } else {
          pushedCount++;
          await markPushUpsertSucceeded(
            db,
            userId,
            op.itemId,
            op.payload.id,
            op.payload.created_at,
            op.payload.updated_at,
            serverNowMs
          );
        }
      }
    }

    const pulledCount =
      reconciled.pulledInserted + reconciled.pulledUpdated + reconciled.pulledDeleted;

    if (failedCount === 0) {
      await setLastSyncedAtPreference(db, userId, serverNowMs);
      return {
        status: 'synced',
        pushedCount,
        pulledCount,
        failedCount: 0,
        lastSyncedAt: serverNowMs,
        error: null,
      };
    }

    const lastSyncedAt = await getLastSyncedAtPreference(db, userId);
    return {
      status: 'error',
      pushedCount,
      pulledCount,
      failedCount,
      lastSyncedAt,
      error: lastError,
    };
  } catch (err) {
    const lastSyncedAt = await getLastSyncedAtPreference(db, userId);
    return {
      status: 'error',
      pushedCount: 0,
      pulledCount: 0,
      failedCount: 0,
      lastSyncedAt,
      error: err instanceof Error ? err.message : 'Synchronization failed.',
    };
  }
}

export function synchronizeAccount(
  db: DatabaseRunner,
  userId: string,
  defaultListId: string
): Promise<SyncRunResult> {
  const existing = inFlightSyncByUser.get(userId);
  if (existing) {
    return existing;
  }

  const run = executeSynchronize(db, userId, defaultListId).finally(() => {
    inFlightSyncByUser.delete(userId);
  });
  inFlightSyncByUser.set(userId, run);
  return run;
}

export function subscribeToRemoteGroceryChanges(
  userId: string,
  onChange: () => void
): () => void {
  const supabase = getSupabaseClient();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const channel = supabase
    .channel(`grocery-items-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'grocery_items',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          onChange();
        }, 400);
      }
    )
    .subscribe();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    supabase.removeChannel(channel);
  };
}
