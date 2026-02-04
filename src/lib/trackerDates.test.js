import test from 'node:test';
import assert from 'node:assert/strict';
import { format } from 'date-fns';
import { getHabitStartDateString, getEligibleDays, isOnOrAfterHabitCreated } from './trackerDates.js';

const formatDay = (date) => format(date, 'yyyy-MM-dd');

test('getHabitStartDateString clamps to month start', () => {
  const currentMonth = new Date(2026, 1, 1);
  const habit = { created_at: '2026-01-10T08:00:00Z' };
  const start = getHabitStartDateString(habit, currentMonth);
  assert.equal(start, '2026-02-01');
});

test('getHabitStartDateString uses habit created_at when inside month', () => {
  const currentMonth = new Date(2026, 1, 1);
  const habit = { created_at: '2026-02-05T15:30:00Z' };
  const start = getHabitStartDateString(habit, currentMonth);
  assert.equal(start, '2026-02-05');
});

test('getEligibleDays excludes dates before habit start', () => {
  const habitStart = '2026-02-05';
  const days = [
    new Date(2026, 1, 1),
    new Date(2026, 1, 4),
    new Date(2026, 1, 5),
    new Date(2026, 1, 10),
  ];
  const eligible = getEligibleDays(days, habitStart).map(formatDay);
  assert.deepEqual(eligible, ['2026-02-05', '2026-02-10']);
});

test('isOnOrAfterHabitCreated respects habit created date', () => {
  const habit = { created_at: '2026-02-03T12:00:00Z' };
  assert.equal(isOnOrAfterHabitCreated('2026-02-02', habit), false);
  assert.equal(isOnOrAfterHabitCreated('2026-02-03', habit), true);
  assert.equal(isOnOrAfterHabitCreated(new Date(2026, 1, 4), habit), true);
});
