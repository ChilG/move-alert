import { Image } from 'react-native';

import { t, tf } from '@/components/move-alert/i18n';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { TodayMetricsSection } from '@/components/move-alert/today/today-metrics-section';
import { TodayReminderSection } from '@/components/move-alert/today/today-reminder-section';
import { TodayTimelineSection } from '@/components/move-alert/today/today-timeline-section';
import { useTodayScreenState } from '@/components/move-alert/today/use-today-screen-state';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';

export default function TodayScreen() {
  const { reminderSectionModel, skipBreak, state, toggleReminder } = useTodayScreenState();

  return (
    <ScreenScrollView>
      <ScreenHeader
        eyebrow={t('today.eyebrow')}
        eyebrowClassName="text-info-600"
        title={t('today.title')}
        trailing={
          <Box className="h-16 w-16 items-center justify-center rounded-2xl">
            <Image source={require('@/assets/images/icon.png')} style={{ width: 56, height: 56, borderRadius: 10 }} />
          </Box>
        }
      />

      <VStack className="mt-6" space="lg">
        <TodayReminderSection model={reminderSectionModel} onSkipBreak={skipBreak} onToggleReminder={toggleReminder} />

        <TodayMetricsSection
          completedToday={state.completedToday}
          doneLabel={t('today.doneMetric')}
          skippedLabel={t('today.skippedMetric')}
          skippedToday={state.skippedToday}
          streakLabel={t('today.streakMetric')}
          streakValue={tf('today.streakValue', { days: state.streakDays })}
        />

        <TodayTimelineSection timeline={state.timeline} title={t('today.timelineTitle')} />
      </VStack>
    </ScreenScrollView>
  );
}
