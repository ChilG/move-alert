import { StretchItem, type TimelineItem, weekDays, type WeekDay } from '../move-alert-data';

export const minuteInMs = 60 * 1000;
export const secondInMs = 1000;

export type MoveAlertTimeline = TimelineItem[];
export type QuietHoursState = {
  quietHoursDays: WeekDay[];
  quietHoursEnabled: boolean;
  quietHoursEndTime: string;
  quietHoursStartTime: string;
};
export type ReminderScheduleState = QuietHoursState & {
  intervalMinutes: number;
  nextReminderAt: string | null;
  timeline: TimelineItem[];
};

export function formatReminderTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function parseReminderTime(time: string, date: Date) {
  const parsedTime = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!parsedTime) return null;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(parsedTime[1]), Number(parsedTime[2]));
}

function getTimeMinutes(time: string) {
  const parsedTime = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!parsedTime) return null;

  return Number(parsedTime[1]) * 60 + Number(parsedTime[2]);
}

function getPreviousWeekDay(day: WeekDay) {
  return ((day + 6) % 7) as WeekDay;
}

export function isQuietHoursActive(state: QuietHoursState, date: Date) {
  if (!state.quietHoursEnabled) return false;

  const startMinutes = getTimeMinutes(state.quietHoursStartTime);
  const endMinutes = getTimeMinutes(state.quietHoursEndTime);
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const currentDay = date.getDay() as WeekDay;

  if (startMinutes === null || endMinutes === null || !weekDays.includes(currentDay)) {
    return false;
  }

  if (startMinutes === endMinutes) {
    return state.quietHoursDays.includes(currentDay);
  }

  if (startMinutes < endMinutes) {
    return state.quietHoursDays.includes(currentDay) && currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes
    ? state.quietHoursDays.includes(currentDay)
    : state.quietHoursDays.includes(getPreviousWeekDay(currentDay)) && currentMinutes < endMinutes;
}

function parseStoredReminderDate(value: string | null) {
  if (!value) return null;

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getLegacyNextReminderDate(timeline: MoveAlertTimeline, date: Date) {
  const nextTimelineItem = timeline.reduce<(typeof timeline)[number] | null>(
    (nextItem, item) => (item.status === 'next' ? item : nextItem),
    null,
  );

  return nextTimelineItem ? parseReminderTime(nextTimelineItem.time, date) : null;
}

function getReminderIntervalMs(intervalMinutes: number) {
  return Math.max(intervalMinutes, 1) * minuteInMs;
}

function advanceReminderDate(
  state: Pick<ReminderScheduleState, 'intervalMinutes'> & QuietHoursState,
  reminderDate: Date,
  date: Date,
) {
  const intervalMs = getReminderIntervalMs(state.intervalMinutes);
  let nextReminderDate = reminderDate;

  while (nextReminderDate.getTime() <= date.getTime() || isQuietHoursActive(state, nextReminderDate)) {
    nextReminderDate = new Date(nextReminderDate.getTime() + intervalMs);
  }

  return nextReminderDate;
}

export function createNextReminderDateFromAnchor(
  state: Pick<ReminderScheduleState, 'intervalMinutes'> & QuietHoursState,
  anchorDate: Date,
) {
  return advanceReminderDate(
    state,
    new Date(anchorDate.getTime() + getReminderIntervalMs(state.intervalMinutes)),
    anchorDate,
  );
}

export function getNextReminderDate(state: ReminderScheduleState, date: Date) {
  const storedReminderDate = parseStoredReminderDate(state.nextReminderAt);
  const legacyTimelineDate = getLegacyNextReminderDate(state.timeline, date);
  const scheduledDate =
    storedReminderDate ?? legacyTimelineDate ?? new Date(date.getTime() + getReminderIntervalMs(state.intervalMinutes));

  return advanceReminderDate(state, scheduledDate, date);
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
  const availableStretches = activityTemplates.filter((stretch) => !completedStretchIds.includes(stretch.id));

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

export function isWaitingForSkippedBreak(state: ReminderScheduleState, date: Date) {
  const latestHistoryItem = state.timeline.at(-1);
  const nextBreakDate = getNextReminderDate(state, date);

  return latestHistoryItem?.labelKey === 'timeline.breakSkipped' && nextBreakDate.getTime() > date.getTime();
}
