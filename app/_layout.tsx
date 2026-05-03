import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthScreen } from '@/components/move-alert/auth-screen';
import { AuthProvider, useAuth } from '@/components/move-alert/auth-state';
import { MoveAlertProvider } from '@/components/move-alert/demo-state';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

function AppStack() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-background-muted">
        <ActivityIndicator color="#18181b" size="large" />
      </View>
    );
  }

  if (status === 'signed-out') {
    return <AuthScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <MoveAlertProvider>
          <AppStack />
        </MoveAlertProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
