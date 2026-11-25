import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Lock,
  LogIn,
  Mail,
  Moon,
  ShoppingBag,
  Sun,
  User,
  UserPlus,
  WifiOff,
} from 'lucide-react-native';
import { useApp } from '@/hooks/useAppContext';
import { getEmailValidationMessage } from '@/services/authService';
import { validateEmailAddress } from '@/utils/validation';

export default function AuthScreen() {
  const {
    colors,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    user,
    signIn,
    signUp,
    syncSummary,
  } = useApp();

  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const emailInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const passwordInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const confirmPasswordInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const fieldPositionsRef = useRef<{
    displayName?: number;
    email?: number;
    password?: number;
    confirmPassword?: number;
  }>({});
  const focusedFieldRef = useRef<
    'displayName' | 'email' | 'password' | 'confirmPassword' | null
  >(null);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollToFocusedField = (
    field?: 'displayName' | 'email' | 'password' | 'confirmPassword' | null
  ) => {
    const target = field ?? focusedFieldRef.current;
    if (!target || Platform.OS === 'web') return;

    if (target === 'password' || target === 'confirmPassword') {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
      return;
    }

    const fieldY = fieldPositionsRef.current[target];
    if (typeof fieldY === 'number') {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, fieldY - 12),
          animated: true,
        });
      });
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        scrollToFocusedField(focusedFieldRef.current);
      }, 60);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    setError(null);
    setInfoMsg(null);

    if (mode === 'signup' && !displayName.trim()) {
      setError(t.usernameCannotBeEmpty);
      return;
    }

    const emailCheck = validateEmailAddress(email, {
      requireGmail: mode === 'signup',
    });
    if (emailCheck.issue) {
      setError(getEmailValidationMessage(emailCheck.issue, language));
      return;
    }

    if (password.length < 6) {
      setError(t.passwordMinLength);
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(emailCheck.normalized, password);
        if (res.error) {
          setError(res.error);
        } else {
          setPassword('');
        }
      } else {
        const res = await signUp(emailCheck.normalized, password, displayName.trim());
        if (res.requiresEmailConfirmation && res.error) {
          setInfoMsg(res.error);
          setPassword('');
          setConfirmPassword('');
          setMode('signin');
        } else if (res.error) {
          setError(res.error);
        } else {
          setPassword('');
          setConfirmPassword('');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.brandRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.emerald }]}>
            <ShoppingBag size={18} color="#FFFFFF" />
          </View>
          <Text style={[styles.topTitle, { color: colors.textPrimary }]}>
            {t.appName}
          </Text>
        </View>

        <View style={styles.topActions}>
          <Pressable
            onPress={() => setLanguage(language === 'en' ? 'my' : 'en')}
            style={[
              styles.langBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.langText, { color: colors.textPrimary }]}>
              {language === 'en' ? 'မြန်မာ' : 'EN'}
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            {theme === 'dark' ? (
              <Sun size={17} color="#FBBF24" />
            ) : (
              <Moon size={17} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        enabled={Platform.OS !== 'web'}
        behavior={Platform.OS === 'web' ? undefined : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'web' ? 0 : insets.top}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible ? styles.scrollContentKeyboardOpen : styles.scrollContentCentered,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.headerBlock}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {mode === 'signin' ? t.signInTab : t.signUpTab}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {mode === 'signin' ? t.accessSubtitle : t.signUpSubtitle}
              </Text>
            </View>

            {!syncSummary.isOnline ? (
              <View
                style={[
                  styles.warningBox,
                  { backgroundColor: colors.amberSoft, borderColor: colors.amber },
                ]}
              >
                <WifiOff size={16} color={colors.amberText} />
                <Text style={[styles.warningText, { color: colors.amberText }]}>
                  {t.offlineAuthNotice}
                </Text>
              </View>
            ) : null}

            {/* Segmented Switch */}
            <View
              style={[
                styles.tabsWrap,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Pressable
                onPress={() => {
                  setMode('signin');
                  setError(null);
                  setInfoMsg(null);
                }}
                style={[
                  styles.tabItem,
                  mode === 'signin' && { backgroundColor: colors.surface },
                ]}
              >
                <LogIn
                  size={15}
                  color={mode === 'signin' ? colors.textPrimary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color:
                        mode === 'signin' ? colors.textPrimary : colors.textSecondary,
                    },
                  ]}
                >
                  {t.signInTab}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMode('signup');
                  setError(null);
                  setInfoMsg(null);
                }}
                style={[
                  styles.tabItem,
                  mode === 'signup' && { backgroundColor: colors.surface },
                ]}
              >
                <UserPlus
                  size={15}
                  color={mode === 'signup' ? colors.textPrimary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color:
                        mode === 'signup' ? colors.textPrimary : colors.textSecondary,
                    },
                  ]}
                >
                  {t.signUpTab}
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.roseSoft, borderColor: colors.rose },
                ]}
              >
                <AlertCircle size={16} color={colors.roseText} />
                <Text style={[styles.errorText, { color: colors.roseText }]}>{error}</Text>
              </View>
            ) : null}

            {infoMsg ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.emeraldSoft, borderColor: colors.emerald },
                ]}
              >
                <AlertCircle size={16} color={colors.emeraldText} />
                <Text style={[styles.errorText, { color: colors.emeraldText }]}>
                  {infoMsg}
                </Text>
              </View>
            ) : null}

            {mode === 'signup' ? (
              <View
                style={styles.field}
                onLayout={(e) => {
                  fieldPositionsRef.current.displayName = e.nativeEvent.layout.y;
                }}
              >
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t.yourNameRole}
                </Text>
                <View
                  style={[
                    styles.inputBox,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <User size={16} color={colors.textMuted} />
                  <TextInput
                    value={displayName}
                    onChangeText={(val) => {
                      setDisplayName(val);
                      if (error) setError(null);
                    }}
                    onFocus={() => {
                      focusedFieldRef.current = 'displayName';
                      scrollToFocusedField('displayName');
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                    placeholder="Alex"
                    placeholderTextColor={colors.textMuted}
                    editable={!submitting}
                    style={[styles.input, { color: colors.textPrimary }]}
                  />
                </View>
              </View>
            ) : null}

            <View
              style={styles.field}
              onLayout={(e) => {
                fieldPositionsRef.current.email = e.nativeEvent.layout.y;
              }}
            >
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t.emailAddress}
              </Text>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Mail size={16} color={colors.textMuted} />
                <TextInput
                  ref={emailInputRef}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (error) setError(null);
                  }}
                  onFocus={() => {
                    focusedFieldRef.current = 'email';
                    scrollToFocusedField('email');
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={mode === 'signup' ? 'yourname@gmail.com' : 'you@example.com'}
                  placeholderTextColor={colors.textMuted}
                  editable={!submitting}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>

              {mode === 'signup' ? (
                <View
                  style={[
                    styles.noticeBox,
                    { backgroundColor: colors.amberSoft, borderColor: colors.amber },
                  ]}
                >
                  <Info size={14} color={colors.amberText} style={styles.noticeIcon} />
                  <Text style={[styles.noticeText, { color: colors.amberText }]}>
                    {t.signupGmailInstruction}
                  </Text>
                </View>
              ) : null}
            </View>

            <View
              style={styles.field}
              onLayout={(e) => {
                fieldPositionsRef.current.password = e.nativeEvent.layout.y;
              }}
            >
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t.passwordLabel}
              </Text>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Lock size={16} color={colors.textMuted} />
                <TextInput
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (error) setError(null);
                  }}
                  onFocus={() => {
                    focusedFieldRef.current = 'password';
                    setTimeout(() => scrollToFocusedField('password'), 80);
                  }}
                  returnKeyType={mode === 'signup' ? 'next' : 'done'}
                  onSubmitEditing={() => {
                    if (mode === 'signup') {
                      confirmPasswordInputRef.current?.focus();
                    } else {
                      handleSubmit();
                    }
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="••••••"
                  placeholderTextColor={colors.textMuted}
                  editable={!submitting}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff size={16} color={colors.textMuted} />
                  ) : (
                    <Eye size={16} color={colors.textMuted} />
                  )}
                </Pressable>
              </View>
            </View>

            {mode === 'signup' ? (
              <View
                style={styles.field}
                onLayout={(e) => {
                  fieldPositionsRef.current.confirmPassword = e.nativeEvent.layout.y;
                }}
              >
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t.confirmPasswordLabel}
                </Text>
                <View
                  style={[
                    styles.inputBox,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <Lock size={16} color={colors.textMuted} />
                  <TextInput
                    ref={confirmPasswordInputRef}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (error) setError(null);
                    }}
                    onFocus={() => {
                      focusedFieldRef.current = 'confirmPassword';
                      setTimeout(() => scrollToFocusedField('confirmPassword'), 80);
                    }}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    secureTextEntry={!showConfirm}
                    placeholder="••••••"
                    placeholderTextColor={colors.textMuted}
                    editable={!submitting}
                    style={[styles.input, { color: colors.textPrimary }]}
                  />
                  <Pressable onPress={() => setShowConfirm((prev) => !prev)} hitSlop={8}>
                    {showConfirm ? (
                      <EyeOff size={16} color={colors.textMuted} />
                    ) : (
                      <Eye size={16} color={colors.textMuted} />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitBtn,
                {
                  backgroundColor: colors.emerald,
                  opacity: submitting ? 0.65 : pressed ? 0.85 : 1,
                },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'signin' ? t.signInButton : t.createAccountButton}
                </Text>
              )}
            </Pressable>

            <Text style={[styles.phaseHint, { color: colors.textMuted }]}>
              {t.authPhaseNote}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 10,
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
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  scrollContentCentered: {
    justifyContent: 'center',
  },
  scrollContentKeyboardOpen: {
    justifyContent: 'flex-start',
    paddingBottom: 28,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  headerBlock: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  warningBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  tabsWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    height: 38,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
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
    lineHeight: 17,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  noticeBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 2,
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  inputBox: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  submitBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  phaseHint: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
