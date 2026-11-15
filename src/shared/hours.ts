import { addDays, weekday, type IsoDate, type Minutes, type ZonedNow } from './time';

export interface TimeRange {
  start: Minutes;
  end: Minutes;
}

/** Opening hours indexed by weekday, 0 = Sunday. A day may have several ranges (lunch break). */
export type WeeklyHours = readonly (readonly TimeRange[])[];

export function rangesOn(hours: WeeklyHours, date: IsoDate): readonly TimeRange[] {
  return hours[weekday(date)] ?? [];
}

export function isOpenAt(hours: WeeklyHours, now: ZonedNow): boolean {
  return rangesOn(hours, now.date).some((r) => now.minutes >= r.start && now.minutes < r.end);
}

/** Next moment the business opens, or the current moment if it is open right now. */
export function nextOpening(hours: WeeklyHours, now: ZonedNow): ZonedNow | null {
  for (let offset = 0; offset < 8; offset++) {
    const date = addDays(now.date, offset);
    for (const range of rangesOn(hours, date)) {
      if (offset > 0 || range.end > now.minutes) {
        return { date, minutes: offset === 0 ? Math.max(range.start, now.minutes) : range.start };
      }
    }
  }
  return null;
}
