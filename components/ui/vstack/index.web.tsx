import React from 'react';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { vstackStyle } from './styles';

type IVStackProps = React.ComponentProps<'div'> &
  VariantProps<typeof vstackStyle> & { className?: string };

const VStack = React.forwardRef<React.ComponentRef<'div'>, IVStackProps>(
  function VStack({ className, reversed, space, ...props }, ref) {
    return (
      <div
        ref={ref}
        {...props}
        className={vstackStyle({ class: className, reversed, space })}
      />
    );
  },
);

VStack.displayName = 'VStack';

export { VStack };
