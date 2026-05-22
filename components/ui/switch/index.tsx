import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';

import { useThemeColors } from '@/components/move-alert/theme-colors';

type SwitchProps = RNSwitchProps & {
  isDisabled?: boolean;
};

const Switch = React.forwardRef<React.ComponentRef<typeof RNSwitch>, SwitchProps>(function Switch(
  { disabled, isDisabled = false, value = false, ...props },
  ref,
) {
  const isSwitchDisabled = disabled ?? isDisabled;
  const colors = useThemeColors();

  return (
    <RNSwitch
      ref={ref}
      {...props}
      disabled={isSwitchDisabled}
      ios_backgroundColor={colors.switchTrackOff}
      thumbColor={colors.switchThumb}
      trackColor={{
        false: colors.switchTrackOff,
        true: colors.switchTrackOn,
      }}
      value={value}
    />
  );
});

Switch.displayName = 'Switch';

export { Switch };
