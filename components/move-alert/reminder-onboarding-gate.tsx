import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { hasSeenReminderOnboardingAsync } from '@/components/move-alert/reminder-onboarding-storage';

export function ReminderOnboardingGate() {
  const { syncStatus } = useMoveAlert();
  const pathname = usePathname();
  const router = useRouter();
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    if (syncStatus === 'loading' || hasCheckedStorage) return;

    let isMounted = true;

    async function checkStorage() {
      const hasSeenOnboarding = await hasSeenReminderOnboardingAsync();

      if (!isMounted) return;

      setHasCheckedStorage(true);

      if (!hasSeenOnboarding && pathname !== '/onboarding/reminders') {
        router.replace('/onboarding/reminders');
      }
    }

    void checkStorage();

    return () => {
      isMounted = false;
    };
  }, [hasCheckedStorage, pathname, router, syncStatus]);

  return null;
}
