import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { compareAppVersions, determineAppUpdatePrompt } = require('../.tmp-test-build/app-update/app-update-decision.js');

function createPolicy(overrides = {}) {
  return {
    forceUpdate: false,
    latestVersion: '1.3.0',
    messageEn: 'Update Move Alert.',
    messageTh: 'อัปเดต Move Alert',
    minimumSupportedVersion: '1.2.0',
    storeUrl: 'https://example.com/store',
    ...overrides,
  };
}

test('compareAppVersions compares semantic versions numerically', () => {
  assert.equal(compareAppVersions('1.10.0', '1.2.0'), 1);
  assert.equal(compareAppVersions('1.2.0', '1.2.0'), 0);
  assert.equal(compareAppVersions('1.1.9', '1.2.0'), -1);
});

test('determineAppUpdatePrompt forces updates below the minimum supported version', () => {
  const prompt = determineAppUpdatePrompt({
    currentVersion: '1.1.9',
    dismissedLatestVersion: null,
    language: 'th',
    policy: createPolicy(),
  });

  assert.deepEqual(prompt, {
    kind: 'forced',
    message: 'อัปเดต Move Alert',
    storeUrl: 'https://example.com/store',
    targetVersion: '1.3.0',
  });
});

test('determineAppUpdatePrompt shows optional updates once per latest version', () => {
  const visiblePrompt = determineAppUpdatePrompt({
    currentVersion: '1.2.2',
    dismissedLatestVersion: null,
    language: 'en',
    policy: createPolicy(),
  });
  const dismissedPrompt = determineAppUpdatePrompt({
    currentVersion: '1.2.2',
    dismissedLatestVersion: '1.3.0',
    language: 'en',
    policy: createPolicy(),
  });

  assert.equal(visiblePrompt?.kind, 'optional');
  assert.equal(visiblePrompt?.message, 'Update Move Alert.');
  assert.equal(dismissedPrompt, null);
});

test('determineAppUpdatePrompt respects remote force update below latest version', () => {
  const prompt = determineAppUpdatePrompt({
    currentVersion: '1.2.2',
    dismissedLatestVersion: '1.3.0',
    language: 'en',
    policy: createPolicy({ forceUpdate: true }),
  });

  assert.equal(prompt?.kind, 'forced');
});

test('determineAppUpdatePrompt returns null when policy is missing or current app is latest', () => {
  assert.equal(
    determineAppUpdatePrompt({
      currentVersion: '1.3.0',
      dismissedLatestVersion: null,
      language: 'en',
      policy: createPolicy(),
    }),
    null,
  );
  assert.equal(
    determineAppUpdatePrompt({
      currentVersion: '1.0.0',
      dismissedLatestVersion: null,
      language: 'en',
      policy: null,
    }),
    null,
  );
});
