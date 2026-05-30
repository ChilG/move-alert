import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

export const requiredFeatureNoticeCardClassName = 'border border-warning-200 bg-background-warning';
export const requiredFeatureActionButtonClassName = 'rounded-xl border-warning-300 bg-background-0';
export const requiredFeatureActionButtonTextClassName = 'text-warning-800';

type RequiredFeatureIconFrameProps = {
  color: string;
  name: ComponentProps<typeof Ionicons>['name'];
  size?: number;
};

export function RequiredFeatureIconFrame({ color, name, size = 21 }: RequiredFeatureIconFrameProps) {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-background-0">
      <Ionicons color={color} name={name} size={size} />
    </View>
  );
}
