import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  syncAppVersionFiles,
  syncExpoVersionConfig,
} from '../scripts/sync-app-version.mjs';

test('syncExpoVersionConfig returns a new app config with the package version', () => {
  const appConfig = {
    expo: {
      name: 'Move Alert',
      slug: 'move-alert',
      version: '1.0.0',
    },
  };

  const nextConfig = syncExpoVersionConfig(appConfig, '1.2.3');

  assert.deepEqual(nextConfig, {
    expo: {
      name: 'Move Alert',
      slug: 'move-alert',
      version: '1.2.3',
    },
  });
  assert.notEqual(nextConfig, appConfig);
  assert.notEqual(nextConfig.expo, appConfig.expo);
  assert.equal(appConfig.expo.version, '1.0.0');
});

test('syncExpoVersionConfig rejects invalid semver values', () => {
  assert.throws(
    () =>
      syncExpoVersionConfig(
        {
          expo: {
            version: '1.0.0',
          },
        },
        'release-candidate',
      ),
    /valid semver string/,
  );
});

test('syncAppVersionFiles updates app.json from package.json', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'move-alert-version-'));
  const packageJsonPath = path.join(tempDir, 'package.json');
  const appJsonPath = path.join(tempDir, 'app.json');

  await writeFile(
    packageJsonPath,
    `${JSON.stringify({ name: 'move-alert', version: '2.3.4' }, null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    appJsonPath,
    `${JSON.stringify(
      {
        expo: {
          name: 'Move Alert',
          version: '1.0.0',
        },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  const result = await syncAppVersionFiles({
    appJsonPath,
    packageJsonPath,
  });

  const nextAppJson = JSON.parse(await readFile(appJsonPath, 'utf8'));

  assert.deepEqual(result, {
    changed: true,
    version: '2.3.4',
  });
  assert.equal(nextAppJson.expo.version, '2.3.4');
});

test('syncAppVersionFiles skips rewriting when versions already match', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'move-alert-version-'));
  const packageJsonPath = path.join(tempDir, 'package.json');
  const appJsonPath = path.join(tempDir, 'app.json');
  const appJsonText = `${JSON.stringify(
    {
      expo: {
        name: 'Move Alert',
        version: '3.0.0',
      },
    },
    null,
    2,
  )}\n`;

  await writeFile(
    packageJsonPath,
    `${JSON.stringify({ name: 'move-alert', version: '3.0.0' }, null, 2)}\n`,
    'utf8',
  );
  await writeFile(appJsonPath, appJsonText, 'utf8');

  const result = await syncAppVersionFiles({
    appJsonPath,
    packageJsonPath,
  });
  const nextAppText = await readFile(appJsonPath, 'utf8');

  assert.deepEqual(result, {
    changed: false,
    version: '3.0.0',
  });
  assert.equal(nextAppText, appJsonText);
});
