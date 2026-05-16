import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import {
  getButtonForegroundColor,
  useThemeColors,
} from '@/components/move-alert/theme-colors';
import { Alert, AlertText } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

type SettingsNotificationDebugSectionProps = {
  debugLabel: string;
  description: string;
  isLoading: boolean;
  onSendDebugNotification: () => void;
  statusMessage: string | null;
  title: string;
};

export function SettingsNotificationDebugSection({
  debugLabel,
  description,
  isLoading,
  onSendDebugNotification,
  statusMessage,
  title,
}: SettingsNotificationDebugSectionProps) {
  const colors = useThemeColors();

  return (
    <SectionCard className="mt-6">
      <View>
        <Text className="text-lg font-extrabold text-typography-900">
          {title}
        </Text>
        <Text className="mt-2 text-sm leading-6 text-typography-600">
          {description}
        </Text>
      </View>

      {statusMessage ? (
        <Alert action="info" className="mt-4 rounded-2xl">
          <AlertText>{statusMessage}</AlertText>
        </Alert>
      ) : null}

      <Button
        className="mt-4 rounded-xl"
        disabled={isLoading}
        onPress={onSendDebugNotification}
        size="lg"
      >
        <Ionicons
          color={getButtonForegroundColor(colors, 'primary', 'solid')}
          name="notifications-outline"
          size={18}
        />
        <Text className="font-bold text-typography-0">{debugLabel}</Text>
      </Button>
    </SectionCard>
  );
}
