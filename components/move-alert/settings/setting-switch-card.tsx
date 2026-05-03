import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Pressable } from '@/components/ui/pressable';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';

type SettingSwitchCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  isEnabled: boolean;
  label: string;
  onPress: () => void;
};

export function SettingSwitchCard({
  icon,
  isEnabled,
  label,
  onPress,
}: SettingSwitchCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      className="flex-row items-center justify-between rounded-2xl bg-background-0 p-4 shadow-soft-1"
      onPress={onPress}
    >
      <HStack className="items-center" space="md">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-info-50">
          <Ionicons color={colors.info} name={icon} size={22} />
        </View>
        <Text className="text-base font-bold text-typography-800">{label}</Text>
      </HStack>

      <Switch pointerEvents="none" value={isEnabled} />
    </Pressable>
  );
}
