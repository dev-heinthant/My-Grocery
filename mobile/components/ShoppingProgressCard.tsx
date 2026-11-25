import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import { useApp } from '@/hooks/useAppContext';

interface ShoppingProgressCardProps {
  totalItems: number;
  remainingCount: number;
  purchasedCount: number;
}

export const ShoppingProgressCard: React.FC<ShoppingProgressCardProps> = ({
  totalItems,
  remainingCount,
  purchasedCount,
}) => {
  const { colors, t } = useApp();
  const percentage = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;
  const isComplete = totalItems > 0 && remainingCount === 0;

  const progressAnim = useRef(new Animated.Value(percentage)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [percentage, progressAnim]);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

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
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t.shoppingProgress}
          </Text>
          {isComplete && (
            <View
              style={[
                styles.allDoneBadge,
                { backgroundColor: colors.emeraldSoft, borderColor: colors.emerald },
              ]}
            >
              <CheckCheck size={13} color={colors.emeraldText} />
              <Text style={[styles.allDoneText, { color: colors.emeraldText }]}>
                {t.allDone}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.percentText, { color: colors.textPrimary }]}>
          {percentage}%
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: isComplete ? colors.emeraldDark : colors.emerald,
              width: widthInterpolated,
            },
          ]}
        />
      </View>

      <View style={styles.statsRow}>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          <Text style={[styles.statNum, { color: colors.textPrimary }]}>{totalItems}</Text>{' '}
          {t.total}
        </Text>
        <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          <Text style={[styles.statNum, { color: colors.amber }]}>{remainingCount}</Text>{' '}
          {t.toBuy}
        </Text>
        <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          <Text style={[styles.statNum, { color: colors.emeraldText }]}>{purchasedCount}</Text>{' '}
          {t.done}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  allDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  allDoneText: {
    fontSize: 11,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statNum: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dot: {
    fontSize: 12,
  },
});
