import { hm } from '@shared/time';
import type { ClinicSetup } from './schedule';
import type { AvailabilityRules, Provider, Service } from './types';

export const clinic = {
  name: 'Brightside Dental',
  timeZoneLabel: 'Austin time',
  domain: 'brightsidedental.com',
  city: 'South Austin, TX',
  address: '4810 S Congress Ave, Suite 120',
  phone: '(512) 555-0100',
  timeZone: 'America/Chicago',
  codePrefix: 'BSD',
} as const;

export const providers: readonly Provider[] = [
  { id: 'patel', name: 'Dr. Anita Patel', title: 'DDS', role: 'dentist' },
  { id: 'liu', name: 'Megan Liu', title: 'RDH', role: 'hygienist' },
  { id: 'ruiz', name: 'Carlos Ruiz', title: 'RDH', role: 'hygienist' },
];

export const services: readonly Service[] = [
  {
    id: 'cleaning',
    name: 'Cleaning and checkup',
    summary: 'Exam, cleaning and X-rays if you are due',
    durationMin: 60,
    role: 'hygienist',
  },
  {
    id: 'new-patient',
    name: 'New patient visit',
    summary: 'Full exam, X-rays and a treatment plan',
    durationMin: 60,
    role: 'dentist',
  },
  {
    id: 'pain',
    name: 'Tooth pain',
    summary: 'We keep short slots open for this every day',
    durationMin: 30,
    role: 'dentist',
  },
  {
    id: 'kids',
    name: "Child's visit",
    summary: 'Cleaning and checkup for ages 3 to 12',
    durationMin: 45,
    role: 'hygienist',
  },
  {
    id: 'whitening',
    name: 'Whitening consult',
    summary: 'Talk through options and pricing',
    durationMin: 30,
    role: 'dentist',
  },
];

const weekday = [
  { start: hm(8), end: hm(12) },
  { start: hm(13), end: hm(18) },
];

export const rules: AvailabilityRules = {
  hours: [
    [],
    weekday,
    weekday,
    [
      { start: hm(8), end: hm(12) },
      { start: hm(13), end: hm(19) },
    ], // late Wednesdays
    weekday,
    [{ start: hm(8), end: hm(14) }],
    [],
  ],
  slotStepMin: 30,
  bufferMin: 0,
  minNoticeMin: 120,
  horizonDays: 14,
};

export const setup: ClinicSetup = { providers, services, rules, codePrefix: clinic.codePrefix };
