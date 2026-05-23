import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildReminderDates,
  getPresentedReminderNotificationIds,
  getReminderNotificationIdentifier,
  isReminderNotificationResponse,
  isReminderScheduledNotification,
  REMINDER_NOTIFICATION_SCOPE,
} = require('../.tmp-test-build/reminder-notification-helpers.js');
const {
  createNextReminderDateFromAnchor,
  getNextReminderDate,
  isQuietHoursActive,
} = require('../.tmp-test-build/today/today-helpers.js');

function createState(overrides = {}) {
  return {
    intervalMinutes: 45,
    nextReminderAt: null,
    quietHoursDays: [0, 1, 2, 3, 4, 5, 6],
    quietHoursEnabled: false,
    quietHoursEndTime: '09:00',
    quietHoursStartTime: '17:00',
    reminderEnabled: true,
    timeline: [],
    ...overrides,
  };
}

test('isQuietHoursActive handles overnight quiet hours across midnight', () => {
  const state = createState({
    quietHoursEnabled: true,
  });

  assert.equal(isQuietHoursActive(state, new Date('2026-05-20T18:30:00+07:00')), true);
  assert.equal(isQuietHoursActive(state, new Date('2026-05-21T08:30:00+07:00')), true);
  assert.equal(isQuietHoursActive(state, new Date('2026-05-21T09:30:00+07:00')), false);
});

test('getNextReminderDate rolls stale next entries forward to the next interval slot', () => {
  const nextReminderDate = getNextReminderDate(
    createState({
      intervalMinutes: 45,
      nextReminderAt: '2026-05-20T02:00:00.000Z',
    }),
    new Date('2026-05-20T10:10:00+07:00'),
  );

  assert.equal(nextReminderDate.toISOString(), '2026-05-20T03:30:00.000Z');
});

test('createNextReminderDateFromAnchor schedules from the triggering event instead of now', () => {
  const nextReminderDate = createNextReminderDateFromAnchor(
    createState({
      intervalMinutes: 60,
    }),
    new Date('2026-05-20T09:15:00+07:00'),
  );

  assert.equal(nextReminderDate.toISOString(), '2026-05-20T03:15:00.000Z');
});

test('buildReminderDates excludes reminders during quiet hours', () => {
  const quietHoursState = createState({
    quietHoursEnabled: true,
  });
  const reminderDates = buildReminderDates(
    {
      ...quietHoursState,
      intervalMinutes: 30,
      nextReminderAt: '2026-05-20T09:30:00.000Z',
    },
    new Date('2026-05-20T16:00:00+07:00'),
  );

  assert.equal(reminderDates[0]?.toISOString(), '2026-05-20T09:30:00.000Z');
  assert.equal(reminderDates[1]?.toISOString(), '2026-05-21T02:00:00.000Z');
  assert.ok(reminderDates.every((date) => !isQuietHoursActive(quietHoursState, date)));
});

test('getNextReminderDate does not loop forever when every day is quiet all day', () => {
  const now = new Date('2026-05-21T00:01:00+07:00');
  const nextReminderDate = getNextReminderDate(
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

test('notification helpers target only real reminder notifications', () => {
  assert.equal(
    isReminderScheduledNotification({
      content: {
        data: {
          scope: REMINDER_NOTIFICATION_SCOPE,
        },
      },
      identifier: getReminderNotificationIdentifier(new Date('2026-05-20T09:00:00+07:00')),
    }),
    true,
  );

  assert.equal(
    isReminderNotificationResponse({
      notification: {
        request: {
          content: {
            data: {
              isDebug: true,
              scope: REMINDER_NOTIFICATION_SCOPE,
            },
          },
          identifier: 'debug-reminder',
        },
      },
    }),
    false,
  );

  assert.deepEqual(
    getPresentedReminderNotificationIds([
      {
        request: {
          content: {
            data: {
              scope: REMINDER_NOTIFICATION_SCOPE,
            },
          },
          identifier: 'real-reminder',
        },
      },
      {
        request: {
          content: {
            data: {
              isDebug: true,
              scope: REMINDER_NOTIFICATION_SCOPE,
            },
          },
          identifier: 'debug-reminder',
        },
      },
      {
        request: {
          content: {
            data: {
              scope: 'other-scope',
            },
          },
          identifier: 'other-notification',
        },
      },
    ]),
    ['real-reminder'],
  );
});
