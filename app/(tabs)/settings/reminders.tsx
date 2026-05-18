import { t } from '@/components/move-alert/i18n';
import {
  reminderIntervals,
  weekDays,
} from '@/components/move-alert/move-alert-data';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { SettingsIntervalSection } from '@/components/move-alert/settings/settings-interval-section';
import { SettingsQuietHoursSection } from '@/components/move-alert/settings/settings-quiet-hours-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';
import { SettingsToggleSection } from '@/components/move-alert/settings/settings-toggle-section';

export default function SettingsRemindersScreen() {
  const {
    setIntervalMinutes,
    setQuietHoursEndTime,
    setQuietHoursStartTime,
    state,
    toggleQuietHours,
    toggleQuietHoursDay,
    toggleReminder,
  } = useMoveAlert();

  return (
    <SettingsScreenShell
      description={t('settings.remindersPageDescription')}
      title={t('settings.remindersPageTitle')}
    >
      <SettingsToggleSection
        isQuietHoursEnabled={state.quietHoursEnabled}
        isReminderEnabled={state.reminderEnabled}
        movementRemindersLabel={t('settings.movementReminders')}
        onToggleQuietHours={toggleQuietHours}
        onToggleReminder={toggleReminder}
        quietHoursLabel={t('settings.quietHours')}
      />

      <SettingsIntervalSection
        customHint={t('settings.reminderIntervalCustomHint')}
        customInvalidMessage={t('settings.reminderIntervalCustomInvalid')}
        customLabel={t('settings.reminderIntervalCustomLabel')}
        customPlaceholder={t('settings.reminderIntervalCustomPlaceholder')}
        description={t('settings.reminderIntervalDescription')}
        intervals={reminderIntervals}
        minutesLabel={t('settings.minutes')}
        onSelectInterval={setIntervalMinutes}
        selectedInterval={state.intervalMinutes}
        title={t('settings.reminderInterval')}
      />

      {state.quietHoursEnabled ? (
        <SettingsQuietHoursSection
          daysLabel={t('settings.quietHoursDays')}
          description={t('settings.quietHoursDescription')}
          endLabel={t('settings.quietHoursEnd')}
          endTime={state.quietHoursEndTime}
          inputPlaceholder={t('settings.quietHoursPlaceholder')}
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
    </SettingsScreenShell>
  );
}
