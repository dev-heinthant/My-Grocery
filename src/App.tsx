import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AddItemCard } from './components/AddItemCard';
import { AuthView } from './components/AuthView';
import { ConfirmModal } from './components/ConfirmModal';
import { EditItemModal } from './components/EditItemModal';
import { GroceryItemRow } from './components/GroceryItemRow';
import { HistoryView } from './components/HistoryView';
import { ActiveWebTab, Navbar } from './components/Navbar';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ShoppingProgressCard } from './components/ShoppingProgressCard';
import { ToastBanner } from './components/ToastBanner';
import { DEFAULT_GROCERY_CATEGORIES } from './constants/categories';
import {
  getItemCanonicalGroupOrName,
  getLocalizedItemName,
  matchesItemSearchQuery,
} from './constants/groceryCatalog';
import { getTranslatedCategory, TRANSLATIONS } from './constants/translations';
import { signOutSession, subscribeToAuthChanges } from './services/authService';
import {
  clearAllGroceryItems,
  clearPurchasedGroceryItems,
  createGroceryItem,
  deleteGroceryItem,
  fetchGroceryItems,
  setGroceryItemPurchased,
  subscribeToGroceryChanges,
  updateGroceryItem,
} from './services/groceryService';
import { clearPersistedAuthSession } from './services/supabaseClient';
import {
  ConfirmAction,
  GroceryCategory,
  GroceryItem,
  Language,
  ThemeMode,
  ToastMessage,
  UserProfile,
} from './types/grocery';

const THEME_PREF_KEY = 'my_grocery_list_theme';
const LANGUAGE_PREF_KEY = 'my_grocery_list_language';

function loadInitialTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_PREF_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'light';
}

function loadInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_PREF_KEY);
    if (saved === 'my' || saved === 'en') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'en';
}

export default function App() {
  const [language, setLanguage] = useState<Language>(loadInitialLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadInitialTheme);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveWebTab>('list');

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = TRANSLATIONS[language];

  const showToast = useCallback(
    (type: ToastMessage['type'], text: string) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToast({ id, type, text });
      toastTimerRef.current = setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, 3600);
    },
    []
  );

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_PREF_KEY, themeMode);
    } catch {
      // Ignore storage access errors
    }
  }, [themeMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_PREF_KEY, language);
    } catch {
      // Ignore storage access errors
    }
  }, [language]);

  // Enforce explicit Login on every fresh page open: purge persisted auth tokens on boot
  useEffect(() => {
    clearPersistedAuthSession();
    const unsubscribe = subscribeToAuthChanges((session, mappedUser) => {
      if (!session || !mappedUser) {
        setUser(null);
        setItems([]);
        setEditingItem(null);
        setConfirmAction(null);
        setIsSettingsOpen(false);
      } else {
        setUser(mappedUser);
      }
    });
    return () => {
      unsubscribe();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadUserItems = useCallback(
    async (userId: string, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoadingItems(true);
      }
      try {
        const fetched = await fetchGroceryItems(userId);
        setItems(fetched);
      } catch (err) {
        showToast(
          'error',
          err instanceof Error ? err.message : 'Unable to load grocery items.'
        );
      } finally {
        setIsLoadingItems(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!user) return;
    void loadUserItems(user.id);
    const unsubscribeRealtime = subscribeToGroceryChanges(user.id, () => {
      void loadUserItems(user.id, { silent: true });
    });
    return () => {
      unsubscribeRealtime();
    };
  }, [user, loadUserItems]);

  const performCreateItem = useCallback(
    async (params: { name: string; category: GroceryCategory; note: string }) => {
      if (!user) return false;
      setIsMutating(true);
      try {
        const created = await createGroceryItem({
          user,
          name: params.name,
          note: params.note,
          category: params.category,
        });
        setItems((prev) => {
          if (prev.some((existing) => existing.id === created.id)) return prev;
          return [created, ...prev];
        });
        const displayName = getLocalizedItemName(created, language);
        showToast('success', t.itemAddedToast.replace('{name}', displayName));
        return true;
      } catch (err) {
        showToast(
          'error',
          err instanceof Error ? err.message : 'Unable to add item.'
        );
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [user, language, t.itemAddedToast, showToast]
  );

  const handleRequestAddItem = useCallback(
    async (params: { name: string; category: GroceryCategory; note: string }) => {
      const candidateGroup = getItemCanonicalGroupOrName({ name: params.name });
      const hasDuplicate = items.some(
        (existing) =>
          getItemCanonicalGroupOrName(existing) === candidateGroup
      );

      if (hasDuplicate) {
        setConfirmAction({
          type: 'duplicate-item',
          name: params.name,
          category: params.category,
          note: params.note,
        });
        return true;
      }

      return performCreateItem(params);
    },
    [items, performCreateItem]
  );

  const handleToggleItemCheckbox = useCallback(
    async (item: GroceryItem) => {
      if (!user) return;
      if (!item.isPurchased) {
        // Require confirmation before marking an unbought item as bought
        setConfirmAction({ type: 'mark-bought', item });
        return;
      }

      setIsMutating(true);
      try {
        const updated = await setGroceryItemPurchased({
          userId: user.id,
          itemId: item.id,
          isPurchased: false,
        });
        setItems((prev) =>
          prev.map((row) => (row.id === updated.id ? updated : row))
        );
        const displayName = getLocalizedItemName(updated, language);
        showToast('info', t.itemRestoredToast.replace('{name}', displayName));
      } catch (err) {
        showToast(
          'error',
          err instanceof Error ? err.message : 'Unable to update item.'
        );
      } finally {
        setIsMutating(false);
      }
    },
    [user, language, t.itemRestoredToast, showToast]
  );

  const handleSaveEdit = useCallback(
    async (params: {
      itemId: string;
      name: string;
      category: GroceryCategory;
      note: string;
    }) => {
      if (!user) return;
      setIsMutating(true);
      try {
        const updated = await updateGroceryItem({
          userId: user.id,
          itemId: params.itemId,
          name: params.name,
          note: params.note,
          category: params.category,
        });
        setItems((prev) =>
          prev.map((row) => (row.id === updated.id ? updated : row))
        );
        setEditingItem(null);
        const displayName = getLocalizedItemName(updated, language);
        showToast('success', t.itemUpdatedToast.replace('{name}', displayName));
      } catch (err) {
        showToast(
          'error',
          err instanceof Error ? err.message : 'Unable to save changes.'
        );
      } finally {
        setIsMutating(false);
      }
    },
    [user, language, t.itemUpdatedToast, showToast]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'sign-out') {
      setConfirmAction(null);
      setIsSettingsOpen(false);
      await signOutSession();
      setUser(null);
      setItems([]);
      setActiveTab('list');
      return;
    }

    if (!user) return;
    setIsMutating(true);

    try {
      switch (confirmAction.type) {
        case 'mark-bought': {
          const updated = await setGroceryItemPurchased({
            userId: user.id,
            itemId: confirmAction.item.id,
            isPurchased: true,
          });
          setItems((prev) =>
            prev.map((row) => (row.id === updated.id ? updated : row))
          );
          const displayName = getLocalizedItemName(updated, language);
          showToast('success', t.itemBoughtToast.replace('{name}', displayName));
          setConfirmAction(null);
          break;
        }
        case 'delete-item': {
          const targetId = confirmAction.item.id;
          const displayName = getLocalizedItemName(confirmAction.item, language);
          await deleteGroceryItem({ userId: user.id, itemId: targetId });
          setItems((prev) => prev.filter((row) => row.id !== targetId));
          showToast('info', t.itemRemovedToast.replace('{name}', displayName));
          setConfirmAction(null);
          break;
        }
        case 'duplicate-item': {
          const { name, category, note } = confirmAction;
          setConfirmAction(null);
          await performCreateItem({ name, category, note });
          break;
        }
        case 'clear-purchased': {
          await clearPurchasedGroceryItems(user.id);
          setItems((prev) => prev.filter((row) => !row.isPurchased));
          showToast('info', t.clearedPurchasedToast);
          setConfirmAction(null);
          break;
        }
        case 'clear-all': {
          await clearAllGroceryItems(user.id);
          setItems([]);
          showToast('info', t.clearedAllToast);
          setConfirmAction(null);
          break;
        }
      }
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Action failed. Please try again.'
      );
    } finally {
      setIsMutating(false);
    }
  }, [
    confirmAction,
    user,
    language,
    t.itemBoughtToast,
    t.itemRemovedToast,
    t.clearedPurchasedToast,
    t.clearedAllToast,
    performCreateItem,
    showToast,
  ]);

  const availableCategories = useMemo(() => {
    const customSet = new Set<string>();
    for (const item of items) {
      if (
        item.category &&
        !DEFAULT_GROCERY_CATEGORIES.includes(
          item.category as (typeof DEFAULT_GROCERY_CATEGORIES)[number]
        )
      ) {
        customSet.add(item.category);
      }
    }
    return ['All', ...DEFAULT_GROCERY_CATEGORIES, ...Array.from(customSet)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      return matchesItemSearchQuery(item, searchQuery);
    });
  }, [items, selectedCategory, searchQuery]);

  const toBuyItems = useMemo(
    () => filteredItems.filter((item) => !item.isPurchased),
    [filteredItems]
  );

  const purchasedItems = useMemo(
    () =>
      filteredItems
        .filter((item) => item.isPurchased)
        .sort(
          (a, b) =>
            (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
        ),
    [filteredItems]
  );

  const totalCount = items.length;
  const purchasedCount = useMemo(
    () => items.filter((item) => item.isPurchased).length,
    [items]
  );
  const toBuyCount = totalCount - purchasedCount;
  const hasActiveFilter =
    selectedCategory !== 'All' || searchQuery.trim().length > 0;

  if (!user) {
    return (
      <>
        <AuthView
          language={language}
          themeMode={themeMode}
          onToggleLanguage={() =>
            setLanguage((prev) => (prev === 'en' ? 'my' : 'en'))
          }
          onToggleTheme={() =>
            setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))
          }
          onAuthenticated={(authenticatedUser) => {
            setUser(authenticatedUser);
            setActiveTab('list');
          }}
        />
        <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <Navbar
        user={user}
        language={language}
        themeMode={themeMode}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onToggleLanguage={() =>
          setLanguage((prev) => (prev === 'en' ? 'my' : 'en'))
        }
        onToggleTheme={() =>
          setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRequestSignOut={() => setConfirmAction({ type: 'sign-out' })}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
        {activeTab === 'history' ? (
          <HistoryView
            items={items}
            language={language}
            themeMode={themeMode}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* Left / Top Column: Add Form & Shopping Progress */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-22">
              <AddItemCard
                language={language}
                isSubmitting={isMutating}
                onAddItem={handleRequestAddItem}
              />
              <ShoppingProgressCard
                total={totalCount}
                toBuy={toBuyCount}
                done={purchasedCount}
                language={language}
              />
            </div>

            {/* Right / Main Column: Search, Filters & Lists */}
            <div className="lg:col-span-8 space-y-5">
              {/* Search & Category Filter Surface */}
              <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label={t.clear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRefreshing(true);
                      void loadUserItems(user.id, { silent: true });
                    }}
                    disabled={isRefreshing || isLoadingItems}
                    aria-label={t.refreshList}
                    title={t.refreshList}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isRefreshing || isLoadingItems ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {availableCategories.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors ${
                          active
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {getTranslatedCategory(cat, language)}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Loading Skeleton */}
              {isLoadingItems ? (
                <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="px-4 py-4 flex items-center gap-3 animate-pulse">
                      <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800/70" />
                      </div>
                    </div>
                  ))}
                </section>
              ) : totalCount === 0 ? (
                /* Empty List State */
                <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-14 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-50">
                    {t.emptyListTitle}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {t.emptyListSubtitle}
                  </p>
                </section>
              ) : filteredItems.length === 0 ? (
                /* No Matching Filter State */
                <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t.noMatchingFilter}
                  </p>
                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-4 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {t.clearFilter}
                    </button>
                  )}
                </section>
              ) : (
                <>
                  {/* To Buy Section */}
                  <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                          {t.toBuySection}
                        </h2>
                        <span className="text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">
                          {toBuyItems.length}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {t.tapCheckboxHint}
                      </span>
                    </div>

                    {toBuyItems.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <Sparkles className="w-6 h-6 mx-auto text-emerald-500" />
                        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {t.allCheckedOff}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {toBuyItems.map((item) => (
                          <GroceryItemRow
                            key={item.id}
                            item={item}
                            language={language}
                            themeMode={themeMode}
                            onToggleCheckbox={handleToggleItemCheckbox}
                            onEdit={setEditingItem}
                            onDelete={(target) =>
                              setConfirmAction({ type: 'delete-item', item: target })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Purchased Section */}
                  <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                          {t.purchasedSection}
                        </h2>
                        <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {purchasedItems.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {purchasedCount > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: 'clear-purchased',
                                count: purchasedCount,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{t.clearPurchased}</span>
                          </button>
                        )}
                        {totalCount > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: 'clear-all',
                                count: totalCount,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.clearAll}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {purchasedItems.length === 0 ? (
                      <div className="px-5 py-7 text-center">
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {t.noPurchasedYet}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {purchasedItems.map((item) => (
                          <GroceryItemRow
                            key={item.id}
                            item={item}
                            language={language}
                            themeMode={themeMode}
                            onToggleCheckbox={handleToggleItemCheckbox}
                            onEdit={setEditingItem}
                            onDelete={(target) =>
                              setConfirmAction({ type: 'delete-item', item: target })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <EditItemModal
        item={editingItem}
        language={language}
        isSubmitting={isMutating}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        user={user}
        language={language}
        themeMode={themeMode}
        onClose={() => setIsSettingsOpen(false)}
        onSetLanguage={setLanguage}
        onSetThemeMode={setThemeMode}
        onUserUpdated={setUser}
        onNotify={(type, text) => showToast(type, text)}
        onRequestSignOut={() => setConfirmAction({ type: 'sign-out' })}
      />

      <ConfirmModal
        action={confirmAction}
        language={language}
        isSubmitting={isMutating}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />

      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
