import { createClient, SupabaseClient } from '@supabase/supabase-js';

const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;

export const SUPABASE_URL =
  viteEnv?.VITE_SUPABASE_URL || 'https://wybiesfczyysdneyiwvl.supabase.co';

export const SUPABASE_ANON_KEY =
  viteEnv?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_6uOCoWoPWHr7vjrY2lt8Sw_MdvHRESA';

function deriveSupabaseAuthStorageKey(url: string): string {
  try {
    const hostPrefix = new URL(url).hostname.split('.')[0];
    return `sb-${hostPrefix}-auth-token`;
  } catch {
    return 'sb-auth-token';
  }
}

const SUPABASE_AUTH_STORAGE_KEY = deriveSupabaseAuthStorageKey(SUPABASE_URL);
const memorySessionStorage = new Map<string, string>();

const inMemoryAuthStorage = {
  getItem(key: string): string | null {
    return memorySessionStorage.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    memorySessionStorage.set(key, value);
  },
  removeItem(key: string): void {
    memorySessionStorage.delete(key);
  },
};

/**
 * Purges any previously persisted Supabase auth session tokens from browser storage
 * so refreshing or reopening the website always presents the Login page first.
 */
export function clearPersistedAuthSession(): void {
  memorySessionStorage.clear();
  if (typeof window === 'undefined') return;

  try {
    const storages = [window.localStorage, window.sessionStorage];
    for (const store of storages) {
      if (!store) continue;
      const keysToRemove: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (
          key &&
          (key === SUPABASE_AUTH_STORAGE_KEY ||
            (key.startsWith('sb-') && key.includes('auth-token')))
        ) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        store.removeItem(key);
      }
    }
  } catch {
    // Ignore storage access errors in restricted browser environments
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: inMemoryAuthStorage,
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return clientInstance;
}
