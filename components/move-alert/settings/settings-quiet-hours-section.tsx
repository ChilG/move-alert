import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import type { WeekDay } from '@/components/move-alert/move-alert-data';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

import { QuietTimeInput } from './quiet-time-input';
import { weekDayLabelKey } from './settings-constants';

type SettingsQuietHoursSectionProps = {
  daysLabel: string;
  description: string;
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
          <Text className="text-lg font-extrabold text-typography-900">
            {title}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-typography-500">
            {description}
          </Text>
        </View>
        <Ionicons color="#525252" name="moon-outline" size={26} />
      </View>

      <HStack className="mt-5" space="md">
        <QuietTimeInput
          label={startLabel}
          onCommit={onSetStartTime}
          value={startTime}
        />
        <QuietTimeInput
          label={endLabel}
          onCommit={onSetEndTime}
          value={endTime}
        />
      </HStack>

      <Text className="mt-5 text-sm font-bold text-typography-600">
        {daysLabel}
      </Text>
      <HStack className="mt-3 flex-wrap" space="sm">
        {quietHoursDays.map((day) => {
          const isSelected = selectedDays.includes(day);

          return (
            <Button
              action={isSelected ? 'primary' : 'default'}
              className={`w-full max-w-20 rounded-2xl ${
                isSelected ? 'bg-green-500' : 'bg-background-muted'
              }`}
              key={day}
              onPress={() => onSelectDay(day)}
              size="lg"
            >
              <Text
                className={`text-center text-sm font-extrabold ${
                  isSelected ? 'text-white' : 'text-typography-800'
                }`}
              >
                {t(weekDayLabelKey[day])}
              </Text>
            </Button>
          );
        })}
      </HStack>
    </SectionCard>
  );
}
