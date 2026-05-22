import React, { createContext, useContext } from 'react';
import { View, ViewProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { Text } from '@/components/ui/text';

import { badgeStyle, badgeTextStyle } from './styles';

type BadgeVariants = VariantProps<typeof badgeStyle>;

const BadgeContext = createContext<{
  action: NonNullable<BadgeVariants['action']>;
  size: NonNullable<BadgeVariants['size']>;
}>({
  action: 'muted',
  size: 'md',
});

type BadgeProps = ViewProps &
  BadgeVariants & {
    className?: string;
  };

const Badge = React.forwardRef<React.ComponentRef<typeof View>, BadgeProps>(function Badge(
  { action = 'muted', children, className, size = 'md', variant = 'solid', ...props },
  ref,
) {
  return (
    <BadgeContext.Provider value={{ action, size }}>
      <View ref={ref} {...props} className={badgeStyle({ action, class: className, size, variant })}>
        {children}
      </View>
    </BadgeContext.Provider>
  );
});

type BadgeTextProps = React.ComponentProps<typeof Text>;

function BadgeText({ className, ...props }: BadgeTextProps) {
  const { action, size } = useContext(BadgeContext);

  return <Text {...props} className={badgeTextStyle({ action, class: className, size })} />;
}

Badge.displayName = 'Badge';

export { Badge, BadgeText };
