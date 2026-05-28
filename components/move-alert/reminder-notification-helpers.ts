import type { TimelineItem, WeekDay } from './move-alert-data';
import { getNextReminderDate, isQuietHoursActive, minuteInMs } from './today/today-helpers';

export const REMINDER_NOTIFICATION_SCOPE = 'move-reminder';
export const REMINDER_HORIZON_DAYS = 3;

export type ReminderNotificationState = {
  intervalMinutes: number;
  nextReminderAt: string | null;
  quietHoursDays: WeekDay[];
  quietHoursEnabled: boolean;
  quietHoursEndTime: string;
  quietHoursStartTime: string;
  reminderEnabled: boolean;
  timeline: TimelineItem[];
};

type ReminderNotificationData = {
  isDebug?: boolean;
  scheduledAt?: unknown;
  scope?: unknown;
};

export type ScheduledReminderNotificationDebugItem = {
  identifier: string;
  scheduledAt: string | null;
};

export type ScheduledReminderNotificationLike = {
  content: {
    data?: ReminderNotificationData | null;
  };
  identifier: string;
};

export type PresentedReminderNotificationLike = {
  request: {
    content: {
      data?: ReminderNotificationData | null;
    };
    identifier: string;
  };
};

export type ReminderNotificationResponseLike = {
  notification: {
    request: {
      content: {
        data?: ReminderNotificationData | null;
      };
      identifier: string;
    };
  };
};

function isReminderNotificationData(
  data: ReminderNotificationData | null | undefined,
  options?: {
    includeDebug?: boolean;
  },
) {
  if (data?.scope !== REMINDER_NOTIFICATION_SCOPE) {
    return false;
  }

  return options?.includeDebug ? true : data.isDebug !== true;
}

export function isReminderScheduledNotification(request: ScheduledReminderNotificationLike) {
  return isReminderNotificationData(request.content.data);
}

export function isReminderNotificationResponse(response: ReminderNotificationResponseLike) {
  return isReminderNotificationData(response.notification.request.content.data);
}

export function getPresentedReminderNotificationIds(notifications: PresentedReminderNotificationLike[]) {
  return notifications
    .filter((notification) => isReminderNotificationData(notification.request.content.data))
    .map((notification) => notification.request.identifier);
}

export function getReminderNotificationIdentifier(date: Date) {
  return `${REMINDER_NOTIFICATION_SCOPE}:${date.getTime()}`;
}

function parseReminderNotificationIdentifierDate(identifier: string) {
  const prefix = `${REMINDER_NOTIFICATION_SCOPE}:`;

  if (!identifier.startsWith(prefix)) return null;

  const timestamp = Number(identifier.slice(prefix.length));
  const parsedDate = new Date(timestamp);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getScheduledReminderDate(request: ScheduledReminderNotificationLike) {
  const scheduledAt = request.content.data?.scheduledAt;
  const parsedScheduledAt = typeof scheduledAt === 'string' ? new Date(scheduledAt) : null;

  if (parsedScheduledAt && !Number.isNaN(parsedScheduledAt.getTime())) {
    return parsedScheduledAt;
  }

  return parseReminderNotificationIdentifierDate(request.identifier);
}

export function getScheduledReminderNotificationDebugItems(requests: ScheduledReminderNotificationLike[]) {
  return requests
    .filter((request) => isReminderNotificationData(request.content.data))
    .map((request) => {
      const scheduledDate = getScheduledReminderDate(request);

      return {
        identifier: request.identifier,
        scheduledAt: scheduledDate ? scheduledDate.toISOString() : null,
      } satisfies ScheduledReminderNotificationDebugItem;
    })
    .sort((a, b) => {
      if (!a.scheduledAt && !b.scheduledAt) return a.identifier.localeCompare(b.identifier);
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;

      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
}

export function buildReminderDates(state: ReminderNotificationState, now: Date) {
  const nextReminderDate = getNextReminderDate(state, now);
  const horizonDate = new Date(now.getTime() + REMINDER_HORIZON_DAYS * 24 * 60 * minuteInMs);
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
