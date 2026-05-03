import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { StretchItem } from '@/components/move-alert/move-alert-data';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { t, tf } from '@/components/move-alert/i18n';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { Box } from '@/components/ui/box';

const statusColor = {
  done: '#15803d',
  skipped: '#b45309',
  next: '#0369a1',
};

const minuteInMs = 60 * 1000;
const secondInMs = 1000;
type MoveAlertTimeline = ReturnType<typeof useMoveAlert>['state']['timeline'];

function formatReminderTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function parseReminderTime(time: string, date: Date) {
  const parsedTime = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!parsedTime) return null;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number(parsedTime[1]),
    Number(parsedTime[2]),
  );
}

function getNextReminderDate(
  timeline: MoveAlertTimeline,
  intervalMinutes: number,
  date: Date,
) {
  const nextTimelineItem = timeline.reduce<(typeof timeline)[number] | null>(
    (nextItem, item) => (item.status === 'next' ? item : nextItem),
    null,
  );
  const intervalMs = Math.max(intervalMinutes, 1) * minuteInMs;
  const timelineDate = nextTimelineItem
    ? parseReminderTime(nextTimelineItem.time, date)
    : null;
  const scheduledDate = timelineDate ?? new Date(date.getTime() + intervalMs);

  if (scheduledDate.getTime() > date.getTime()) {
    return scheduledDate;
  }

  const intervalsElapsed =
    Math.floor((date.getTime() - scheduledDate.getTime()) / intervalMs) + 1;

  return new Date(scheduledDate.getTime() + intervalsElapsed * intervalMs);
}

function getLatestTimelineItemByStatus(
  timeline: MoveAlertTimeline,
  status: MoveAlertTimeline[number]['status'],
) {
  return timeline.reduce<MoveAlertTimeline[number] | null>(
    (latestItem, item) => (item.status === status ? item : latestItem),
    null,
  );
}

function getSeededIndex(seed: string, itemCount: number) {
  const hash = seed.split('').reduce((currentHash, character) => {
    return Math.imul(31, currentHash) + character.charCodeAt(0);
  }, 0);

  return Math.abs(hash) % itemCount;
}

function getSuggestedStretch(
  activityTemplates: StretchItem[],
  completedStretchIds: string[],
  seedDate: Date,
): StretchItem | null {
  const availableStretches = activityTemplates.filter(
    (stretch) => !completedStretchIds.includes(stretch.id),
  );

  if (availableStretches.length === 0) return null;

  const seed = [
    seedDate.getFullYear(),
    seedDate.getMonth(),
    seedDate.getDate(),
    seedDate.getHours(),
    seedDate.getMinutes(),
    completedStretchIds.join(','),
  ].join(':');

  return availableStretches[getSeededIndex(seed, availableStretches.length)];
}

function isWaitingForSkippedBreak(timeline: MoveAlertTimeline, date: Date) {
  const latestHistoryItem = timeline
    .filter((item) => item.status !== 'next')
    .at(-1);
  const nextBreakItem = getLatestTimelineItemByStatus(timeline, 'next');
  const nextBreakDate = nextBreakItem
    ? parseReminderTime(nextBreakItem.time, date)
    : null;

  return (
    latestHistoryItem?.labelKey === 'timeline.breakSkipped' &&
    nextBreakDate !== null &&
    nextBreakDate.getTime() > date.getTime()
  );
}

export default function TodayScreen() {
  const {
    activityTemplates,
    completeStretch,
    dailyGoal,
    progressPercent,
    skipBreak,
    state,
    stretchCooldown,
    toggleReminder,
  } = useMoveAlert();
  const { timeline } = state;
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const nextReminderDate = useMemo(
    () => getNextReminderDate(timeline, state.intervalMinutes, currentTime),
    [currentTime, state.intervalMinutes, timeline],
  );
  const minutesUntilNextReminder = Math.max(
    1,
    Math.ceil(
      (nextReminderDate.getTime() - currentTime.getTime()) / minuteInMs,
    ),
  );
  const reminderMinutes = state.reminderEnabled
    ? minutesUntilNextReminder
    : state.intervalMinutes;
  const nextReminderTime = formatReminderTime(nextReminderDate);
  const canSkipBreak =
    state.reminderEnabled && !isWaitingForSkippedBreak(timeline, currentTime);
  const suggestedStretch = useMemo(
    () =>
      getSuggestedStretch(
        activityTemplates,
        state.completedStretchIds,
        nextReminderDate,
      ),
    [activityTemplates, nextReminderDate, state.completedStretchIds],
  );
  const isSuggestedStretchCoolingDown =
    suggestedStretch !== null &&
    stretchCooldown !== null &&
    stretchCooldown.endsAt > currentTime.getTime() &&
    stretchCooldown.activeStretchId !== suggestedStretch.id;
  const suggestedStretchCooldownSeconds = stretchCooldown
    ? Math.max(
        Math.ceil(
          (stretchCooldown.endsAt - currentTime.getTime()) / secondInMs,
        ),
        0,
      )
    : 0;

  useEffect(() => {
    const timerId = setInterval(
      () => {
        setCurrentTime(new Date());
      },
      stretchCooldown ? secondInMs : minuteInMs,
    );

    return () => {
      clearInterval(timerId);
    };
  }, [stretchCooldown]);

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
              {state.reminderEnabled
                ? t('today.nextReminder')
                : t('today.reminderInterval')}
            </Text>
            <View className="mt-2 flex-row items-end">
              <Text className="text-6xl font-extrabold text-typography-950">
                {reminderMinutes}
              </Text>
              <Text className="pb-2 text-base font-bold text-typography-500">
                {t('common.minutesShort')}
              </Text>
            </View>
            <Text className="mt-2 text-sm font-semibold text-typography-500">
              {state.reminderEnabled
                ? tf('today.nextReminderAt', { time: nextReminderTime })
                : t('today.remindersPaused')}
            </Text>
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

        <View className="mt-5 border-t border-outline-100 pt-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-info-50">
              <Ionicons
                color="#0369a1"
                name={
                  suggestedStretch
                    ? (suggestedStretch.icon as keyof typeof Ionicons.glyphMap)
                    : 'checkmark-done-outline'
                }
                size={24}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase text-info-700">
                {t('today.suggestedStretch')}
              </Text>
              <Text className="mt-1 text-lg font-extrabold text-typography-950">
                {suggestedStretch
                  ? t(suggestedStretch.titleKey)
                  : t('today.suggestedStretchDone')}
              </Text>
              {suggestedStretch ? (
                <>
                  <Text className="mt-1 text-sm font-semibold text-typography-500">
                    {t(suggestedStretch.durationKey)}
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-typography-600">
                    {t(suggestedStretch.descriptionKey)}
                  </Text>
                  <Pressable
                    className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ${
                      isSuggestedStretchCoolingDown
                        ? 'bg-background-muted'
                        : 'bg-info-600'
                    }`}
                    disabled={isSuggestedStretchCoolingDown}
                    onPress={() => completeStretch(suggestedStretch.id)}
                  >
                    <Ionicons
                      color={
                        isSuggestedStretchCoolingDown ? '#71717a' : '#ffffff'
                      }
                      name={
                        isSuggestedStretchCoolingDown
                          ? 'time-outline'
                          : 'walk-outline'
                      }
                      size={18}
                    />
                    <Text
                      className={`font-bold ${
                        isSuggestedStretchCoolingDown
                          ? 'text-typography-500'
                          : 'text-typography-0'
                      }`}
                    >
                      {isSuggestedStretchCoolingDown
                        ? tf('stretches.cooldown', {
                            seconds: suggestedStretchCooldownSeconds,
                          })
                        : t('today.startSuggestedStretch')}
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          </View>
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
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-outline-200 px-4 py-3 ${
              canSkipBreak ? 'bg-background-0' : 'bg-background-muted'
            }`}
            disabled={!canSkipBreak}
            onPress={skipBreak}
          >
            <Ionicons
              color={canSkipBreak ? '#525252' : '#a3a3a3'}
              name="close-circle-outline"
              size={18}
            />
            <Text
              className={`font-bold ${
                canSkipBreak ? 'text-typography-700' : 'text-typography-400'
              }`}
            >
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
        {timeline.length === 0 ? (
          <Text className="text-base text-typography-500">
            {t('today.timelineEmpty')}
          </Text>
        ) : (
          timeline.map((item, index) => (
            <View
              className={`flex-row gap-3 ${index === 0 ? '' : 'mt-4'}`}
              key={`${item.time}-${item.labelKey}-${item.status}-${index}`}
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
          ))
        )}
      </Box>
    </ScreenScrollView>
  );
}
