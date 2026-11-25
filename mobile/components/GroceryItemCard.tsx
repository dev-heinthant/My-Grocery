import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Edit2, Tag, Trash2 } from 'lucide-react-native';
import { getCategoryColor } from '@/constants/categories';
import { getLocalizedItemName } from '@/constants/groceryCatalog';
import { getTranslatedCategory } from '@/constants/translations';
import { useApp } from '@/hooks/useAppContext';
import { GroceryItem } from '@/types/grocery';
import { formatRelativeTime } from '@/utils/time';
import { formatQuantityBadge } from '@/utils/validation';

interface GroceryItemCardProps {
  item: GroceryItem;
  onEdit: (item: GroceryItem) => void;
}

export const GroceryItemCard: React.FC<GroceryItemCardProps> = ({ item, onEdit }) => {
  const {
    colors,
    theme,
    language,
    t,
    togglePurchased,
    requestMarkAsBought,
    requestDeleteItem,
  } = useApp();
  const catColor = getCategoryColor(item.category, theme);
  const displayName = getLocalizedItemName(item, language);
  const translatedCategory = getTranslatedCategory(item.category, language);
  const timeText = formatRelativeTime(item.createdAt, language);
  const qtyText = formatQuantityBadge(item.quantity, item.unit);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: item.isPurchased ? colors.background : colors.surface,
          borderColor: colors.border,
          opacity: item.isPurchased ? 0.78 : 1,
        },
      ]}
    >
      {/* Checkbox */}
      <Pressable
        onPress={() => {
          if (item.isPurchased) {
            togglePurchased(item.id);
          } else {
            requestMarkAsBought(item);
          }
        }}
        style={styles.checkboxHitTarget}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.isPurchased }}
        accessibilityLabel={`Toggle ${displayName}`}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: item.isPurchased ? colors.emerald : 'transparent',
              borderColor: item.isPurchased ? colors.emerald : colors.textMuted,
            },
          ]}
        >
          {item.isPurchased ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.name,
              {
                color: item.isPurchased ? colors.textMuted : colors.textPrimary,
                textDecorationLine: item.isPurchased ? 'line-through' : 'none',
              },
            ]}
          >
            {displayName}
          </Text>
          <View
            style={[
              styles.qtyBadge,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.qtyText, { color: colors.textSecondary }]}>{qtyText}</Text>
          </View>
        </View>

        {item.note ? (
          <Text
            style={[
              styles.note,
              {
                color: item.isPurchased ? colors.textMuted : colors.textSecondary,
                textDecorationLine: item.isPurchased ? 'line-through' : 'none',
              },
            ]}
          >
            {item.note}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.catMeta}>
            <Tag size={11} color={item.isPurchased ? colors.textMuted : catColor} />
            <Text
              style={[
                styles.catText,
                { color: item.isPurchased ? colors.textMuted : catColor },
              ]}
            >
              {translatedCategory}
            </Text>
          </View>

          {timeText ? (
            <>
              <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {t.added} {timeText}
              </Text>
            </>
          ) : null}

          {item.updatedAt ? (
            <>
              <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{t.edited}</Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => onEdit(item)}
          style={styles.actionBtn}
          accessibilityLabel={`${t.edit} ${displayName}`}
        >
          <Edit2 size={16} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => requestDeleteItem(item)}
          style={styles.actionBtn}
          accessibilityLabel={`${t.delete} ${displayName}`}
        >
          <Trash2 size={16} color={colors.roseText} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  checkboxHitTarget: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  qtyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  catMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    fontSize: 11,
  },
  timeText: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
