export const REMINDER_NOTIFICATION_SCOPE = 'move-reminder';

type ReminderNotificationData = {
  isDebug?: boolean;
  scheduledAt?: unknown;
  scope?: unknown;
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

function isReminderNotificationData(data: ReminderNotificationData | null | undefined) {
  if (data?.scope !== REMINDER_NOTIFICATION_SCOPE) {
    return false;
  }

  return data.isDebug !== true;
}

export function isReminderNotificationResponse(response: ReminderNotificationResponseLike) {
  return isReminderNotificationData(response.notification.request.content.data);
}

export function getPresentedReminderNotificationIds(notifications: PresentedReminderNotificationLike[]) {
  return notifications
    .filter((notification) => isReminderNotificationData(notification.request.content.data))
    .map((notification) => notification.request.identifier);
}
