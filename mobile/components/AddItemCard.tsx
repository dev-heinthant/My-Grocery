import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Minus, Plus, StickyNote, Tag, X } from 'lucide-react-native';
import { COMMON_UNITS } from '@/constants/categories';
import { getQuickAddSuggestions } from '@/constants/groceryCatalog';
import { getTranslatedCategory } from '@/constants/translations';
import { useApp } from '@/hooks/useAppContext';
import { GroceryCategory } from '@/types/grocery';
import { guessCategory } from '@/utils/categoryGuesser';
import { parseQuantityInput } from '@/utils/validation';

export const AddItemCard: React.FC = () => {
  const { colors, t, language, categories, addItem } = useApp();

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('Produce');
  const [quantityText, setQuantityText] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [isCategoryManual, setIsCategoryManual] = useState(false);
  const [showNoteField, setShowNoteField] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickSuggestions = getQuickAddSuggestions(language);

  useEffect(() => {
    if (!isCategoryManual && name.trim().length > 0) {
      setCategory(guessCategory(name));
    }
  }, [name, isCategoryManual]);

  const adjustQty = (delta: number) => {
    const current = parseQuantityInput(quantityText);
    const next = Math.max(0.5, Math.round((current + delta) * 100) / 100);
    setQuantityText(Number.isInteger(next) ? String(next) : String(next));
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.pleaseEnterName);
      return;
    }
    setError(null);
    addItem({
      name: trimmed,
      note: note.trim(),
      category,
      quantity: parseQuantityInput(quantityText),
      unit,
    });
    setName('');
    setNote('');
    setQuantityText('1');
    setUnit('pcs');
    setCategory('Produce');
    setIsCategoryManual(false);
    setShowNoteField(false);
  };

  const handleQuickAdd = (suggestion: { name: string; category: GroceryCategory }) => {
    setName(suggestion.name);
    setCategory(suggestion.category);
    setIsCategoryManual(true);
    setError(null);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Item Name Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError(null);
          }}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          placeholder={t.whatToBuyPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.nameInput,
            {
              backgroundColor: colors.background,
              borderColor: error ? colors.rose : colors.border,
              color: colors.textPrimary,
            },
          ]}
        />
        <Pressable
          onPress={() => setShowNoteField((prev) => !prev)}
          style={({ pressed }) => [
            styles.noteToggleBtn,
            {
              backgroundColor: showNoteField ? colors.emeraldSoft : colors.surfaceSecondary,
              borderColor: showNoteField ? colors.emerald : colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          accessibilityLabel={t.addNote}
        >
          <StickyNote
            size={18}
            color={showNoteField ? colors.emeraldText : colors.textSecondary}
          />
        </Pressable>
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.roseText }]}>{error}</Text>
      ) : null}

      {/* Quantity, Unit, Category, and Add CTA */}
      <View style={styles.controlsRow}>
        {/* Quantity Stepper */}
        <View
          style={[
            styles.qtyBox,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() => adjustQty(-1)}
            style={styles.qtyStepBtn}
            accessibilityLabel="Decrease quantity"
          >
            <Minus size={14} color={colors.textSecondary} />
          </Pressable>
          <TextInput
            value={quantityText}
            onChangeText={setQuantityText}
            keyboardType="decimal-pad"
            style={[styles.qtyInput, { color: colors.textPrimary }]}
            accessibilityLabel={t.quantity}
          />
          <Pressable
            onPress={() => adjustQty(1)}
            style={styles.qtyStepBtn}
            accessibilityLabel="Increase quantity"
          >
            <Plus size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Unit Selector Pill */}
        <Pressable
          onPress={() => {
            setShowUnitPicker((prev) => !prev);
            setShowCategoryPicker(false);
          }}
          style={[
            styles.selectorBtn,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: showUnitPicker ? colors.emerald : colors.border,
            },
          ]}
        >
          <Text style={[styles.selectorText, { color: colors.textPrimary }]}>{unit}</Text>
        </Pressable>

        {/* Category Selector Pill */}
        <Pressable
          onPress={() => {
            setShowCategoryPicker((prev) => !prev);
            setShowUnitPicker(false);
          }}
          style={[
            styles.selectorBtn,
            styles.categorySelector,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: showCategoryPicker ? colors.emerald : colors.border,
            },
          ]}
        >
          <Tag size={13} color={colors.emeraldText} />
          <Text
            numberOfLines={1}
            style={[styles.selectorText, { color: colors.textPrimary, flexShrink: 1 }]}
          >
            {getTranslatedCategory(category, language)}
          </Text>
        </Pressable>

        {/* Add Button */}
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.emerald,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t.addItem}</Text>
        </Pressable>
      </View>

      {/* Expandable Unit Chips */}
      {showUnitPicker && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {COMMON_UNITS.map((u) => {
            const active = unit === u;
            return (
              <Pressable
                key={u}
                onPress={() => {
                  setUnit(u);
                  setShowUnitPicker(false);
                }}
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
      )}

      {/* Expandable Category Chips */}
      {showCategoryPicker && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {categories.map((cat) => {
            const active = category === cat.name;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  setCategory(cat.name);
                  setIsCategoryManual(true);
                  setShowCategoryPicker(false);
                }}
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
      )}

      {/* Optional Note Field */}
      {showNoteField && (
        <View style={styles.noteRow}>
          <TextInput
            value={note}
            onChangeText={setNote}
            onSubmitEditing={handleSubmit}
            placeholder={t.optionalNotePlaceholder}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
          />
          <Pressable
            onPress={() => {
              setNote('');
              setShowNoteField(false);
            }}
            style={styles.clearNoteBtn}
            accessibilityLabel={t.cancel}
          >
            <X size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Quick Suggestions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsRow}
      >
        <Text style={[styles.quickLabel, { color: colors.textMuted }]}>{t.quickAdd}</Text>
        {quickSuggestions.map((item) => (
          <Pressable
            key={item.name}
            onPress={() => handleQuickAdd(item)}
            style={({ pressed }) => [
              styles.suggestionChip,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
              + {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  noteToggleBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  qtyStepBtn: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 2,
  },
  selectorBtn: {
    height: 40,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categorySelector: {
    flex: 1,
    minWidth: 100,
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  chipScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  clearNoteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
