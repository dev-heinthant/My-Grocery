import { Platform } from 'react-native';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type * as SecureStoreTypes from 'expo-secure-store';

function getSecureStore(): typeof SecureStoreTypes | null {
  try {
    return require('expo-secure-store') as typeof SecureStoreTypes;
  } catch {
    return null;
  }
}

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wybiesfczyysdneyiwvl.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
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

let lastObservedServerDateMs: number | null = null;
let lastObservedServerOffsetMs: number | null = null;

export function getLastObservedServerClock(): {
  serverDateMs: number | null;
  offsetMs: number | null;
} {
  return {
    serverDateMs: lastObservedServerDateMs,
    offsetMs: lastObservedServerOffsetMs,
  };
}

function sanitizeSecureKey(rawKey: string): string {
  return rawKey.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Session-only in-memory storage adapter so authentication remains active during
 * the current app session/tab, while never persisting sessions across cold launches
 * or browser refreshes.
 */
const inMemoryAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    return memorySessionStorage.get(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    memorySessionStorage.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    memorySessionStorage.delete(key);
  },
};

/**
 * Purges any previously persisted Supabase auth session tokens from device storage
 * (SecureStore on Android/iOS, localStorage/sessionStorage on Web) so stale tokens
 * from earlier builds or sessions can never auto-authenticate on startup.
 */
export async function clearPersistedAuthSession(): Promise<void> {
  memorySessionStorage.clear();

  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined') {
        const storages = [window.localStorage, window.sessionStorage];
        for (const store of storages) {
          if (!store) continue;
          const keysToRemove: string[] = [];
          for (let i = 0; i < store.length; i++) {
            const k = store.key(i);
            if (
              k &&
              (k === SUPABASE_AUTH_STORAGE_KEY ||
                (k.startsWith('sb-') && k.includes('auth-token')))
            ) {
              keysToRemove.push(k);
            }
          }
          for (const k of keysToRemove) {
            store.removeItem(k);
          }
        }
      }
    } catch {
      // Ignore storage access errors in restricted browser contexts
    }
    return;
  }

  const SecureStore = getSecureStore();
  if (!SecureStore) return;

  const candidateKeys = [
    sanitizeSecureKey(SUPABASE_AUTH_STORAGE_KEY),
    sanitizeSecureKey(`${SUPABASE_AUTH_STORAGE_KEY}-user`),
  ];

  for (const safeKey of candidateKeys) {
    try {
      const chunkCountRaw = await SecureStore.getItemAsync(`${safeKey}.__chunks`);
      if (chunkCountRaw) {
        const count = Number(chunkCountRaw);
        if (Number.isInteger(count) && count > 0) {
          for (let i = 0; i < count; i++) {
            await SecureStore.deleteItemAsync(`${safeKey}.__chunk_${i}`);
          }
        }
        await SecureStore.deleteItemAsync(`${safeKey}.__chunks`);
      }
      await SecureStore.deleteItemAsync(safeKey);
    } catch {
      // Ignore SecureStore cleanup errors
    }
  }
}

const clockAwareFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  try {
    const dateHeader = response.headers.get('date');
    if (dateHeader) {
      const parsed = Date.parse(dateHeader);
      if (Number.isFinite(parsed) && parsed > 0) {
        lastObservedServerDateMs = parsed;
        lastObservedServerOffsetMs = parsed - Date.now();
      }
    }
  } catch {
    // Ignore header parse errors
  }
  return response;
};

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
      global: {
        fetch: clockAwareFetch,
      },
    });
  }
  return clientInstance;
}
