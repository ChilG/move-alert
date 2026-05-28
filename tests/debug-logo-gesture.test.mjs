import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  debugLogoTapTarget,
  debugLogoTapWindowMs,
  getNextDebugLogoTapState,
  initialDebugLogoTapState,
} = require('../.tmp-test-build/debug-logo-gesture.js');

test('debug logo gesture unlocks after ten taps inside the tap window', () => {
  const result = Array.from({ length: debugLogoTapTarget }).reduce(
    (state, _tap, index) => getNextDebugLogoTapState(state, 1000 + index * 100),
    initialDebugLogoTapState,
  );

  assert.equal(result.count, debugLogoTapTarget);
  assert.equal(result.firstTapAt, 1000);
  assert.equal(result.isUnlocked, true);
});

test('debug logo gesture restarts when taps are too far apart', () => {
  const firstTapState = getNextDebugLogoTapState(initialDebugLogoTapState, 1000);
  const result = getNextDebugLogoTapState(firstTapState, 1000 + debugLogoTapWindowMs + 1);

  assert.equal(result.count, 1);
  assert.equal(result.firstTapAt, 1000 + debugLogoTapWindowMs + 1);
  assert.equal(result.isUnlocked, false);
});
