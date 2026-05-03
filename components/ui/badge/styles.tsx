import { tva } from '@gluestack-ui/utils/nativewind-utils';

export const badgeStyle = tva({
  base: 'flex-row items-center rounded-full',
  variants: {
    action: {
      error: 'bg-error-50',
      warning: 'bg-warning-50',
      success: 'bg-success-50',
      info: 'bg-info-50',
      muted: 'bg-background-muted',
    },
    size: {
      sm: 'px-2 py-0.5',
      md: 'px-3 py-1',
      lg: 'px-4 py-1.5',
    },
    variant: {
      solid: '',
      outline: 'border border-outline-200 bg-background-0',
    },
  },
  defaultVariants: {
    action: 'muted',
    size: 'md',
    variant: 'solid',
  },
});

export const badgeTextStyle = tva({
  base: 'font-bold',
  variants: {
    action: {
      error: 'text-error-700',
      warning: 'text-warning-700',
      success: 'text-success-700',
      info: 'text-info-700',
      muted: 'text-typography-600',
    },
    size: {
      sm: 'text-2xs',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    action: 'muted',
    size: 'md',
  },
});
