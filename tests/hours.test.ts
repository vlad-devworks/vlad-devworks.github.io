import { describe, expect, it } from 'vitest';
import { isOpenAt, nextOpening, type WeeklyHours } from '../src/shared/hours';
import { hm } from '../src/shared/time';

describe('opening hours', () => {
  const hours: WeeklyHours = [
    [],
    [
      { start: hm(8), end: hm(12) },
      { start: hm(13), end: hm(18) },
    ],
    [{ start: hm(8), end: hm(18) }],
    [],
    [],
    [],
    [],
  ];

  it('is closed over lunch', () => {
    expect(isOpenAt(hours, { date: '2026-11-16', minutes: hm(11, 59) })).toBe(true);
    expect(isOpenAt(hours, { date: '2026-11-16', minutes: hm(12, 30) })).toBe(false);
    expect(isOpenAt(hours, { date: '2026-11-16', minutes: hm(18) })).toBe(false);
  });

  it('finds the next opening across days', () => {
    expect(nextOpening(hours, { date: '2026-11-15', minutes: hm(21) })).toEqual({
      date: '2026-11-16',
      minutes: hm(8),
    });
    expect(nextOpening(hours, { date: '2026-11-16', minutes: hm(12, 15) })).toEqual({
      date: '2026-11-16',
      minutes: hm(13),
    });
    expect(nextOpening(hours, { date: '2026-11-17', minutes: hm(19) })).toEqual({
      date: '2026-11-23',
      minutes: hm(8),
    });
  });

  it('returns the current moment when already open', () => {
    expect(nextOpening(hours, { date: '2026-11-16', minutes: hm(9, 15) })).toEqual({
      date: '2026-11-16',
      minutes: hm(9, 15),
    });
  });
});
