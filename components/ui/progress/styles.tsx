import { tva } from '@gluestack-ui/utils/nativewind-utils';

export const progressStyle = tva({
  base: 'w-full rounded-full bg-background-300 overflow-hidden',
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full justify-end',
    },
    size: {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-5',
      '2xl': 'h-6',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
});

export const progressFilledTrackStyle = tva({
  base: 'rounded-full bg-primary-500',
  variants: {
    orientation: {
      horizontal: 'h-full',
      vertical: 'w-full',
    },
    size: {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-5',
      '2xl': 'h-6',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
});
