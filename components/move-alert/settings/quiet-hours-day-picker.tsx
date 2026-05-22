import { t } from '@/components/move-alert/i18n';
import type { WeekDay } from '@/components/move-alert/move-alert-data';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

import { weekDayLabelKey } from './settings-constants';

type QuietHoursDayPickerProps = {
  days: readonly WeekDay[];
  labelSize?: 'sm' | 'xs';
  onSelectDay: (day: WeekDay) => void;
  selectedDays: WeekDay[];
};

export function QuietHoursDayPicker({ days, labelSize = 'sm', onSelectDay, selectedDays }: QuietHoursDayPickerProps) {
  return (
    <HStack className="flex-wrap" space="sm">
      {days.map((day) => {
        const isSelected = selectedDays.includes(day);

        return (
          <Button
            action={isSelected ? 'primary' : 'default'}
            className={`w-full max-w-20 rounded-2xl border ${isSelected ? 'border-green-500 bg-green-500' : 'border-outline-200 bg-background-muted'}`}
            key={day}
            onPress={() => onSelectDay(day)}
            size="lg"
          >
            <Text
              className={`text-center font-extrabold ${labelSize === 'xs' ? 'text-xs' : 'text-sm'} ${isSelected ? 'text-white' : 'text-typography-800'}`}
            >
              {t(weekDayLabelKey[day])}
            </Text>
          </Button>
        );
      })}
    </HStack>
  );
}
