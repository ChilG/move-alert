import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SEMVER_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
}

export function syncExpoVersionConfig(appConfig, version) {
  assertObject(appConfig, 'app.json');

  if (typeof version !== 'string' || !SEMVER_PATTERN.test(version.trim())) {
    throw new Error(
      `package.json version must be a valid semver string. Received "${version}".`,
    );
  }

  assertObject(appConfig.expo, 'app.json expo');

  return {
    ...appConfig,
    expo: {
      ...appConfig.expo,
      version: version.trim(),
    },
  };
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse ${label}: ${message}`);
  }
}

export async function syncAppVersionFiles({
  appJsonPath,
  packageJsonPath,
} = {}) {
  const packagePath = packageJsonPath ?? path.resolve(process.cwd(), 'package.json');
  const appPath = appJsonPath ?? path.resolve(process.cwd(), 'app.json');

  const [packageText, appText] = await Promise.all([
    readFile(packagePath, 'utf8'),
    readFile(appPath, 'utf8'),
  ]);

  const packageJson = parseJson(packageText, 'package.json');
  const appJson = parseJson(appText, 'app.json');
  const nextVersion = packageJson.version;
  const nextAppJson = syncExpoVersionConfig(appJson, nextVersion);
  const nextAppText = `${JSON.stringify(nextAppJson, null, 2)}\n`;

  if (nextAppText === appText) {
    return {
      changed: false,
      version: nextVersion,
    };
  }

  await writeFile(appPath, nextAppText, 'utf8');

  return {
    changed: true,
    version: nextVersion,
  };
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  syncAppVersionFiles()
    .then(({ changed, version }) => {
      const status = changed ? 'updated' : 'already matched';
      console.log(`Synced Expo app version to ${version} (${status}).`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
