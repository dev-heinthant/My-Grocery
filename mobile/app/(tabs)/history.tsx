import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, History, Tag } from 'lucide-react-native';
import { AppHeader } from '@/components/AppHeader';
import { getCategoryColor } from '@/constants/categories';
import { getLocalizedItemName } from '@/constants/groceryCatalog';
import { getTranslatedCategory } from '@/constants/translations';
import { useApp } from '@/hooks/useAppContext';
import {
  CalendarDayOption,
  filterPurchasedItemsForDate,
  formatLocalTime,
  getLast7CalendarDays,
  toLocalDateKey,
} from '@/utils/time';
import { formatQuantityBadge } from '@/utils/validation';

export default function HistoryScreen() {
  const { colors, theme, t, language, items } = useApp();

  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());
  const days = useMemo(
    () => getLast7CalendarDays(referenceDate, language),
    [referenceDate, language]
  );
  const todayKey = days[days.length - 1]?.dateKey ?? toLocalDateKey(referenceDate);
  const prevTodayKeyRef = useRef<string>(todayKey);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Automatically refresh the 7-day window at local midnight or when returning to foreground
  useEffect(() => {
    const syncTodayIfChanged = () => {
      const now = new Date();
      const currentKey = toLocalDateKey(now);
      if (currentKey !== prevTodayKeyRef.current) {
        setReferenceDate(now);
      }
    };

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1,
      0
    );
    const msUntilMidnight = Math.max(1_000, nextMidnight.getTime() - now.getTime());
    const midnightTimer = setTimeout(syncTodayIfChanged, msUntilMidnight);

    const appSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncTodayIfChanged();
      }
    });

    return () => {
      clearTimeout(midnightTimer);
      appSub.remove();
    };
  }, [todayKey]);

  const validWindowKeys = useMemo(() => new Set(days.map((d) => d.dateKey)), [days]);

  useEffect(() => {
    const previousToday = prevTodayKeyRef.current;
    if (previousToday !== todayKey) {
      prevTodayKeyRef.current = todayKey;
      setSelectedDateKey((prev) =>
        prev === previousToday || !validWindowKeys.has(prev) ? todayKey : prev
      );
    } else if (!validWindowKeys.has(selectedDateKey)) {
      setSelectedDateKey(todayKey);
    }
  }, [selectedDateKey, todayKey, validWindowKeys]);

  const selectedDay = useMemo(
    () => days.find((d) => d.dateKey === selectedDateKey) ?? days[days.length - 1],
    [days, selectedDateKey]
  );

  const purchasedOnSelectedDate = useMemo(
    () => filterPurchasedItemsForDate(items, selectedDay.dateKey, validWindowKeys),
    [items, selectedDay.dateKey, validWindowKeys]
  );

  const handleSelectDay = (day: CalendarDayOption) => {
    if (day.dateKey > todayKey || !validWindowKeys.has(day.dateKey)) {
      return;
    }
    setSelectedDateKey(day.dateKey);
  };

  const selectedDayTitle = selectedDay.isToday
    ? `${t.historyToday} · ${selectedDay.monthDayLabel}`
    : selectedDay.isYesterday
    ? `${t.historyYesterday} · ${selectedDay.monthDayLabel}`
    : `${selectedDay.weekdayLabel}, ${selectedDay.monthDayLabel}`;

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <AppHeader title={t.historyTitle} subtitle={t.historySubtitle} />

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Last 7 Calendar Dates Horizontal Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {days.map((day) => {
            const isSelected = day.dateKey === selectedDay.dateKey;
            return (
              <Pressable
                key={day.dateKey}
                onPress={() => handleSelectDay(day)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${day.weekdayLabel} ${day.dayNumber}`}
                style={({ pressed }) => [
                  styles.datePill,
                  {
                    backgroundColor: isSelected ? colors.emerald : colors.surface,
                    borderColor: isSelected ? colors.emerald : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.weekdayText,
                    { color: isSelected ? 'rgba(255,255,255,0.88)' : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {day.weekdayLabel}
                </Text>
                <Text
                  style={[
                    styles.dayNumberText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Selected Date Summary Header */}
        <View style={styles.summaryHeader}>
          <Text style={[styles.selectedDayTitle, { color: colors.textPrimary }]}>
            {selectedDayTitle}
          </Text>
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor:
                  purchasedOnSelectedDate.length > 0
                    ? colors.emeraldSoft
                    : colors.surfaceSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.countBadgeText,
                {
                  color:
                    purchasedOnSelectedDate.length > 0
                      ? colors.emeraldText
                      : colors.textSecondary,
                },
              ]}
            >
              {t.historyItemsCount.replace(
                '{count}',
                String(purchasedOnSelectedDate.length)
              )}
            </Text>
          </View>
        </View>

        {/* Purchased Items or Empty State */}
        {purchasedOnSelectedDate.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <History size={26} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {t.historyEmptyTitle}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t.historyEmptySubtitle}
            </Text>
          </View>
        ) : (
          <View style={styles.itemsStack}>
            {purchasedOnSelectedDate.map((item) => {
              const catColor = getCategoryColor(item.category, theme);
              const translatedCategory = getTranslatedCategory(item.category, language);
              const qtyText = formatQuantityBadge(item.quantity, item.unit);
              const boughtTimeText = item.purchasedAt
                ? formatLocalTime(item.purchasedAt, language)
                : '';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.boughtBadgeIcon,
                      { backgroundColor: colors.emeraldSoft },
                    ]}
                  >
                    <Check size={14} color={colors.emeraldText} strokeWidth={3} />
                  </View>

                  <View style={styles.itemContent}>
                    <View style={styles.itemTopRow}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                        {getLocalizedItemName(item, language)}
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
                        <Text style={[styles.qtyText, { color: colors.textSecondary }]}>
                          {qtyText}
                        </Text>
                      </View>
                    </View>

                    {item.note ? (
                      <Text style={[styles.itemNote, { color: colors.textSecondary }]}>
                        {item.note}
                      </Text>
                    ) : null}

                    <View style={styles.itemMetaRow}>
                      {item.category ? (
                        <View style={styles.catMeta}>
                          <Tag size={11} color={catColor} />
                          <Text style={[styles.catText, { color: catColor }]}>
                            {translatedCategory}
                          </Text>
                        </View>
                      ) : null}

                      {boughtTimeText ? (
                        <>
                          {item.category ? (
                            <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
                          ) : null}
                          <Text style={[styles.timeText, { color: colors.textMuted }]}>
                            {t.historyBoughtAt.replace('{time}', boughtTimeText)}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
    gap: 14,
    paddingBottom: 32,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    flexGrow: 1,
  },
  datePill: {
    flex: 1,
    minWidth: 46,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  selectedDayTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
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
    width: 52,
    height: 52,
    borderRadius: 15,
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
  itemsStack: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  boughtBadgeIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemName: {
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
  itemNote: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemMetaRow: {
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
});
