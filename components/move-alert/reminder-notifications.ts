import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { type TimelineItem, type WeekDay } from '@/components/move-alert/move-alert-data';
import {
  getNextReminderDate,
  isQuietHoursActive,
  minuteInMs,
} from '@/components/move-alert/today/today-helpers';

const REMINDER_NOTIFICATION_CHANNEL_ID = 'move-reminders-urgent';
const REMINDER_NOTIFICATION_SCOPE = 'move-reminder';
const REMINDER_HORIZON_DAYS = 3;
const REMINDER_VIBRATION_PATTERN = [0, 350, 150, 350, 150, 700];
const REMINDER_COLOR = '#16A34A';
let reminderSyncPromise = Promise.resolve();
let hasInitializedNotificationHandler = false;
export type DebugReminderResult =
  | 'permission-denied'
  | 'sent'
  | 'unsupported';

type ReminderNotificationState = {
  intervalMinutes: number;
  quietHoursDays: WeekDay[];
  quietHoursEnabled: boolean;
  quietHoursEndTime: string;
  quietHoursStartTime: string;
  reminderEnabled: boolean;
  timeline: TimelineItem[];
};

type NotificationsModule = typeof import('expo-notifications');
type ScheduledNotificationRequest = Awaited<
  ReturnType<NotificationsModule['getAllScheduledNotificationsAsync']>
>[number];

function isAndroidDevice() {
  return Platform.OS === 'android';
}

function isNotificationRuntimeSupported() {
  return isAndroidDevice() && !isRunningInExpoGo();
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

function isReminderNotification(
  request: ScheduledNotificationRequest,
) {
  return request.content.data?.scope === REMINDER_NOTIFICATION_SCOPE;
}

async function ensureReminderChannelAsync() {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) return false;

  await notificationsModule.setNotificationChannelAsync(
    REMINDER_NOTIFICATION_CHANNEL_ID,
    {
      audioAttributes: {
        contentType: notificationsModule.AndroidAudioContentType.SONIFICATION,
        usage: notificationsModule.AndroidAudioUsage.ALARM,
      },
      bypassDnd: false,
      description: t('notifications.channelDescription'),
      enableVibrate: true,
      importance: notificationsModule.AndroidImportance.HIGH,
      lightColor: REMINDER_COLOR,
      lockscreenVisibility:
        notificationsModule.AndroidNotificationVisibility.PUBLIC,
      name: t('notifications.channelName'),
      showBadge: false,
      sound: 'default',
      vibrationPattern: REMINDER_VIBRATION_PATTERN,
    },
  );

  return true;
}

async function ensureReminderPermissionsAsync() {
  const notificationsModule = await loadNotificationsAsync();

  if (!notificationsModule) return false;

  const permissions = await notificationsModule.getPermissionsAsync();

  if (permissions.granted) return true;
  if (!permissions.canAskAgain) return false;

  const requestedPermissions =
    await notificationsModule.requestPermissionsAsync();

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

  const scheduledNotifications =
    await notificationsModule.getAllScheduledNotificationsAsync();
  const reminderNotifications = scheduledNotifications.filter((request) =>
    isReminderNotification(request),
  );

  await Promise.all(
    reminderNotifications.map((request) =>
      notificationsModule.cancelScheduledNotificationAsync(request.identifier),
    ),
  );
}

function buildReminderDates(state: ReminderNotificationState, now: Date) {
  const nextReminderDate = getNextReminderDate(
    state.timeline,
    state.intervalMinutes,
    now,
  );
  const horizonDate = new Date(
    now.getTime() + REMINDER_HORIZON_DAYS * 24 * 60 * minuteInMs,
  );
  const intervalMs = Math.max(state.intervalMinutes, 1) * minuteInMs;
  const reminderDates: Date[] = [];

  for (
    let candidateDate = nextReminderDate;
    candidateDate.getTime() <= horizonDate.getTime();
    candidateDate = new Date(candidateDate.getTime() + intervalMs)
  ) {
    if (!isQuietHoursActive(state, candidateDate)) {
      reminderDates.push(candidateDate);
    }
  }

  return reminderDates;
}

async function scheduleReminderNotificationsAsync(
  state: ReminderNotificationState,
) {
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
        identifier: `${REMINDER_NOTIFICATION_SCOPE}:${date.getTime()}`,
        trigger: {
          channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
          date,
          type: notificationsModule.SchedulableTriggerInputTypes.DATE,
        },
      }),
    ),
  );
}

async function runReminderNotificationsSyncAsync(
  state: ReminderNotificationState | null,
) {
  if (!isNotificationRuntimeSupported()) return;

  const channelReady = await ensureReminderChannelAsync();

  if (!channelReady) return;
  await cancelReminderNotificationsAsync();

  if (!state?.reminderEnabled) return;

  const hasPermission = await ensureReminderPermissionsAsync();

  if (!hasPermission) return;

  await scheduleReminderNotificationsAsync(state);
}

export function syncReminderNotificationsAsync(
  state: ReminderNotificationState | null,
) {
  reminderSyncPromise = reminderSyncPromise
    .catch(() => {})
    .then(() => runReminderNotificationsSyncAsync(state));

  return reminderSyncPromise;
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
