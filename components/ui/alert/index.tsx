import React, { createContext, useContext } from 'react';
import { View, ViewProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { Text } from '@/components/ui/text';

import { alertStyle, alertTextStyle } from './styles';

type AlertVariants = VariantProps<typeof alertStyle>;

const AlertContext = createContext<{
  action: NonNullable<AlertVariants['action']>;
}>({
  action: 'muted',
});

type AlertProps = ViewProps &
  AlertVariants & {
    className?: string;
  };

const Alert = React.forwardRef<React.ComponentRef<typeof View>, AlertProps>(function Alert(
  { action = 'muted', children, className, variant = 'solid', ...props },
  ref,
) {
  return (
    <AlertContext.Provider value={{ action }}>
      <View ref={ref} {...props} className={alertStyle({ action, class: className, variant })}>
        {children}
      </View>
    </AlertContext.Provider>
  );
});

type AlertTextProps = React.ComponentProps<typeof Text>;

function AlertText({ className, ...props }: AlertTextProps) {
  const { action } = useContext(AlertContext);

  return <Text {...props} className={alertTextStyle({ action, class: className })} />;
}

Alert.displayName = 'Alert';

export { Alert, AlertText };
