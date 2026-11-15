import { rangesOn } from '@shared/hours';
import { createCode, createRandom, hashString, pick } from '@shared/random';
import type { IsoDate, ZonedNow } from '@shared/time';
import { findSlots } from './availability';
import type { Appointment, AvailabilityRules, Patient, Provider, Service } from './types';

export interface ClinicSetup {
  providers: readonly Provider[];
  services: readonly Service[];
  rules: AvailabilityRules;
  codePrefix: string;
}

/**
 * What the demo persists. Phone bookings are generated from the date, so the calendar always
 * looks lived-in without storing weeks of fake data; only online bookings and cancellations
 * are saved.
 */
export interface ScheduleState {
  online: Appointment[];
  cancelled: string[];
}

export const emptySchedule = (): ScheduleState => ({ online: [], cancelled: [] });

const FIRST_NAMES = [
  'Maria',
  'Daniel',
  'Aisha',
  'Tom',
  'Grace',
  'Luis',
  'Hannah',
  'Ethan',
  'Priya',
  'Owen',
  'Chloe',
  'Marcus',
  'Sofia',
  'Noah',
  'Ruth',
  'Kevin',
  'Jada',
  'Andre',
  'Lena',
  'Sam',
];
const LAST_INITIALS = [...'ABCDGHKLMNPRSTVW'];

/** Deterministic "booked by phone" appointments for a day, roughly half of each chair's time. */
export function phoneBookingsOn(date: IsoDate, setup: ClinicSetup): Appointment[] {
  const random = createRandom(hashString(`brightside:${date}`));
  const appointments: Appointment[] = [];

  for (const provider of setup.providers) {
    const options = setup.services.filter((s) => s.role === provider.role);
    for (const range of rangesOn(setup.rules.hours, date)) {
      let start = range.start;
      while (start < range.end) {
        const service = pick(random, options);
        if (random() < 0.45 && start + service.durationMin <= range.end) {
          appointments.push({
            id: `phone-${date}-${appointments.length}`,
            serviceId: service.id,
            providerId: provider.id,
            date,
            start,
            end: start + service.durationMin,
            source: 'phone',
            patient: {
              name: `${pick(random, FIRST_NAMES)} ${pick(random, LAST_INITIALS)}.`,
              phone: `512555${String(1000 + Math.floor(random() * 9000))}`,
              isNew: random() < 0.15,
            },
          });
          start += service.durationMin;
        } else {
          start += setup.rules.slotStepMin;
        }
      }
    }
  }
  return appointments;
}

export function appointmentsOn(
  state: ScheduleState,
  date: IsoDate,
  setup: ClinicSetup,
): Appointment[] {
  const cancelled = new Set(state.cancelled);
  return [...phoneBookingsOn(date, setup), ...state.online.filter((a) => a.date === date)]
    .filter((a) => !cancelled.has(a.id))
    .sort((a, b) => a.start - b.start);
}

export interface BookingRequest {
  serviceId: string;
  date: IsoDate;
  start: number;
  patient: Patient;
}

export type BookingResult =
  | { ok: true; appointment: Appointment; state: ScheduleState }
  | { ok: false; reason: 'slot-taken' | 'unknown-service' };

/**
 * Re-checks availability at confirmation time: the slot may have been taken in another tab
 * (or, in production, by the front desk) while the patient was typing their details.
 */
export function book(
  state: ScheduleState,
  request: BookingRequest,
  setup: ClinicSetup,
  now: ZonedNow,
  createdAt: Date = new Date(),
): BookingResult {
  const service = setup.services.find((s) => s.id === request.serviceId);
  if (!service) return { ok: false, reason: 'unknown-service' };

  const slot = findSlots({
    date: request.date,
    service,
    providers: setup.providers,
    appointments: appointmentsOn(state, request.date, setup),
    rules: setup.rules,
    now,
  }).find((s) => s.start === request.start);
  if (!slot) return { ok: false, reason: 'slot-taken' };

  const code = `${setup.codePrefix}-${createCode(4)}`;
  const appointment: Appointment = {
    id: `online-${code}`,
    serviceId: service.id,
    providerId: slot.providerId,
    date: request.date,
    start: slot.start,
    end: slot.end,
    patient: request.patient,
    source: 'online',
    code,
    createdAt: createdAt.toISOString(),
  };
  return { ok: true, appointment, state: { ...state, online: [...state.online, appointment] } };
}

export function cancel(state: ScheduleState, appointmentId: string): ScheduleState {
  if (state.cancelled.includes(appointmentId)) return state;
  return { ...state, cancelled: [...state.cancelled, appointmentId] };
}

export function recentOnlineBookings(state: ScheduleState, limit = 5): Appointment[] {
  const cancelled = new Set(state.cancelled);
  return state.online
    .filter((a) => !cancelled.has(a.id))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, limit);
}
