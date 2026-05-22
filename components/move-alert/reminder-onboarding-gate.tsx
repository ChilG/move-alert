import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { hasSeenReminderOnboardingAsync } from '@/components/move-alert/reminder-onboarding-storage';

export function ReminderOnboardingGate() {
  const { syncStatus } = useMoveAlert();
  const pathname = usePathname();
  const router = useRouter();
  const hasCheckedStorageRef = useRef(false);

  useEffect(() => {
    if (hasCheckedStorageRef.current || syncStatus === 'idle' || syncStatus === 'loading' || syncStatus === 'saving') {
      return;
    }

    let isMounted = true;

    async function checkStorage() {
      const hasSeenOnboarding = await hasSeenReminderOnboardingAsync();

      if (!isMounted) return;

      hasCheckedStorageRef.current = true;

      if (!hasSeenOnboarding && pathname !== '/onboarding/reminders') {
        router.replace('/onboarding/reminders');
      }
    }

    void checkStorage();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, syncStatus]);

  return null;
}
