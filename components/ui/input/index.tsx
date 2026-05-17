import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { TextInput, TextInputProps, View, ViewProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { Pressable } from '@/components/ui/pressable';

import { inputFieldStyle, inputStyle } from './styles';

type InputVariants = VariantProps<typeof inputStyle>;

type InputContextValue = {
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  onBlur: () => void;
  onFocus: () => void;
  registerFieldRef: (field: React.ComponentRef<typeof TextInput> | null) => void;
  size: NonNullable<InputVariants['size']>;
  variant: NonNullable<InputVariants['variant']>;
};

const InputContext = createContext<InputContextValue>({
  isDisabled: false,
  isInvalid: false,
  isReadOnly: false,
  onBlur: () => undefined,
  onFocus: () => undefined,
  registerFieldRef: () => undefined,
  size: 'md',
  variant: 'outline',
});

function assignRef<T>(ref: React.ForwardedRef<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

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
    const fieldRef = useRef<React.ComponentRef<typeof TextInput> | null>(null);

    const contextValue = useMemo(
      () => ({
        isDisabled,
        isInvalid,
        isReadOnly,
        onBlur: () => setIsFocused(false),
        onFocus: () => setIsFocused(true),
        registerFieldRef: (
          field: React.ComponentRef<typeof TextInput> | null,
        ) => {
          fieldRef.current = field;
        },
        size,
        variant,
      }),
      [isDisabled, isInvalid, isReadOnly, size, variant],
    );

    return (
      <InputContext.Provider value={contextValue}>
        <Pressable
          accessible={false}
          onPress={() => {
            if (!isDisabled && !isReadOnly) {
              fieldRef.current?.focus();
            }
          }}
        >
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
        </Pressable>
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
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const {
    isDisabled,
    isReadOnly,
    onBlur: handleContextBlur,
    onFocus: handleContextFocus,
    registerFieldRef,
    size,
    variant,
  } = useContext(InputContext);

  return (
    <TextInput
      ref={(node) => {
        inputRef.current = node;
        registerFieldRef(node);
        assignRef(ref, node);
      }}
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
