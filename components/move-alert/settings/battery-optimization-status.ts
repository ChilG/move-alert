import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

export type BatteryOptimizationStatus = 'ignored' | 'optimized' | 'unsupported';

type MoveAlertBatteryOptimizationModule = {
  getStatusAsync: () => Promise<unknown>;
};

let nativeModule: MoveAlertBatteryOptimizationModule | null | undefined;

function getNativeModule() {
  if (nativeModule !== undefined) return nativeModule;

  try {
    nativeModule = requireNativeModule<MoveAlertBatteryOptimizationModule>(
      'MoveAlertBatteryOptimization',
    );
  } catch {
    nativeModule = null;
  }

  return nativeModule;
}

function parseBatteryOptimizationStatus(
  status: unknown,
): BatteryOptimizationStatus {
  return status === 'ignored' || status === 'optimized'
    ? status
    : 'unsupported';
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
