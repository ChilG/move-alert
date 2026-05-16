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

type SettingsAccountSectionProps = {
  cancelDeleteAccountLabel: string;
  deleteAccountConfirmLabel: string;
  deleteAccountDescription: string;
  deleteAccountLabel: string;
  errorMessage: string | null;
  isDeleteConfirmationVisible: boolean;
  isLoading: boolean;
  onCancelDeleteAccount: () => void;
  onConfirmDeleteAccount: () => void;
  onSignOut: () => void;
  onStartDeleteAccount: () => void;
  signedInAccountLabel: string;
  signOutLabel: string;
  syncLabel: string;
  userEmail: string;
};

export function SettingsAccountSection({
  cancelDeleteAccountLabel,
  deleteAccountConfirmLabel,
  deleteAccountDescription,
  deleteAccountLabel,
  errorMessage,
  isDeleteConfirmationVisible,
  isLoading,
  onCancelDeleteAccount,
  onConfirmDeleteAccount,
  onSignOut,
  onStartDeleteAccount,
  signedInAccountLabel,
  signOutLabel,
  syncLabel,
  userEmail,
}: SettingsAccountSectionProps) {
  const colors = useThemeColors();

  return (
    <SectionCard className="mt-6">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-success-50">
          <Ionicons
            color={colors.success}
            name="person-circle-outline"
            size={28}
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-typography-500">
            {signedInAccountLabel}
          </Text>
          <Text className="mt-1 text-base font-extrabold text-typography-900">
            {userEmail}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-typography-500">
            {syncLabel}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Alert action="error" className="mt-4 rounded-2xl">
          <AlertText>{errorMessage}</AlertText>
        </Alert>
      ) : null}

      <Button
        action="default"
        className="mt-4"
        disabled={isLoading}
        onPress={onSignOut}
        size="xl"
        variant="outline"
      >
        <Ionicons
          color={getButtonForegroundColor(colors, 'default', 'outline')}
          name="log-out-outline"
          size={18}
        />
        <Text className="font-bold">{signOutLabel}</Text>
      </Button>

      <Button
        action="negative"
        className="mt-3"
        disabled={isLoading}
        onPress={
          isDeleteConfirmationVisible
            ? onConfirmDeleteAccount
            : onStartDeleteAccount
        }
        size="xl"
      >
        <Ionicons
          color={getButtonForegroundColor(colors, 'negative', 'solid')}
          name="trash-outline"
          size={18}
        />
        <Text className="font-bold text-typography-0">
          {isDeleteConfirmationVisible
            ? deleteAccountConfirmLabel
            : deleteAccountLabel}
        </Text>
      </Button>

      {isDeleteConfirmationVisible ? (
        <Alert action="warning" className="mt-4 rounded-2xl">
          <AlertText>{deleteAccountDescription}</AlertText>
          <Button
            action="default"
            className="mt-3 self-start"
            disabled={isLoading}
            onPress={onCancelDeleteAccount}
            size="md"
            variant="outline"
          >
            <Text className="font-bold">{cancelDeleteAccountLabel}</Text>
          </Button>
        </Alert>
      ) : null}
    </SectionCard>
  );
}
