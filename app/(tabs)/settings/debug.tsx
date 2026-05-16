import { Redirect } from 'expo-router';
import { useState } from 'react';

import { t } from '@/components/move-alert/i18n';
import { sendDebugReminderNotificationAsync } from '@/components/move-alert/reminder-notifications';
import { SettingsNotificationDebugSection } from '@/components/move-alert/settings/settings-notification-debug-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';

export default function SettingsDebugScreen() {
  const [isSendingDebugNotification, setIsSendingDebugNotification] =
    useState(false);
  const [notificationDebugMessage, setNotificationDebugMessage] = useState<
    string | null
  >(null);

  if (!__DEV__) {
    return <Redirect href="/(tabs)/settings" />;
  }

  async function sendDebugNotification() {
    setIsSendingDebugNotification(true);

    try {
      const result = await sendDebugReminderNotificationAsync();

      setNotificationDebugMessage(
        result === 'sent'
          ? t('settings.notificationDebugSent')
          : result === 'permission-denied'
            ? t('settings.notificationDebugPermissionDenied')
            : t('settings.notificationDebugUnsupported'),
      );
    } finally {
      setIsSendingDebugNotification(false);
    }
  }

  return (
    <SettingsScreenShell
      description={t('settings.debugPageDescription')}
      title={t('settings.debugPageTitle')}
    >
      <SettingsNotificationDebugSection
        debugLabel={t('settings.notificationDebugSend')}
        description={t('settings.notificationDebugDescription')}
        isLoading={isSendingDebugNotification}
        onSendDebugNotification={() => {
          void sendDebugNotification();
        }}
        statusMessage={notificationDebugMessage}
        title={t('settings.notificationDebugTitle')}
      />
    </SettingsScreenShell>
  );
}
