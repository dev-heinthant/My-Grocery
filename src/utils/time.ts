import { TRANSLATIONS } from '../constants/translations';
import { Language } from '../types/grocery';

export function formatRelativeTime(timestamp: number, language: Language): string {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) {
    return language === 'my' ? 'ယခုလေးတင်' : 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return language === 'my' ? `လွန်ခဲ့သော ${diffMinutes} မိနစ်` : `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return language === 'my' ? `လွန်ခဲ့သော ${diffHours} နာရီ` : `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return language === 'my' ? `လွန်ခဲ့သော ${diffDays} ရက်` : `${diffDays}d ago`;
  }

  return new Date(timestamp).toLocaleDateString(
    language === 'my' ? 'my-MM' : 'en-US',
    { month: 'short', day: 'numeric' }
  );
}

export function getLocalDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface HistoryDateOption {
  dateKey: string;
  label: string;
  subLabel: string;
}

export function getLastSevenDaysOptions(language: Language): HistoryDateOption[] {
  const t = TRANSLATIONS[language];
  const locale = language === 'my' ? 'my-MM' : 'en-US';
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const options: HistoryDateOption[] = [];

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(todayMidnight);
    d.setDate(todayMidnight.getDate() - offset);
    const dateKey = getLocalDateKey(d.getTime());

    let label: string;
    if (offset === 0) {
      label = t.historyToday;
    } else if (offset === 1) {
      label = t.historyYesterday;
    } else {
      label = d.toLocaleDateString(locale, { weekday: 'short' });
    }

    const subLabel = d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });

    options.push({ dateKey, label, subLabel });
  }

  return options;
}

export function formatClockTime(timestamp: number, language: Language): string {
  return new Date(timestamp).toLocaleTimeString(
    language === 'my' ? 'my-MM' : 'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
    }
  );
}
