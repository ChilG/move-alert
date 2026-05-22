import { t } from '@/components/move-alert/i18n';

export const minReminderIntervalMinutes = 10;
export const maxReminderIntervalMinutes = 300;
export const reminderIntervalStepMinutes = 5;

export function isValidQuietTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function parseReminderInterval(value: string) {
  const normalizedValue = value.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 10 || parsedValue > 300) {
    return null;
  }

  return parsedValue;
}

export function formatReminderInterval(minutes: number) {
  if (minutes < 60) {
    return `${minutes} ${t('settings.minutes')}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hourLabel = `${hours} ${t('settings.hourShort')}`;

  if (remainingMinutes === 0) {
    return hourLabel;
  }

  return `${hourLabel} ${remainingMinutes} ${t('settings.minutes')}`;
}
