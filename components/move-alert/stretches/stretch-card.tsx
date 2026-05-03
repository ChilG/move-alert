import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { t, tf } from '@/components/move-alert/i18n';
import { StretchItem } from '@/components/move-alert/move-alert-data';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

import { toneClass } from './stretches-helpers';

type StretchCardProps = {
  activeCooldownStretchId: string | null;
  completedCount: number;
  cooldownRemainingSeconds: number;
  isDone: boolean;
  onComplete: (stretchId: string) => void;
  stretch: StretchItem;
};

export function StretchCard({
  activeCooldownStretchId,
  completedCount,
  cooldownRemainingSeconds,
  isDone,
  onComplete,
  stretch,
}: StretchCardProps) {
  const colors = useThemeColors();
  const isActiveCooldown = activeCooldownStretchId === stretch.id;
  const isCoolingDown =
    activeCooldownStretchId !== null && activeCooldownStretchId !== stretch.id;
  const isDisabled = isDone || isCoolingDown || isActiveCooldown;
  const isRepeatDisabled = isActiveCooldown || activeCooldownStretchId !== null;
  const buttonClassName = isActiveCooldown
    ? 'bg-primary-500'
    : isDone
      ? 'bg-success-50'
      : isCoolingDown
        ? 'bg-background-muted'
        : 'bg-primary-500';
  const buttonIconColor = isActiveCooldown
    ? colors.textInverse
    : isDone
      ? colors.success
      : isCoolingDown
        ? colors.textDisabled
        : colors.textInverse;
  const buttonIconName = isActiveCooldown
    ? 'time-outline'
    : isDone
      ? 'checkmark-circle'
      : isCoolingDown
        ? 'time-outline'
        : 'checkmark-circle-outline';
  const buttonTextClassName = isActiveCooldown
    ? 'text-typography-0'
    : isDone
      ? 'text-success-700'
      : isCoolingDown
        ? 'text-typography-500'
        : 'text-typography-0';
  const buttonLabel = isActiveCooldown
    ? tf('stretches.doingCountdown', {
        seconds: cooldownRemainingSeconds,
      })
    : isDone
      ? tf('stretches.completedCount', {
          count: completedCount,
        })
      : isCoolingDown
        ? tf('stretches.cooldown', {
            seconds: cooldownRemainingSeconds,
          })
        : t('stretches.markDone');

  return (
    <SectionCard>
      <HStack space="lg">
        <View
          className={`h-14 w-14 items-center justify-center rounded-2xl ${
            toneClass[stretch.tone]
          }`}
        >
          <Ionicons
            color={
              stretch.tone === 'error'
                ? colors.error
                : stretch.tone === 'warning'
                  ? colors.warning
                  : stretch.tone === 'success'
                    ? colors.success
                    : colors.info
            }
            name={stretch.icon as keyof typeof Ionicons.glyphMap}
            size={28}
          />
        </View>

        <View className="flex-1">
          <HStack className="items-start justify-between" space="md">
            <View className="flex-1">
              <Text className="text-lg font-extrabold text-typography-900">
                {t(stretch.titleKey)}
              </Text>
              <Text className="mt-1 text-sm font-semibold text-typography-500">
                {t(stretch.targetKey)}
              </Text>
            </View>
            <Badge className="px-3 py-1">
              <BadgeText>{t(stretch.durationKey)}</BadgeText>
            </Badge>
          </HStack>

          <Text className="mt-3 text-base leading-6 text-typography-600">
            {t(stretch.descriptionKey)}
          </Text>

          {isDone ? (
            <HStack className="mt-3" space="sm">
              <Button
                action={isRepeatDisabled ? 'default' : 'primary'}
                accessibilityState={{ disabled: isRepeatDisabled }}
                className={`flex-1 rounded-xl ${
                  isRepeatDisabled ? 'bg-background-muted' : 'bg-primary-500'
                }`}
                disabled={isRepeatDisabled}
                onPress={() => onComplete(stretch.id)}
                size="lg"
              >
                <Ionicons
                  color={
                    isRepeatDisabled ? colors.textDisabled : colors.textInverse
                  }
                  name={
                    isRepeatDisabled ? 'time-outline' : 'refresh-circle-outline'
                  }
                  size={18}
                />
                <Text
                  className={`font-bold ${
                    isRepeatDisabled
                      ? 'text-typography-500'
                      : 'text-typography-0'
                  }`}
                >
                  {isRepeatDisabled
                    ? tf('stretches.cooldown', {
                        seconds: cooldownRemainingSeconds,
                      })
                    : t('stretches.repeatDone')}
                </Text>
              </Button>

              <Button
                action="default"
                accessibilityLabel={t('stretches.completed')}
                className="w-12 items-center justify-center rounded-xl bg-success-50 px-0"
                disabled
                size="lg"
              >
                <Ionicons
                  color={colors.success}
                  name="checkmark-circle"
                  size={22}
                />
              </Button>
            </HStack>
          ) : (
            <Button
              action={isDone || isCoolingDown ? 'default' : 'primary'}
              accessibilityState={{ disabled: isDisabled }}
              className={`mt-4 rounded-xl ${buttonClassName}`}
              disabled={isDisabled}
              onPress={() => onComplete(stretch.id)}
              size="lg"
            >
              <Ionicons
                color={buttonIconColor}
                name={buttonIconName}
                size={18}
              />
              <Text className={`font-bold ${buttonTextClassName}`}>
                {buttonLabel}
              </Text>
            </Button>
          )}
        </View>
      </HStack>
    </SectionCard>
  );
}
