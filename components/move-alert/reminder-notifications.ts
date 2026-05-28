import { Platform } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import {
  buildReminderDates,
  getScheduledReminderNotificationDebugItems,
  getPresentedReminderNotificationIds,
  getReminderNotificationIdentifier,
  isReminderNotificationResponse,
  isReminderScheduledNotification,
  REMINDER_NOTIFICATION_SCOPE,
  type ScheduledReminderNotificationDebugItem,
  type ReminderNotificationState,
} from '@/components/move-alert/reminder-notification-helpers';

const REMINDER_NOTIFICATION_CHANNEL_ID = 'move-reminders-signature-v2';
const REMINDER_VIBRATION_PATTERN = [0, 720, 140, 260, 120, 260, 160, 860, 180, 320];
const REMINDER_COLOR = '#16A34A';
let reminderSyncPromise = Promise.resolve();
let hasInitializedNotificationHandler = false;
export type DebugReminderResult = 'permission-denied' | 'sent' | 'unsupported';

type NotificationsModule = typeof import('expo-notifications');
type ScheduledNotificationRequest = Awaited<
  ReturnType<NotificationsModule['getAllScheduledNotificationsAsync']>
>[number];
type PresentedNotification = Awaited<ReturnType<NotificationsModule['getPresentedNotificationsAsync']>>[number];
type NotificationResponse = NonNullable<Awaited<ReturnType<NotificationsModule['getLastNotificationResponseAsync']>>>;

function isAndroidDevice() {
  return Platform.OS === 'android';
}

function isNotificationRuntimeSupported() {
  return isAndroidDevice();
}

async function loadNotificationsAsync(): Promise<NotificationsModule | null> {
  if (!isNotificationRuntimeSupported()) {
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

function isReminderNotification(request: ScheduledNotificationRequest) {
  return isReminderScheduledNotification(request);
}

async function ensureReminderChannelAsync() {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) return false;

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
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) return false;

  const permissions = await notificationsModule.getPermissionsAsync();

  if (permissions.granted) return true;
  if (!permissions.canAskAgain) return false;

  const requestedPermissions = await notificationsModule.requestPermissionsAsync();

  return requestedPermissions.granted;
}

function createReminderNotificationContent() {
  return {
    autoDismiss: true,
    body: t('notifications.reminderBody'),
    color: REMINDER_COLOR,
    data: {
      scope: REMINDER_NOTIFICATION_SCOPE,
    },
    priority: 'max' as const,
    sound: 'default' as const,
    sticky: false,
    title: t('notifications.reminderTitle'),
    vibrate: REMINDER_VIBRATION_PATTERN,
  };
}

async function cancelReminderNotificationsAsync() {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) return;

  const scheduledNotifications = await notificationsModule.getAllScheduledNotificationsAsync();
  const reminderNotifications = scheduledNotifications.filter((request) => isReminderNotification(request));

  await Promise.all(
    reminderNotifications.map((request) => notificationsModule.cancelScheduledNotificationAsync(request.identifier)),
  );
}

async function dismissPresentedReminderNotificationsAsync() {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) return;

  const presentedNotifications = await notificationsModule.getPresentedNotificationsAsync();
  const reminderNotificationIds = getPresentedReminderNotificationIds(
    presentedNotifications as PresentedNotification[],
  );

  await Promise.all(
    reminderNotificationIds.map((identifier) => notificationsModule.dismissNotificationAsync(identifier)),
  );
}

async function scheduleReminderNotificationsAsync(state: ReminderNotificationState) {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) return;

  const reminderDates = buildReminderDates(state, new Date());

  await Promise.all(
    reminderDates.map((date) =>
      notificationsModule.scheduleNotificationAsync({
        content: {
          ...createReminderNotificationContent(),
          data: {
            scope: REMINDER_NOTIFICATION_SCOPE,
            scheduledAt: date.toISOString(),
          },
        },
        identifier: getReminderNotificationIdentifier(date),
        trigger: {
          channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
          date,
          type: notificationsModule.SchedulableTriggerInputTypes.DATE,
        },
      }),
    ),
  );
}

async function runReminderNotificationsSyncAsync(state: ReminderNotificationState | null) {
  if (!isNotificationRuntimeSupported()) return;

  const channelReady = await ensureReminderChannelAsync();

  if (!channelReady) return;
  await cancelReminderNotificationsAsync();
  await dismissPresentedReminderNotificationsAsync();

  if (!state?.reminderEnabled) return;

  const hasPermission = await ensureReminderPermissionsAsync();

  if (!hasPermission) return;

  await scheduleReminderNotificationsAsync(state);
}

export function syncReminderNotificationsAsync(state: ReminderNotificationState | null) {
  reminderSyncPromise = reminderSyncPromise.catch(() => {}).then(() => runReminderNotificationsSyncAsync(state));

  return reminderSyncPromise;
}

export async function getScheduledReminderNotificationsDebugAsync(): Promise<
  ScheduledReminderNotificationDebugItem[] | null
> {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) {
    return null;
  }

  const scheduledNotifications = await notificationsModule.getAllScheduledNotificationsAsync();

  return getScheduledReminderNotificationDebugItems(scheduledNotifications);
}

export async function subscribeToReminderNotificationResponsesAsync(onReminderPress: () => void) {
  const notificationsModule = await loadNotificationsAsync();

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

export async function sendDebugReminderNotificationAsync(): Promise<DebugReminderResult> {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) {
    return 'unsupported';
  }

  const channelReady = await ensureReminderChannelAsync();

  if (!channelReady) {
    return 'unsupported';
  }

  const hasPermission = await ensureReminderPermissionsAsync();

  if (!hasPermission) {
    return 'permission-denied';
  }

  await notificationsModule.scheduleNotificationAsync({
    content: {
      ...createReminderNotificationContent(),
      data: {
        isDebug: true,
        scope: REMINDER_NOTIFICATION_SCOPE,
      },
    },
    trigger: null,
  });

  return 'sent';
}
