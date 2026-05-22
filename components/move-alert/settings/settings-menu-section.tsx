import { PropsWithChildren } from 'react';

import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type SettingsMenuSectionProps = PropsWithChildren<{
  className?: string;
  title: string;
}>;

export function SettingsMenuSection({ children, className, title }: SettingsMenuSectionProps) {
  return (
    <VStack className={className ?? 'mt-6'} space="md">
      <Text className="px-1 text-sm font-bold uppercase text-typography-500">{title}</Text>
      <VStack space="md">{children}</VStack>
    </VStack>
  );
}
