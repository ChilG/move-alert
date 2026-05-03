import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

type SettingsIntervalSectionProps = {
  description: string;
  intervals: number[];
  minutesLabel: string;
  onSelectInterval: (interval: number) => void;
  selectedInterval: number;
  title: string;
};

export function SettingsIntervalSection({
  description,
  intervals,
  minutesLabel,
  onSelectInterval,
  selectedInterval,
  title,
}: SettingsIntervalSectionProps) {
  const colors = useThemeColors();

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
    </SectionCard>
  );
}
