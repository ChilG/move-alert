import { useState } from 'react';

import { useAuth } from '@/components/move-alert/auth-state';
import { t } from '@/components/move-alert/i18n';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';
import { SettingsAccountSection } from '@/components/move-alert/settings/settings-account-section';

export default function SettingsAccountScreen() {
  const { deleteAccount, isGuest, isLoading, isLoginDisabled, signOut, user } =
    useAuth();
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] =
    useState(false);
  const { errorMessage, isSyncing, syncStatus } = useMoveAlert();
  const syncLabel = isSyncing
    ? t('settings.syncing')
    : syncStatus === 'error'
      ? t('settings.syncError')
      : t('settings.synced');

  return (
    <SettingsScreenShell
      description={t('settings.accountPageDescription')}
      title={t('settings.accountPageTitle')}
    >
      <SettingsAccountSection
        cancelDeleteAccountLabel={t('settings.cancelDeleteAccount')}
        deleteAccountConfirmLabel={t('settings.deleteAccountConfirm')}
        deleteAccountDescription={t('settings.deleteAccountDescription')}
        deleteAccountLabel={t('settings.deleteAccount')}
        errorMessage={errorMessage}
        isDeleteConfirmationVisible={isDeleteConfirmationVisible}
        isLoading={isLoading}
        onCancelDeleteAccount={() => {
          setIsDeleteConfirmationVisible(false);
        }}
        onConfirmDeleteAccount={() => {
          void deleteAccount();
        }}
        onSignOut={() => {
          void signOut();
        }}
        onStartDeleteAccount={() => {
          setIsDeleteConfirmationVisible(true);
        }}
        showDeleteAccount={!isGuest}
        showSignOut={!isLoginDisabled}
        signedInAccountLabel={t('settings.signedInAccount')}
        signOutLabel={t('settings.signOut')}
        syncLabel={syncLabel}
        userEmail={
          isGuest
            ? t('settings.guestSession')
            : (user?.email ?? t('settings.unknownUser'))
        }
      />
    </SettingsScreenShell>
  );
}
