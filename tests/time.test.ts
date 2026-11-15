import { describe, expect, it } from 'vitest';
import { addDays, formatTime, hm, weekday, zonedNow } from '../src/shared/time';

describe('time', () => {
  it('converts an instant to wall-clock time in another zone', () => {
    // 03:40 UTC on Nov 16 is still the evening of Nov 15 in Austin (CST, UTC-6).
    expect(zonedNow('America/Chicago', new Date('2026-11-16T03:40:00Z'))).toEqual({
      date: '2026-11-15',
      minutes: hm(21, 40),
    });
  });

  it('adds days across month and DST boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('knows the weekday of an ISO date regardless of local zone', () => {
    expect(weekday('2026-11-15')).toBe(0);
    expect(weekday('2026-11-16')).toBe(1);
  });

  it('formats 12-hour times', () => {
    expect(formatTime(0)).toBe('12:00 AM');
    expect(formatTime(hm(9, 5))).toBe('9:05 AM');
    expect(formatTime(hm(12))).toBe('12:00 PM');
    expect(formatTime(hm(17, 30))).toBe('5:30 PM');
  });
});
