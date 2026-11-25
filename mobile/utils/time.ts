import { GroceryItem, Language } from '@/types/grocery';

export interface CalendarDayOption {
  dateKey: string;
  weekdayLabel: string;
  dayNumber: string;
  isToday: boolean;
  isYesterday: boolean;
  monthDayLabel: string;
  startOfDayMs: number;
  endOfDayMs: number;
}

const WEEKDAY_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAY_SHORT_MY = ['နွေ', 'လာ', 'ဂါ', 'ဟူး', 'ကြာ', 'သော', 'နေ'] as const;
const MONTH_SHORT_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function toLocalDateKey(timestampOrDate: number | Date): string {
  const date =
    timestampOrDate instanceof Date ? timestampOrDate : new Date(timestampOrDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLast7CalendarDays(
  referenceDate: Date = new Date(),
  language: Language = 'en'
): CalendarDayOption[] {
  const todayAnchor = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0
  );

  const days: CalendarDayOption[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const dayStart = new Date(
      todayAnchor.getFullYear(),
      todayAnchor.getMonth(),
      todayAnchor.getDate() - offset,
      0,
      0,
      0,
      0
    );
    const dayEnd = new Date(
      todayAnchor.getFullYear(),
      todayAnchor.getMonth(),
      todayAnchor.getDate() - offset,
      23,
      59,
      59,
      999
    );

    const dayIdx = dayStart.getDay();
    const weekdayLabel =
      language === 'my' ? WEEKDAY_SHORT_MY[dayIdx] : WEEKDAY_SHORT_EN[dayIdx];
    const monthLabel = MONTH_SHORT_EN[dayStart.getMonth()];
    const dayNum = dayStart.getDate();

    days.push({
      dateKey: toLocalDateKey(dayStart),
      weekdayLabel,
      dayNumber: String(dayNum),
      isToday: offset === 0,
      isYesterday: offset === 1,
      monthDayLabel:
        language === 'my'
          ? `${dayStart.getMonth() + 1} လပိုင်း ${dayNum}`
          : `${monthLabel} ${dayNum}`,
      startOfDayMs: dayStart.getTime(),
      endOfDayMs: dayEnd.getTime(),
    });
  }

  return days;
}

export function filterPurchasedItemsForDate(
  items: GroceryItem[],
  dateKey: string,
  validWindowKeys?: Set<string>
): GroceryItem[] {
  if (!dateKey) return [];
  if (validWindowKeys && !validWindowKeys.has(dateKey)) {
    return [];
  }

  return items
    .filter((item) => {
      if (item.isDeletedLocally || !item.isPurchased) return false;
      if (
        typeof item.purchasedAt !== 'number' ||
        !Number.isFinite(item.purchasedAt) ||
        item.purchasedAt <= 0
      ) {
        return false;
      }
      return toLocalDateKey(item.purchasedAt) === dateKey;
    })
    .sort((a, b) => (b.purchasedAt ?? 0) - (a.purchasedAt ?? 0));
}

export function formatLocalTime(timestamp: number, language: Language): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '';
  const date = new Date(timestamp);
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours24 >= 12 ? (language === 'my' ? 'ညနေ' : 'PM') : language === 'my' ? 'နံနက်' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

export function formatRelativeTime(timestamp: number, language: Language): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (language === 'my') {
    if (diffInMinutes < 1) return 'ယခုလေးတင်';
    if (diffInMinutes < 60) return `${diffInMinutes} မိနစ်ခန့်က`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} နာရီခန့်က`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'မနေ့က';
    if (diffInDays < 7) return `${diffInDays} ရက်ခန့်က`;
    return new Date(timestamp).toLocaleDateString();
  }

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function getEffectiveUpdatedAt(createdAt: number, updatedAt?: number | null): number {
  if (typeof updatedAt === 'number' && !Number.isNaN(updatedAt) && updatedAt > 0) {
    return updatedAt;
  }
  return createdAt;
}
