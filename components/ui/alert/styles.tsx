import { tva } from '@gluestack-ui/utils/nativewind-utils';

export const alertStyle = tva({
  base: 'flex-row items-center gap-2 rounded-2xl border border-outline-100 px-4 py-3',
  variants: {
    action: {
      error: 'bg-background-error',
      warning: 'bg-background-warning',
      success: 'bg-background-success',
      info: 'bg-background-info',
      muted: 'bg-background-muted',
    },
    variant: {
      solid: '',
      outline: 'bg-background-0',
    },
  },
  defaultVariants: {
    action: 'muted',
    variant: 'solid',
  },
});

export const alertTextStyle = tva({
  base: 'font-medium',
  variants: {
    action: {
      error: 'text-error-800',
      warning: 'text-warning-800',
      success: 'text-success-800',
      info: 'text-info-800',
      muted: 'text-typography-700',
    },
  },
  defaultVariants: {
    action: 'muted',
  },
});
