import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { useBatteryOptimizationStatus } from '@/components/move-alert/settings/use-battery-optimization-status';
import { openReminderBatterySettingsAsync } from '@/components/move-alert/settings/system-settings';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { SectionCard } from '@/components/move-alert/shared/section-card';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

function getStatusLabel(status: ReturnType<typeof useBatteryOptimizationStatus>['status']) {
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

export default function BatteryOptimizationScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { status } = useBatteryOptimizationStatus();
  const isConfigured = status === 'ignored';

  const benefits = [
    t('batteryOptimization.benefitTimely'),
    t('batteryOptimization.benefitBackground'),
    t('batteryOptimization.benefitQuietHours'),
  ];

  return (
    <ScreenScrollView>
      <ScreenHeader
        description={t('batteryOptimization.description')}
        eyebrow={t('batteryOptimization.eyebrow')}
        eyebrowClassName="text-warning-600"
        title={t('batteryOptimization.title')}
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
                <Ionicons color={colors.warning} name="battery-charging-outline" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-warning-800">{t('batteryOptimization.statusLabel')}</Text>
                <Text className="mt-1 text-lg font-extrabold text-warning-950">{getStatusLabel(status)}</Text>
              </View>
            </HStack>
            <Badge action={isConfigured ? 'success' : 'warning'} className="px-3 py-1">
              <BadgeText>{isConfigured ? t('common.active') : t('common.paused')}</BadgeText>
            </Badge>
          </HStack>
        </SectionCard>

        <SectionCard>
          <Text className="text-lg font-extrabold text-typography-950">{t('batteryOptimization.benefitsTitle')}</Text>
          <VStack className="mt-4" space="md">
            {benefits.map((benefit) => (
              <HStack key={benefit} className="items-start" space="md">
                <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-success-50">
                  <Ionicons color={colors.success} name="checkmark" size={17} />
                </View>
                <Text className="flex-1 text-sm leading-5 text-typography-600">{benefit}</Text>
              </HStack>
            ))}
          </VStack>
        </SectionCard>

        <Button
          className="rounded-xl"
          isDisabled={isConfigured}
          onPress={() => {
            void openReminderBatterySettingsAsync();
          }}
          size="lg"
        >
          <Ionicons color={colors.textInverse} name="settings-outline" size={18} />
          <ButtonText>
            {isConfigured ? t('batteryOptimization.configuredAction') : t('batteryOptimization.action')}
          </ButtonText>
        </Button>
      </VStack>
    </ScreenScrollView>
  );
}
