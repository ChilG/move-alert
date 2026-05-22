import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { t, tf } from '@/components/move-alert/i18n';
import {
  getButtonForegroundColor,
  useThemeColors,
} from '@/components/move-alert/theme-colors';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

export type TodayReminderSectionModel = {
  canSkipBreak: boolean;
  isQuietNow: boolean;
  isReminderEnabled: boolean;
  isScheduleLoading: boolean;
  nextReminderTime: string;
  progressPercent: number;
  progressSummary: string;
  reminderMinutes: number;
};

type TodayReminderSectionProps = {
  model: TodayReminderSectionModel;
  onSkipBreak: () => void;
  onToggleReminder: () => void;
};

export function TodayReminderSection({
  model,
  onSkipBreak,
  onToggleReminder,
}: TodayReminderSectionProps) {
  const colors = useThemeColors();
  const {
    canSkipBreak,
    isQuietNow,
    isReminderEnabled,
    isScheduleLoading,
    nextReminderTime,
    progressPercent,
    progressSummary,
    reminderMinutes,
  } = model;

  return (
    <SectionCard className="mb-5">
      <HStack className="items-start justify-between">
        <View>
          <Text className="text-sm font-semibold text-typography-500">
            {isReminderEnabled
              ? isQuietNow
                ? t('settings.quietHours')
                : t('today.nextReminder')
              : t('today.reminderInterval')}
          </Text>
          {isReminderEnabled && isScheduleLoading ? (
            <View className="mt-3 flex-row items-end">
              <View className="h-16 w-28 rounded-xl bg-background-muted" />
              <View className="mb-1 ml-2 h-5 w-12 rounded-lg bg-background-muted" />
            </View>
          ) : isReminderEnabled ? (
            <View className="mt-2 flex-row items-end">
              <Text className="text-6xl font-extrabold text-typography-950">
                {reminderMinutes}
              </Text>
              <Text className="pb-1 pl-2 text-base font-bold text-typography-500">
                {t('common.minutesShort')}
              </Text>
            </View>
          ) : (
            <Text
              className="mt-2 text-5xl font-extrabold text-typography-950"
              style={{ lineHeight: 56 }}
            >
              {t('today.remindersPausedValue')}
            </Text>
          )}
          {isReminderEnabled && isScheduleLoading ? (
            <View className="mt-3 h-4 w-36 rounded-lg bg-background-muted" />
          ) : (
            <Text className="mt-2 text-sm font-semibold text-typography-500">
              {isReminderEnabled
                ? isQuietNow
                  ? t('today.quietHoursActive')
                  : tf('today.nextReminderAt', { time: nextReminderTime })
                : t('today.remindersPaused')}
            </Text>
          )}
        </View>
        <Badge
          action={isReminderEnabled && !isQuietNow ? 'success' : 'warning'}
          className="px-3 py-1"
        >
          <BadgeText>
            {isReminderEnabled && !isQuietNow
              ? t('common.active')
              : t('common.paused')}
          </BadgeText>
        </Badge>
      </HStack>

      <Progress className="mt-5" isAnimated value={progressPercent}>
        <ProgressFilledTrack className="bg-success-500" />
      </Progress>

      <View className="mt-3 flex-row justify-between">
        <Text className="text-sm text-typography-500">{progressSummary}</Text>
        <Text className="text-sm font-bold text-typography-800">
          {progressPercent}
          {t('common.percent')}
        </Text>
      </View>

      <HStack className="mt-5" space="md">
        <Button
          className="flex-1 rounded-xl"
          onPress={onToggleReminder}
          size="lg"
        >
          <Ionicons
            color={getButtonForegroundColor(colors, 'primary', 'solid')}
            name={isReminderEnabled ? 'pause-outline' : 'play-outline'}
            size={18}
          />
          <ButtonText>
            {isReminderEnabled ? t('today.pause') : t('today.start')}
          </ButtonText>
        </Button>

        <Button
          action="default"
          className={`flex-1 rounded-xl ${
            canSkipBreak ? 'bg-background-0' : 'bg-background-muted'
          }`}
          disabled={!canSkipBreak}
          onPress={onSkipBreak}
          size="lg"
          variant="outline"
        >
          <Ionicons
            color={canSkipBreak ? colors.textDefault : colors.textDisabled}
            name="close-circle-outline"
            size={18}
          />
          <Text
            className={`font-bold ${
              canSkipBreak ? 'text-typography-700' : 'text-typography-400'
            }`}
          >
            {t('today.skip')}
          </Text>
        </Button>
      </HStack>
    </SectionCard>
  );
}
