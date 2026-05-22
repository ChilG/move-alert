import { useRouter } from 'expo-router';

import { useAuth } from '@/components/move-alert/auth-state';
import { t } from '@/components/move-alert/i18n';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { SettingsMenuItem } from '@/components/move-alert/settings/settings-menu-item';
import { SettingsMenuSection } from '@/components/move-alert/settings/settings-menu-section';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { useThemePreference } from '@/components/move-alert/theme-state';

function getThemeLabel(mode: ReturnType<typeof useThemePreference>['themeMode']) {
  if (mode === 'light') return t('settings.themeLight');
  if (mode === 'dark') return t('settings.themeDark');

  return t('settings.themeSystem');
}

function getLanguageLabel(mode: ReturnType<typeof useLanguagePreference>['languageMode']) {
  if (mode === 'th') return t('settings.languageThai');
  if (mode === 'en') return t('settings.languageEnglish');

  return t('settings.languageSystem');
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isGuest, user } = useAuth();
  const { languageMode } = useLanguagePreference();
  const { themeMode } = useThemePreference();
  const { state } = useMoveAlert();

  return (
    <ScreenScrollView>
      <ScreenHeader
        description={t('settings.menuDescription')}
        eyebrow={t('settings.eyebrow')}
        eyebrowClassName="text-warning-600"
        title={t('settings.title')}
      />

      <SettingsMenuSection className="mt-6" title={t('settings.menuPreferencesGroup')}>
        <SettingsMenuItem
          description={t('settings.menuRemindersDescription')}
          icon="notifications-outline"
          onPress={() => {
            router.push('/(tabs)/settings/reminders');
          }}
          title={t('settings.menuRemindersTitle')}
          value={`${state.intervalMinutes} ${t('common.minutesShort')}`}
        />
        <SettingsMenuItem
          description={t('settings.menuAppearanceDescription')}
          icon="color-palette-outline"
          onPress={() => {
            router.push('/(tabs)/settings/appearance');
          }}
          title={t('settings.menuAppearanceTitle')}
          value={getThemeLabel(themeMode)}
        />
        <SettingsMenuItem
          description={t('settings.menuLanguageDescription')}
          icon="language-outline"
          onPress={() => {
            router.push('/(tabs)/settings/language');
          }}
          title={t('settings.menuLanguageTitle')}
          value={getLanguageLabel(languageMode)}
        />
      </SettingsMenuSection>

      <SettingsMenuSection title={t('settings.menuAccountGroup')}>
        <SettingsMenuItem
          icon="person-circle-outline"
          onPress={() => {
            router.push('/(tabs)/settings/account');
          }}
          title={t('settings.menuAccountTitle')}
          description={isGuest ? t('settings.guestSession') : (user?.email ?? t('settings.unknownUser'))}
        />
      </SettingsMenuSection>

      <SettingsMenuSection title={t('settings.menuSupportGroup')}>
        <SettingsMenuItem
          description={t('settings.menuLegalDescription')}
          icon="document-text-outline"
          onPress={() => {
            router.push('/(tabs)/settings/legal');
          }}
          title={t('settings.menuLegalTitle')}
        />

        <SettingsMenuItem
          description={t('settings.debugPageDescription')}
          icon="flask-outline"
          onPress={() => {
            router.push('/(tabs)/settings/debug');
          }}
          title={t('settings.debugPageTitle')}
        />
      </SettingsMenuSection>
    </ScreenScrollView>
  );
}
