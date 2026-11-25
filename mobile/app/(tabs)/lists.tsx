import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Check,
  Edit2,
  FolderPlus,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react-native';
import { AppHeader } from '@/components/AppHeader';
import { getCategoryColor } from '@/constants/categories';
import { getTranslatedCategory } from '@/constants/translations';
import { useApp } from '@/hooks/useAppContext';

export default function ListsScreen() {
  const router = useRouter();
  const {
    colors,
    theme,
    t,
    language,
    lists,
    activeListId,
    setActiveListId,
    createList,
    renameList,
    requestDeleteList,
    categories,
    addCustomCategory,
    deleteCustomCategory,
    items,
  } = useApp();

  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateList = async () => {
    if (await createList(newListName)) {
      setNewListName('');
    }
  };

  const handleSaveRename = async (id: string) => {
    if (await renameList(id, editingListName)) {
      setEditingListId(null);
      setEditingListName('');
    }
  };

  const handleAddCategory = async () => {
    if (await addCustomCategory(newCategoryName)) {
      setNewCategoryName('');
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <AppHeader title={t.listsTitle} subtitle={t.listsSubtitle} />

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Grocery Lists Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t.listsTitle}
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t.listsSubtitle}
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              value={newListName}
              onChangeText={setNewListName}
              onSubmitEditing={handleCreateList}
              placeholder={t.listNamePlaceholder}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />
            <Pressable
              onPress={handleCreateList}
              style={[styles.primaryBtn, { backgroundColor: colors.emerald }]}
            >
              <FolderPlus size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{t.createList}</Text>
            </Pressable>
          </View>

          <View style={styles.stack}>
            {lists.map((list) => {
              const isActive = list.id === activeListId;
              const isEditing = editingListId === list.id;
              const itemCount = items.filter(
                (i) => i.listId === list.id && !i.isDeletedLocally
              ).length;

              return (
                <View
                  key={list.id}
                  style={[
                    styles.rowCard,
                    {
                      backgroundColor: isActive ? colors.emeraldSoft : colors.background,
                      borderColor: isActive ? colors.emerald : colors.border,
                    },
                  ]}
                >
                  {isEditing ? (
                    <View style={styles.renameRow}>
                      <TextInput
                        value={editingListName}
                        onChangeText={setEditingListName}
                        onSubmitEditing={() => handleSaveRename(list.id)}
                        autoFocus
                        style={[
                          styles.renameInput,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.emerald,
                            color: colors.textPrimary,
                          },
                        ]}
                      />
                      <Pressable
                        onPress={() => handleSaveRename(list.id)}
                        style={styles.iconAction}
                      >
                        <Check size={17} color={colors.emeraldText} />
                      </Pressable>
                      <Pressable
                        onPress={() => setEditingListId(null)}
                        style={styles.iconAction}
                      >
                        <X size={17} color={colors.textMuted} />
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => {
                          setActiveListId(list.id);
                          router.push('/(tabs)');
                        }}
                        style={styles.rowMain}
                      >
                        <View style={styles.listHeaderRow}>
                          <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                            {list.name}
                          </Text>
                          {isActive ? (
                            <View
                              style={[
                                styles.badge,
                                { backgroundColor: colors.emerald },
                              ]}
                            >
                              <Text style={styles.badgeTextWhite}>{t.activeBadge}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                          {t.itemsCountLabel.replace('{count}', String(itemCount))}
                        </Text>
                      </Pressable>

                      <View style={styles.rowActions}>
                        <Pressable
                          onPress={() => {
                            setEditingListId(list.id);
                            setEditingListName(list.name);
                          }}
                          style={styles.iconAction}
                          accessibilityLabel={t.renameList}
                        >
                          <Edit2 size={16} color={colors.textSecondary} />
                        </Pressable>
                        {lists.length > 1 ? (
                          <Pressable
                            onPress={() => requestDeleteList(list)}
                            style={styles.iconAction}
                            accessibilityLabel={t.delete}
                          >
                            <Trash2 size={16} color={colors.roseText} />
                          </Pressable>
                        ) : null}
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Categories Management Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t.categoriesTitle}
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {t.categoriesSubtitle}
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              onSubmitEditing={handleAddCategory}
              placeholder={t.categoryNamePlaceholder}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />
            <Pressable
              onPress={handleAddCategory}
              style={[styles.primaryBtn, { backgroundColor: colors.slateButton }]}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{t.addCategory}</Text>
            </Pressable>
          </View>

          <View style={styles.catGrid}>
            {categories.map((cat) => {
              const catColor = getCategoryColor(cat.name, theme);
              return (
                <View
                  key={cat.id}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Tag size={13} color={catColor} />
                  <Text style={[styles.catChipText, { color: colors.textPrimary }]}>
                    {getTranslatedCategory(cat.name, language)}
                  </Text>
                  <View
                    style={[
                      styles.catBadge,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <Text style={[styles.catBadgeText, { color: colors.textMuted }]}>
                      {cat.isDefault ? t.defaultCategoryBadge : t.customCategoryBadge}
                    </Text>
                  </View>
                  {!cat.isDefault ? (
                    <Pressable
                      onPress={() => deleteCustomCategory(cat.id)}
                      hitSlop={6}
                    >
                      <X size={14} color={colors.roseText} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  primaryBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stack: {
    gap: 8,
  },
  rowCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowMain: {
    flex: 1,
    gap: 3,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTextWhite: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  renameInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
