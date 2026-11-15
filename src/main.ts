import { availabilityByDay } from './booking/availability';
import { clinic, setup } from './booking/clinic';
import { appointmentsOn, emptySchedule } from './booking/schedule';
import { isOpenAt, nextOpening, rangesOn } from '@shared/hours';
import { createPersistentStore } from '@shared/store';
import { formatTime, formatTimeShort, relativeDay, zonedNow } from '@shared/time';
import './styles/base.css';
import './home.css';

const MY_TIME_ZONE = 'Europe/Kyiv';

// Same store as the booking demo, so a visit booked there shows up in the count here.
const schedule = createPersistentStore({ key: 'demo.booking', version: 1, initial: emptySchedule });

const byId = (id: string) => document.getElementById(id);

function clock(timeZone: string): string {
  return new Date().toLocaleTimeString('en-US', { timeZone, hour: 'numeric', minute: '2-digit' });
}

function deskStatus(): string {
  const now = zonedNow(clinic.timeZone);
  if (isOpenAt(setup.rules.hours, now)) {
    const closesAt = rangesOn(setup.rules.hours, now.date).find((r) => now.minutes < r.end)?.end;
    return closesAt ? `Open until ${formatTime(closesAt)}` : 'Open';
  }
  const opening = nextOpening(setup.rules.hours, now);
  if (!opening) return 'Closed';
  const day =
    opening.date === now.date ? '' : ` ${relativeDay(opening.date, now.date).toLowerCase()}`;
  return `Closed, opens ${formatTimeShort(opening.minutes)}${day}`;
}

function openCleaningSlots(): number {
  const cleaning = setup.services.find((s) => s.id === 'cleaning');
  if (!cleaning) return 0;
  const state = schedule.get();
  return availabilityByDay({
    service: cleaning,
    providers: setup.providers,
    rules: { ...setup.rules, horizonDays: 7 },
    now: zonedNow(clinic.timeZone),
    appointmentsOn: (date) => appointmentsOn(state, date, setup),
  }).reduce((total, day) => total + day.slots.length, 0);
}

function update() {
  const set = (id: string, text: string) => {
    const el = byId(id);
    if (el) el.textContent = text;
  };
  set('my-time', clock(MY_TIME_ZONE));
  set('austin-time', clock(clinic.timeZone));
  set('desk-status', deskStatus());
  set('open-slots', `${openCleaningSlots()} cleaning slots`);
}

update();
setInterval(update, 30_000);
schedule.subscribe(update);

const year = byId('year');
if (year) year.textContent = String(new Date().getFullYear());
