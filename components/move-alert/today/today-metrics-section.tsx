import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

type TodayMetricsSectionProps = {
  completedToday: number;
  doneLabel: string;
  skippedToday: number;
  skippedLabel: string;
  streakLabel: string;
  streakValue: string;
};

export function TodayMetricsSection({
  completedToday,
  doneLabel,
  skippedToday,
  skippedLabel,
  streakLabel,
  streakValue,
}: TodayMetricsSectionProps) {
  const colors = useThemeColors();

  return (
    <HStack className="mb-5" space="md">
      <Box className="flex-1 rounded-2xl bg-info-50 p-4">
        <Ionicons color={colors.info} name="bar-chart-outline" size={24} />
        <Text className="mt-3 text-sm font-semibold text-info-700">{doneLabel}</Text>
        <Text className="mt-1 text-2xl font-extrabold text-info-900">{completedToday}</Text>
      </Box>

      <Box className="flex-1 rounded-2xl bg-success-50 p-4">
        <Ionicons color={colors.success} name="flame-outline" size={24} />
        <Text className="mt-3 text-sm font-semibold text-success-700">{streakLabel}</Text>
        <Text className="mt-1 text-2xl font-extrabold text-success-900">{streakValue}</Text>
      </Box>

      <Box className="flex-1 rounded-2xl bg-warning-50 p-4">
        <Ionicons color={colors.warning} name="time-outline" size={24} />
        <Text className="mt-3 text-sm font-semibold text-warning-700">{skippedLabel}</Text>
        <Text className="mt-1 text-2xl font-extrabold text-warning-900">{skippedToday}</Text>
      </Box>
    </HStack>
  );
}
