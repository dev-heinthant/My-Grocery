import { DatabaseRunner } from '@/database/types';
import { Language, ThemeMode } from '@/types/grocery';

const KEY_THEME = 'theme_mode';
const KEY_LANGUAGE = 'language_code';
const KEY_ACTIVE_LIST_PREFIX = 'active_list_id:';
const KEY_SERVER_CLOCK_OFFSET = 'server_clock_offset_ms';
const KEY_LAST_AUTH_USER = 'last_authenticated_user_id';
const KEY_PENDING_CLAIMED_BY = 'pending_local_data_claimed_by';
const KEY_LAST_SYNCED_PREFIX = 'last_synced_at:';
const KEY_LAST_BACKUP_PREFIX = 'last_backup_at:';

export async function getPreference(
  db: DatabaseRunner,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_preferences WHERE key = ?`,
    [key]
  );
  return row?.value ?? null;
}

export async function setPreference(
  db: DatabaseRunner,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    `INSERT INTO app_preferences (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = excluded.updated_at`,
    [key, value, Date.now()]
  );
}

export async function getThemePreference(db: DatabaseRunner): Promise<ThemeMode | null> {
  const value = await getPreference(db, KEY_THEME);
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return null;
}

export async function setThemePreference(
  db: DatabaseRunner,
  theme: ThemeMode
): Promise<void> {
  await setPreference(db, KEY_THEME, theme);
}

export async function getLanguagePreference(db: DatabaseRunner): Promise<Language | null> {
  const value = await getPreference(db, KEY_LANGUAGE);
  if (value === 'en' || value === 'my') {
    return value;
  }
  return null;
}

export async function setLanguagePreference(
  db: DatabaseRunner,
  language: Language
): Promise<void> {
  await setPreference(db, KEY_LANGUAGE, language);
}

export async function getActiveListIdPreference(
  db: DatabaseRunner,
  userId: string
): Promise<string | null> {
  return getPreference(db, `${KEY_ACTIVE_LIST_PREFIX}${userId}`);
}

export async function setActiveListIdPreference(
  db: DatabaseRunner,
  userId: string,
  listId: string
): Promise<void> {
  await setPreference(db, `${KEY_ACTIVE_LIST_PREFIX}${userId}`, listId);
}

export async function getServerClockOffsetMs(db: DatabaseRunner): Promise<number> {
  const raw = await getPreference(db, KEY_SERVER_CLOCK_OFFSET);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

export async function setServerClockOffsetMs(
  db: DatabaseRunner,
  offsetMs: number
): Promise<void> {
  if (!Number.isFinite(offsetMs)) return;
  await setPreference(db, KEY_SERVER_CLOCK_OFFSET, String(Math.trunc(offsetMs)));
}

export async function getLastAuthenticatedUserId(
  db: DatabaseRunner
): Promise<string | null> {
  return getPreference(db, KEY_LAST_AUTH_USER);
}

export async function setLastAuthenticatedUserId(
  db: DatabaseRunner,
  userId: string
): Promise<void> {
  await setPreference(db, KEY_LAST_AUTH_USER, userId);
}

export async function getPendingLocalClaimedBy(
  db: DatabaseRunner
): Promise<string | null> {
  return getPreference(db, KEY_PENDING_CLAIMED_BY);
}

export async function setPendingLocalClaimedBy(
  db: DatabaseRunner,
  userId: string
): Promise<void> {
  await setPreference(db, KEY_PENDING_CLAIMED_BY, userId);
}

export async function getLastSyncedAtPreference(
  db: DatabaseRunner,
  userId: string
): Promise<number | null> {
  const raw = await getPreference(db, `${KEY_LAST_SYNCED_PREFIX}${userId}`);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function setLastSyncedAtPreference(
  db: DatabaseRunner,
  userId: string,
  timestamp: number
): Promise<void> {
  await setPreference(db, `${KEY_LAST_SYNCED_PREFIX}${userId}`, String(Math.trunc(timestamp)));
}

export async function getLastBackupAtPreference(
  db: DatabaseRunner,
  userId: string
): Promise<number | null> {
  const raw = await getPreference(db, `${KEY_LAST_BACKUP_PREFIX}${userId}`);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function setLastBackupAtPreference(
  db: DatabaseRunner,
  userId: string,
  timestamp: number
): Promise<void> {
  await setPreference(db, `${KEY_LAST_BACKUP_PREFIX}${userId}`, String(Math.trunc(timestamp)));
}
