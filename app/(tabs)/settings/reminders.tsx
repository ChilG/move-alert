import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { t } from '@/components/move-alert/i18n';
import {
  reminderIntervals,
  weekDays,
} from '@/components/move-alert/move-alert-data';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import {
  getBatteryOptimizationStatusAsync,
  type BatteryOptimizationStatus,
} from '@/components/move-alert/settings/battery-optimization-status';
import { SettingsIntervalSection } from '@/components/move-alert/settings/settings-interval-section';
import { SettingsMenuItem } from '@/components/move-alert/settings/settings-menu-item';
import { SettingsMenuSection } from '@/components/move-alert/settings/settings-menu-section';
import { SettingsQuietHoursSection } from '@/components/move-alert/settings/settings-quiet-hours-section';
import { SettingsScreenShell } from '@/components/move-alert/settings/settings-screen-shell';
import {
  openReminderAppSettingsAsync,
  openReminderBatterySettingsAsync,
  openReminderNotificationSettingsAsync,
} from '@/components/move-alert/settings/system-settings';
import { SettingsToggleSection } from '@/components/move-alert/settings/settings-toggle-section';

function getBatteryOptimizationStatusLabel(
  status: BatteryOptimizationStatus | 'loading',
) {
  switch (status) {
    case 'ignored':
      return t('settings.batteryOptimizationIgnored');
    case 'optimized':
      return t('settings.batteryOptimizationOptimized');
    case 'unsupported':
      return t('settings.batteryOptimizationUnsupported');
    case 'loading':
      return t('common.loading');
  }
}

export default function SettingsRemindersScreen() {
  const [batteryOptimizationStatus, setBatteryOptimizationStatus] = useState<
    BatteryOptimizationStatus | 'loading'
  >('loading');
  const {
    setIntervalMinutes,
    setQuietHoursEndTime,
    setQuietHoursStartTime,
    state,
    toggleQuietHours,
    toggleQuietHoursDay,
    toggleReminder,
  } = useMoveAlert();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setBatteryOptimizationStatus('loading');
      void getBatteryOptimizationStatusAsync().then((status) => {
        if (isActive) {
          setBatteryOptimizationStatus(status);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

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

      <SettingsMenuSection title={t('settings.systemSettingsTitle')}>
        <SettingsMenuItem
          description={t('settings.systemSettingsDescription')}
          icon="settings-outline"
          onPress={() => {
            void openReminderAppSettingsAsync();
          }}
          title={t('settings.openAppSettings')}
        />
        <SettingsMenuItem
          description={t('settings.notificationSettingsDescription')}
          icon="notifications-outline"
          onPress={() => {
            void openReminderNotificationSettingsAsync();
          }}
          title={t('settings.notificationSettingsTitle')}
        />
        <SettingsMenuItem
          description={t('settings.batterySettingsDescription')}
          icon="battery-half-outline"
          onPress={() => {
            void openReminderBatterySettingsAsync();
          }}
          title={t('settings.batterySettingsTitle')}
          value={getBatteryOptimizationStatusLabel(batteryOptimizationStatus)}
        />
      </SettingsMenuSection>
    </SettingsScreenShell>
  );
}
