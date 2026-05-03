import { Ionicons } from '@expo/vector-icons';

import { t, tf } from '@/components/move-alert/i18n';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { TodayMetricsSection } from '@/components/move-alert/today/today-metrics-section';
import { TodayReminderSection } from '@/components/move-alert/today/today-reminder-section';
import { TodayTimelineSection } from '@/components/move-alert/today/today-timeline-section';
import { useTodayScreenState } from '@/components/move-alert/today/use-today-screen-state';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';

export default function TodayScreen() {
  const colors = useThemeColors();
  const { reminderSectionModel, skipBreak, state, toggleReminder } =
    useTodayScreenState();

  return (
    <ScreenScrollView>
      <ScreenHeader
        eyebrow={t('today.eyebrow')}
        eyebrowClassName="text-info-600"
        title={t('today.title')}
        trailing={
          <Box className="h-14 w-14 items-center justify-center rounded-2xl bg-success-100">
            <Ionicons color={colors.success} name="walk-outline" size={30} />
          </Box>
        }
      />

      <VStack className="mt-6" space="lg">
        <TodayReminderSection
          model={reminderSectionModel}
          onSkipBreak={skipBreak}
          onToggleReminder={toggleReminder}
        />

        <TodayMetricsSection
          completedToday={state.completedToday}
          doneLabel={t('today.doneMetric')}
          skippedLabel={t('today.skippedMetric')}
          skippedToday={state.skippedToday}
          streakLabel={t('today.streakMetric')}
          streakValue={tf('today.streakValue', { days: state.streakDays })}
        />

        <TodayTimelineSection
          timeline={state.timeline}
          title={t('today.timelineTitle')}
        />
      </VStack>
    </ScreenScrollView>
  );
}
