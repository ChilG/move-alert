import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getReminderNotificationPermissionStatusAsync } from '@/components/move-alert/reminder-notifications';
import type { ReminderNotificationPermissionStatus } from '@/components/move-alert/required-feature-helpers';

export function useNotificationPermissionStatus() {
  const [status, setStatus] = useState<ReminderNotificationPermissionStatus>('loading');

  const refresh = useCallback(async () => {
    setStatus(await getReminderNotificationPermissionStatusAsync());
  }, []);

  useEffect(() => {
    void refresh();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refresh]);

  return {
    refresh,
    status,
  };
}
