import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthScreen } from '@/components/move-alert/auth-screen';
import { LanguagePreferenceProvider } from '@/components/move-alert/language-state';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { AuthProvider, useAuth } from '@/components/move-alert/auth-state';
import { MoveAlertProvider } from '@/components/move-alert/move-alert-state';
import {
  ThemePreferenceProvider,
  useThemePreference,
} from '@/components/move-alert/theme-state';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

function AppStack() {
  const { status } = useAuth();
  const colors = useThemeColors();

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-background-muted">
        <ActivityIndicator color={colors.statusBarSpinner} size="large" />
      </View>
    );
  }

  if (status === 'signed-out') {
    return <AuthScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function RootLayoutContent() {
  const { resolvedTheme, themeMode } = useThemePreference();

  return (
    <GluestackUIProvider mode={themeMode}>
      <AuthProvider>
        <MoveAlertProvider>
          <AppStack />
        </MoveAlertProvider>
      </AuthProvider>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguagePreferenceProvider>
      <ThemePreferenceProvider>
        <RootLayoutContent />
      </ThemePreferenceProvider>
    </LanguagePreferenceProvider>
  );
}
