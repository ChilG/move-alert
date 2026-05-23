import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

export type BatteryOptimizationStatus = 'ignored' | 'optimized' | 'unsupported';

type MoveAlertBatteryOptimizationModule = {
  getStatusAsync: () => Promise<unknown>;
  openApplicationDetailsSettingsAsync?: () => Promise<unknown>;
  requestIgnoreBatteryOptimizationsAsync?: () => Promise<unknown>;
};

let nativeModule: MoveAlertBatteryOptimizationModule | null | undefined;

function getNativeModule() {
  if (nativeModule !== undefined) return nativeModule;

  try {
    nativeModule = requireNativeModule<MoveAlertBatteryOptimizationModule>('MoveAlertBatteryOptimization');
  } catch {
    nativeModule = null;
  }

  return nativeModule;
}

function parseBatteryOptimizationStatus(status: unknown): BatteryOptimizationStatus {
  return status === 'ignored' || status === 'optimized' ? status : 'unsupported';
}

export async function getBatteryOptimizationStatusAsync(): Promise<BatteryOptimizationStatus> {
  if (Platform.OS !== 'android') return 'unsupported';

  const module = getNativeModule();

  if (!module) return 'unsupported';

  try {
    return parseBatteryOptimizationStatus(await module.getStatusAsync());
  } catch {
    return 'unsupported';
  }
}

export async function requestIgnoreBatteryOptimizationsAsync() {
  if (Platform.OS !== 'android') return false;

  const module = getNativeModule();

  if (!module?.requestIgnoreBatteryOptimizationsAsync) return false;

  try {
    return (await module.requestIgnoreBatteryOptimizationsAsync()) === true;
  } catch {
    return false;
  }
}

export async function openApplicationDetailsSettingsAsync() {
  if (Platform.OS !== 'android') return false;

  const module = getNativeModule();

  if (!module?.openApplicationDetailsSettingsAsync) return false;

  try {
    return (await module.openApplicationDetailsSettingsAsync()) === true;
  } catch {
    return false;
  }
}
