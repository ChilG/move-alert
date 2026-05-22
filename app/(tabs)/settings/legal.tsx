import * as Linking from 'expo-linking';

import { t } from '@/components/move-alert/i18n';
import { accountDeletionUrl, privacyPolicyUrl } from '@/components/move-alert/legal-links';
import { SettingsLegalSection } from '@/components/move-alert/settings/settings-legal-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';

export default function SettingsLegalScreen() {
  function openExternalUrl(url: string) {
    if (!url) return;

    void Linking.openURL(url);
  }

  return (
    <SettingsScreenShell description={t('settings.legalPageDescription')} title={t('settings.legalPageTitle')}>
      <SettingsLegalSection
        accountDeletionLabel={t('settings.accountDeletionPolicy')}
        description={t('settings.legalDescription')}
        onOpenAccountDeletion={() => {
          openExternalUrl(accountDeletionUrl);
        }}
        onOpenPrivacyPolicy={() => {
          openExternalUrl(privacyPolicyUrl);
        }}
        privacyPolicyLabel={t('settings.privacyPolicy')}
        title={t('settings.legalTitle')}
      />
    </SettingsScreenShell>
  );
}
