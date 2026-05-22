import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemeColors } from '@/components/move-alert/theme-colors';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type SettingsMenuItemProps = {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  title: string;
  value?: string;
};

export function SettingsMenuItem({ description, icon, onPress, title, value }: SettingsMenuItemProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      className="flex-row items-center justify-between rounded-2xl bg-background-0 p-4 shadow-soft-1"
      onPress={onPress}
    >
      <HStack className="flex-1 items-center" space="md">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-warning-50">
          <Ionicons color={colors.warning} name={icon} size={22} />
        </View>

        <View className="flex-1">
          <Text className="text-base font-extrabold text-typography-900">{title}</Text>
          <Text className="mt-1 text-sm leading-5 text-typography-500">{description}</Text>
        </View>
      </HStack>

      <HStack className="ml-4 items-center" space="sm">
        {value ? (
          <Text className="max-w-[112px] text-right text-sm font-semibold text-typography-500" numberOfLines={2}>
            {value}
          </Text>
        ) : null}
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
      </HStack>
    </Pressable>
  );
}
