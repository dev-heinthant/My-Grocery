import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Search,
  ShoppingBasket,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';
import { AddItemCard } from '@/components/AddItemCard';
import { AppHeader } from '@/components/AppHeader';
import { EditItemModal } from '@/components/EditItemModal';
import { GroceryItemCard } from '@/components/GroceryItemCard';
import { ShoppingProgressCard } from '@/components/ShoppingProgressCard';
import { matchesItemSearchQuery } from '@/constants/groceryCatalog';
import { getTranslatedCategory } from '@/constants/translations';
import { useApp } from '@/hooks/useAppContext';
import { GroceryItem } from '@/types/grocery';

export default function HomeScreen() {
  const {
    colors,
    t,
    language,
    lists,
    activeList,
    setActiveListId,
    activeListItems,
    requestClearPurchased,
    requestClearAll,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);

  const totalItems = activeListItems.length;
  const purchasedCount = useMemo(
    () => activeListItems.filter((i) => i.isPurchased).length,
    [activeListItems]
  );
  const remainingCount = totalItems - purchasedCount;

  const activeCategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of activeListItems) {
      const cat = item.category || 'Other';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return counts;
  }, [activeListItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim();
    return activeListItems.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (q && !matchesItemSearchQuery(item, q)) {
        return false;
      }
      return true;
    });
  }, [activeListItems, searchQuery, selectedCategory]);

  const toBuyItems = useMemo(
    () => filteredItems.filter((i) => !i.isPurchased),
    [filteredItems]
  );
  const purchasedItems = useMemo(
    () => filteredItems.filter((i) => i.isPurchased),
    [filteredItems]
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <AppHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.bodyWrapper, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Active List Switcher Strip */}
          {lists.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listSwitcherRow}
            >
              {lists.map((list) => {
                const isSelected = list.id === activeList.id;
                return (
                  <Pressable
                    key={list.id}
                    onPress={() => {
                      setActiveListId(list.id);
                      setSelectedCategory('All');
                    }}
                    style={[
                      styles.listPill,
                      {
                        backgroundColor: isSelected ? colors.emerald : colors.surface,
                        borderColor: isSelected ? colors.emerald : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.listPillText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {list.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {/* Progress Overview */}
          <ShoppingProgressCard
            totalItems={totalItems}
            remainingCount={remainingCount}
            purchasedCount={purchasedCount}
          />

          {/* Add Item Form */}
          <AddItemCard />

          {/* Search & Category Filters */}
          {totalItems > 0 ? (
            <View style={styles.filterSection}>
              <View
                style={[
                  styles.searchBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Search size={16} color={colors.textMuted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t.searchPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                />
                {searchQuery.length > 0 ? (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    hitSlop={8}
                    accessibilityLabel={t.clear}
                  >
                    <X size={16} color={colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>

              {activeCategoryCounts.size > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScroll}
                >
                  <Pressable
                    onPress={() => setSelectedCategory('All')}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          selectedCategory === 'All' ? colors.slateButton : colors.surface,
                        borderColor:
                          selectedCategory === 'All' ? colors.slateButton : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            selectedCategory === 'All' ? '#FFFFFF' : colors.textSecondary,
                        },
                      ]}
                    >
                      {t.catAll}
                    </Text>
                    <Text
                      style={[
                        styles.filterCount,
                        {
                          color:
                            selectedCategory === 'All'
                              ? 'rgba(255,255,255,0.75)'
                              : colors.textMuted,
                        },
                      ]}
                    >
                      {totalItems}
                    </Text>
                  </Pressable>

                  {Array.from(activeCategoryCounts.entries()).map(([cat, count]) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: isSelected ? colors.slateButton : colors.surface,
                            borderColor: isSelected ? colors.slateButton : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {getTranslatedCategory(cat, language)}
                        </Text>
                        <Text
                          style={[
                            styles.filterCount,
                            {
                              color: isSelected
                                ? 'rgba(255,255,255,0.75)'
                                : colors.textMuted,
                            },
                          ]}
                        >
                          {count}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : null}
            </View>
          ) : null}

          {/* Empty List State */}
          {totalItems === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={[styles.emptyIcon, { backgroundColor: colors.emeraldSoft }]}>
                <ShoppingBasket size={28} color={colors.emeraldText} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {t.emptyListTitle}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t.emptyListSubtitle}
              </Text>
            </View>
          ) : null}

          {/* Filter Empty State */}
          {totalItems > 0 && filteredItems.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {t.noMatchingFilter}
              </Text>
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                <Text style={[styles.resetFilterLink, { color: colors.emeraldText }]}>
                  {t.clearFilter}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* To Buy & Purchased Sections */}
          {totalItems > 0 && filteredItems.length > 0 ? (
            <View style={styles.listsWrapper}>
              {/* Section 1: To Buy */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      {t.toBuySection}
                    </Text>
                    <View
                      style={[
                        styles.countBadge,
                        { backgroundColor: colors.amberSoft },
                      ]}
                    >
                      <Text style={[styles.countBadgeText, { color: colors.amberText }]}>
                        {toBuyItems.length}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                    {t.tapCheckboxHint}
                  </Text>
                </View>

                {toBuyItems.length === 0 ? (
                  <View
                    style={[
                      styles.allCheckedBanner,
                      {
                        backgroundColor: colors.emeraldSoft,
                        borderColor: colors.emerald,
                      },
                    ]}
                  >
                    <Sparkles size={16} color={colors.emeraldText} />
                    <Text style={[styles.allCheckedText, { color: colors.emeraldText }]}>
                      {t.allCheckedOff}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.itemsStack}>
                    {toBuyItems.map((item) => (
                      <GroceryItemCard
                        key={item.id}
                        item={item}
                        onEdit={setEditingItem}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Section 2: Purchased */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      {t.purchasedSection}
                    </Text>
                    <View
                      style={[
                        styles.countBadge,
                        { backgroundColor: colors.surfaceSecondary },
                      ]}
                    >
                      <Text style={[styles.countBadgeText, { color: colors.textSecondary }]}>
                        {purchasedItems.length}
                      </Text>
                    </View>
                  </View>

                  {purchasedItems.length > 0 ? (
                    <Pressable
                      onPress={requestClearPurchased}
                      style={styles.inlineAction}
                    >
                      <CheckCircle2 size={14} color={colors.emeraldText} />
                      <Text style={[styles.inlineActionText, { color: colors.emeraldText }]}>
                        {t.clearPurchased}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {purchasedItems.length === 0 ? (
                  <View
                    style={[
                      styles.noPurchasedBox,
                      { borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.noPurchasedText, { color: colors.textMuted }]}>
                      {t.noPurchasedYet}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.itemsStack}>
                    {purchasedItems.map((item) => (
                      <GroceryItemCard
                        key={item.id}
                        item={item}
                        onEdit={setEditingItem}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Clear All Button */}
              <Pressable
                onPress={requestClearAll}
                style={[
                  styles.clearAllBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Trash2 size={15} color={colors.roseText} />
                <Text style={[styles.clearAllText, { color: colors.roseText }]}>
                  {t.clearAll}
                </Text>
              </Pressable>
            </View>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>

      <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bodyWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  listSwitcherRow: {
    gap: 8,
  },
  listPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  listPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterSection: {
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryScroll: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterCount: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  resetFilterLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  listsWrapper: {
    gap: 18,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sectionHint: {
    fontSize: 11,
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  allCheckedBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  allCheckedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noPurchasedBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
  },
  noPurchasedText: {
    fontSize: 12,
  },
  itemsStack: {
    gap: 8,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
