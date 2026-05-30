import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import type { RequiredFeatureIssue } from '@/components/move-alert/required-feature-helpers';
import {
  RequiredFeatureIconFrame,
  requiredFeatureActionButtonClassName,
  requiredFeatureActionButtonTextClassName,
  requiredFeatureNoticeCardClassName,
} from '@/components/move-alert/required-feature-styles';
import { SectionCard } from '@/components/move-alert/shared/section-card';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

type TodayRequiredFeatureSectionProps = {
  issues: RequiredFeatureIssue[];
  onViewDetails: () => void;
};

function getSummaryKey(issues: RequiredFeatureIssue[]) {
  if (issues.includes('notification-permission') && issues.includes('battery-optimization')) {
    return 'today.requiredFeatureSummaryAll';
  }

  if (issues.includes('notification-permission')) {
    return 'today.requiredFeatureSummaryNotification';
  }

  return 'today.requiredFeatureSummaryBattery';
}

export function TodayRequiredFeatureSection({ issues, onViewDetails }: TodayRequiredFeatureSectionProps) {
  const colors = useThemeColors();

  return (
    <SectionCard className={`${requiredFeatureNoticeCardClassName} p-4`}>
      <HStack className="items-start" space="md">
        <RequiredFeatureIconFrame color={colors.warning} name="warning-outline" />

        <View className="flex-1">
          <Text className="text-base font-extrabold text-warning-900">{t('today.requiredFeatureTitle')}</Text>
          <Text className="mt-1 text-sm leading-5 text-warning-800" numberOfLines={3}>
            {t(getSummaryKey(issues))}
          </Text>
        </View>
      </HStack>

      <Button
        action="default"
        className={`mt-4 ${requiredFeatureActionButtonClassName}`}
        onPress={onViewDetails}
        size="md"
        variant="outline"
      >
        <Ionicons color={colors.warning} name="settings-outline" size={18} />
        <ButtonText className={requiredFeatureActionButtonTextClassName}>{t('today.requiredFeatureAction')}</ButtonText>
      </Button>
    </SectionCard>
  );
}
