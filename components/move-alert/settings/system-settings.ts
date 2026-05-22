import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const APP_PACKAGE_NAME =
  Constants.expoConfig?.android?.package ?? 'com.chilgoe.movealert';

async function openAppSettingsAsync() {
  await Linking.openSettings();
}

export async function openReminderAppSettingsAsync() {
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
    await openAppSettingsAsync();
  }
}

export async function openReminderBatterySettingsAsync() {
  if (Platform.OS !== 'android') {
    await openAppSettingsAsync();
    return;
  }

  try {
    await Linking.sendIntent(
      'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    );
  } catch {
    try {
      await Linking.sendIntent('android.settings.BATTERY_SAVER_SETTINGS');
    } catch {
      await openAppSettingsAsync();
    }
  }
}
