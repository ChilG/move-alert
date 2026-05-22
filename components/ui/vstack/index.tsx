import React from 'react';
import { View, ViewProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { vstackStyle } from './styles';

type IVStackProps = ViewProps & VariantProps<typeof vstackStyle> & { className?: string };

const VStack = React.forwardRef<React.ComponentRef<typeof View>, IVStackProps>(function VStack(
  { className, reversed, space, ...props },
  ref,
) {
  return <View ref={ref} {...props} className={vstackStyle({ class: className, reversed, space })} />;
});

VStack.displayName = 'VStack';

export { VStack };
