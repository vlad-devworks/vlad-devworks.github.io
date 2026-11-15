import { rangesOn } from '@shared/hours';
import { addDays, type IsoDate, type Minutes, type ZonedNow } from '@shared/time';
import type { Appointment, AvailabilityRules, Provider, Service, Slot } from './types';

export interface SlotQuery {
  date: IsoDate;
  service: Service;
  providers: readonly Provider[];
  /** Appointments for at least `date`; others are ignored. */
  appointments: readonly Appointment[];
  rules: AvailabilityRules;
  now: ZonedNow;
}

const overlaps = (aStart: Minutes, aEnd: Minutes, bStart: Minutes, bEnd: Minutes) =>
  aStart < bEnd && bStart < aEnd;

/**
 * Open start times for one service on one day. A time is offered when at least one provider
 * with the right role is free for the whole visit, including the buffer after it.
 */
export function findSlots({
  date,
  service,
  providers,
  appointments,
  rules,
  now,
}: SlotQuery): Slot[] {
  if (date < now.date) return [];

  const earliest = date === now.date ? now.minutes + rules.minNoticeMin : 0;
  const booked = appointments.filter((a) => a.date === date);
  const bookedMinutes = (providerId: string) =>
    booked.filter((a) => a.providerId === providerId).reduce((sum, a) => sum + a.end - a.start, 0);

  // Offer the least busy provider first so the day fills evenly across chairs.
  const candidates = providers
    .filter((p) => p.role === service.role)
    .sort((a, b) => bookedMinutes(a.id) - bookedMinutes(b.id));

  const isFree = (providerId: string, start: Minutes, end: Minutes) =>
    !booked.some(
      (a) =>
        a.providerId === providerId &&
        overlaps(start, end + rules.bufferMin, a.start, a.end + rules.bufferMin),
    );

  const slots: Slot[] = [];
  for (const range of rangesOn(rules.hours, date)) {
    for (
      let start = range.start;
      start + service.durationMin <= range.end;
      start += rules.slotStepMin
    ) {
      if (start < earliest) continue;
      const end = start + service.durationMin;
      const provider = candidates.find((p) => isFree(p.id, start, end));
      if (provider) slots.push({ start, end, providerId: provider.id });
    }
  }
  return slots;
}

export interface DayAvailability {
  date: IsoDate;
  isOpen: boolean;
  slots: Slot[];
}

type RangeQuery = Omit<SlotQuery, 'date' | 'appointments'> & {
  appointmentsOn: (date: IsoDate) => readonly Appointment[];
};

export function availabilityByDay({ appointmentsOn, ...query }: RangeQuery): DayAvailability[] {
  return Array.from({ length: query.rules.horizonDays }, (_, offset) => {
    const date = addDays(query.now.date, offset);
    return {
      date,
      isOpen: rangesOn(query.rules.hours, date).length > 0,
      slots: findSlots({ ...query, date, appointments: appointmentsOn(date) }),
    };
  });
}
