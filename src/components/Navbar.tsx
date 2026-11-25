import {
  CalendarClock,
  Globe,
  ListChecks,
  LogOut,
  Moon,
  ShoppingBasket,
  Sun,
  UserCircle2,
} from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { Language, ThemeMode, UserProfile } from '../types/grocery';

export type ActiveWebTab = 'list' | 'history';

interface NavbarProps {
  user: UserProfile;
  language: Language;
  themeMode: ThemeMode;
  activeTab: ActiveWebTab;
  onChangeTab: (tab: ActiveWebTab) => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onRequestSignOut: () => void;
}

export function Navbar({
  user,
  language,
  themeMode,
  activeTab,
  onChangeTab,
  onToggleLanguage,
  onToggleTheme,
  onOpenSettings,
  onRequestSignOut,
}: NavbarProps) {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Wordmark */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShoppingBasket className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50 truncate">
              {t.appName}
            </h1>
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate">
              {t.appDescription}
            </p>
          </div>
        </div>

        {/* Center: View Tabs (Desktop) */}
        <nav
          aria-label="Primary navigation"
          className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80"
        >
          <button
            type="button"
            onClick={() => onChangeTab('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.tabList}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('history')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.tabHistory}</span>
          </button>
        </nav>

        {/* Right: Utilities & Account */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            title={language === 'en' ? 'Switch to Burmese' : 'Switch to English'}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'en' ? 'EN' : 'မြန်မာ'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={themeMode === 'dark' ? t.switchToLight : t.switchToDark}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title={t.profileSettings}
            className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <UserCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {user.displayName}
            </span>
          </button>

          <button
            type="button"
            onClick={onRequestSignOut}
            aria-label={t.signOut}
            title={t.signOut}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile View Switcher */}
      <div className="sm:hidden border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 bg-slate-50/70 dark:bg-slate-950/60">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onChangeTab('list')}
            className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.tabList}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('history')}
            className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.tabHistory}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
