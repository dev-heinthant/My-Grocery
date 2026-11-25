import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Cloud,
  CloudOff,
  Moon,
  RefreshCw,
  ShoppingBag,
  Sun,
} from 'lucide-react-native';
import { useApp } from '@/hooks/useAppContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle }) => {
  const {
    colors,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    user,
    syncSummary,
    syncNow,
  } = useApp();

  const renderSyncChip = () => {
    if (!user) return null;

    const isSyncing = syncSummary.status === 'syncing';
    const isOffline = !syncSummary.isOnline || syncSummary.status === 'offline';
    const hasPending = syncSummary.pendingCount > 0;
    const isError = syncSummary.status === 'error';

    let bg = colors.emeraldSoft;
    let border = colors.border;
    let textColor = colors.emeraldText;
    let label = t.syncedLabel;

    if (isOffline) {
      bg = colors.surfaceSecondary;
      textColor = colors.textSecondary;
      label = hasPending
        ? `${t.offlineLabel} · ${syncSummary.pendingCount}`
        : t.offlineLabel;
    } else if (isSyncing) {
      bg = colors.emeraldSoft;
      textColor = colors.emeraldText;
      label = '';
    } else if (isError) {
      bg = colors.roseSoft;
      textColor = colors.roseText;
      label = hasPending ? String(syncSummary.pendingCount) : '!';
    } else if (hasPending) {
      bg = colors.amberSoft;
      textColor = colors.amberText;
      label = String(syncSummary.pendingCount);
    }

    return (
      <Pressable
        onPress={() => syncNow(false)}
        style={({ pressed }) => [
          styles.syncChip,
          {
            backgroundColor: bg,
            borderColor: border,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
        accessibilityLabel={t.syncNow}
      >
        {isSyncing ? (
          <ActivityIndicator size={13} color={colors.emeraldText} />
        ) : isOffline ? (
          <CloudOff size={14} color={textColor} />
        ) : isError || hasPending ? (
          <RefreshCw size={13} color={textColor} />
        ) : (
          <Cloud size={14} color={textColor} />
        )}
        {label ? (
          <Text numberOfLines={1} style={[styles.syncChipText, { color: textColor }]}>
            {label}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.brandRow}>
        <View style={[styles.logoBox, { backgroundColor: colors.emerald }]}>
          <ShoppingBag size={20} color="#FFFFFF" />
        </View>
        <View style={styles.brandText}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.textPrimary }]}
          >
            {title || t.appName}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            {subtitle || (user ? user.displayName : t.appDescription)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {renderSyncChip()}

        <Pressable
          onPress={() => setLanguage(language === 'en' ? 'my' : 'en')}
          style={({ pressed }) => [
            styles.langButton,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          accessibilityLabel="Toggle language"
        >
          <Text style={[styles.langText, { color: colors.textPrimary }]}>
            {language === 'en' ? 'မြန်မာ' : 'EN'}
          </Text>
        </Pressable>

        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          accessibilityLabel={theme === 'dark' ? t.switchToLight : t.switchToDark}
        >
          {theme === 'dark' ? (
            <Sun size={18} color="#FBBF24" />
          ) : (
            <Moon size={18} color={colors.textSecondary} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
  },
  syncChipText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  langButton: {
    paddingHorizontal: 9,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
