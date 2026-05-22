import React, { createContext, useContext } from 'react';
import { ActivityIndicator, PressableProps, Pressable as RNPressable } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { getButtonForegroundColor, useThemeColors } from '@/components/move-alert/theme-colors';
import { Text } from '@/components/ui/text';

import { buttonStyle, buttonTextStyle } from './styles';

type ButtonVariants = VariantProps<typeof buttonStyle>;

type ButtonContextValue = {
  action: NonNullable<ButtonVariants['action']>;
  size: NonNullable<ButtonVariants['size']>;
  variant: NonNullable<ButtonVariants['variant']>;
};

const ButtonContext = createContext<ButtonContextValue>({
  action: 'primary',
  size: 'md',
  variant: 'solid',
});

type ButtonProps = PressableProps &
  ButtonVariants & {
    className?: string;
    isDisabled?: boolean;
  };

const Button = React.forwardRef<React.ComponentRef<typeof RNPressable>, ButtonProps>(function Button(
  { action = 'primary', children, className, disabled, isDisabled = false, size = 'md', variant = 'solid', ...props },
  ref,
) {
  const isButtonDisabled = disabled ?? isDisabled;

  return (
    <ButtonContext.Provider value={{ action, size, variant }}>
      <RNPressable
        ref={ref}
        accessibilityState={{
          ...props.accessibilityState,
          disabled: isButtonDisabled,
        }}
        className={buttonStyle({
          action,
          class: className,
          size,
          variant,
        })}
        disabled={isButtonDisabled}
        {...props}
      >
        {children}
      </RNPressable>
    </ButtonContext.Provider>
  );
});

type ButtonTextProps = React.ComponentProps<typeof Text>;

function ButtonText({ className, ...props }: ButtonTextProps) {
  const { action, size, variant } = useContext(ButtonContext);

  return (
    <Text
      {...props}
      className={buttonTextStyle({
        action,
        class: className,
        size,
        variant,
      })}
    />
  );
}

function ButtonSpinner({ color, size = 'small' }: { color?: string; size?: 'small' | 'large' }) {
  const { action, variant } = useContext(ButtonContext);
  const colors = useThemeColors();
  const resolvedColor = color ?? getButtonForegroundColor(colors, action, variant);

  return <ActivityIndicator color={resolvedColor} size={size} />;
}

Button.displayName = 'Button';

export { Button, ButtonSpinner, ButtonText };
