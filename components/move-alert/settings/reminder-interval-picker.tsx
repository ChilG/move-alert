import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@/components/ui/slider';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import {
  formatReminderInterval,
  maxReminderIntervalMinutes,
  minReminderIntervalMinutes,
  reminderIntervalStepMinutes,
} from './settings-helpers';

type ReminderIntervalPickerProps = {
  customHint: string;
  customLabel: string;
  intervals: number[];
  minutesLabel: string;
  onSelectInterval: (interval: number) => void;
  presetButtonSize?: 'lg' | 'xl';
  selectedInterval: number;
};

export function ReminderIntervalPicker({
  customHint,
  customLabel,
  intervals,
  minutesLabel,
  onSelectInterval,
  presetButtonSize = 'xl',
  selectedInterval,
}: ReminderIntervalPickerProps) {
  return (
    <>
      <HStack space="md">
        {intervals.map((interval) => {
          const isSelected = selectedInterval === interval;

          return (
            <Button
              action={isSelected ? 'primary' : 'default'}
              className={`flex-1 rounded-2xl ${isSelected ? '' : 'bg-background-muted'}`}
              key={interval}
              onPress={() => onSelectInterval(interval)}
              size={presetButtonSize}
            >
              <HStack className="items-center" space="xs">
                <Text
                  className={`text-center text-lg font-extrabold ${isSelected ? 'text-typography-0' : 'text-typography-800'}`}
                >
                  {interval}
                </Text>
                <Text
                  className={`text-center text-xs font-semibold ${isSelected ? 'text-typography-0' : 'text-typography-500'}`}
                >
                  {minutesLabel}
                </Text>
              </HStack>
            </Button>
          );
        })}
      </HStack>

      <VStack className="mt-5" space="xs">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-typography-700">{customLabel}</Text>
          <Text className="text-sm font-extrabold text-typography-900">{formatReminderInterval(selectedInterval)}</Text>
        </View>
        <Slider
          className="py-4"
          maxValue={maxReminderIntervalMinutes}
          minValue={minReminderIntervalMinutes}
          onChange={onSelectInterval}
          size="lg"
          sliderTrackHeight={8}
          step={reminderIntervalStepMinutes}
          value={selectedInterval}
        >
          <SliderTrack className="h-2 border border-outline-200 bg-background-100">
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb className="h-7 w-7 border-2 border-background-0" />
        </Slider>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-typography-500">
            {minReminderIntervalMinutes} {minutesLabel}
          </Text>
          <Text className="text-xs font-semibold text-typography-500">
            {maxReminderIntervalMinutes} {minutesLabel}
          </Text>
        </View>
        <Text className="text-xs font-semibold text-typography-500">{customHint}</Text>
      </VStack>
    </>
  );
}
