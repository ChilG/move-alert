import { ReactNode } from 'react';
import { View } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

type ScreenHeaderProps = {
  description?: string;
  eyebrow: string;
  eyebrowClassName: string;
  title: string;
  trailing?: ReactNode;
};

export function ScreenHeader({ description, eyebrow, eyebrowClassName, title, trailing }: ScreenHeaderProps) {
  return (
    <HStack className="items-start justify-between" space="md">
      <View className="flex-1 pr-4">
        <Text className={`text-sm font-bold uppercase ${eyebrowClassName}`}>{eyebrow}</Text>
        <Text className="mt-1 text-3xl font-extrabold text-typography-950">{title}</Text>
        {description ? <Text className="mt-3 text-base leading-6 text-typography-600">{description}</Text> : null}
      </View>
      {trailing}
    </HStack>
  );
}
