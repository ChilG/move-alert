import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { clearReminderOnboardingSeenAsync } from '@/components/move-alert/reminder-onboarding-storage';
import {
  getScheduledReminderNotificationsDebugAsync,
  sendDebugReminderNotificationAsync,
} from '@/components/move-alert/reminder-notifications';
import type { ScheduledReminderNotificationDebugItem } from '@/components/move-alert/reminder-notification-helpers';
import { SettingsNotificationDebugSection } from '@/components/move-alert/settings/settings-notification-debug-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';
import { SectionCard } from '@/components/move-alert/shared/section-card';
import { getButtonForegroundColor, useThemeColors } from '@/components/move-alert/theme-colors';
import { Alert, AlertText } from '@/components/ui/alert';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

function formatScheduledReminderTime(item: ScheduledReminderNotificationDebugItem) {
  if (!item.scheduledAt) {
    return t('settings.scheduledNotificationsUnknownTime');
  }

  const scheduledDate = new Date(item.scheduledAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    return t('settings.scheduledNotificationsUnknownTime');
  }

  return scheduledDate.toLocaleString(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    weekday: 'short',
  });
}

export default function SettingsDebugScreen() {
  const colors = useThemeColors();
  const [isSendingDebugNotification, setIsSendingDebugNotification] = useState(false);
  const [isLoadingScheduledNotifications, setIsLoadingScheduledNotifications] = useState(false);
  const [isClearingOnboarding, setIsClearingOnboarding] = useState(false);
  const [notificationDebugMessage, setNotificationDebugMessage] = useState<string | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledReminderNotificationDebugItem[] | null>(
    null,
  );
  const [scheduledNotificationsMessage, setScheduledNotificationsMessage] = useState<string | null>(null);
  const [onboardingDebugMessage, setOnboardingDebugMessage] = useState<string | null>(null);

  async function refreshScheduledNotifications() {
    setIsLoadingScheduledNotifications(true);
    setScheduledNotificationsMessage(null);

    try {
      const result = await getScheduledReminderNotificationsDebugAsync();

      if (!result) {
        setScheduledNotifications(null);
        setScheduledNotificationsMessage(t('settings.scheduledNotificationsUnsupported'));
        return;
      }

      setScheduledNotifications(result);
    } catch {
      setScheduledNotifications(null);
      setScheduledNotificationsMessage(t('settings.scheduledNotificationsLoadFailed'));
    } finally {
      setIsLoadingScheduledNotifications(false);
    }
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

  async function clearReminderOnboarding() {
    setIsClearingOnboarding(true);

    try {
      await clearReminderOnboardingSeenAsync();
      setOnboardingDebugMessage(t('settings.onboardingDebugCleared'));
    } finally {
      setIsClearingOnboarding(false);
    }
  }

  useEffect(() => {
    void refreshScheduledNotifications();
  }, []);

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
          <Text className="text-lg font-extrabold text-typography-900">
            {t('settings.scheduledNotificationsTitle')}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-typography-600">
            {t('settings.scheduledNotificationsDescription')}
          </Text>
        </View>

        {scheduledNotificationsMessage ? (
          <Alert action="info" className="mt-4 rounded-2xl">
            <AlertText>{scheduledNotificationsMessage}</AlertText>
          </Alert>
        ) : null}

        <Button
          action="secondary"
          className="mt-4 rounded-xl"
          disabled={isLoadingScheduledNotifications}
          onPress={() => {
            void refreshScheduledNotifications();
          }}
          size="lg"
        >
          {isLoadingScheduledNotifications ? (
            <ButtonSpinner />
          ) : (
            <Ionicons color={getButtonForegroundColor(colors, 'secondary', 'solid')} name="refresh-outline" size={18} />
          )}
          <ButtonText>{t('settings.scheduledNotificationsRefresh')}</ButtonText>
        </Button>

        {scheduledNotifications ? (
          <VStack className="mt-4" space="sm">
            {scheduledNotifications.length === 0 ? (
              <Text className="rounded-xl bg-background-50 p-4 text-sm leading-5 text-typography-600">
                {t('settings.scheduledNotificationsEmpty')}
              </Text>
            ) : (
              scheduledNotifications.map((item) => (
                <View className="rounded-xl border border-outline-100 bg-background-50 p-4" key={item.identifier}>
                  <Text className="text-base font-extrabold text-typography-900">
                    {formatScheduledReminderTime(item)}
                  </Text>
                  <Text className="mt-2 text-xs font-semibold text-typography-500" isTruncated>
                    {t('settings.scheduledNotificationsIdentifier')}: {item.identifier}
                  </Text>
                </View>
              ))
            )}
          </VStack>
        ) : null}
      </SectionCard>

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
