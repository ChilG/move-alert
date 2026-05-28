import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getReminderNotificationSyncAction } = require('../.tmp-test-build/reminder-sync-helpers.js');

test('getReminderNotificationSyncAction waits while auth is loading', () => {
  assert.equal(
    getReminderNotificationSyncAction({
      authStatus: 'loading',
      userId: null,
    }),
    'wait',
  );
});

test('getReminderNotificationSyncAction syncs once a user id is available', () => {
  assert.equal(
    getReminderNotificationSyncAction({
      authStatus: 'authenticated',
      userId: 'user-1',
    }),
    'sync',
  );
});

test('getReminderNotificationSyncAction clears only after auth is signed out', () => {
  assert.equal(
    getReminderNotificationSyncAction({
      authStatus: 'signed-out',
      userId: null,
    }),
    'clear',
  );
});
