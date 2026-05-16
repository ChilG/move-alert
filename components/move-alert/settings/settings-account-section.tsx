import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import {
  getButtonForegroundColor,
  useThemeColors,
} from '@/components/move-alert/theme-colors';
import { Alert, AlertText } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
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
    <>
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
      </SectionCard>

      <SectionCard className="mt-5 border border-red-500">
        <Text className="text-sm font-bold uppercase text-error-700">
          {deleteAccountLabel}
        </Text>
        <Text className="mt-2 text-sm leading-6 text-typography-600">
          {deleteAccountDescription}
        </Text>

        <Button
          action="negative"
          className="mt-4"
          disabled={isLoading}
          onPress={onStartDeleteAccount}
          size="xl"
        >
          <Ionicons
            color={getButtonForegroundColor(colors, 'negative', 'solid')}
            name="trash-outline"
            size={18}
          />
          <Text className="font-bold text-typography-0">{deleteAccountLabel}</Text>
        </Button>
      </SectionCard>

      <AlertDialog
        isOpen={isDeleteConfirmationVisible}
        onClose={onCancelDeleteAccount}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text className="text-lg font-extrabold text-typography-950">
              {deleteAccountLabel}
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3">
            <Text className="text-sm leading-6 text-typography-600">
              {deleteAccountDescription}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              action="default"
              disabled={isLoading}
              onPress={onCancelDeleteAccount}
              size="md"
              variant="outline"
            >
              <Text className="font-bold">{cancelDeleteAccountLabel}</Text>
            </Button>
            <Button
              action="negative"
              disabled={isLoading}
              onPress={onConfirmDeleteAccount}
              size="md"
            >
              <Text className="font-bold text-typography-0">
                {deleteAccountConfirmLabel}
              </Text>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
