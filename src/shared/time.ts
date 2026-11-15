/**
 * Calendar dates are ISO strings (`2026-11-16`) and times of day are minutes after midnight,
 * both in the business's own time zone. Keeping wall-clock values apart from `Date` avoids the
 * classic off-by-one-day bugs when the visitor sits in a different zone than the business.
 */
export type IsoDate = string;
export type Minutes = number;

export interface ZonedNow {
  date: IsoDate;
  minutes: Minutes;
}

const zonedFormatters = new Map<string, Intl.DateTimeFormat>();

function zonedFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = zonedFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    zonedFormatters.set(timeZone, formatter);
  }
  return formatter;
}

export function zonedNow(timeZone: string, at: Date = new Date()): ZonedNow {
  const parts = zonedFormatter(timeZone).formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    minutes: Number(part('hour')) * 60 + Number(part('minute')),
  };
}

const asUtcMidnight = (date: IsoDate) => new Date(`${date}T00:00:00Z`);

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = asUtcMidnight(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, same as `Date#getDay`. */
export function weekday(date: IsoDate): number {
  return asUtcMidnight(date).getUTCDay();
}

export function formatDate(
  date: IsoDate,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' },
): string {
  return asUtcMidnight(date).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

export function dayOfMonth(date: IsoDate): number {
  return asUtcMidnight(date).getUTCDate();
}

export function relativeDay(date: IsoDate, today: IsoDate): string {
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  return formatDate(date);
}

export function formatTime(minutes: Minutes): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 && h < 24 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Shorter form for dense UIs: `9 AM`, `9:30 AM`. */
export function formatTimeShort(minutes: Minutes): string {
  return formatTime(minutes).replace(':00', '');
}

export const hm = (hours: number, minutes = 0): Minutes => hours * 60 + minutes;

export function formatAgo(from: Date, now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - from.getTime()) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}
