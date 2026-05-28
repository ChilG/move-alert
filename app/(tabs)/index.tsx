import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  getNextDebugLogoTapState,
  initialDebugLogoTapState,
  type DebugLogoTapState,
} from '@/components/move-alert/debug-logo-gesture';
import { t, tf } from '@/components/move-alert/i18n';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { useBatteryOptimizationStatus } from '@/components/move-alert/settings/use-battery-optimization-status';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { TodayBatteryOptimizationSection } from '@/components/move-alert/today/today-battery-optimization-section';
import { TodayMetricsSection } from '@/components/move-alert/today/today-metrics-section';
import { TodayReminderSection } from '@/components/move-alert/today/today-reminder-section';
import { TodayTimelineSection } from '@/components/move-alert/today/today-timeline-section';
import { useTodayScreenState } from '@/components/move-alert/today/use-today-screen-state';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';

export default function TodayScreen() {
  const router = useRouter();
  const { status: batteryOptimizationStatus } = useBatteryOptimizationStatus();
  const { reminderSectionModel, skipBreak, state, toggleReminder } = useTodayScreenState();
  const [debugLogoTapState, setDebugLogoTapState] = useState<DebugLogoTapState>(initialDebugLogoTapState);

  const handleLogoPress = useCallback(() => {
    const nextTapState = getNextDebugLogoTapState(debugLogoTapState, Date.now());

    if (nextTapState.isUnlocked) {
      setDebugLogoTapState(initialDebugLogoTapState);
      router.push('/(tabs)/settings/debug');
      return;
    }

    setDebugLogoTapState({
      count: nextTapState.count,
      firstTapAt: nextTapState.firstTapAt,
    });
  }, [debugLogoTapState, router]);

  return (
    <ScreenScrollView>
      <ScreenHeader
        eyebrow={t('today.eyebrow')}
        eyebrowClassName="text-info-600"
        title={t('today.title')}
        trailing={
          <Pressable
            accessible={false}
            className="h-16 w-16 items-center justify-center rounded-2xl"
            onPress={handleLogoPress}
          >
            <Image source={require('@/assets/images/icon.png')} style={{ width: 56, height: 56, borderRadius: 10 }} />
          </Pressable>
        }
      />

      <VStack className="mt-6" space="lg">
        {batteryOptimizationStatus === 'optimized' ? (
          <TodayBatteryOptimizationSection
            onViewDetails={() => {
              router.push('/battery-optimization');
            }}
          />
        ) : null}

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
