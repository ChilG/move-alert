import { existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REQUIRED_ANDROID_PACKAGES = [
  {
    id: 'platform-tools',
    pathParts: ['platform-tools', 'adb'],
    install: 'platform-tools',
  },
  {
    id: 'platforms;android-36',
    pathParts: ['platforms', 'android-36', 'source.properties'],
    install: 'platforms;android-36',
  },
  {
    id: 'build-tools;36.0.0',
    pathParts: ['build-tools', '36.0.0', 'source.properties'],
    install: 'build-tools;36.0.0',
  },
  {
    id: 'ndk;27.1.12297006',
    pathParts: ['ndk', '27.1.12297006', 'source.properties'],
    install: 'ndk;27.1.12297006',
  },
];

function run(command, args = []) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function commandWorks(command, args = ['--version']) {
  const result = run(command, args);
  return result.status === 0;
}

function statusIcon(ok) {
  return ok ? 'OK' : 'MISSING';
}

function printCheck(ok, label, detail) {
  const suffix = detail ? ` - ${detail}` : '';
  console.log(`[${statusIcon(ok)}] ${label}${suffix}`);
}

function sdkRootCandidates() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
  ].filter(Boolean);

  if (process.platform === 'darwin') {
    candidates.push(path.join(os.homedir(), 'Library', 'Android', 'sdk'));
  }

  candidates.push(path.join(os.homedir(), 'Android', 'Sdk'));

  return [...new Set(candidates)];
}

function findAndroidSdkRoot() {
  return sdkRootCandidates().find((candidate) => existsSync(candidate));
}

function findSdkManager(sdkRoot) {
  const candidates = [
    path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin', 'sdkmanager'),
    path.join(sdkRoot, 'tools', 'bin', 'sdkmanager'),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

function hasAndroidCmake(sdkRoot) {
  const cmakeRoot = path.join(sdkRoot, 'cmake');
  if (!existsSync(cmakeRoot)) {
    return false;
  }

  return readdirSync(cmakeRoot, { withFileTypes: true }).some((entry) => {
    if (!entry.isDirectory()) {
      return false;
    }

    return existsSync(path.join(cmakeRoot, entry.name, 'source.properties'));
  });
}

function checkAndroid() {
  console.log('Android device preflight');

  const failures = [];
  const warnings = [];
  const sdkRoot = findAndroidSdkRoot();

  printCheck(Boolean(sdkRoot), 'Android SDK root', sdkRoot);
  if (!sdkRoot) {
    failures.push(
      'Install Android Studio and Android SDK, or set ANDROID_HOME.',
    );
    return { failures, warnings };
  }

  const javaReady = commandWorks('java', ['-version']);
  printCheck(javaReady, 'Java runtime');
  if (!javaReady) {
    failures.push('Install a JDK or configure Android Studio JDK on PATH.');
  }

  const missingPackages = REQUIRED_ANDROID_PACKAGES.filter((pkg) => {
    const packagePath = path.join(sdkRoot, ...pkg.pathParts);
    const installed = existsSync(packagePath);
    printCheck(installed, pkg.id, packagePath);
    return !installed;
  });

  const cmakeRoot = path.join(sdkRoot, 'cmake');
  const hasCmake = hasAndroidCmake(sdkRoot);
  printCheck(hasCmake, 'Android CMake', cmakeRoot);
  if (!hasCmake) {
    warnings.push('Install Android SDK CMake if native builds request it.');
  }

  if (missingPackages.length > 0) {
    const sdkManager = findSdkManager(sdkRoot);
    const packages = missingPackages.map((pkg) => `"${pkg.install}"`).join(' ');
    const command = sdkManager
      ? `${sdkManager} ${packages}`
      : `sdkmanager ${packages}`;
    failures.push(`Install missing Android SDK packages:\n  ${command}`);
  }

  const adbPath = path.join(sdkRoot, 'platform-tools', 'adb');
  if (existsSync(adbPath)) {
    const devices = run(adbPath, ['devices']);
    if (devices.status === 0) {
      const attachedDevices = devices.stdout
        .split('\n')
        .slice(1)
        .map((line) => line.trim())
        .filter((line) => line && !line.includes('offline'));
      if (attachedDevices.length === 0) {
        warnings.push('No Android device/emulator is connected right now.');
      } else {
        printCheck(
          true,
          'Android device/emulator',
          `${attachedDevices.length} found`,
        );
      }
    } else {
      warnings.push(
        'Could not query adb devices. Start an emulator or reconnect the device.',
      );
    }
  }

  return { failures, warnings };
}

function checkIos() {
  console.log('iOS device preflight');

  const failures = [];
  const warnings = [];
  const isMac = process.platform === 'darwin';

  printCheck(isMac, 'macOS host');
  if (!isMac) {
    failures.push('iOS local builds require macOS with Xcode.');
    return { failures, warnings };
  }

  const xcodeReady = commandWorks('xcodebuild', ['-version']);
  printCheck(xcodeReady, 'Xcode command line tools');
  if (!xcodeReady) {
    failures.push(
      'Install Xcode and run: sudo xcode-select --switch /Applications/Xcode.app',
    );
  }

  const simctlReady = commandWorks('xcrun', ['simctl', 'help']);
  printCheck(simctlReady, 'iOS Simulator tools');
  if (!simctlReady) {
    warnings.push(
      'Simulator tools are not responding. Open Xcode or reboot if simulator builds fail.',
    );
  }

  const podReady = commandWorks('pod', ['--version']);
  printCheck(podReady, 'CocoaPods');
  if (!podReady) {
    warnings.push(
      'CocoaPods is not on PATH. If iOS pods fail, run: npx pod-install',
    );
  }

  return { failures, warnings };
}

function printResult({ failures, warnings }) {
  for (const warning of warnings) {
    console.warn(`[WARN] ${warning}`);
  }

  if (failures.length === 0) {
    console.log('Preflight passed.');
    return;
  }

  console.error('Preflight failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
}

const target = process.argv[2];
const validTargets = new Set(['android', 'ios', 'all']);

if (!validTargets.has(target)) {
  console.error('Usage: node scripts/device-preflight.mjs <android|ios|all>');
  process.exit(1);
}

const results = [];

if (target === 'android' || target === 'all') {
  results.push(checkAndroid());
}

if (target === 'ios' || target === 'all') {
  if (results.length > 0) {
    console.log('');
  }
  results.push(checkIos());
}

printResult({
  failures: results.flatMap((result) => result.failures),
  warnings: results.flatMap((result) => result.warnings),
});
