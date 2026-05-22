import React from 'react';
import { Pressable as RNPressable, PressableProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { pressableStyle } from './styles';

type IPressableProps = PressableProps & VariantProps<typeof pressableStyle> & { className?: string };

const Pressable = React.forwardRef<React.ComponentRef<typeof RNPressable>, IPressableProps>(function Pressable(
  { className, ...props },
  ref,
) {
  return <RNPressable ref={ref} {...props} className={pressableStyle({ class: className })} />;
});

Pressable.displayName = 'Pressable';

export { Pressable };
