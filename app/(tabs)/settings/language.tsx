import { useState } from 'react';

import { t } from '@/components/move-alert/i18n';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import { SettingsLanguageSection } from '@/components/move-alert/settings/settings-language-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';
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

export default function SettingsLanguageScreen() {
  const { languageMode, setLanguageMode } = useLanguagePreference();
  const [isRestartNoticeVisible, setIsRestartNoticeVisible] = useState(false);

  async function selectLanguage(mode: typeof languageMode) {
    if (mode === languageMode) {
      return;
    }

    await setLanguageMode(mode);
    setIsRestartNoticeVisible(true);
  }

  return (
    <SettingsScreenShell description={t('settings.languagePageDescription')} title={t('settings.languagePageTitle')}>
      <SettingsLanguageSection
        description={t('settings.languageDescription')}
        languageEnglishLabel={t('settings.languageEnglish')}
        languageSystemLabel={t('settings.languageSystem')}
        languageThaiLabel={t('settings.languageThai')}
        mode={languageMode}
        onSelectLanguage={selectLanguage}
        title={t('settings.languageTitle')}
      />
      <AlertDialog
        isOpen={isRestartNoticeVisible}
        onClose={() => {
          setIsRestartNoticeVisible(false);
        }}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text className="text-lg font-extrabold text-typography-950">{t('settings.languageRestartTitle')}</Text>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3">
            <Text className="text-sm leading-6 text-typography-600">{t('settings.languageRestartDescription')}</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              action="primary"
              onPress={() => {
                setIsRestartNoticeVisible(false);
              }}
              size="md"
            >
              <Text className="font-bold text-typography-0">{t('settings.languageRestartConfirm')}</Text>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsScreenShell>
  );
}
