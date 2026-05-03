import React from 'react';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { hstackStyle } from './styles';

type IHStackProps = React.ComponentProps<'div'> &
  VariantProps<typeof hstackStyle> & { className?: string };

const HStack = React.forwardRef<React.ComponentRef<'div'>, IHStackProps>(
  function HStack({ className, reversed, space, ...props }, ref) {
    return (
      <div
        ref={ref}
        {...props}
        className={hstackStyle({ class: className, reversed, space })}
      />
    );
  },
);

HStack.displayName = 'HStack';

export { HStack };
