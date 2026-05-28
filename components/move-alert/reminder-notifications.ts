import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getCalendars } from 'expo-localization';
import { Platform } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import type { SupportedLanguage } from '@/components/move-alert/i18n';
import {
  getPresentedReminderNotificationIds,
  isReminderNotificationResponse,
  REMINDER_NOTIFICATION_SCOPE,
} from '@/components/move-alert/reminder-notification-helpers';
import type { ReminderNotificationPermissionStatus } from '@/components/move-alert/required-feature-helpers';
import { supabase, supabasePublishableKey, supabaseUrl } from '@/lib/supabase';

const REMINDER_NOTIFICATION_CHANNEL_ID = 'move-reminders-signature-v2';
const REMINDER_VIBRATION_PATTERN = [0, 720, 140, 260, 120, 260, 160, 860, 180, 320];
const REMINDER_COLOR = '#16A34A';
const REMINDER_DEVICE_ID_STORAGE_KEY = 'move-alert-reminder-device-id';
let hasInitializedNotificationHandler = false;
let hasClearedLocalReminderNotifications = false;
export type ServerReminderPushTokenResult =
  | 'missing-project-id'
  | 'permission-denied'
  | 'registered'
  | 'signed-out'
  | 'unsupported';
export type ServerReminderFunctionSummary = {
  claimed: number;
  failed: number;
  sent: number;
  skipped: number;
};
export type ServerReminderDebugInfo = {
  logs: {
    createdAt: string;
    errorMessage: string | null;
    scheduledFor: string | null;
    status: string;
  }[];
  tokens: {
    id: string;
    isActive: boolean;
    language: string;
    lastSeenAt: string;
    platform: string;
    timezone: string;
  }[];
  settings: {
    lastReminderSentAt: string | null;
    nextReminderAt: string | null;
    reminderEnabled: boolean;
    reminderProcessingAt: string | null;
    timezone: string;
  } | null;
};

type NotificationsModule = typeof import('expo-notifications');
type PresentedNotification = Awaited<ReturnType<NotificationsModule['getPresentedNotificationsAsync']>>[number];
type NotificationResponse = NonNullable<Awaited<ReturnType<NotificationsModule['getLastNotificationResponseAsync']>>>;

function isAndroidDevice() {
  return Platform.OS === 'android';
}

function isNativeNotificationDevice() {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

function getExpoProjectId() {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId ?? null;
}

function getDeviceTimezone() {
  try {
    return getCalendars()[0]?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Asia/Bangkok';
  } catch {
    return 'Asia/Bangkok';
  }
}

async function getReminderDeviceIdAsync() {
  const storedDeviceId = await AsyncStorage.getItem(REMINDER_DEVICE_ID_STORAGE_KEY);

  if (storedDeviceId) {
    return storedDeviceId;
  }

  const nextDeviceId = `move-alert-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  await AsyncStorage.setItem(REMINDER_DEVICE_ID_STORAGE_KEY, nextDeviceId);

  return nextDeviceId;
}

async function loadNativeNotificationsAsync(): Promise<NotificationsModule | null> {
  if (!isNativeNotificationDevice()) {
    return null;
  }

  const notificationsModule = await import('expo-notifications');

  if (!hasInitializedNotificationHandler) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        priority: notificationsModule.AndroidNotificationPriority.MAX,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    hasInitializedNotificationHandler = true;
  }

  return notificationsModule;
}

async function ensureReminderChannelAsync() {
  const notificationsModule = await loadNativeNotificationsAsync();

  if (!notificationsModule) return false;
  if (!isAndroidDevice()) return true;

  await notificationsModule.setNotificationChannelAsync(REMINDER_NOTIFICATION_CHANNEL_ID, {
    audioAttributes: {
      contentType: notificationsModule.AndroidAudioContentType.SONIFICATION,
      usage: notificationsModule.AndroidAudioUsage.ALARM,
    },
    bypassDnd: false,
    description: t('notifications.channelDescription'),
    enableVibrate: true,
    importance: notificationsModule.AndroidImportance.MAX,
    lightColor: REMINDER_COLOR,
    lockscreenVisibility: notificationsModule.AndroidNotificationVisibility.PUBLIC,
    name: t('notifications.channelName'),
    showBadge: false,
    sound: 'default',
    vibrationPattern: REMINDER_VIBRATION_PATTERN,
  });

  return true;
}

async function ensureReminderPermissionsAsync() {
  const notificationsModule = await loadNativeNotificationsAsync();

  if (!notificationsModule) return false;

  const permissions = await notificationsModule.getPermissionsAsync();

  if (permissions.granted) return true;
  if (!permissions.canAskAgain) return false;

  const requestedPermissions = await notificationsModule.requestPermissionsAsync();

  return requestedPermissions.granted;
}

export async function getReminderNotificationPermissionStatusAsync(): Promise<ReminderNotificationPermissionStatus> {
  const notificationsModule = await loadNativeNotificationsAsync();

  if (!notificationsModule) return 'unsupported';

  const permissions = await notificationsModule.getPermissionsAsync();

  return permissions.granted ? 'granted' : 'denied';
}

export async function requestReminderNotificationPermissionsAsync(): Promise<ReminderNotificationPermissionStatus> {
  const channelReady = await ensureReminderChannelAsync();

  if (!channelReady) return 'unsupported';

  return (await ensureReminderPermissionsAsync()) ? 'granted' : 'denied';
}

function isLegacyLocalReminderNotification(request: {
  content: {
    data?: {
      isDebug?: boolean;
      scope?: unknown;
    } | null;
  };
}) {
  return request.content.data?.scope === REMINDER_NOTIFICATION_SCOPE && request.content.data.isDebug !== true;
}

async function cancelReminderNotificationsAsync() {
  const notificationsModule = await loadNativeNotificationsAsync();

  if (!notificationsModule) return;

  const scheduledNotifications = await notificationsModule.getAllScheduledNotificationsAsync();
  const reminderNotifications = scheduledNotifications.filter((request) => isLegacyLocalReminderNotification(request));

  await Promise.all(
    reminderNotifications.map((request) => notificationsModule.cancelScheduledNotificationAsync(request.identifier)),
  );
}

export async function clearLocalReminderNotificationsOnceAsync() {
  if (hasClearedLocalReminderNotifications) return;

  hasClearedLocalReminderNotifications = true;
  await cancelReminderNotificationsAsync();
}

async function dismissPresentedReminderNotificationsAsync() {
  const notificationsModule = await loadNativeNotificationsAsync();

  if (!notificationsModule) return;

  const presentedNotifications = await notificationsModule.getPresentedNotificationsAsync();
  const reminderNotificationIds = getPresentedReminderNotificationIds(
    presentedNotifications as PresentedNotification[],
  );

  await Promise.all(
    reminderNotificationIds.map((identifier) => notificationsModule.dismissNotificationAsync(identifier)),
  );
}

export async function syncServerReminderPushTokenAsync(
  language: SupportedLanguage,
): Promise<ServerReminderPushTokenResult> {
  if (!isNativeNotificationDevice()) {
    return 'unsupported';
  }

  const notificationsModule = await loadNativeNotificationsAsync();

  if (!notificationsModule) {
    return 'unsupported';
  }

  const permissionStatus = await requestReminderNotificationPermissionsAsync();

  if (permissionStatus === 'unsupported') {
    return 'unsupported';
  }

  if (permissionStatus !== 'granted') {
    return 'permission-denied';
  }

  const projectId = getExpoProjectId();

  if (!projectId) {
    return 'missing-project-id';
  }

  const [{ data: userData }, deviceId] = await Promise.all([supabase.auth.getUser(), getReminderDeviceIdAsync()]);
  const userId = userData.user?.id;

  if (!userId) {
    return 'signed-out';
  }

  const expoPushToken = await notificationsModule.getExpoPushTokenAsync({ projectId });
  const timezone = getDeviceTimezone();
  const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'unknown';
  const { error: tokenError } = await supabase.from('move_alert_push_tokens').upsert(
    {
      device_id: deviceId,
      expo_push_token: expoPushToken.data,
      is_active: true,
      language,
      last_seen_at: new Date().toISOString(),
      platform,
      timezone,
      user_id: userId,
    },
    {
      onConflict: 'user_id,device_id',
    },
  );

  if (tokenError) {
    throw new Error(tokenError.message);
  }

  const { error: settingsError } = await supabase.from('move_alert_settings').upsert(
    {
      timezone,
      user_id: userId,
    },
    {
      onConflict: 'user_id',
    },
  );

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  return 'registered';
}

export async function getServerReminderDebugInfoAsync(): Promise<ServerReminderDebugInfo> {
  const [tokensResult, logsResult, settingsResult] = await Promise.all([
    supabase
      .from('move_alert_push_tokens')
      .select('id, is_active, language, last_seen_at, platform, timezone')
      .order('last_seen_at', { ascending: false })
      .limit(5),
    supabase
      .from('move_alert_push_delivery_logs')
      .select('created_at, error_message, scheduled_for, status')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('move_alert_settings')
      .select('last_reminder_sent_at, next_reminder_at, reminder_enabled, reminder_processing_at, timezone')
      .maybeSingle(),
  ]);

  const error = tokensResult.error ?? logsResult.error ?? settingsResult.error;

  if (error) {
    throw new Error(error.message);
  }

  return {
    logs: (logsResult.data ?? []).map((log) => ({
      createdAt: String(log.created_at),
      errorMessage: log.error_message,
      scheduledFor: log.scheduled_for,
      status: String(log.status),
    })),
    tokens: (tokensResult.data ?? []).map((token) => ({
      id: String(token.id),
      isActive: Boolean(token.is_active),
      language: String(token.language),
      lastSeenAt: String(token.last_seen_at),
      platform: String(token.platform),
      timezone: String(token.timezone),
    })),
    settings: settingsResult.data
      ? {
          lastReminderSentAt: settingsResult.data.last_reminder_sent_at,
          nextReminderAt: settingsResult.data.next_reminder_at,
          reminderEnabled: Boolean(settingsResult.data.reminder_enabled),
          reminderProcessingAt: settingsResult.data.reminder_processing_at,
          timezone: String(settingsResult.data.timezone),
        }
      : null,
  };
}

export async function subscribeToReminderNotificationResponsesAsync(onReminderPress: () => void) {
  const notificationsModule = await loadNativeNotificationsAsync();

  if (!notificationsModule) {
    return () => {};
  }

  const notifications = notificationsModule;
  const handledResponseIds = new Set<string>();

  async function handleResponse(response: NotificationResponse | null) {
    if (!response || !isReminderNotificationResponse(response)) {
      return;
    }

    if (response.actionIdentifier !== notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }

    const responseId = response.notification.request.identifier;

    if (handledResponseIds.has(responseId)) {
      return;
    }

    handledResponseIds.add(responseId);
    onReminderPress();
    await notifications.dismissNotificationAsync(responseId);
    await dismissPresentedReminderNotificationsAsync();
    await notifications.clearLastNotificationResponseAsync();
  }

  await handleResponse(await notifications.getLastNotificationResponseAsync());

  const subscription = notifications.addNotificationResponseReceivedListener((response) => {
    void handleResponse(response);
  });

  return () => {
    subscription.remove();
  };
}

function normalizeServerReminderFunctionSummary(data: Partial<ServerReminderFunctionSummary> | null | undefined) {
  return {
    claimed: Number(data?.claimed ?? 0),
    failed: Number(data?.failed ?? 0),
    sent: Number(data?.sent ?? 0),
    skipped: Number(data?.skipped ?? 0),
  } satisfies ServerReminderFunctionSummary;
}

export async function invokeServerReminderPushFunctionAsync(): Promise<ServerReminderFunctionSummary> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const userId = sessionData.session?.user.id;

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!accessToken || !userId) {
    throw new Error(t('settings.serverPushRegisterSignedOut'));
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/run-reminder-scheduler`, {
    body: JSON.stringify({
      source: 'manual',
      userId,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      apikey: supabasePublishableKey,
    },
    method: 'POST',
  });
  const data = (await response.json().catch(() => null)) as
    | (Partial<ServerReminderFunctionSummary> & { error?: string })
    | null;

  if (!response.ok || data?.error) {
    throw new Error(data?.error ?? `Server reminder function returned HTTP ${response.status}`);
  }

  return normalizeServerReminderFunctionSummary(data);
}
