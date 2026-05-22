import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type { WeekDay } from '@/components/move-alert/move-alert-data';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

import { QuietHoursControls } from './quiet-hours-controls';

type SettingsQuietHoursSectionProps = {
  daysLabel: string;
  description: string;
  inputPlaceholder: string;
  onSelectDay: (day: WeekDay) => void;
  onSetEndTime: (time: string) => void;
  onSetStartTime: (time: string) => void;
  quietHoursDays: readonly WeekDay[];
  selectedDays: WeekDay[];
  startLabel: string;
  startTime: string;
  title: string;
  endLabel: string;
  endTime: string;
};

export function SettingsQuietHoursSection({
  daysLabel,
  description,
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
  title,
}: SettingsQuietHoursSectionProps) {
  return (
    <SectionCard className="mt-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-extrabold text-typography-900">{title}</Text>
          <Text className="mt-1 text-sm leading-5 text-typography-500">{description}</Text>
        </View>
        <Ionicons color="#525252" name="moon-outline" size={26} />
      </View>

      <QuietHoursControls
        className="mt-5"
        daysLabel={daysLabel}
        daysLabelClassName="text-sm font-bold text-typography-600"
        endLabel={endLabel}
        endTime={endTime}
        inputPlaceholder={inputPlaceholder}
        onSelectDay={onSelectDay}
        onSetEndTime={onSetEndTime}
        onSetStartTime={onSetStartTime}
        quietHoursDays={quietHoursDays}
        selectedDays={selectedDays}
        startLabel={startLabel}
        startTime={startTime}
      />
    </SectionCard>
  );
}
