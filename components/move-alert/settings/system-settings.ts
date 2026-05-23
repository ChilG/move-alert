import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import {
  openApplicationDetailsSettingsAsync,
  requestIgnoreBatteryOptimizationsAsync,
} from '@/components/move-alert/settings/battery-optimization-status';

const APP_PACKAGE_NAME = Constants.expoConfig?.android?.package ?? 'com.chilgoe.movealert';

async function openAppSettingsAsync() {
  await Linking.openSettings();
}

export async function openReminderAppSettingsAsync() {
  if (Platform.OS === 'android' && (await openApplicationDetailsSettingsAsync())) {
    return;
  }

  await openAppSettingsAsync();
}

export async function openReminderNotificationSettingsAsync() {
  if (Platform.OS !== 'android') {
    await openAppSettingsAsync();
    return;
  }

  try {
    await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
      {
        key: 'android.provider.extra.APP_PACKAGE',
        value: APP_PACKAGE_NAME,
      },
    ]);
  } catch {
    await openReminderAppSettingsAsync();
  }
}

export async function openReminderBatterySettingsAsync() {
  if (Platform.OS !== 'android') {
    await openAppSettingsAsync();
    return;
  }

  const didOpenPackageRequest = await requestIgnoreBatteryOptimizationsAsync();

  if (didOpenPackageRequest) {
    return;
  }

  const didOpenAppSettings = await openApplicationDetailsSettingsAsync();

  if (didOpenAppSettings) {
    return;
  }

  await openAppSettingsAsync();
}
