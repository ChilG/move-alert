import { useEffect, useMemo, useState } from 'react';

import { tf } from '@/components/move-alert/i18n';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';

import type { TodayReminderSectionModel } from './today-reminder-section';
import {
  formatReminderTime,
  getNextReminderDate,
  isQuietHoursActive,
  isWaitingForSkippedBreak,
  minuteInMs,
} from './today-helpers';

export function useTodayScreenState() {
  const moveAlert = useMoveAlert();
  useLanguagePreference();
  const { dailyGoal, state } = moveAlert;
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
  const isQuietNow = isQuietHoursActive(state, currentTime);
  const canSkipBreak =
    state.reminderEnabled &&
    !isQuietNow &&
    !isWaitingForSkippedBreak(timeline, currentTime);
  const progressSummary = tf('today.progressSummary', {
    completed: state.completedToday,
    goal: dailyGoal,
  });
  const reminderSectionModel = useMemo<TodayReminderSectionModel>(
    () => ({
      canSkipBreak,
      isQuietNow,
      isReminderEnabled: state.reminderEnabled,
      nextReminderTime,
      progressPercent: moveAlert.progressPercent,
      progressSummary,
      reminderMinutes,
    }),
    [
      canSkipBreak,
      isQuietNow,
      moveAlert.progressPercent,
      nextReminderTime,
      progressSummary,
      reminderMinutes,
      state.reminderEnabled,
    ],
  );

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, minuteInMs);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return {
    ...moveAlert,
    canSkipBreak,
    dailyGoal,
    isQuietNow,
    nextReminderTime,
    reminderSectionModel,
    reminderMinutes,
  };
}
