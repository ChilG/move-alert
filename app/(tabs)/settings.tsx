import { useAuth } from '@/components/move-alert/auth-state';
import { t } from '@/components/move-alert/i18n';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import {
  reminderIntervals,
  weekDays,
} from '@/components/move-alert/move-alert-data';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { SettingsAccountSection } from '@/components/move-alert/settings/settings-account-section';
import { SettingsIntervalSection } from '@/components/move-alert/settings/settings-interval-section';
import { SettingsLanguageSection } from '@/components/move-alert/settings/settings-language-section';
import { SettingsQuietHoursSection } from '@/components/move-alert/settings/settings-quiet-hours-section';
import { SettingsThemeSection } from '@/components/move-alert/settings/settings-theme-section';
import { SettingsToggleSection } from '@/components/move-alert/settings/settings-toggle-section';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { useThemePreference } from '@/components/move-alert/theme-state';

export default function SettingsScreen() {
  const { isLoading, signOut, user } = useAuth();
  const { languageMode, setLanguageMode } = useLanguagePreference();
  const { setThemeMode, themeMode } = useThemePreference();
  const {
    errorMessage,
    isSyncing,
    setIntervalMinutes,
    setQuietHoursEndTime,
    setQuietHoursStartTime,
    state,
    syncStatus,
    toggleQuietHours,
    toggleQuietHoursDay,
    toggleReminder,
  } = useMoveAlert();
  const syncLabel = isSyncing
    ? t('settings.syncing')
    : syncStatus === 'error'
      ? t('settings.syncError')
      : t('settings.synced');

  return (
    <ScreenScrollView>
      <ScreenHeader
        eyebrow={t('settings.eyebrow')}
        eyebrowClassName="text-warning-600"
        title={t('settings.title')}
      />

      <SettingsAccountSection
        errorMessage={errorMessage}
        isLoading={isLoading}
        onSignOut={() => {
          void signOut();
        }}
        signedInAccountLabel={t('settings.signedInAccount')}
        signOutLabel={t('settings.signOut')}
        syncLabel={syncLabel}
        userEmail={user?.email ?? t('settings.unknownUser')}
      />

      <SettingsIntervalSection
        description={t('settings.reminderIntervalDescription')}
        intervals={reminderIntervals}
        minutesLabel={t('settings.minutes')}
        onSelectInterval={setIntervalMinutes}
        selectedInterval={state.intervalMinutes}
        title={t('settings.reminderInterval')}
      />

      <SettingsToggleSection
        isQuietHoursEnabled={state.quietHoursEnabled}
        isReminderEnabled={state.reminderEnabled}
        movementRemindersLabel={t('settings.movementReminders')}
        onToggleQuietHours={toggleQuietHours}
        onToggleReminder={toggleReminder}
        quietHoursLabel={t('settings.quietHours')}
      />

      {state.quietHoursEnabled ? (
        <SettingsQuietHoursSection
          daysLabel={t('settings.quietHoursDays')}
          description={t('settings.quietHoursDescription')}
          endLabel={t('settings.quietHoursEnd')}
          endTime={state.quietHoursEndTime}
          onSelectDay={toggleQuietHoursDay}
          onSetEndTime={setQuietHoursEndTime}
          onSetStartTime={setQuietHoursStartTime}
          quietHoursDays={weekDays}
          selectedDays={state.quietHoursDays}
          startLabel={t('settings.quietHoursStart')}
          startTime={state.quietHoursStartTime}
          title={t('settings.quietHours')}
        />
      ) : null}

      <SettingsThemeSection
        description={t('settings.themeDescription')}
        mode={themeMode}
        onSelectTheme={setThemeMode}
        themeDarkLabel={t('settings.themeDark')}
        themeLightLabel={t('settings.themeLight')}
        themeSystemLabel={t('settings.themeSystem')}
        title={t('settings.themeTitle')}
      />

      <SettingsLanguageSection
        description={t('settings.languageDescription')}
        languageEnglishLabel={t('settings.languageEnglish')}
        languageSystemLabel={t('settings.languageSystem')}
        languageThaiLabel={t('settings.languageThai')}
        mode={languageMode}
        onSelectLanguage={setLanguageMode}
        title={t('settings.languageTitle')}
      />
    </ScreenScrollView>
  );
}
