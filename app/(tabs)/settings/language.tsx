import { t } from '@/components/move-alert/i18n';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import { SettingsLanguageSection } from '@/components/move-alert/settings/settings-language-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';

export default function SettingsLanguageScreen() {
  const { languageMode, setLanguageMode } = useLanguagePreference();

  return (
    <SettingsScreenShell
      description={t('settings.languagePageDescription')}
      title={t('settings.languagePageTitle')}
    >
      <SettingsLanguageSection
        description={t('settings.languageDescription')}
        languageEnglishLabel={t('settings.languageEnglish')}
        languageSystemLabel={t('settings.languageSystem')}
        languageThaiLabel={t('settings.languageThai')}
        mode={languageMode}
        onSelectLanguage={setLanguageMode}
        title={t('settings.languageTitle')}
      />
    </SettingsScreenShell>
  );
}
