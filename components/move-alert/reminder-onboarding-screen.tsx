import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { t, tf } from '@/components/move-alert/i18n';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import { reminderIntervals, weekDays, type WeekDay } from '@/components/move-alert/move-alert-data';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import {
  requestReminderNotificationPermissionsAsync,
  syncServerReminderPushTokenAsync,
} from '@/components/move-alert/reminder-notifications';
import { markReminderOnboardingSeenAsync } from '@/components/move-alert/reminder-onboarding-storage';
import {
  RequiredFeatureIconFrame,
  requiredFeatureActionButtonClassName,
  requiredFeatureActionButtonTextClassName,
  requiredFeatureNoticeCardClassName,
} from '@/components/move-alert/required-feature-styles';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { openReminderBatterySettingsAsync } from '@/components/move-alert/settings/system-settings';
import { useBatteryOptimizationStatus } from '@/components/move-alert/settings/use-battery-optimization-status';
import { useNotificationPermissionStatus } from '@/components/move-alert/settings/use-notification-permission-status';
import { QuietHoursControls } from '@/components/move-alert/settings/quiet-hours-controls';
import { ReminderIntervalPicker } from '@/components/move-alert/settings/reminder-interval-picker';
import { weekDayLabelKey } from '@/components/move-alert/settings/settings-constants';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const onboardingSteps = ['welcome', 'required-feature', 'interval', 'quiet-hours', 'done'] as const;
const onboardingCardClassName = 'rounded-2xl border border-outline-200 bg-background-0 p-4 shadow-soft-1';
const requiredFeatureOnboardingCardClassName = `rounded-2xl p-4 shadow-soft-1 ${requiredFeatureNoticeCardClassName}`;

type OnboardingStep = (typeof onboardingSteps)[number];

function toggleQuietDay(days: WeekDay[], day: WeekDay) {
  const nextDays = days.includes(day)
    ? days.filter((quietDay) => quietDay !== day)
    : [...days, day].sort((a, b) => a - b);

  return nextDays.length > 0 ? nextDays : days;
}

function getStepTitle(step: OnboardingStep) {
  switch (step) {
    case 'welcome':
      return t('onboarding.welcomeTitle');
    case 'required-feature':
      return t('onboarding.requiredFeatureTitle');
    case 'interval':
      return t('onboarding.intervalTitle');
    case 'quiet-hours':
      return t('onboarding.quietHoursTitle');
    case 'done':
      return t('onboarding.doneTitle');
  }
}

function getStepDescription(step: OnboardingStep) {
  switch (step) {
    case 'welcome':
      return t('onboarding.welcomeDescription');
    case 'required-feature':
      return t('onboarding.requiredFeatureDescription');
    case 'interval':
      return t('onboarding.intervalDescription');
    case 'quiet-hours':
      return t('onboarding.quietHoursDescription');
    case 'done':
      return t('onboarding.doneDescription');
  }
}

export function ReminderOnboardingScreen() {
  const { configureReminderPreferences, state } = useMoveAlert();
  const { resolvedLanguage } = useLanguagePreference();
  const router = useRouter();
  const colors = useThemeColors();
  const { refreshStatus: refreshBatteryOptimizationStatus, status: batteryOptimizationStatus } =
    useBatteryOptimizationStatus();
  const { refresh: refreshNotificationStatus, status: notificationStatus } = useNotificationPermissionStatus();
  const [stepIndex, setStepIndex] = useState(0);
  const [draftInterval, setDraftInterval] = useState(state.intervalMinutes);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(state.quietHoursEnabled);
  const [quietHoursStartTime, setQuietHoursStartTime] = useState(state.quietHoursStartTime);
  const [quietHoursEndTime, setQuietHoursEndTime] = useState(state.quietHoursEndTime);
  const [quietHoursDays, setQuietHoursDays] = useState<WeekDay[]>(state.quietHoursDays);
  const hasAutoRequestedNotificationRef = useRef(false);
  const activeStep = onboardingSteps[stepIndex];
  const isDoneStep = activeStep === 'done';
  const quietDayLabels = quietHoursDays.map((day) => t(weekDayLabelKey[day])).join(', ');

  const requestNotificationAccess = useCallback(async () => {
    const nextStatus = await requestReminderNotificationPermissionsAsync();

    if (nextStatus === 'granted') {
      await syncServerReminderPushTokenAsync(resolvedLanguage);
    }

    await refreshNotificationStatus();
  }, [refreshNotificationStatus, resolvedLanguage]);

  useEffect(() => {
    if (hasAutoRequestedNotificationRef.current || notificationStatus !== 'denied') {
      return;
    }

    hasAutoRequestedNotificationRef.current = true;
    const timeoutId = setTimeout(() => {
      void requestNotificationAccess();
    }, 600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [notificationStatus, requestNotificationAccess]);

  function goBack() {
    setStepIndex((currentStepIndex) => Math.max(currentStepIndex - 1, 0));
  }

  function goNext() {
    setStepIndex((currentStepIndex) => Math.min(currentStepIndex + 1, onboardingSteps.length - 1));
  }

  async function finishWithCurrentSettings() {
    await requestNotificationAccess();
    await markReminderOnboardingSeenAsync();
    router.replace('/');
  }

  async function savePreferences() {
    const didConfigure = configureReminderPreferences({
      intervalMinutes: draftInterval,
      quietHoursDays,
      quietHoursEnabled,
      quietHoursEndTime,
      quietHoursStartTime,
    });

    if (!didConfigure) return;

    await markReminderOnboardingSeenAsync();
    router.replace('/');
  }

  function renderStepContent() {
    if (activeStep === 'welcome') {
      return (
        <VStack space="md">
          <View className={onboardingCardClassName}>
            <Text className="text-base font-extrabold text-typography-900">{t('onboarding.welcomeCardTitle')}</Text>
            <Text className="mt-2 text-sm leading-5 text-typography-600">{t('onboarding.welcomeCardDescription')}</Text>
          </View>
          <Text className="text-sm leading-5 text-typography-500">{t('onboarding.welcomeBody')}</Text>
        </VStack>
      );
    }

    if (activeStep === 'interval') {
      return (
        <ReminderIntervalPicker
          customHint={t('settings.reminderIntervalCustomHint')}
          customLabel={t('settings.reminderIntervalCustomLabel')}
          intervals={reminderIntervals}
          minutesLabel={t('settings.minutes')}
          onSelectInterval={setDraftInterval}
          presetButtonSize="lg"
          selectedInterval={draftInterval}
        />
      );
    }

    if (activeStep === 'required-feature') {
      const isNotificationConfigured = notificationStatus === 'granted';
      const isNotificationUnavailable = notificationStatus === 'unsupported';
      const isNotificationLoading = notificationStatus === 'loading';
      const isNotificationButtonDisabled =
        isNotificationConfigured || isNotificationUnavailable || isNotificationLoading;
      const isBatteryOptimizationConfigured = batteryOptimizationStatus === 'ignored';
      const isBatteryOptimizationUnavailable = batteryOptimizationStatus === 'unsupported';
      const isBatteryOptimizationLoading = batteryOptimizationStatus === 'loading';
      const isBatteryOptimizationButtonDisabled =
        isBatteryOptimizationConfigured || isBatteryOptimizationUnavailable || isBatteryOptimizationLoading;

      return (
        <VStack space="md">
          <View className={requiredFeatureOnboardingCardClassName}>
            <HStack className="items-center justify-between" space="md">
              <HStack className="flex-1 items-center" space="md">
                <RequiredFeatureIconFrame color={colors.warning} name="notifications-outline" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-warning-900">
                    {t('onboarding.requiredFeatureNotificationTitle')}
                  </Text>
                  <Text className="mt-1 text-xs leading-4 text-warning-800">
                    {t('onboarding.requiredFeatureNotificationDescription')}
                  </Text>
                </View>
              </HStack>
              <Badge
                action={isNotificationConfigured || isNotificationUnavailable ? 'success' : 'warning'}
                className="px-3 py-1"
              >
                <BadgeText>
                  {isNotificationConfigured || isNotificationUnavailable
                    ? t('onboarding.requiredFeatureConfigured')
                    : t('common.paused')}
                </BadgeText>
              </Badge>
            </HStack>

            <Button
              action="default"
              className={`mt-4 ${requiredFeatureActionButtonClassName}`}
              isDisabled={isNotificationButtonDisabled}
              onPress={() => {
                void requestNotificationAccess();
              }}
              size="md"
              variant="outline"
            >
              <Ionicons color={colors.warning} name="notifications-outline" size={18} />
              <ButtonText className={requiredFeatureActionButtonTextClassName}>
                {isNotificationLoading
                  ? t('common.loading')
                  : isNotificationUnavailable
                    ? t('settings.batteryOptimizationUnsupported')
                    : isNotificationConfigured
                      ? t('onboarding.requiredFeatureConfigured')
                      : t('onboarding.requiredFeatureAction')}
              </ButtonText>
            </Button>
          </View>

          <View className={requiredFeatureOnboardingCardClassName}>
            <HStack className="items-center justify-between" space="md">
              <HStack className="flex-1 items-center" space="md">
                <RequiredFeatureIconFrame color={colors.warning} name="battery-charging-outline" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-warning-900">
                    {t('onboarding.requiredFeatureBatteryTitle')}
                  </Text>
                  <Text className="mt-1 text-xs leading-4 text-warning-800">
                    {t('onboarding.requiredFeatureBatteryDescription')}
                  </Text>
                </View>
              </HStack>
              <Badge
                action={isBatteryOptimizationConfigured || isBatteryOptimizationUnavailable ? 'success' : 'warning'}
                className="px-3 py-1"
              >
                <BadgeText>
                  {isBatteryOptimizationConfigured || isBatteryOptimizationUnavailable
                    ? t('onboarding.requiredFeatureConfigured')
                    : t('common.paused')}
                </BadgeText>
              </Badge>
            </HStack>

            <Button
              action="default"
              className={`mt-4 ${requiredFeatureActionButtonClassName}`}
              isDisabled={isBatteryOptimizationButtonDisabled}
              onPress={() => {
                void openReminderBatterySettingsAsync().finally(refreshBatteryOptimizationStatus);
              }}
              size="md"
              variant="outline"
            >
              <Ionicons color={colors.warning} name="settings-outline" size={18} />
              <ButtonText className={requiredFeatureActionButtonTextClassName}>
                {isBatteryOptimizationLoading
                  ? t('common.loading')
                  : isBatteryOptimizationUnavailable
                    ? t('settings.batteryOptimizationUnsupported')
                    : isBatteryOptimizationConfigured
                      ? t('batteryOptimization.configuredAction')
                      : t('batteryOptimization.action')}
              </ButtonText>
            </Button>
          </View>
        </VStack>
      );
    }

    if (activeStep === 'quiet-hours') {
      return (
        <VStack space="lg">
          <View className={`flex-row items-center justify-between ${onboardingCardClassName}`}>
            <View className="flex-1 pr-4">
              <Text className="text-sm font-bold text-typography-700">{t('settings.quietHours')}</Text>
              <Text className="mt-1 text-xs leading-4 text-typography-500">{t('settings.quietHoursDescription')}</Text>
            </View>
            <Switch onValueChange={setQuietHoursEnabled} value={quietHoursEnabled} />
          </View>

          {quietHoursEnabled ? (
            <QuietHoursControls
              dayLabelSize="xs"
              daysLabel={t('settings.quietHoursDays')}
              endLabel={t('settings.quietHoursEnd')}
              endTime={quietHoursEndTime}
              inputPlaceholder={t('settings.quietHoursPlaceholder')}
              onSelectDay={(day) => {
                setQuietHoursDays((currentDays) => toggleQuietDay(currentDays, day));
              }}
              onSetEndTime={setQuietHoursEndTime}
              onSetStartTime={setQuietHoursStartTime}
              quietHoursDays={weekDays}
              selectedDays={quietHoursDays}
              startLabel={t('settings.quietHoursStart')}
              startTime={quietHoursStartTime}
              timeInputSpace="sm"
            />
          ) : null}
        </VStack>
      );
    }

    return (
      <VStack space="md">
        <View className={onboardingCardClassName}>
          <Text className="text-sm font-bold text-typography-600">{t('settings.reminderInterval')}</Text>
          <Text className="mt-1 text-lg font-extrabold text-typography-950">
            {tf('onboarding.doneIntervalSummary', {
              minutes: draftInterval,
            })}
          </Text>
        </View>

        <View className={onboardingCardClassName}>
          <Text className="text-sm font-bold text-typography-600">{t('settings.quietHours')}</Text>
          <Text className="mt-1 text-base font-extrabold text-typography-950">
            {quietHoursEnabled
              ? tf('onboarding.doneQuietHoursSummary', {
                  days: quietDayLabels,
                  end: quietHoursEndTime,
                  start: quietHoursStartTime,
                })
              : t('onboarding.doneQuietHoursDisabled')}
          </Text>
        </View>
      </VStack>
    );
  }

  return (
    <ScreenScrollView>
      <ScreenHeader
        description={getStepDescription(activeStep)}
        eyebrow={tf('onboarding.stepProgress', {
          current: stepIndex + 1,
          total: onboardingSteps.length,
        })}
        eyebrowClassName="text-info-600"
        title={getStepTitle(activeStep)}
      />

      <HStack className="mt-5" space="xs">
        {onboardingSteps.map((step, index) => {
          const isReachedStep = index <= stepIndex;

          return (
            <View
              className={`h-2 flex-1 rounded-full border ${isReachedStep ? 'border-primary-500 bg-primary-500' : 'border-outline-200 bg-background-0'}`}
              key={step}
            />
          );
        })}
      </HStack>

      <View className="mt-8">{renderStepContent()}</View>

      <HStack className="mt-8" space="md">
        {stepIndex === 0 ? (
          <Button
            action="default"
            className="flex-1 rounded-xl"
            onPress={() => {
              void finishWithCurrentSettings();
            }}
            size="lg"
            variant="outline"
          >
            <ButtonText>{t('onboarding.useCurrent')}</ButtonText>
          </Button>
        ) : (
          <Button action="default" className="flex-1 rounded-xl" onPress={goBack} size="lg" variant="outline">
            <ButtonText>{t('onboarding.back')}</ButtonText>
          </Button>
        )}

        <Button
          className="flex-1 rounded-xl"
          onPress={() => {
            if (isDoneStep) {
              void savePreferences();
              return;
            }

            if (activeStep === 'required-feature') {
              void requestNotificationAccess().finally(goNext);
              return;
            }

            goNext();
          }}
          size="lg"
        >
          <ButtonText>{isDoneStep ? t('onboarding.finish') : t('onboarding.next')}</ButtonText>
        </Button>
      </HStack>
    </ScreenScrollView>
  );
}
