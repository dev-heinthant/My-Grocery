import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';
import { COMMON_UNITS } from '@/constants/categories';
import { getLocalizedItemName, resolveCatalogKey } from '@/constants/groceryCatalog';
import { getTranslatedCategory } from '@/constants/translations';
import { useApp } from '@/hooks/useAppContext';
import { GroceryCategory, GroceryItem } from '@/types/grocery';
import { parseQuantityInput } from '@/utils/validation';

interface EditItemModalProps {
  item: GroceryItem | null;
  onClose: () => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, onClose }) => {
  const { colors, t, language, categories, updateItem } = useApp();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('Other');
  const [quantityText, setQuantityText] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(getLocalizedItemName(item, language));
      setNote(item.note);
      setCategory(item.category);
      setQuantityText(String(item.quantity));
      setUnit(item.unit || 'pcs');
      setError(null);
    }
  }, [item, language]);

  if (!item) return null;

  const adjustQty = (delta: number) => {
    const current = parseQuantityInput(quantityText);
    const next = Math.max(0.5, Math.round((current + delta) * 100) / 100);
    setQuantityText(String(next));
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.nameCannotBeEmpty);
      return;
    }
    const localizedOriginal = getLocalizedItemName(item, language);
    const unchangedDisplayName = trimmed === localizedOriginal;
    updateItem({
      id: item.id,
      name: unchangedDisplayName ? item.name : trimmed,
      catalogKey: unchangedDisplayName
        ? item.catalogKey ?? resolveCatalogKey(item.name) ?? null
        : resolveCatalogKey(trimmed) ?? null,
      note: note.trim(),
      category,
      quantity: parseQuantityInput(quantityText),
      unit,
    });
    onClose();
  };

  return (
    <Modal visible={Boolean(item)} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      >
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t.editItemTitle}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t.editItemName}</Text>
              <TextInput
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (error) setError(null);
                }}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: error ? colors.rose : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />
              {error ? <Text style={[styles.error, { color: colors.roseText }]}>{error}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t.quantity} & {t.unit}
              </Text>
              <View style={styles.qtyRow}>
                <View
                  style={[
                    styles.qtyBox,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <Pressable onPress={() => adjustQty(-1)} style={styles.qtyBtn}>
                    <Minus size={14} color={colors.textSecondary} />
                  </Pressable>
                  <TextInput
                    value={quantityText}
                    onChangeText={setQuantityText}
                    keyboardType="decimal-pad"
                    style={[styles.qtyInput, { color: colors.textPrimary }]}
                  />
                  <Pressable onPress={() => adjustQty(1)} style={styles.qtyBtn}>
                    <Plus size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  {COMMON_UNITS.map((u) => {
                    const active = unit === u;
                    return (
                      <Pressable
                        key={u}
                        onPress={() => setUnit(u)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active ? colors.emerald : colors.surfaceSecondary,
                            borderColor: active ? colors.emerald : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: active ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {u}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t.category}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {categories.map((cat) => {
                  const active = category === cat.name;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategory(cat.name)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.emerald : colors.surfaceSecondary,
                          borderColor: active ? colors.emerald : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {getTranslatedCategory(cat.name, language)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t.optionalNoteLabel}
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t.optionalNotePlaceholder}
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
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={onClose}
              style={[styles.footerBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[styles.footerBtnText, { color: colors.textSecondary }]}>
                {t.cancel}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.footerBtn, { backgroundColor: colors.emerald }]}
            >
              <Text style={[styles.footerBtnText, { color: '#FFFFFF' }]}>{t.saveChanges}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  dialog: {
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    maxHeight: 420,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    fontWeight: '500',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  chipRow: {
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  footerBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
