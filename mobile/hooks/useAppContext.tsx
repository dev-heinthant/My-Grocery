import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import type * as NetworkTypes from 'expo-network';
import {
  getItemCanonicalGroupOrName,
  getLocalizedItemName,
  resolveCatalogKey,
} from '@/constants/groceryCatalog';
import { AppThemeColors, getThemeColors } from '@/constants/theme';
import { getTranslatedCategory, TRANSLATIONS, Translations } from '@/constants/translations';
import { getDatabase } from '@/database/client';
import { ensureAccountSeeded } from '@/database/migrations';
import { DatabaseRunner } from '@/database/types';
import {
  claimPendingLocalData,
  discardPendingLocalData,
  inspectClaimablePendingData,
} from '@/repositories/accountMigrationRepository';
import * as categoryRepo from '@/repositories/categoryRepository';
import * as groceryRepo from '@/repositories/groceryRepository';
import * as listRepo from '@/repositories/listRepository';
import * as preferencesRepo from '@/repositories/preferencesRepository';
import {
  checkIsOnline,
  signInWithEmail,
  signOutSession,
  signUpWithEmail,
  subscribeToAuthChanges,
  updateUserDisplayName,
  updateUserPassword,
} from '@/services/authService';
import { clearPersistedAuthSession } from '@/services/supabaseClient';
import {
  subscribeToRemoteGroceryChanges,
  synchronizeAccount,
} from '@/services/syncEngine';
import {
  CategoryRecord,
  ConfirmActionType,
  GroceryCategory,
  GroceryItem,
  GroceryList,
  Language,
  SyncSummary,
  ThemeMode,
  ToastMessage,
  UserProfile,
} from '@/types/grocery';
import { generateId } from '@/utils/id';

const EMPTY_LIST_PLACEHOLDER: GroceryList = {
  id: 'unauthenticated-placeholder-list',
  userId: '',
  name: 'My Grocery List',
  isDefault: true,
  createdAt: 0,
};

interface AddItemInput {
  name: string;
  catalogKey?: string | null;
  note: string;
  category: GroceryCategory;
  quantity: number;
  unit: string;
}

interface UpdateItemInput {
  id: string;
  name: string;
  catalogKey?: string | null;
  note: string;
  category: GroceryCategory;
  quantity: number;
  unit: string;
}

interface AppContextValue {
  isDbReady: boolean;
  isAuthReady: boolean;
  dbError: string | null;
  retryDbInit: () => void;
  theme: ThemeMode;
  colors: AppThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>;
  updateDisplayName: (name: string) => Promise<{ error: string | null }>;
  changePassword: (newPassword: string) => Promise<{ error: string | null }>;
  requestSignOut: () => void;
  signOutNow: () => Promise<void>;
  syncSummary: SyncSummary;
  syncNow: (silent?: boolean) => Promise<void>;
  lists: GroceryList[];
  activeListId: string;
  activeList: GroceryList;
  setActiveListId: (id: string) => void;
  createList: (name: string) => Promise<boolean>;
  renameList: (id: string, name: string) => Promise<boolean>;
  requestDeleteList: (list: GroceryList) => void;
  categories: CategoryRecord[];
  addCustomCategory: (name: string) => Promise<boolean>;
  deleteCustomCategory: (id: string) => Promise<void>;
  items: GroceryItem[];
  activeListItems: GroceryItem[];
  addItem: (input: AddItemInput) => Promise<void>;
  updateItem: (input: UpdateItemInput) => Promise<void>;
  togglePurchased: (id: string) => Promise<void>;
  requestMarkAsBought: (item: GroceryItem) => void;
  requestDeleteItem: (item: GroceryItem) => void;
  requestClearPurchased: () => void;
  requestClearAll: () => void;
  confirmModal: ConfirmActionType | null;
  confirmModalAction: () => Promise<void>;
  cancelModalAction: () => void;
  toast: ToastMessage | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [initAttempt, setInitAttempt] = useState(0);

  const [theme, setThemeState] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );
  const [language, setLanguageState] = useState<Language>('en');
  const [user, setUser] = useState<UserProfile | null>(null);

  const [lists, setLists] = useState<GroceryList[]>([]);
  const [activeListId, setActiveListIdState] = useState<string>('');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmActionType | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [syncSummary, setSyncSummary] = useState<SyncSummary>({
    status: 'idle',
    pendingCount: 0,
    lastSyncedAt: null,
    lastError: null,
    isOnline: true,
  });

  const dbRef = useRef<DatabaseRunner | null>(null);
  const defaultListIdRef = useRef<string>('');
  const userRef = useRef<UserProfile | null>(null);
  userRef.current = user;

  const t = TRANSLATIONS[language];
  const colors = useMemo(() => getThemeColors(theme), [theme]);

  const showToast = useCallback(
    (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
      setToast({
        id: generateId(),
        text,
        type,
      });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const ensureDb = useCallback(async (): Promise<DatabaseRunner> => {
    if (dbRef.current) {
      return dbRef.current;
    }
    const db = await getDatabase();
    dbRef.current = db;
    return db;
  }, []);

  const refreshAccountFromSqlite = useCallback(
    async (db: DatabaseRunner, userId: string, lang: Language) => {
      const defaultListName = TRANSLATIONS[lang].defaultListName;
      const defaultListId = await ensureAccountSeeded(db, userId, defaultListName);
      defaultListIdRef.current = defaultListId;

      const [
        loadedLists,
        loadedCategories,
        loadedItems,
        savedActiveListId,
        pendingQueue,
        lastSyncedAt,
      ] = await Promise.all([
        listRepo.getLists(db, userId),
        categoryRepo.getCategories(db, userId),
        groceryRepo.getItems(db, userId),
        preferencesRepo.getActiveListIdPreference(db, userId),
        groceryRepo.getPendingSyncQueue(db, userId),
        preferencesRepo.getLastSyncedAtPreference(db, userId),
      ]);

      const validActiveList =
        savedActiveListId && loadedLists.some((l) => l.id === savedActiveListId)
          ? savedActiveListId
          : loadedLists.find((l) => l.id === defaultListId)?.id ??
            loadedLists[0]?.id ??
            defaultListId;

      setLists(loadedLists);
      setActiveListIdState(validActiveList);
      setCategories(loadedCategories);
      setItems(loadedItems);
      setSyncSummary((prev) => ({
        ...prev,
        pendingCount: pendingQueue.length,
        lastSyncedAt,
      }));

      return { defaultListId, pendingCount: pendingQueue.length };
    },
    []
  );

  const refreshPendingCount = useCallback(
    async (db: DatabaseRunner, userId: string) => {
      const pending = await groceryRepo.getPendingSyncQueue(db, userId);
      setSyncSummary((prev) => ({
        ...prev,
        pendingCount: pending.length,
      }));
    },
    []
  );

  const syncNow = useCallback(
    async (silent = false) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      const db = await ensureDb();
      const online = await checkIsOnline();
      if (!online) {
        const [pending, lastSyncedAt] = await Promise.all([
          groceryRepo.getPendingSyncQueue(db, currentUser.id),
          preferencesRepo.getLastSyncedAtPreference(db, currentUser.id),
        ]);
        setSyncSummary({
          status: 'offline',
          pendingCount: pending.length,
          lastSyncedAt,
          lastError: null,
          isOnline: false,
        });
        if (!silent) {
          showToast(
            language === 'my'
              ? 'အော့ဖ်လိုင်းဖြစ်နေပါသည်။ အင်တာနက်ရရှိချိန်တွင် Sync လုပ်ပါမည်။'
              : 'You are offline. Changes are saved locally and will sync when back online.',
            'info'
          );
        }
        return;
      }

      setSyncSummary((prev) => ({
        ...prev,
        status: 'syncing',
        isOnline: true,
        lastError: null,
      }));

      const defaultListId =
        defaultListIdRef.current ||
        (await ensureAccountSeeded(
          db,
          currentUser.id,
          TRANSLATIONS[language].defaultListName
        ));
      defaultListIdRef.current = defaultListId;

      const result = await synchronizeAccount(db, currentUser.id, defaultListId);

      // Guard against account switching mid-sync
      if (userRef.current?.id !== currentUser.id) return;

      const [reloadedItems, pendingAfter] = await Promise.all([
        groceryRepo.getItems(db, currentUser.id),
        groceryRepo.getPendingSyncQueue(db, currentUser.id),
      ]);
      setItems(reloadedItems);

      if (result.status === 'offline') {
        setSyncSummary({
          status: 'offline',
          pendingCount: pendingAfter.length,
          lastSyncedAt: result.lastSyncedAt,
          lastError: null,
          isOnline: false,
        });
      } else if (result.status === 'error') {
        setSyncSummary({
          status: 'error',
          pendingCount: pendingAfter.length,
          lastSyncedAt: result.lastSyncedAt,
          lastError: result.error,
          isOnline: true,
        });
        if (!silent && result.error) {
          showToast(result.error, 'warning');
        }
      } else {
        setSyncSummary({
          status: 'synced',
          pendingCount: pendingAfter.length,
          lastSyncedAt: result.lastSyncedAt,
          lastError: null,
          isOnline: true,
        });
        if (!silent) {
          showToast(
            language === 'my' ? 'Cloud နှင့် Sync ပြီးပါပြီ' : 'Synced with cloud'
          );
        }
      }
    },
    [ensureDb, language, showToast]
  );

  // Boot SQLite preferences and clear any persisted auth tokens so every launch starts at Login
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        setDbError(null);
        const [db] = await Promise.all([ensureDb(), clearPersistedAuthSession()]);

        const [savedTheme, savedLanguage, online] = await Promise.all([
          preferencesRepo.getThemePreference(db),
          preferencesRepo.getLanguagePreference(db),
          checkIsOnline(),
        ]);

        if (cancelled) return;

        if (savedTheme) setThemeState(savedTheme);
        if (savedLanguage) setLanguageState(savedLanguage);

        setSyncSummary((prev) => ({
          ...prev,
          isOnline: online,
          status: online ? 'idle' : 'offline',
        }));

        setUser(null);
        setIsDbReady(true);
        setIsAuthReady(true);
      } catch (err) {
        if (cancelled) return;
        setDbError(
          err instanceof Error ? err.message : 'Failed to initialize application storage'
        );
        setIsDbReady(false);
        setIsAuthReady(true);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [ensureDb, initAttempt]);

  // Listen for external Supabase auth events (e.g. token refresh, remote sign-out)
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((_session, nextUser) => {
      setUser((prev) => {
        if (prev?.id === nextUser?.id && prev?.displayName === nextUser?.displayName) {
          return prev;
        }
        return nextUser;
      });
      if (!nextUser) {
        // Clear in-memory account state immediately so no previous user's items stay visible
        setLists([]);
        setActiveListIdState('');
        setCategories([]);
        setItems([]);
        defaultListIdRef.current = '';
        setSyncSummary((prev) => ({
          ...prev,
          status: prev.isOnline ? 'idle' : 'offline',
          pendingCount: 0,
          lastSyncedAt: null,
          lastError: null,
        }));
      }
    });
    return unsubscribe;
  }, []);

  // Network reconnect, AppState foreground, and Supabase Realtime listeners when signed in
  useEffect(() => {
    if (!user || !isDbReady) return;

    let netSub: { remove: () => void } | null = null;
    try {
      const Network = require('expo-network') as typeof NetworkTypes;
      netSub = Network.addNetworkStateListener((state) => {
        const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
        setSyncSummary((prev) => ({
          ...prev,
          isOnline: online,
          status: online ? prev.status : 'offline',
        }));
        if (online) {
          syncNow(true).catch(() => {});
        }
      });
    } catch {
      // Fallback safely if ExpoNetwork native module is unavailable
    }

    const appSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncNow(true).catch(() => {});
      }
    });

    const unsubscribeRealtime = subscribeToRemoteGroceryChanges(user.id, () => {
      syncNow(true).catch(() => {});
    });

    return () => {
      netSub?.remove();
      appSub.remove();
      unsubscribeRealtime();
    };
  }, [isDbReady, syncNow, user]);

  const retryDbInit = useCallback(() => {
    setInitAttempt((prev) => prev + 1);
  }, []);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeState(mode);
      ensureDb()
        .then((db) => preferencesRepo.setThemePreference(db, mode))
        .catch(() => {});
    },
    [ensureDb]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      ensureDb()
        .then((db) => preferencesRepo.setThemePreference(db, next))
        .catch(() => {});
      return next;
    });
  }, [ensureDb]);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      ensureDb()
        .then((db) => preferencesRepo.setLanguagePreference(db, lang))
        .catch(() => {});
    },
    [ensureDb]
  );

  const setActiveListId = useCallback(
    (id: string) => {
      const currentUser = userRef.current;
      setActiveListIdState(id);
      if (!currentUser) return;
      ensureDb()
        .then((db) => preferencesRepo.setActiveListIdPreference(db, currentUser.id, id))
        .catch(() => {});
    },
    [ensureDb]
  );

  const handleAuthenticatedAccountEntry = useCallback(
    async (authedUser: UserProfile, welcomeMessage: string) => {
      const db = await ensureDb();
      setUser(authedUser);
      setSyncSummary((prev) => ({
        ...prev,
        isOnline: true,
        status: prev.status === 'offline' ? 'idle' : prev.status,
      }));
      await refreshAccountFromSqlite(db, authedUser.id, language);

      const claimCheck = await inspectClaimablePendingData(db, authedUser.id);
      await preferencesRepo.setLastAuthenticatedUserId(db, authedUser.id);

      showToast(welcomeMessage);

      if (claimCheck.canOfferClaim) {
        setConfirmModal({
          type: 'claim-local-data',
          summary: {
            itemCount: claimCheck.itemCount,
            listCount: claimCheck.listCount,
            customCategoryCount: claimCheck.customCategoryCount,
          },
          targetUserEmail: authedUser.email,
        });
      } else {
        syncNow(true).catch(() => {});
      }
    },
    [ensureDb, language, refreshAccountFromSqlite, showToast, syncNow]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInWithEmail(email, password, language);
      if (result.error || !result.user) {
        return { error: result.error || 'Failed to sign in.' };
      }

      await handleAuthenticatedAccountEntry(
        result.user,
        language === 'my'
          ? `ပြန်လည်ကြိုဆိုပါတယ် ${result.user.displayName}`
          : `Welcome back, ${result.user.displayName}!`
      );
      return { error: null };
    },
    [handleAuthenticatedAccountEntry, language]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const result = await signUpWithEmail(email, password, displayName, language);
      if (result.error || !result.user) {
        return {
          error: result.error || 'Failed to create account.',
          requiresEmailConfirmation: result.requiresEmailConfirmation,
        };
      }

      await handleAuthenticatedAccountEntry(
        result.user,
        language === 'my'
          ? `မင်္ဂလာပါ ${result.user.displayName}`
          : `Welcome, ${result.user.displayName}!`
      );
      return { error: null };
    },
    [handleAuthenticatedAccountEntry, language]
  );

  const updateDisplayName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return { error: t.usernameCannotBeEmpty };
      }
      const res = await updateUserDisplayName(trimmed);
      if (res.error || !res.user) {
        return { error: res.error || 'Failed to update display name.' };
      }
      setUser(res.user);
      showToast(
        language === 'my'
          ? `အမည်ကို "${trimmed}" သို့ ပြင်ဆင်ပြီးပါပြီ`
          : `Name updated to "${trimmed}"`
      );
      return { error: null };
    },
    [language, showToast, t.usernameCannotBeEmpty]
  );

  const changePassword = useCallback(
    async (newPassword: string) => {
      const res = await updateUserPassword(newPassword);
      if (res.error) return { error: res.error };
      showToast(
        language === 'my'
          ? 'စကားဝှက် ပြောင်းလဲပြီးပါပြီ'
          : 'Password updated successfully'
      );
      return { error: null };
    },
    [language, showToast]
  );

  const signOutNow = useCallback(async () => {
    await signOutSession();
    setUser(null);
    setLists([]);
    setActiveListIdState('');
    setCategories([]);
    setItems([]);
    defaultListIdRef.current = '';
    setConfirmModal(null);
    setSyncSummary((prev) => ({
      ...prev,
      status: prev.isOnline ? 'idle' : 'offline',
      pendingCount: 0,
      lastSyncedAt: null,
      lastError: null,
    }));
    showToast(
      language === 'my' ? 'အကောင့်မှ ထွက်လိုက်ပါပြီ' : 'Signed out',
      'info'
    );
  }, [language, showToast]);

  const requestSignOut = useCallback(() => {
    setConfirmModal({ type: 'sign-out' });
  }, []);

  const activeList = useMemo(() => {
    return (
      lists.find((l) => l.id === activeListId) ?? lists[0] ?? EMPTY_LIST_PLACEHOLDER
    );
  }, [lists, activeListId]);

  const activeListItems = useMemo(() => {
    if (!activeList.id || activeList.id === EMPTY_LIST_PLACEHOLDER.id) return [];
    return items.filter((item) => item.listId === activeList.id && !item.isDeletedLocally);
  }, [items, activeList.id]);

  const insertNewItem = useCallback(
    async (input: AddItemInput) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      const db = await ensureDb();
      const created = await groceryRepo.addItem(db, currentUser.id, {
        listId: activeList.id,
        name: input.name.trim(),
        catalogKey: input.catalogKey,
        note: input.note.trim(),
        category: input.category || 'Other',
        quantity: input.quantity > 0 ? input.quantity : 1,
        unit: input.unit.trim() || 'pcs',
        createdByName: currentUser.displayName,
        createdByEmail: currentUser.email,
      });

      setItems((prev) => [created, ...prev]);
      await refreshPendingCount(db, currentUser.id);
      const catLabel = getTranslatedCategory(created.category, language);
      const displayName = getLocalizedItemName(created, language);
      showToast(
        language === 'my'
          ? `"${displayName}" ကို ${catLabel} တွင် ထည့်ပြီးပါပြီ`
          : `Added "${displayName}" to ${catLabel}`
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      syncNow(true).catch(() => {});
    },
    [activeList.id, ensureDb, language, refreshPendingCount, showToast, syncNow]
  );

  const addItem = useCallback(
    async (input: AddItemInput) => {
      const trimmed = input.name.trim();
      if (!trimmed) return;

      const incomingKey =
        input.catalogKey !== undefined
          ? input.catalogKey
          : resolveCatalogKey(trimmed) ?? null;
      const incomingCanonical = getItemCanonicalGroupOrName({
        name: trimmed,
        catalogKey: incomingKey,
      });

      const duplicate = activeListItems.find(
        (existing) => getItemCanonicalGroupOrName(existing) === incomingCanonical
      );
      if (duplicate) {
        setConfirmModal({
          type: 'duplicate-item',
          pendingItem: {
            name: trimmed,
            note: input.note.trim(),
            category: input.category,
            quantity: input.quantity > 0 ? input.quantity : 1,
            unit: input.unit.trim() || 'pcs',
          },
        });
        return;
      }

      await insertNewItem({
        ...input,
        name: trimmed,
        catalogKey: incomingKey,
      });
    },
    [activeListItems, insertNewItem]
  );

  const updateItem = useCallback(
    async (input: UpdateItemInput) => {
      const currentUser = userRef.current;
      const trimmed = input.name.trim();
      if (!currentUser || !trimmed) return;

      const db = await ensureDb();
      const updated = await groceryRepo.updateItem(db, currentUser.id, {
        id: input.id,
        name: trimmed,
        catalogKey: input.catalogKey,
        note: input.note.trim(),
        category: input.category,
        quantity: input.quantity > 0 ? input.quantity : 1,
        unit: input.unit.trim() || 'pcs',
      });

      if (!updated) return;

      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      await refreshPendingCount(db, currentUser.id);
      const displayName = getLocalizedItemName(updated, language);
      showToast(
        language === 'my' ? `"${displayName}" ကို ပြင်ဆင်ပြီးပါပြီ` : `Updated "${displayName}"`
      );
      syncNow(true).catch(() => {});
    },
    [ensureDb, language, refreshPendingCount, showToast, syncNow]
  );

  const togglePurchased = useCallback(
    async (id: string) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      const db = await ensureDb();
      const updated = await groceryRepo.togglePurchased(db, currentUser.id, id);
      if (!updated) return;

      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      await refreshPendingCount(db, currentUser.id);
      Haptics.selectionAsync().catch(() => {});
      const displayName = getLocalizedItemName(updated, language);
      showToast(
        updated.isPurchased
          ? language === 'my'
            ? `"${displayName}" ကို ဝယ်ပြီးအဖြစ် မှတ်သားလိုက်ပါပြီ`
            : `Marked "${displayName}" as purchased`
          : language === 'my'
          ? `"${displayName}" ကို ဝယ်ယူရန်သို့ ပြန်လည်ရွှေ့လိုက်ပါပြီ`
          : `Moved "${displayName}" back to To Buy`,
        'info'
      );
      syncNow(true).catch(() => {});
    },
    [ensureDb, language, refreshPendingCount, showToast, syncNow]
  );

  const requestMarkAsBought = useCallback((item: GroceryItem) => {
    setConfirmModal({ type: 'mark-bought', item });
  }, []);

  const requestDeleteItem = useCallback((item: GroceryItem) => {
    setConfirmModal({ type: 'delete-item', item });
  }, []);

  const requestClearPurchased = useCallback(() => {
    const count = activeListItems.filter((i) => i.isPurchased).length;
    if (count === 0) return;
    setConfirmModal({ type: 'clear-purchased', count });
  }, [activeListItems]);

  const requestClearAll = useCallback(() => {
    if (activeListItems.length === 0) return;
    setConfirmModal({ type: 'clear-all', count: activeListItems.length });
  }, [activeListItems.length]);

  const createList = useCallback(
    async (name: string): Promise<boolean> => {
      const currentUser = userRef.current;
      const trimmed = name.trim();
      if (!currentUser || !trimmed) return false;

      const db = await ensureDb();
      const newList = await listRepo.createList(db, currentUser.id, trimmed);
      await preferencesRepo.setActiveListIdPreference(db, currentUser.id, newList.id);

      setLists((prev) => [...prev, newList]);
      setActiveListIdState(newList.id);
      showToast(
        language === 'my' ? `"${trimmed}" စာရင်းအသစ် ဖန်တီးပြီးပါပြီ` : `Created "${trimmed}"`
      );
      return true;
    },
    [ensureDb, language, showToast]
  );

  const renameList = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      const currentUser = userRef.current;
      const trimmed = name.trim();
      if (!currentUser || !trimmed) return false;

      const db = await ensureDb();
      const updated = await listRepo.renameList(db, currentUser.id, id, trimmed);
      if (!updated) return false;

      const now = Date.now();
      setLists((prev) =>
        prev.map((l) => (l.id === id ? { ...l, name: trimmed, updatedAt: now } : l))
      );
      showToast(
        language === 'my' ? `"${trimmed}" သို့ အမည်ပြောင်းပြီးပါပြီ` : `Renamed to "${trimmed}"`
      );
      return true;
    },
    [ensureDb, language, showToast]
  );

  const requestDeleteList = useCallback(
    (list: GroceryList) => {
      if (lists.length <= 1) {
        showToast(
          language === 'my'
            ? 'အနည်းဆုံး စာရင်းတစ်ခု ရှိရပါမည်'
            : 'At least one grocery list is required',
          'warning'
        );
        return;
      }
      setConfirmModal({ type: 'delete-list', list });
    },
    [language, lists.length, showToast]
  );

  const addCustomCategory = useCallback(
    async (name: string): Promise<boolean> => {
      const currentUser = userRef.current;
      const trimmed = name.trim();
      if (!currentUser || !trimmed) return false;

      const db = await ensureDb();
      const created = await categoryRepo.addCustomCategory(db, currentUser.id, trimmed);
      if (!created) {
        showToast(
          language === 'my' ? 'ဤအမျိုးအစား ရှိနှင့်ပြီးဖြစ်သည်' : 'Category already exists',
          'warning'
        );
        return false;
      }

      setCategories((prev) => [...prev, created]);
      showToast(
        language === 'my' ? `"${trimmed}" အမျိုးအစား ထည့်ပြီးပါပြီ` : `Added category "${trimmed}"`
      );
      return true;
    },
    [ensureDb, language, showToast]
  );

  const deleteCustomCategory = useCallback(
    async (id: string) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      const db = await ensureDb();
      const deletedName = await categoryRepo.deleteCustomCategory(db, currentUser.id, id);
      if (!deletedName) return;

      const [reloadedCategories, reloadedItems] = await Promise.all([
        categoryRepo.getCategories(db, currentUser.id),
        groceryRepo.getItems(db, currentUser.id),
      ]);
      setCategories(reloadedCategories);
      setItems(reloadedItems);
      await refreshPendingCount(db, currentUser.id);
      showToast(
        language === 'my'
          ? `"${deletedName}" အမျိုးအစားကို ဖျက်လိုက်ပါပြီ`
          : `Removed category "${deletedName}"`,
        'info'
      );
      syncNow(true).catch(() => {});
    },
    [ensureDb, language, refreshPendingCount, showToast, syncNow]
  );

  const confirmModalAction = useCallback(async () => {
    if (!confirmModal) return;
    const modalSnapshot = confirmModal;
    setConfirmModal(null);

    if (modalSnapshot.type === 'sign-out') {
      await signOutNow();
      return;
    }

    const currentUser = userRef.current;
    if (!currentUser) return;

    const db = await ensureDb();

    switch (modalSnapshot.type) {
      case 'claim-local-data': {
        const defaultId =
          defaultListIdRef.current ||
          (await ensureAccountSeeded(
            db,
            currentUser.id,
            TRANSLATIONS[language].defaultListName
          ));
        const movedCount = await claimPendingLocalData(db, currentUser.id, defaultId);
        await refreshAccountFromSqlite(db, currentUser.id, language);
        showToast(
          language === 'my'
            ? `စက်ထဲရှိ ပစ္စည်း ${movedCount} ခုကို ထည့်သွင်းပြီးပါပြီ`
            : `Imported ${movedCount} offline items into your account`
        );
        syncNow(true).catch(() => {});
        break;
      }
      case 'mark-bought': {
        if (!modalSnapshot.item.isPurchased) {
          await togglePurchased(modalSnapshot.item.id);
        }
        break;
      }
      case 'delete-item': {
        const target = modalSnapshot.item;
        const deleted = await groceryRepo.deleteItem(db, currentUser.id, target.id);
        if (deleted) {
          setItems((prev) => prev.filter((i) => i.id !== target.id));
          await refreshPendingCount(db, currentUser.id);
          const displayName = getLocalizedItemName(target, language);
          showToast(
            language === 'my'
              ? `"${displayName}" ကို ဖျက်လိုက်ပါပြီ`
              : `Deleted "${displayName}"`,
            'info'
          );
          syncNow(true).catch(() => {});
        }
        break;
      }
      case 'duplicate-item': {
        await insertNewItem(modalSnapshot.pendingItem);
        break;
      }
      case 'clear-purchased': {
        const cleared = await groceryRepo.clearPurchased(
          db,
          currentUser.id,
          activeList.id
        );
        setItems((prev) =>
          prev.filter((i) => !(i.listId === activeList.id && i.isPurchased))
        );
        await refreshPendingCount(db, currentUser.id);
        showToast(
          language === 'my'
            ? `ဝယ်ပြီးပစ္စည်း ${cleared} ခုကို ဖယ်ရှားလိုက်ပါပြီ`
            : `Cleared ${cleared} purchased items`
        );
        syncNow(true).catch(() => {});
        break;
      }
      case 'clear-all': {
        await groceryRepo.clearListItems(db, currentUser.id, activeList.id);
        setItems((prev) => prev.filter((i) => i.listId !== activeList.id));
        await refreshPendingCount(db, currentUser.id);
        showToast(
          language === 'my'
            ? 'ဈေးဝယ်စာရင်းတစ်ခုလုံးကို ဖျက်လိုက်ပါပြီ'
            : 'Cleared grocery list',
          'info'
        );
        syncNow(true).catch(() => {});
        break;
      }
      case 'delete-list': {
        const listToDelete = modalSnapshot.list;
        const deleted = await listRepo.deleteList(db, currentUser.id, listToDelete.id);
        if (!deleted) break;

        const remaining = lists.filter((l) => l.id !== listToDelete.id);
        setLists(remaining);
        setItems((prev) => prev.filter((i) => i.listId !== listToDelete.id));
        if (activeListId === listToDelete.id && remaining.length > 0) {
          const fallbackId = remaining[0].id;
          setActiveListIdState(fallbackId);
          await preferencesRepo.setActiveListIdPreference(
            db,
            currentUser.id,
            fallbackId
          );
        }
        await refreshPendingCount(db, currentUser.id);
        showToast(
          language === 'my'
            ? `"${listToDelete.name}" စာရင်းကို ဖျက်လိုက်ပါပြီ`
            : `Deleted list "${listToDelete.name}"`,
          'info'
        );
        syncNow(true).catch(() => {});
        break;
      }
    }
  }, [
    activeList.id,
    activeListId,
    confirmModal,
    ensureDb,
    insertNewItem,
    language,
    lists,
    refreshAccountFromSqlite,
    refreshPendingCount,
    showToast,
    signOutNow,
    syncNow,
    togglePurchased,
  ]);

  const cancelModalAction = useCallback(() => {
    const snapshot = confirmModal;
    setConfirmModal(null);

    if (snapshot?.type === 'claim-local-data' && userRef.current) {
      const uid = userRef.current.id;
      ensureDb()
        .then((db) => discardPendingLocalData(db, uid))
        .then(() => syncNow(true))
        .catch(() => {});
    }
  }, [confirmModal, ensureDb, syncNow]);

  const value = useMemo<AppContextValue>(
    () => ({
      isDbReady,
      isAuthReady,
      dbError,
      retryDbInit,
      theme,
      colors,
      toggleTheme,
      setTheme,
      language,
      t,
      setLanguage,
      user,
      signIn,
      signUp,
      updateDisplayName,
      changePassword,
      requestSignOut,
      signOutNow,
      syncSummary,
      syncNow,
      lists,
      activeListId,
      activeList,
      setActiveListId,
      createList,
      renameList,
      requestDeleteList,
      categories,
      addCustomCategory,
      deleteCustomCategory,
      items,
      activeListItems,
      addItem,
      updateItem,
      togglePurchased,
      requestMarkAsBought,
      requestDeleteItem,
      requestClearPurchased,
      requestClearAll,
      confirmModal,
      confirmModalAction,
      cancelModalAction,
      toast,
      showToast,
      dismissToast,
    }),
    [
      isDbReady,
      isAuthReady,
      dbError,
      retryDbInit,
      theme,
      colors,
      toggleTheme,
      setTheme,
      language,
      t,
      setLanguage,
      user,
      signIn,
      signUp,
      updateDisplayName,
      changePassword,
      requestSignOut,
      signOutNow,
      syncSummary,
      syncNow,
      lists,
      activeListId,
      activeList,
      setActiveListId,
      createList,
      renameList,
      requestDeleteList,
      categories,
      addCustomCategory,
      deleteCustomCategory,
      items,
      activeListItems,
      addItem,
      updateItem,
      togglePurchased,
      requestMarkAsBought,
      requestDeleteItem,
      requestClearPurchased,
      requestClearAll,
      confirmModal,
      confirmModalAction,
      cancelModalAction,
      toast,
      showToast,
      dismissToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
