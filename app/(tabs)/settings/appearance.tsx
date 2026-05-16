import { t } from '@/components/move-alert/i18n';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';
import { SettingsThemeSection } from '@/components/move-alert/settings/settings-theme-section';
import { useThemePreference } from '@/components/move-alert/theme-state';

export default function SettingsAppearanceScreen() {
  const { setThemeMode, themeMode } = useThemePreference();

  return (
    <SettingsScreenShell
      description={t('settings.appearancePageDescription')}
      title={t('settings.appearancePageTitle')}
    >
      <SettingsThemeSection
        description={t('settings.themeDescription')}
        mode={themeMode}
        onSelectTheme={setThemeMode}
        themeDarkLabel={t('settings.themeDark')}
        themeLightLabel={t('settings.themeLight')}
        themeSystemLabel={t('settings.themeSystem')}
        title={t('settings.themeTitle')}
      />
    </SettingsScreenShell>
  );
}
