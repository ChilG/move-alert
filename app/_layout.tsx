import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppLoadingScreen } from '@/components/move-alert/app-loading-screen';
import { AppUpdateGate } from '@/components/move-alert/app-update/app-update-gate';
import { AuthScreen } from '@/components/move-alert/auth-screen';
import { LanguagePreferenceProvider } from '@/components/move-alert/language-state';
import { AuthProvider, useAuth } from '@/components/move-alert/auth-state';
import { MoveAlertProvider } from '@/components/move-alert/move-alert-state';
import { ReminderOnboardingGate } from '@/components/move-alert/reminder-onboarding-gate';
import { ThemePreferenceProvider, useThemePreference } from '@/components/move-alert/theme-state';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

function AppStack() {
  const { isLoginDisabled, status } = useAuth();

  if (status === 'loading') {
    return <AppLoadingScreen />;
  }

  if (status === 'signed-out') {
    return isLoginDisabled ? <AppLoadingScreen /> : <AuthScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <ReminderOnboardingGate />
    </>
  );
}

function RootLayoutContent() {
  const { resolvedTheme, themeMode } = useThemePreference();

  return (
    <GluestackUIProvider mode={themeMode}>
      <AuthProvider>
        <MoveAlertProvider>
          <AppStack />
          <AppUpdateGate />
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
