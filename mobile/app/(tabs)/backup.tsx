import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HardDriveDownload,
  HardDriveUpload,
} from 'lucide-react-native';
import { AppHeader } from '@/components/AppHeader';
import { useApp } from '@/hooks/useAppContext';

export default function BackupScreen() {
  const { colors, t, showToast } = useApp();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <AppHeader title={t.backupTitle} subtitle={t.backupSubtitle} />

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() => showToast(t.backupPhaseNote, 'info')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.emerald, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <HardDriveUpload size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>{t.exportBackup}</Text>
          </Pressable>

          <Pressable
            onPress={() => showToast(t.backupPhaseNote, 'info')}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <HardDriveDownload size={18} color={colors.textPrimary} />
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
              {t.importBackup}
            </Text>
          </Pressable>
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
  actionButton: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
