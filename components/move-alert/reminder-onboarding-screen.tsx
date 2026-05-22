import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { t, tf } from '@/components/move-alert/i18n';
import {
  weekDays,
  type WeekDay,
} from '@/components/move-alert/move-alert-data';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { markReminderOnboardingSeenAsync } from '@/components/move-alert/reminder-onboarding-storage';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { QuietTimeInput } from '@/components/move-alert/settings/quiet-time-input';
import { weekDayLabelKey } from '@/components/move-alert/settings/settings-constants';
import { parseReminderInterval } from '@/components/move-alert/settings/settings-helpers';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const onboardingIntervals = [30, 45, 60];
const onboardingSteps = ['welcome', 'interval', 'quiet-hours', 'done'] as const;

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
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [draftInterval, setDraftInterval] = useState(
    String(state.intervalMinutes),
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(
    state.quietHoursEnabled,
  );
  const [quietHoursStartTime, setQuietHoursStartTime] = useState(
    state.quietHoursStartTime,
  );
  const [quietHoursEndTime, setQuietHoursEndTime] = useState(
    state.quietHoursEndTime,
  );
  const [quietHoursDays, setQuietHoursDays] = useState<WeekDay[]>(
    state.quietHoursDays,
  );
  const parsedInterval = useMemo(
    () => parseReminderInterval(draftInterval),
    [draftInterval],
  );
  const activeStep = onboardingSteps[stepIndex];
  const isValidInterval = parsedInterval !== null;
  const isDoneStep = activeStep === 'done';
  const quietDayLabels = quietHoursDays
    .map((day) => t(weekDayLabelKey[day]))
    .join(', ');

  function goBack() {
    setStepIndex((currentStepIndex) => Math.max(currentStepIndex - 1, 0));
  }

  function goNext() {
    if (activeStep === 'interval' && !isValidInterval) return;

    setStepIndex((currentStepIndex) =>
      Math.min(currentStepIndex + 1, onboardingSteps.length - 1),
    );
  }

  async function finishWithCurrentSettings() {
    await markReminderOnboardingSeenAsync();
    router.replace('/');
  }

  async function savePreferences() {
    if (parsedInterval === null) return;

    const didConfigure = configureReminderPreferences({
      intervalMinutes: parsedInterval,
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
          <View className="rounded-2xl bg-background-muted p-4">
            <Text className="text-base font-extrabold text-typography-900">
              {t('onboarding.welcomeCardTitle')}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-typography-600">
              {t('onboarding.welcomeCardDescription')}
            </Text>
          </View>
          <Text className="text-sm leading-5 text-typography-500">
            {t('onboarding.welcomeBody')}
          </Text>
        </VStack>
      );
    }

    if (activeStep === 'interval') {
      return (
        <VStack space="lg">
          <HStack space="sm">
            {onboardingIntervals.map((interval) => {
              const isSelected = parsedInterval === interval;

              return (
                <Button
                  action={isSelected ? 'primary' : 'default'}
                  className={`flex-1 rounded-2xl ${
                    isSelected ? '' : 'bg-background-muted'
                  }`}
                  key={interval}
                  onPress={() => setDraftInterval(String(interval))}
                  size="lg"
                >
                  <ButtonText>
                    {interval} {t('settings.minutes')}
                  </ButtonText>
                </Button>
              );
            })}
          </HStack>

          <VStack space="xs">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-typography-700">
                {t('settings.reminderIntervalCustomLabel')}
              </Text>
              <Text className="text-xs font-semibold text-typography-500">
                {t('settings.reminderIntervalCustomHint')}
              </Text>
            </View>
            <Input
              className="rounded-2xl"
              isInvalid={!isValidInterval}
              size="lg"
            >
              <InputField
                inputMode="numeric"
                keyboardType="number-pad"
                onChangeText={setDraftInterval}
                placeholder={t('settings.reminderIntervalCustomPlaceholder')}
                value={draftInterval}
              />
            </Input>
            {isValidInterval ? null : (
              <Text className="text-xs font-semibold text-error-700">
                {t('settings.reminderIntervalCustomInvalid')}
              </Text>
            )}
          </VStack>
        </VStack>
      );
    }

    if (activeStep === 'quiet-hours') {
      return (
        <VStack space="lg">
          <View className="flex-row items-center justify-between rounded-2xl bg-background-muted p-4">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-bold text-typography-700">
                {t('settings.quietHours')}
              </Text>
              <Text className="mt-1 text-xs leading-4 text-typography-500">
                {t('settings.quietHoursDescription')}
              </Text>
            </View>
            <Switch
              onValueChange={setQuietHoursEnabled}
              value={quietHoursEnabled}
            />
          </View>

          {quietHoursEnabled ? (
            <VStack space="md">
              <HStack space="sm">
                <QuietTimeInput
                  label={t('settings.quietHoursStart')}
                  onCommit={setQuietHoursStartTime}
                  placeholder={t('settings.quietHoursPlaceholder')}
                  value={quietHoursStartTime}
                />
                <QuietTimeInput
                  label={t('settings.quietHoursEnd')}
                  onCommit={setQuietHoursEndTime}
                  placeholder={t('settings.quietHoursPlaceholder')}
                  value={quietHoursEndTime}
                />
              </HStack>

              <VStack space="sm">
                <Text className="text-sm font-bold text-typography-700">
                  {t('settings.quietHoursDays')}
                </Text>
                <HStack className="flex-wrap" space="sm">
                  {weekDays.map((day) => {
                    const isSelected = quietHoursDays.includes(day);

                    return (
                      <Button
                        action={isSelected ? 'primary' : 'default'}
                        className={`w-full max-w-20 rounded-2xl ${
                          isSelected ? 'bg-green-500' : 'bg-background-muted'
                        }`}
                        key={day}
                        onPress={() =>
                          setQuietHoursDays((currentDays) =>
                            toggleQuietDay(currentDays, day),
                          )
                        }
                        size="md"
                      >
                        <Text
                          className={`text-center text-xs font-extrabold ${
                            isSelected ? 'text-white' : 'text-typography-800'
                          }`}
                        >
                          {t(weekDayLabelKey[day])}
                        </Text>
                      </Button>
                    );
                  })}
                </HStack>
              </VStack>
            </VStack>
          ) : null}
        </VStack>
      );
    }

    return (
      <VStack space="md">
        <View className="rounded-2xl bg-background-muted p-4">
          <Text className="text-sm font-bold text-typography-600">
            {t('settings.reminderInterval')}
          </Text>
          <Text className="mt-1 text-lg font-extrabold text-typography-950">
            {tf('onboarding.doneIntervalSummary', {
              minutes: parsedInterval ?? state.intervalMinutes,
            })}
          </Text>
        </View>

        <View className="rounded-2xl bg-background-muted p-4">
          <Text className="text-sm font-bold text-typography-600">
            {t('settings.quietHours')}
          </Text>
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
        {onboardingSteps.map((step, index) => (
          <View
            className={`h-1 flex-1 rounded-full ${
              index <= stepIndex ? 'bg-primary-500' : 'bg-background-muted'
            }`}
            key={step}
          />
        ))}
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
          <Button
            action="default"
            className="flex-1 rounded-xl"
            onPress={goBack}
            size="lg"
            variant="outline"
          >
            <ButtonText>{t('onboarding.back')}</ButtonText>
          </Button>
        )}

        <Button
          className="flex-1 rounded-xl"
          disabled={activeStep === 'interval' && !isValidInterval}
          onPress={() => {
            if (isDoneStep) {
              void savePreferences();
              return;
            }

            goNext();
          }}
          size="lg"
        >
          <ButtonText>
            {isDoneStep ? t('onboarding.finish') : t('onboarding.next')}
          </ButtonText>
        </Button>
      </HStack>
    </ScreenScrollView>
  );
}
