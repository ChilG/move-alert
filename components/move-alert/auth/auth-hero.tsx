import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

type AuthHeroProps = {
  subtitle: string;
  title: string;
};

export function AuthHero({ subtitle, title }: AuthHeroProps) {
  const colors = useThemeColors();

  return (
    <View className="mb-8 items-center">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-success-100">
        <Ionicons color={colors.success} name="walk-outline" size={34} />
      </View>
      <Heading size="2xl" style={{ lineHeight: 36 }}>
        {title}
      </Heading>
      <Text className="mt-2 text-center text-base leading-6 text-typography-600">
        {subtitle}
      </Text>
    </View>
  );
}
