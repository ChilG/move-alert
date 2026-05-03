import { tva } from '@gluestack-ui/utils/nativewind-utils';

export const inputStyle = tva({
  base: 'flex-row items-center overflow-hidden border bg-background-0',
  variants: {
    size: {
      sm: 'h-9',
      md: 'h-10',
      lg: 'h-11',
      xl: 'h-12',
    },
    variant: {
      underlined: 'rounded-none border-b border-t-0 border-l-0 border-r-0',
      outline: 'rounded border-outline-200',
      rounded: 'rounded-full border-outline-200',
    },
    isDisabled: {
      true: 'opacity-40',
    },
    isFocused: {
      true: 'border-primary-700',
    },
    isInvalid: {
      true: 'border-error-700',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
});

export const inputFieldStyle = tva({
  base: 'flex-1 h-full py-0 text-typography-900 placeholder:text-typography-500 web:cursor-text web:outline-none',
  variants: {
    size: {
      sm: 'text-sm px-3',
      md: 'text-base px-3',
      lg: 'text-lg px-3',
      xl: 'text-xl px-4',
    },
    variant: {
      underlined: 'px-0',
      outline: '',
      rounded: 'px-4',
    },
    isReadOnly: {
      true: 'text-typography-500',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
});
