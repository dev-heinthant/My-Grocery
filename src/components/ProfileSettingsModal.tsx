import React, { useEffect, useState } from 'react';
import { Globe, KeyRound, LogOut, Moon, Sun, User, X } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { updateUserDisplayName, updateUserPassword } from '../services/authService';
import { Language, ThemeMode, UserProfile } from '../types/grocery';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  user: UserProfile;
  language: Language;
  themeMode: ThemeMode;
  onClose: () => void;
  onSetLanguage: (lang: Language) => void;
  onSetThemeMode: (mode: ThemeMode) => void;
  onUserUpdated: (user: UserProfile) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
  onRequestSignOut: () => void;
}

export function ProfileSettingsModal({
  isOpen,
  user,
  language,
  themeMode,
  onClose,
  onSetLanguage,
  onSetThemeMode,
  onUserUpdated,
  onNotify,
  onRequestSignOut,
}: ProfileSettingsModalProps) {
  const t = TRANSLATIONS[language];
  const [displayName, setDisplayName] = useState(user.displayName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDisplayName(user.displayName);
    setNameError(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  }, [isOpen, user.displayName]);

  if (!isOpen) return null;

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError(t.usernameCannotBeEmpty);
      return;
    }

    setIsSavingName(true);
    try {
      const result = await updateUserDisplayName(trimmed, language);
      if (result.error) {
        setNameError(result.error);
        return;
      }
      if (result.user) {
        onUserUpdated(result.user);
      }
      onNotify('success', t.nameUpdatedToast);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError(t.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordsDoNotMatch);
      return;
    }

    setIsSavingPassword(true);
    try {
      const result = await updateUserPassword(newPassword, language);
      if (result.error) {
        setPasswordError(result.error);
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
      onNotify('success', t.passwordUpdatedToast);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-settings-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div>
            <h2
              id="profile-settings-title"
              className="text-base font-bold text-slate-900 dark:text-slate-50"
            >
              {t.profileTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.doneButton}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Display Name */}
          <form onSubmit={handleSaveName} noValidate className="space-y-2.5">
            <label
              htmlFor="settings-display-name"
              className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100"
            >
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.yourDisplayName}</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.nameHelp}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="settings-display-name"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSavingName}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {t.saveName}
              </button>
            </div>
            {nameError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {nameError}
              </p>
            )}
          </form>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Change Password */}
          <form onSubmit={handleUpdatePassword} noValidate className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.changePassword}</span>
            </h3>
            <div className="space-y-2.5">
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder={t.newPasswordPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
              />
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder={t.confirmPasswordPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500"
              />
            </div>
            {passwordError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {t.updatePassword}
            </button>
          </form>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Appearance & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t.appearanceTitle}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onSetThemeMode('light')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    themeMode === 'light'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{t.lightMode}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetThemeMode('dark')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    themeMode === 'dark'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>{t.darkMode}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t.languageTitle}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onSetLanguage('en')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    language === 'en'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>English</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetLanguage('my')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    language === 'my'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>မြန်မာ</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onRequestSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t.doneButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
