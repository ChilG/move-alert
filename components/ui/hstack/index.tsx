import React from 'react';
import { View, ViewProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { hstackStyle } from './styles';

type IHStackProps = ViewProps &
  VariantProps<typeof hstackStyle> & { className?: string };

const HStack = React.forwardRef<React.ComponentRef<typeof View>, IHStackProps>(
  function HStack({ className, reversed, space, ...props }, ref) {
    return (
      <View
        ref={ref}
        {...props}
        className={hstackStyle({ class: className, reversed, space })}
      />
    );
  },
);

HStack.displayName = 'HStack';

export { HStack };
