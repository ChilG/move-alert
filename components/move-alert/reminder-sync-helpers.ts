export type ReminderNotificationSyncAction = 'clear' | 'sync' | 'wait';

type ReminderNotificationSyncInput = {
  authStatus: 'authenticated' | 'loading' | 'signed-out';
  userId: string | null | undefined;
};

export function getReminderNotificationSyncAction({
  authStatus,
  userId,
}: ReminderNotificationSyncInput): ReminderNotificationSyncAction {
  if (authStatus === 'loading') {
    return 'wait';
  }

  return userId ? 'sync' : 'clear';
}
