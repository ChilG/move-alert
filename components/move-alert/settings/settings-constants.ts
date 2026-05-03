import { t } from '@/components/move-alert/i18n';
import type { WeekDay } from '@/components/move-alert/move-alert-data';

export const weekDayLabelKey: Record<WeekDay, Parameters<typeof t>[0]> = {
  0: 'weekdays.sunday',
  1: 'weekdays.monday',
  2: 'weekdays.tuesday',
  3: 'weekdays.wednesday',
  4: 'weekdays.thursday',
  5: 'weekdays.friday',
  6: 'weekdays.saturday',
};
