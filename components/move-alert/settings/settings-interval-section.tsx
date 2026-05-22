import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';
import { ReminderIntervalPicker } from './reminder-interval-picker';

type SettingsIntervalSectionProps = {
  customHint: string;
  customLabel: string;
  description: string;
  intervals: number[];
  minutesLabel: string;
  onSelectInterval: (interval: number) => void;
  selectedInterval: number;
  title: string;
};

export function SettingsIntervalSection({
  customHint,
  customLabel,
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
          <Text className="text-lg font-extrabold text-typography-900">{title}</Text>
          <Text className="mt-1 text-sm text-typography-500">{description}</Text>
        </View>
        <Ionicons color={colors.textDefault} name="alarm-outline" size={26} />
      </View>

      <View className="mt-5">
        <ReminderIntervalPicker
          customHint={customHint}
          customLabel={customLabel}
          intervals={intervals}
          minutesLabel={minutesLabel}
          onSelectInterval={onSelectInterval}
          selectedInterval={selectedInterval}
        />
      </View>
    </SectionCard>
  );
}
