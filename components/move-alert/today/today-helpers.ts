import {
  StretchItem,
  type TimelineItem,
  weekDays,
  type WeekDay,
} from '@/components/move-alert/move-alert-data';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';

export const minuteInMs = 60 * 1000;
export const secondInMs = 1000;

export type MoveAlertTimeline = ReturnType<
  typeof useMoveAlert
>['state']['timeline'];
export type QuietHoursState = {
  quietHoursDays: WeekDay[];
  quietHoursEnabled: boolean;
  quietHoursEndTime: string;
  quietHoursStartTime: string;
};
export type ReminderScheduleState = QuietHoursState & {
  intervalMinutes: number;
  timeline: TimelineItem[];
};

export function formatReminderTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

export function parseReminderTime(time: string, date: Date) {
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

function getTimeMinutes(time: string) {
  const parsedTime = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!parsedTime) return null;

  return Number(parsedTime[1]) * 60 + Number(parsedTime[2]);
}

function getPreviousWeekDay(day: WeekDay) {
  return ((day + 6) % 7) as WeekDay;
}

export function isQuietHoursActive(
  state: QuietHoursState,
  date: Date,
) {
  if (!state.quietHoursEnabled) return false;

  const startMinutes = getTimeMinutes(state.quietHoursStartTime);
  const endMinutes = getTimeMinutes(state.quietHoursEndTime);
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const currentDay = date.getDay() as WeekDay;

  if (
    startMinutes === null ||
    endMinutes === null ||
    !weekDays.includes(currentDay)
  ) {
    return false;
  }

  if (startMinutes === endMinutes) {
    return state.quietHoursDays.includes(currentDay);
  }

  if (startMinutes < endMinutes) {
    return (
      state.quietHoursDays.includes(currentDay) &&
      currentMinutes >= startMinutes &&
      currentMinutes < endMinutes
    );
  }

  return currentMinutes >= startMinutes
    ? state.quietHoursDays.includes(currentDay)
    : state.quietHoursDays.includes(getPreviousWeekDay(currentDay)) &&
        currentMinutes < endMinutes;
}

export function getNextReminderDate(
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

export function getSuggestedStretch(
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

export function isWaitingForSkippedBreak(
  timeline: MoveAlertTimeline,
  date: Date,
) {
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
