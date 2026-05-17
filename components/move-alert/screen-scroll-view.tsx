import { PropsWithChildren } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenScrollViewProps = PropsWithChildren<
  Omit<ScrollViewProps, 'contentContainerStyle'>
> & {
  bottomOffset?: number;
};

export function ScreenScrollView({
  bottomOffset = 96,
  children,
  ...props
}: ScreenScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background-50"
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 16) + 20,
        paddingBottom: Math.max(insets.bottom, 16) + bottomOffset,
        paddingHorizontal: 20,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
