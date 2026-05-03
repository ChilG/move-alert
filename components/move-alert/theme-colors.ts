import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { useThemePreference } from '@/components/move-alert/theme-state';
import { buttonStyle } from '@/components/ui/button/styles';

type ButtonVariants = VariantProps<typeof buttonStyle>;
type ButtonAction = NonNullable<ButtonVariants['action']>;
type ButtonVariant = NonNullable<ButtonVariants['variant']>;

type ThemeColorPalette = {
  borderDefault: string;
  borderMuted: string;
  error: string;
  info: string;
  placeholder: string;
  primary: string;
  statusBarSpinner: string;
  success: string;
  surface: string;
  surfaceInfo: string;
  surfaceMuted: string;
  surfacePrimary: string;
  switchThumb: string;
  switchTrackOff: string;
  switchTrackOn: string;
  tabBarActive: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarInactive: string;
  textDefault: string;
  textDisabled: string;
  textInverse: string;
  textMuted: string;
  textStrong: string;
  warning: string;
};

const lightThemeColors: ThemeColorPalette = {
  borderDefault: '#e6e6e6',
  borderMuted: '#d4d4d8',
  error: '#b91c1c',
  info: '#0973a8',
  placeholder: '#8c8c8c',
  primary: '#292929',
  statusBarSpinner: '#171717',
  success: '#206f3e',
  surface: '#ffffff',
  surfaceInfo: '#ebf8fe',
  surfaceMuted: '#f7f8f7',
  surfacePrimary: '#f5f5f5',
  switchThumb: '#ffffff',
  switchTrackOff: '#d4d4d8',
  switchTrackOn: '#22c55e',
  tabBarActive: '#171717',
  tabBarBackground: '#ffffff',
  tabBarBorder: '#ededed',
  tabBarInactive: '#8c8c8c',
  textDefault: '#525252',
  textDisabled: '#a3a3a3',
  textInverse: '#fefeff',
  textMuted: '#737373',
  textStrong: '#171717',
  warning: '#b45a1a',
} as const;

const darkThemeColors: ThemeColorPalette = {
  borderDefault: '#3f3f46',
  borderMuted: '#52525b',
  error: '#f87171',
  info: '#7cd0f8',
  placeholder: '#a3a3a3',
  primary: '#e6e6e6',
  statusBarSpinner: '#f4f4f5',
  success: '#86efac',
  surface: '#121212',
  surfaceInfo: '#0f2530',
  surfaceMuted: '#1c1c1c',
  surfacePrimary: '#2a2a2a',
  switchThumb: '#ffffff',
  switchTrackOff: '#52525b',
  switchTrackOn: '#22c55e',
  tabBarActive: '#f4f4f5',
  tabBarBackground: '#121212',
  tabBarBorder: '#2a2a2a',
  tabBarInactive: '#a3a3a3',
  textDefault: '#d4d4d8',
  textDisabled: '#71717a',
  textInverse: '#171717',
  textMuted: '#a1a1aa',
  textStrong: '#f4f4f5',
  warning: '#fdba74',
};

export function useThemeColors() {
  const { resolvedTheme } = useThemePreference();

  return resolvedTheme === 'dark' ? darkThemeColors : lightThemeColors;
}

export function getButtonForegroundColor(
  colors: ReturnType<typeof useThemeColors>,
  action: ButtonAction,
  variant: ButtonVariant,
) {
  if (variant === 'solid') {
    if (action === 'secondary' || action === 'default') {
      return colors.textStrong;
    }

    if (action === 'positive') {
      return colors.textInverse;
    }

    if (action === 'negative') {
      return colors.textInverse;
    }

    return colors.textInverse;
  }

  if (action === 'negative') {
    return colors.error;
  }

  if (action === 'positive') {
    return colors.success;
  }

  if (action === 'primary') {
    return colors.primary;
  }

  return colors.textDefault;
}
