import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { clearReminderOnboardingSeenAsync } from '@/components/move-alert/reminder-onboarding-storage';
import { sendDebugReminderNotificationAsync } from '@/components/move-alert/reminder-notifications';
import { SettingsNotificationDebugSection } from '@/components/move-alert/settings/settings-notification-debug-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';
import { SectionCard } from '@/components/move-alert/shared/section-card';
import { getButtonForegroundColor, useThemeColors } from '@/components/move-alert/theme-colors';
import { Alert, AlertText } from '@/components/ui/alert';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function SettingsDebugScreen() {
  const colors = useThemeColors();
  const [isSendingDebugNotification, setIsSendingDebugNotification] = useState(false);
  const [isClearingOnboarding, setIsClearingOnboarding] = useState(false);
  const [notificationDebugMessage, setNotificationDebugMessage] = useState<string | null>(null);
  const [onboardingDebugMessage, setOnboardingDebugMessage] = useState<string | null>(null);

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

  async function clearReminderOnboarding() {
    setIsClearingOnboarding(true);

    try {
      await clearReminderOnboardingSeenAsync();
      setOnboardingDebugMessage(t('settings.onboardingDebugCleared'));
    } finally {
      setIsClearingOnboarding(false);
    }
  }

  return (
    <SettingsScreenShell description={t('settings.debugPageDescription')} title={t('settings.debugPageTitle')}>
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

      <SectionCard className="mt-5">
        <View>
          <Text className="text-lg font-extrabold text-typography-900">{t('settings.onboardingDebugTitle')}</Text>
          <Text className="mt-2 text-sm leading-6 text-typography-600">{t('settings.onboardingDebugDescription')}</Text>
        </View>

        {onboardingDebugMessage ? (
          <Alert action="info" className="mt-4 rounded-2xl">
            <AlertText>{onboardingDebugMessage}</AlertText>
          </Alert>
        ) : null}

        <Button
          action="secondary"
          className="mt-4 rounded-xl"
          disabled={isClearingOnboarding}
          onPress={() => {
            void clearReminderOnboarding();
          }}
          size="lg"
        >
          <Ionicons color={getButtonForegroundColor(colors, 'secondary', 'solid')} name="refresh-outline" size={18} />
          <ButtonText>{t('settings.onboardingDebugClear')}</ButtonText>
        </Button>
      </SectionCard>
    </SettingsScreenShell>
  );
}
