export type SupportedPushLanguage = 'en' | 'th';

export type ReminderScheduleInput = {
  intervalMinutes: number;
  nextReminderAt: string | null;
  quietHoursDays: number[];
  quietHoursEnabled: boolean;
  quietHoursEndTime: string;
  quietHoursStartTime: string;
  timezone: string;
};

export type ReminderPushMessage = {
  body: string;
  title: string;
};

const minuteInMs = 60 * 1000;
const fallbackTimezone = 'Asia/Bangkok';
const reminderMessages: Record<SupportedPushLanguage, ReminderPushMessage> = {
  en: {
    body: 'Stand up, stretch, and reset your posture for a moment.',
    title: 'Time to move',
  },
  th: {
    body: 'ลุกขึ้นยืดเส้น คลายตัว และรีเซ็ตท่าทางสักครู่',
    title: 'ได้เวลาขยับร่างกาย',
  },
};

function getReminderIntervalMs(intervalMinutes: number) {
  return Math.max(intervalMinutes, 1) * minuteInMs;
}

function parseStoredReminderDate(value: string | null) {
  if (!value) return null;

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getTimeMinutes(time: string) {
  const parsedTime = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(time);

  if (!parsedTime) return null;

  return Number(parsedTime[1]) * 60 + Number(parsedTime[2]);
}

function getZonedDateParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    timeZone: timezone || fallbackTimezone,
    weekday: 'short',
    year: 'numeric',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const weekdayByLabel: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    day: Number(parts.day),
    hour: Number(parts.hour === '24' ? '00' : parts.hour),
    minute: Number(parts.minute),
    month: Number(parts.month),
    weekday: weekdayByLabel[parts.weekday] ?? 0,
    year: Number(parts.year),
  };
}

function getPreviousWeekDay(day: number) {
  return (day + 6) % 7;
}

export function isQuietHoursActiveForTimezone(state: ReminderScheduleInput, date: Date) {
  if (!state.quietHoursEnabled) return false;

  const startMinutes = getTimeMinutes(state.quietHoursStartTime);
  const endMinutes = getTimeMinutes(state.quietHoursEndTime);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  const zonedDate = getZonedDateParts(date, state.timezone);
  const currentMinutes = zonedDate.hour * 60 + zonedDate.minute;
  const currentDay = zonedDate.weekday;

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

function getAdvanceReminderAttemptLimit(intervalMs: number) {
  const oneWeekMs = 7 * 24 * 60 * minuteInMs;

  return Math.ceil(oneWeekMs / intervalMs) + 1;
}

export function getNextServerReminderDate(state: ReminderScheduleInput, date: Date) {
  const intervalMs = getReminderIntervalMs(state.intervalMinutes);
  const storedReminderDate = parseStoredReminderDate(state.nextReminderAt);
  const reminderDate = storedReminderDate ?? new Date(date.getTime() + intervalMs);
  let nextReminderDate = reminderDate;
  let attempts = 0;
  const attemptLimit = getAdvanceReminderAttemptLimit(intervalMs);

  while (
    attempts < attemptLimit &&
    (nextReminderDate.getTime() <= date.getTime() || isQuietHoursActiveForTimezone(state, nextReminderDate))
  ) {
    nextReminderDate = new Date(nextReminderDate.getTime() + intervalMs);
    attempts += 1;
  }

  return isQuietHoursActiveForTimezone(state, nextReminderDate)
    ? new Date(Math.max(reminderDate.getTime(), date.getTime() + intervalMs))
    : nextReminderDate;
}

export function createNextServerReminderDateFromAnchor(state: ReminderScheduleInput, anchorDate: Date) {
  return getNextServerReminderDate(
    {
      ...state,
      nextReminderAt: new Date(anchorDate.getTime() + getReminderIntervalMs(state.intervalMinutes)).toISOString(),
    },
    anchorDate,
  );
}

export function getReminderPushMessage(language: string | null | undefined) {
  return reminderMessages[language === 'en' ? 'en' : 'th'];
}
