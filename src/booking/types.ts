import type { WeeklyHours } from '@shared/hours';
import type { IsoDate, Minutes } from '@shared/time';

export type ProviderRole = 'dentist' | 'hygienist';

export interface Provider {
  id: string;
  name: string;
  title: string;
  role: ProviderRole;
}

export interface Service {
  id: string;
  name: string;
  summary: string;
  durationMin: Minutes;
  role: ProviderRole;
}

export interface AvailabilityRules {
  hours: WeeklyHours;
  slotStepMin: Minutes;
  /** Free time kept after each visit for the same provider (room turnover, notes). */
  bufferMin: Minutes;
  /** Online bookings close this long before a slot starts. */
  minNoticeMin: Minutes;
  horizonDays: number;
}

export interface Patient {
  name: string;
  phone: string;
  email?: string;
  isNew: boolean;
  note?: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  providerId: string;
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  patient: Patient;
  source: 'online' | 'phone';
  code?: string;
  /** ISO timestamp, only meaningful for online bookings. */
  createdAt?: string;
}

export interface Slot {
  start: Minutes;
  end: Minutes;
  providerId: string;
}
