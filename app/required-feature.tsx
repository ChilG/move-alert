import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { requestReminderNotificationPermissionsAsync } from '@/components/move-alert/reminder-notifications';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { useBatteryOptimizationStatus } from '@/components/move-alert/settings/use-battery-optimization-status';
import { useNotificationPermissionStatus } from '@/components/move-alert/settings/use-notification-permission-status';
import {
  openReminderBatterySettingsAsync,
  openReminderNotificationSettingsAsync,
} from '@/components/move-alert/settings/system-settings';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { SectionCard } from '@/components/move-alert/shared/section-card';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

function getNotificationStatusLabel(status: ReturnType<typeof useNotificationPermissionStatus>['status']) {
  switch (status) {
    case 'granted':
      return t('requiredFeature.notificationAllowed');
    case 'denied':
      return t('requiredFeature.notificationBlocked');
    case 'unsupported':
      return t('settings.batteryOptimizationUnsupported');
    case 'loading':
      return t('common.loading');
  }
}

function getBatteryStatusLabel(status: ReturnType<typeof useBatteryOptimizationStatus>['status']) {
  switch (status) {
    case 'ignored':
      return t('settings.batteryOptimizationIgnored');
    case 'optimized':
      return t('settings.batteryOptimizationOptimized');
    case 'unsupported':
      return t('settings.batteryOptimizationUnsupported');
    case 'loading':
      return t('common.loading');
  }
}

export default function RequiredFeatureScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { refresh: refreshNotificationStatus, status: notificationStatus } = useNotificationPermissionStatus();
  const { status: batteryStatus } = useBatteryOptimizationStatus();
  const isNotificationConfigured = notificationStatus === 'granted' || notificationStatus === 'unsupported';
  const isBatteryConfigured = batteryStatus === 'ignored' || batteryStatus === 'unsupported';

  async function requestNotificationPermission() {
    const nextStatus = await requestReminderNotificationPermissionsAsync();

    if (nextStatus !== 'granted') {
      await openReminderNotificationSettingsAsync();
    }

    await refreshNotificationStatus();
  }

  return (
    <ScreenScrollView>
      <ScreenHeader
        description={t('requiredFeature.description')}
        eyebrow={t('requiredFeature.eyebrow')}
        eyebrowClassName="text-warning-600"
        title={t('requiredFeature.title')}
        trailing={
          <Button
            action="default"
            className="mt-1 h-11 w-11 rounded-2xl bg-background-0 p-0 shadow-soft-1"
            onPress={() => {
              router.back();
            }}
            variant="solid"
          >
            <Ionicons color={colors.textDefault} name="chevron-back" size={22} />
          </Button>
        }
      />

      <VStack className="mt-6" space="lg">
        <SectionCard className="border border-warning-200 bg-background-warning">
          <HStack className="items-center justify-between" space="md">
            <HStack className="flex-1 items-center" space="md">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-0">
                <Ionicons color={colors.warning} name="notifications-outline" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-warning-800">
                  {t('requiredFeature.notificationStatusLabel')}
                </Text>
                <Text className="mt-1 text-lg font-extrabold text-warning-950">
                  {getNotificationStatusLabel(notificationStatus)}
                </Text>
              </View>
            </HStack>
            <Badge action={isNotificationConfigured ? 'success' : 'warning'} className="px-3 py-1">
              <BadgeText>{isNotificationConfigured ? t('common.active') : t('common.paused')}</BadgeText>
            </Badge>
          </HStack>

          <Text className="mt-4 text-sm leading-5 text-warning-800">
            {t('requiredFeature.notificationDescription')}
          </Text>

          <Button
            className="mt-4 rounded-xl"
            isDisabled={isNotificationConfigured}
            onPress={() => {
              void requestNotificationPermission();
            }}
            size="lg"
          >
            <Ionicons color={colors.textInverse} name="notifications-outline" size={18} />
            <ButtonText>
              {isNotificationConfigured
                ? t('requiredFeature.notificationConfiguredAction')
                : t('requiredFeature.notificationAction')}
            </ButtonText>
          </Button>
        </SectionCard>

        <SectionCard>
          <HStack className="items-center justify-between" space="md">
            <HStack className="flex-1 items-center" space="md">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-warning-50">
                <Ionicons color={colors.warning} name="battery-charging-outline" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-typography-600">
                  {t('requiredFeature.batteryStatusLabel')}
                </Text>
                <Text className="mt-1 text-lg font-extrabold text-typography-950">
                  {getBatteryStatusLabel(batteryStatus)}
                </Text>
              </View>
            </HStack>
            <Badge action={isBatteryConfigured ? 'success' : 'warning'} className="px-3 py-1">
              <BadgeText>{isBatteryConfigured ? t('common.active') : t('common.paused')}</BadgeText>
            </Badge>
          </HStack>

          <Text className="mt-4 text-sm leading-5 text-typography-600">{t('requiredFeature.batteryDescription')}</Text>

          <Button
            className="mt-4 rounded-xl"
            isDisabled={isBatteryConfigured}
            onPress={() => {
              void openReminderBatterySettingsAsync();
            }}
            size="lg"
          >
            <Ionicons color={colors.textInverse} name="settings-outline" size={18} />
            <ButtonText>
              {isBatteryConfigured ? t('batteryOptimization.configuredAction') : t('batteryOptimization.action')}
            </ButtonText>
          </Button>
        </SectionCard>
      </VStack>
    </ScreenScrollView>
  );
}
