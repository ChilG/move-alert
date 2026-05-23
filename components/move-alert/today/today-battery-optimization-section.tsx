import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { SectionCard } from '@/components/move-alert/shared/section-card';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

type TodayBatteryOptimizationSectionProps = {
  onViewDetails: () => void;
};

export function TodayBatteryOptimizationSection({ onViewDetails }: TodayBatteryOptimizationSectionProps) {
  const colors = useThemeColors();

  return (
    <SectionCard className="border border-warning-200 bg-background-warning p-4">
      <HStack className="items-start" space="md">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-background-0">
          <Ionicons color={colors.warning} name="battery-dead-outline" size={21} />
        </View>

        <View className="flex-1">
          <Text className="text-base font-extrabold text-warning-900">{t('today.batteryOptimizationTitle')}</Text>
          <Text className="mt-1 text-sm leading-5 text-warning-800" numberOfLines={2}>
            {t('today.batteryOptimizationSummary')}
          </Text>
        </View>
      </HStack>

      <Button
        action="default"
        className="mt-4 rounded-xl border-warning-300 bg-background-0"
        onPress={onViewDetails}
        size="md"
        variant="outline"
      >
        <Ionicons color={colors.warning} name="information-circle-outline" size={18} />
        <ButtonText className="text-warning-800">{t('today.batteryOptimizationDetails')}</ButtonText>
      </Button>
    </SectionCard>
  );
}
