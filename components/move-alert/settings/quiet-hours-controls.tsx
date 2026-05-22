import type { WeekDay } from '@/components/move-alert/move-alert-data';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { QuietHoursDayPicker } from './quiet-hours-day-picker';
import { QuietTimeInput } from './quiet-time-input';

type QuietHoursControlsProps = {
  className?: string;
  dayLabelSize?: 'sm' | 'xs';
  daysLabel: string;
  daysLabelClassName?: string;
  endLabel: string;
  endTime: string;
  inputPlaceholder: string;
  onSelectDay: (day: WeekDay) => void;
  onSetEndTime: (time: string) => void;
  onSetStartTime: (time: string) => void;
  quietHoursDays: readonly WeekDay[];
  selectedDays: WeekDay[];
  startLabel: string;
  startTime: string;
  timeInputSpace?: 'sm' | 'md';
};

export function QuietHoursControls({
  className,
  dayLabelSize = 'sm',
  daysLabel,
  daysLabelClassName = 'text-sm font-bold text-typography-700',
  endLabel,
  endTime,
  inputPlaceholder,
  onSelectDay,
  onSetEndTime,
  onSetStartTime,
  quietHoursDays,
  selectedDays,
  startLabel,
  startTime,
  timeInputSpace = 'md',
}: QuietHoursControlsProps) {
  return (
    <VStack className={className} space="md">
      <HStack space={timeInputSpace}>
        <QuietTimeInput label={startLabel} onCommit={onSetStartTime} placeholder={inputPlaceholder} value={startTime} />
        <QuietTimeInput label={endLabel} onCommit={onSetEndTime} placeholder={inputPlaceholder} value={endTime} />
      </HStack>

      <VStack space="sm">
        <Text className={daysLabelClassName}>{daysLabel}</Text>
        <QuietHoursDayPicker
          days={quietHoursDays}
          labelSize={dayLabelSize}
          onSelectDay={onSelectDay}
          selectedDays={selectedDays}
        />
      </VStack>
    </VStack>
  );
}
