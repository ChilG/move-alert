import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { SectionCard } from '@/components/move-alert/shared/section-card';
import { parseReminderInterval } from './settings-helpers';

type SettingsIntervalSectionProps = {
  customHint: string;
  customInvalidMessage: string;
  customLabel: string;
  customPlaceholder: string;
  description: string;
  intervals: number[];
  minutesLabel: string;
  onSelectInterval: (interval: number) => void;
  selectedInterval: number;
  title: string;
};

export function SettingsIntervalSection({
  customHint,
  customInvalidMessage,
  customLabel,
  customPlaceholder,
  description,
  intervals,
  minutesLabel,
  onSelectInterval,
  selectedInterval,
  title,
}: SettingsIntervalSectionProps) {
  const [draftInterval, setDraftInterval] = useState(String(selectedInterval));
  const colors = useThemeColors();
  const parsedDraftInterval = parseReminderInterval(draftInterval);
  const isValidDraftInterval = parsedDraftInterval !== null;

  useEffect(() => {
    setDraftInterval(String(selectedInterval));
  }, [selectedInterval]);

  function commitDraftInterval() {
    if (
      parsedDraftInterval !== null &&
      parsedDraftInterval !== selectedInterval
    ) {
      onSelectInterval(parsedDraftInterval);
    }
  }

  return (
    <SectionCard className="mt-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-extrabold text-typography-900">
            {title}
          </Text>
          <Text className="mt-1 text-sm text-typography-500">
            {description}
          </Text>
        </View>
        <Ionicons color={colors.textDefault} name="alarm-outline" size={26} />
      </View>

      <HStack className="mt-5" space="md">
        {intervals.map((interval) => {
          const isSelected = selectedInterval === interval;

          return (
            <Button
              action={isSelected ? 'primary' : 'default'}
              className={`flex-1 rounded-2xl ${
                isSelected ? '' : 'bg-background-muted'
              }`}
              key={interval}
              onPress={() => onSelectInterval(interval)}
              size="xl"
            >
              <HStack className="items-center" space="xs">
                <Text
                  className={`text-center text-lg font-extrabold ${
                    isSelected ? 'text-typography-0' : 'text-typography-800'
                  }`}
                >
                  {interval}
                </Text>
                <Text
                  className={`text-center text-xs font-semibold ${
                    isSelected ? 'text-typography-0' : 'text-typography-500'
                  }`}
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
          <Text className="text-sm font-bold text-typography-700">
            {customLabel}
          </Text>
          <Text className="text-xs font-semibold text-typography-500">
            {customHint}
          </Text>
        </View>

        <Input className="rounded-2xl" isInvalid={!isValidDraftInterval} size="lg">
          <InputField
            inputMode="numeric"
            keyboardType="number-pad"
            onBlur={commitDraftInterval}
            onChangeText={setDraftInterval}
            onSubmitEditing={commitDraftInterval}
            placeholder={customPlaceholder}
            placeholderTextColor={colors.placeholder}
            value={draftInterval}
          />
        </Input>

        {isValidDraftInterval ? null : (
          <Text className="text-xs font-semibold text-error-700">
            {customInvalidMessage}
          </Text>
        )}
      </VStack>
    </SectionCard>
  );
}
