import { tva } from '@gluestack-ui/utils/nativewind-utils';

export const buttonStyle = tva({
  base: 'rounded bg-primary-500 flex-row items-center justify-center gap-2 data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-indicator-info data-[focus-visible=true]:ring-2 data-[disabled=true]:opacity-40',
  variants: {
    action: {
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      positive: 'bg-success-500',
      negative: 'bg-error-500',
      default: 'bg-transparent',
    },
    variant: {
      link: 'px-0 bg-transparent',
      outline: 'border bg-transparent border-outline-200',
      solid: '',
    },
    size: {
      xs: 'h-8 px-3.5',
      sm: 'h-9 px-4',
      md: 'h-10 px-5',
      lg: 'h-11 px-6',
      xl: 'h-12 px-7',
    },
  },
  compoundVariants: [
    {
      action: 'default',
      variant: 'solid',
      class: 'bg-background-muted',
    },
  ],
  defaultVariants: {
    action: 'primary',
    size: 'md',
    variant: 'solid',
  },
});

export const buttonTextStyle = tva({
  base: 'font-semibold web:select-none',
  variants: {
    action: {
      primary: '',
      secondary: '',
      positive: '',
      negative: '',
      default: 'text-typography-700',
    },
    variant: {
      link: '',
      outline: '',
      solid: '',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  compoundVariants: [
    {
      action: 'primary',
      variant: 'solid',
      class: 'text-typography-0',
    },
    {
      action: 'secondary',
      variant: 'solid',
      class: 'text-typography-800',
    },
    {
      action: 'positive',
      variant: 'solid',
      class: 'text-typography-0',
    },
    {
      action: 'negative',
      variant: 'solid',
      class: 'text-typography-0',
    },
    {
      action: 'default',
      variant: 'solid',
      class: 'text-typography-700',
    },
    {
      action: 'primary',
      variant: 'outline',
      class: 'text-primary-600',
    },
    {
      action: 'secondary',
      variant: 'outline',
      class: 'text-typography-700',
    },
    {
      action: 'positive',
      variant: 'outline',
      class: 'text-success-700',
    },
    {
      action: 'negative',
      variant: 'outline',
      class: 'text-error-700',
    },
    {
      action: 'default',
      variant: 'outline',
      class: 'text-typography-700',
    },
    {
      action: 'primary',
      variant: 'link',
      class: 'text-primary-600',
    },
    {
      action: 'secondary',
      variant: 'link',
      class: 'text-typography-700',
    },
    {
      action: 'positive',
      variant: 'link',
      class: 'text-success-700',
    },
    {
      action: 'negative',
      variant: 'link',
      class: 'text-error-700',
    },
  ],
  defaultVariants: {
    action: 'primary',
    size: 'md',
    variant: 'solid',
  },
});
