import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertCircle,
  Check,
  Cloud,
  CloudOff,
  Globe,
  Lock,
  LogOut,
  Moon,
  RefreshCw,
  Sun,
  User,
} from 'lucide-react-native';
import { AppHeader } from '@/components/AppHeader';
import { useApp } from '@/hooks/useAppContext';
import { formatRelativeTime } from '@/utils/time';

export default function SettingsScreen() {
  const {
    colors,
    theme,
    setTheme,
    language,
    setLanguage,
    t,
    user,
    updateDisplayName,
    changePassword,
    requestSignOut,
    syncSummary,
    syncNow,
  } = useApp();

  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayNameInput(user?.displayName || '');
  }, [user?.displayName]);

  const handleSaveName = async () => {
    setProfileError(null);
    const trimmed = displayNameInput.trim();
    if (!trimmed) {
      setProfileError(t.usernameCannotBeEmpty);
      return;
    }
    setSavingName(true);
    try {
      const res = await updateDisplayName(trimmed);
      if (res.error) setProfileError(res.error);
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async () => {
    setProfileError(null);
    if (newPassword.length < 6) {
      setProfileError(t.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileError(t.passwordsDoNotMatch);
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changePassword(newPassword);
      if (res.error) {
        setProfileError(res.error);
      } else {
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const syncStatusText = (() => {
    if (!syncSummary.isOnline || syncSummary.status === 'offline') {
      return syncSummary.pendingCount > 0
        ? `${t.offlineLabel} · ${t.pendingSyncLabel.replace('{count}', String(syncSummary.pendingCount))}`
        : t.offlineLabel;
    }
    if (syncSummary.status === 'syncing') return t.syncingLabel;
    if (syncSummary.status === 'error') {
      return syncSummary.pendingCount > 0
        ? `${t.syncErrorLabel} · ${t.pendingSyncLabel.replace('{count}', String(syncSummary.pendingCount))}`
        : t.syncErrorLabel;
    }
    if (syncSummary.pendingCount > 0) {
      return t.pendingSyncLabel.replace('{count}', String(syncSummary.pendingCount));
    }
    return t.syncedLabel;
  })();

  const lastSyncedText = syncSummary.lastSyncedAt
    ? t.lastSyncedLabel.replace(
        '{time}',
        formatRelativeTime(syncSummary.lastSyncedAt, language)
      )
    : t.neverSyncedLabel;

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <AppHeader title={t.tabSettings} subtitle={t.profileTitle} />

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Signed-In Profile Card */}
        {user ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.profileTop}>
              <View
                style={[styles.avatarBox, { backgroundColor: colors.slateButton }]}
              >
                <Text style={styles.avatarText}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                  {user.displayName}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {user.email}
                </Text>
              </View>
            </View>

            {profileError ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.roseSoft, borderColor: colors.rose },
                ]}
              >
                <AlertCircle size={15} color={colors.roseText} />
                <Text style={[styles.errorText, { color: colors.roseText }]}>
                  {profileError}
                </Text>
              </View>
            ) : null}

            {/* Display Name Update */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t.yourDisplayName}
              </Text>
              <View style={styles.inlineRow}>
                <View
                  style={[
                    styles.inputBox,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <User size={15} color={colors.textMuted} />
                  <TextInput
                    value={displayNameInput}
                    onChangeText={setDisplayNameInput}
                    placeholder={t.yourDisplayName}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { color: colors.textPrimary }]}
                  />
                </View>
                <Pressable
                  onPress={handleSaveName}
                  disabled={savingName}
                  style={[
                    styles.inlineBtn,
                    { backgroundColor: colors.emerald, opacity: savingName ? 0.65 : 1 },
                  ]}
                >
                  {savingName ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              </View>
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                {t.nameHelp}
              </Text>
            </View>

            {/* Change Password */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t.changePassword}
              </Text>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Lock size={15} color={colors.textMuted} />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder={t.newPasswordPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Lock size={15} color={colors.textMuted} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder={t.confirmPasswordPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>
              <Pressable
                onPress={handleUpdatePassword}
                disabled={savingPassword}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    opacity: savingPassword ? 0.6 : pressed ? 0.8 : 1,
                  },
                ]}
              >
                {savingPassword ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>
                    {t.updatePassword}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Sign Out */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={requestSignOut}
              style={({ pressed }) => [
                styles.signOutBtn,
                {
                  backgroundColor: colors.roseSoft,
                  borderColor: colors.rose,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <LogOut size={16} color={colors.roseText} />
              <Text style={[styles.signOutText, { color: colors.roseText }]}>
                {t.signOut}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Cloud Synchronization Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            {syncSummary.isOnline ? (
              <Cloud size={17} color={colors.emeraldText} />
            ) : (
              <CloudOff size={17} color={colors.textMuted} />
            )}
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t.syncStatusTitle}
            </Text>
          </View>

          <View style={styles.syncMetaRow}>
            <View style={styles.syncMetaCol}>
              <Text style={[styles.syncStateLabel, { color: colors.textPrimary }]}>
                {syncStatusText}
              </Text>
              <Text style={[styles.syncTimeLabel, { color: colors.textSecondary }]}>
                {lastSyncedText}
              </Text>
              {syncSummary.lastError ? (
                <Text style={[styles.syncErrorText, { color: colors.roseText }]}>
                  {syncSummary.lastError}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => syncNow(false)}
              disabled={syncSummary.status === 'syncing'}
              style={({ pressed }) => [
                styles.syncNowBtn,
                {
                  backgroundColor: colors.emerald,
                  opacity: syncSummary.status === 'syncing' ? 0.6 : pressed ? 0.85 : 1,
                },
              ]}
            >
              {syncSummary.status === 'syncing' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={15} color="#FFFFFF" />
                  <Text style={styles.syncNowText}>{t.syncNow}</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Appearance Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            {theme === 'dark' ? (
              <Moon size={17} color={colors.amber} />
            ) : (
              <Sun size={17} color={colors.emeraldText} />
            )}
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t.appearanceTitle}
            </Text>
          </View>

          <View style={styles.segmentedRow}>
            <Pressable
              onPress={() => setTheme('light')}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor:
                    theme === 'light' ? colors.emerald : colors.surfaceSecondary,
                  borderColor: theme === 'light' ? colors.emerald : colors.border,
                },
              ]}
            >
              <Sun
                size={16}
                color={theme === 'light' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: theme === 'light' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t.lightMode}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTheme('dark')}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor:
                    theme === 'dark' ? colors.emerald : colors.surfaceSecondary,
                  borderColor: theme === 'dark' ? colors.emerald : colors.border,
                },
              ]}
            >
              <Moon
                size={16}
                color={theme === 'dark' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: theme === 'dark' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t.darkMode}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Language Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Globe size={17} color={colors.emeraldText} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t.languageTitle}
            </Text>
          </View>

          <View style={styles.segmentedRow}>
            <Pressable
              onPress={() => setLanguage('en')}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor:
                    language === 'en' ? colors.slateButton : colors.surfaceSecondary,
                  borderColor: language === 'en' ? colors.slateButton : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: language === 'en' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                English
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLanguage('my')}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor:
                    language === 'my' ? colors.slateButton : colors.surfaceSecondary,
                  borderColor: language === 'my' ? colors.slateButton : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: language === 'my' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                မြန်မာ
              </Text>
            </Pressable>
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
    gap: 14,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  profileMeta: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
  },
  errorBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputBox: {
    flex: 1,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  inlineBtn: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  secondaryBtn: {
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  signOutBtn: {
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  syncMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  syncMetaCol: {
    flex: 1,
    gap: 3,
  },
  syncStateLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  syncTimeLabel: {
    fontSize: 12,
  },
  syncErrorText: {
    fontSize: 11,
    marginTop: 2,
  },
  syncNowBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentBtn: {
    flex: 1,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
