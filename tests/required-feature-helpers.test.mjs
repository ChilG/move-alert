import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  getRequiredFeatureIssues,
  shouldShowRequiredFeatureWarning,
} = require('../.tmp-test-build/required-feature-helpers.js');

test('getRequiredFeatureIssues requires notification permission when denied', () => {
  assert.deepEqual(
    getRequiredFeatureIssues({
      batteryOptimizationStatus: 'ignored',
      notificationPermissionStatus: 'denied',
    }),
    ['notification-permission'],
  );
});

test('getRequiredFeatureIssues requires battery setup when Android is still optimized', () => {
  assert.deepEqual(
    getRequiredFeatureIssues({
      batteryOptimizationStatus: 'optimized',
      notificationPermissionStatus: 'granted',
    }),
    ['battery-optimization'],
  );
});

test('shouldShowRequiredFeatureWarning hides when required features are ready or unavailable', () => {
  assert.equal(
    shouldShowRequiredFeatureWarning({
      batteryOptimizationStatus: 'ignored',
      notificationPermissionStatus: 'granted',
    }),
    false,
  );
  assert.equal(
    shouldShowRequiredFeatureWarning({
      batteryOptimizationStatus: 'unsupported',
      notificationPermissionStatus: 'unsupported',
    }),
    false,
  );
});
