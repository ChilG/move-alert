import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  createNextServerReminderDateFromAnchor,
  getNextServerReminderDate,
  getReminderPushMessage,
  isQuietHoursActiveForTimezone,
} = require('../.tmp-test-build/supabase/functions/_shared/reminder-helpers.js');

function createState(overrides = {}) {
  return {
    intervalMinutes: 45,
    nextReminderAt: null,
    quietHoursDays: [0, 1, 2, 3, 4, 5, 6],
    quietHoursEnabled: false,
    quietHoursEndTime: '09:00',
    quietHoursStartTime: '17:00',
    timezone: 'Asia/Bangkok',
    ...overrides,
  };
}

test('server reminder helper handles overnight quiet hours in the device timezone', () => {
  const state = createState({
    quietHoursEnabled: true,
  });

  assert.equal(isQuietHoursActiveForTimezone(state, new Date('2026-05-20T11:30:00.000Z')), true);
  assert.equal(isQuietHoursActiveForTimezone(state, new Date('2026-05-21T01:30:00.000Z')), true);
  assert.equal(isQuietHoursActiveForTimezone(state, new Date('2026-05-21T02:30:00.000Z')), false);
});

test('server reminder helper rolls stale reminders forward', () => {
  const nextReminderDate = getNextServerReminderDate(
    createState({
      intervalMinutes: 45,
      nextReminderAt: '2026-05-20T02:00:00.000Z',
    }),
    new Date('2026-05-20T03:10:00.000Z'),
  );

  assert.equal(nextReminderDate.toISOString(), '2026-05-20T03:30:00.000Z');
});

test('server reminder helper schedules from the triggering event', () => {
  const nextReminderDate = createNextServerReminderDateFromAnchor(
    createState({
      intervalMinutes: 60,
    }),
    new Date('2026-05-20T02:15:00.000Z'),
  );

  assert.equal(nextReminderDate.toISOString(), '2026-05-20T03:15:00.000Z');
});

test('server reminder helper falls back when every day is quiet all day', () => {
  const now = new Date('2026-05-20T17:01:00.000Z');
  const nextReminderDate = getNextServerReminderDate(
    createState({
      nextReminderAt: '2026-05-20T16:30:00.000Z',
      quietHoursEnabled: true,
      quietHoursEndTime: '00:00',
      quietHoursStartTime: '00:00',
    }),
    now,
  );

  assert.equal(nextReminderDate.toISOString(), new Date(now.getTime() + 45 * 60 * 1000).toISOString());
});

test('server reminder push messages are localized', () => {
  assert.deepEqual(getReminderPushMessage('en'), {
    body: 'Stand up, stretch, and reset your posture for a moment.',
    title: 'Time to move',
  });
  assert.deepEqual(getReminderPushMessage('th'), {
    body: 'ลุกขึ้นยืดเส้น คลายตัว และรีเซ็ตท่าทางสักครู่',
    title: 'ได้เวลาขยับร่างกาย',
  });
  assert.equal(getReminderPushMessage('unknown').title, 'ได้เวลาขยับร่างกาย');
});
