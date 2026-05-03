import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { TextInput, TextInputProps, View, ViewProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { inputFieldStyle, inputStyle } from './styles';

type InputVariants = VariantProps<typeof inputStyle>;

type InputContextValue = {
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  onBlur: () => void;
  onFocus: () => void;
  size: NonNullable<InputVariants['size']>;
  variant: NonNullable<InputVariants['variant']>;
};

const InputContext = createContext<InputContextValue>({
  isDisabled: false,
  isInvalid: false,
  isReadOnly: false,
  onBlur: () => undefined,
  onFocus: () => undefined,
  size: 'md',
  variant: 'outline',
});

type InputProps = PropsWithChildren<
  ViewProps &
    InputVariants & {
      className?: string;
      isDisabled?: boolean;
      isInvalid?: boolean;
      isReadOnly?: boolean;
    }
>;

const Input = React.forwardRef<React.ComponentRef<typeof View>, InputProps>(
  function Input(
    {
      children,
      className,
      isDisabled = false,
      isInvalid = false,
      isReadOnly = false,
      size = 'md',
      variant = 'outline',
      ...props
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);

    const contextValue = useMemo(
      () => ({
        isDisabled,
        isInvalid,
        isReadOnly,
        onBlur: () => setIsFocused(false),
        onFocus: () => setIsFocused(true),
        size,
        variant,
      }),
      [isDisabled, isInvalid, isReadOnly, size, variant],
    );

    return (
      <InputContext.Provider value={contextValue}>
        <View
          ref={ref}
          {...props}
          className={inputStyle({
            class: className,
            isDisabled,
            isFocused,
            isInvalid,
            size,
            variant,
          })}
        >
          {children}
        </View>
      </InputContext.Provider>
    );
  },
);

type InputFieldProps = TextInputProps & {
  className?: string;
  type?: 'password' | 'text';
};

const InputField = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  InputFieldProps
>(function InputField(
  { className, onBlur, onFocus, secureTextEntry, type = 'text', ...props },
  ref,
) {
  const { isDisabled, isReadOnly, onBlur: handleContextBlur, onFocus: handleContextFocus, size, variant } =
    useContext(InputContext);

  return (
    <TextInput
      ref={ref}
      {...props}
      className={inputFieldStyle({
        class: className,
        isReadOnly,
        size,
        variant,
      })}
      editable={!isDisabled && !isReadOnly}
      onBlur={(event) => {
        handleContextBlur();
        onBlur?.(event);
      }}
      onFocus={(event) => {
        handleContextFocus();
        onFocus?.(event);
      }}
      secureTextEntry={secureTextEntry ?? type === 'password'}
    />
  );
});

Input.displayName = 'Input';
InputField.displayName = 'InputField';

export { Input, InputField };
