import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { dailyGoal, timeline } from '@/components/move-alert/demo-data';
import { useMoveAlert } from '@/components/move-alert/demo-state';
import { t, tf } from '@/components/move-alert/i18n';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { Box } from '@/components/ui/box';

const statusColor = {
  done: '#15803d',
  skipped: '#b45309',
  next: '#0369a1',
};

export default function TodayScreen() {
  const { progressPercent, skipBreak, state, toggleReminder } = useMoveAlert();

  return (
    <ScreenScrollView>
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-sm font-bold uppercase text-info-600">
            {t('today.eyebrow')}
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-typography-950">
            {t('today.title')}
          </Text>
        </View>
        <Box className="h-14 w-14 items-center justify-center rounded-2xl bg-success-100">
          <Ionicons color="#166534" name="walk-outline" size={30} />
        </Box>
      </View>

      <Box className="mb-5 rounded-3xl bg-background-0 p-5 shadow-soft-1">
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-sm font-semibold text-typography-500">
              {t('today.nextReminder')}
            </Text>
            <View className="mt-2 flex-row items-end">
              <Text className="text-6xl font-extrabold text-typography-950">
                {state.intervalMinutes}
              </Text>
              <Text className="pb-2 text-base font-bold text-typography-500">
                {t('common.minutesShort')}
              </Text>
            </View>
          </View>
          <View
            className={`rounded-full px-3 py-1 ${
              state.reminderEnabled ? 'bg-success-50' : 'bg-warning-50'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                state.reminderEnabled ? 'text-success-700' : 'text-warning-700'
              }`}
            >
              {state.reminderEnabled ? t('common.active') : t('common.paused')}
            </Text>
          </View>
        </View>

        <View className="mt-5 h-3 overflow-hidden rounded-full bg-background-muted">
          <View
            className="h-3 rounded-full bg-success-500"
            style={{ width: `${progressPercent}%` }}
          />
        </View>

        <View className="mt-3 flex-row justify-between">
          <Text className="text-sm text-typography-500">
            {tf('today.progressSummary', {
              completed: state.completedToday,
              goal: dailyGoal,
            })}
          </Text>
          <Text className="text-sm font-bold text-typography-800">
            {progressPercent}
            {t('common.percent')}
          </Text>
        </View>

        <View className="mt-5 flex-row gap-3">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3"
            onPress={toggleReminder}
          >
            <Ionicons
              color="#ffffff"
              name={state.reminderEnabled ? 'pause-outline' : 'play-outline'}
              size={18}
            />
            <Text className="font-bold text-typography-0">
              {state.reminderEnabled ? t('today.pause') : t('today.start')}
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-outline-200 bg-background-0 px-4 py-3"
            onPress={skipBreak}
          >
            <Ionicons color="#525252" name="close-circle-outline" size={18} />
            <Text className="font-bold text-typography-700">
              {t('today.skip')}
            </Text>
          </Pressable>
        </View>
      </Box>

      <View className="mb-5 flex-row gap-3">
        <Box className="flex-1 rounded-2xl bg-info-50 p-4">
          <Ionicons color="#0369a1" name="bar-chart-outline" size={24} />
          <Text className="mt-3 text-sm font-semibold text-info-700">
            {t('today.doneMetric')}
          </Text>
          <Text className="mt-1 text-2xl font-extrabold text-info-900">
            {state.completedToday}
          </Text>
        </Box>

        <Box className="flex-1 rounded-2xl bg-success-50 p-4">
          <Ionicons color="#15803d" name="flame-outline" size={24} />
          <Text className="mt-3 text-sm font-semibold text-success-700">
            {t('today.streakMetric')}
          </Text>
          <Text className="mt-1 text-2xl font-extrabold text-success-900">
            {tf('today.streakValue', { days: state.streakDays })}
          </Text>
        </Box>

        <Box className="flex-1 rounded-2xl bg-warning-50 p-4">
          <Ionicons color="#b45309" name="time-outline" size={24} />
          <Text className="mt-3 text-sm font-semibold text-warning-700">
            {t('today.skippedMetric')}
          </Text>
          <Text className="mt-1 text-2xl font-extrabold text-warning-900">
            {state.skippedToday}
          </Text>
        </Box>
      </View>

      <Text className="mb-3 text-lg font-extrabold text-typography-900">
        {t('today.timelineTitle')}
      </Text>

      <Box className="rounded-3xl bg-background-0 p-5 shadow-soft-1">
        {timeline.map((item, index) => (
          <View
            className={`flex-row gap-3 ${index === 0 ? '' : 'mt-4'}`}
            key={`${item.time}-${item.labelKey}`}
          >
            <View className="w-14">
              <Text className="text-sm font-bold text-typography-500">
                {item.time}
              </Text>
            </View>
            <View className="items-center pt-1.5">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: statusColor[item.status] }}
              />
              {index < timeline.length - 1 ? (
                <View className="mt-2 h-8 w-px bg-outline-100" />
              ) : null}
            </View>
            <Text className="flex-1 text-base text-typography-700">
              {t(item.labelKey)}
            </Text>
          </View>
        ))}
      </Box>
    </ScreenScrollView>
  );
}
