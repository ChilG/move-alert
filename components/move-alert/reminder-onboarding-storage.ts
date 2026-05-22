import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_ONBOARDING_STORAGE_KEY = 'move-alert:reminder-onboarding:v1';

export async function hasSeenReminderOnboardingAsync() {
  return (await AsyncStorage.getItem(REMINDER_ONBOARDING_STORAGE_KEY)) === 'seen';
}

export async function markReminderOnboardingSeenAsync() {
  await AsyncStorage.setItem(REMINDER_ONBOARDING_STORAGE_KEY, 'seen');
}

export async function clearReminderOnboardingSeenAsync() {
  await AsyncStorage.removeItem(REMINDER_ONBOARDING_STORAGE_KEY);
}
