import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { StretchItem } from '@/components/move-alert/move-alert-data';
import { t, tf } from '@/components/move-alert/i18n';
import { useMoveAlert } from '@/components/move-alert/move-alert-state';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { Box } from '@/components/ui/box';

const toneClass: Record<StretchItem['tone'], string> = {
  info: 'bg-info-50',
  success: 'bg-success-50',
  warning: 'bg-warning-50',
  error: 'bg-error-50',
};

const toneIcon: Record<StretchItem['tone'], string> = {
  info: '#0369a1',
  success: '#15803d',
  warning: '#b45309',
  error: '#dc2626',
};

export default function StretchesScreen() {
  const { activityTemplates, completeStretch, state, stretchCooldown } =
    useMoveAlert();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!stretchCooldown) return;

    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [stretchCooldown]);

  const cooldownRemainingSeconds = stretchCooldown
    ? Math.max(Math.ceil((stretchCooldown.endsAt - now) / 1000), 0)
    : 0;
  const activeCooldownStretchId =
    cooldownRemainingSeconds > 0 ? stretchCooldown?.activeStretchId : null;

  return (
    <ScreenScrollView>
      <Text className="text-sm font-bold uppercase text-success-600">
        {t('stretches.eyebrow')}
      </Text>
      <Text className="mt-1 text-3xl font-extrabold text-typography-950">
        {t('stretches.title')}
      </Text>
      <Text className="mt-3 text-base leading-6 text-typography-600">
        {t('stretches.description')}
      </Text>

      <View className="mt-6 gap-4">
        {activityTemplates.map((stretch) => {
          const isDone = state.completedStretchIds.includes(stretch.id);
          const isActiveCooldown = activeCooldownStretchId === stretch.id;
          const isCoolingDown =
            !isDone &&
            activeCooldownStretchId !== null &&
            activeCooldownStretchId !== stretch.id;
          const isDisabled = isDone || isCoolingDown || isActiveCooldown;
          const buttonClassName = isActiveCooldown
            ? 'bg-primary-500'
            : isDone
              ? 'bg-success-50'
              : isCoolingDown
                ? 'bg-background-muted'
                : 'bg-primary-500';
          const buttonIconColor = isActiveCooldown
            ? '#ffffff'
            : isDone
              ? '#15803d'
              : isCoolingDown
                ? '#71717a'
                : '#ffffff';
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
              ? t('stretches.completed')
              : isCoolingDown
                ? tf('stretches.cooldown', {
                    seconds: cooldownRemainingSeconds,
                  })
                : t('stretches.markDone');

          return (
            <Box
              className="rounded-3xl bg-background-0 p-5 shadow-soft-1"
              key={stretch.id}
            >
              <View className="flex-row gap-4">
                <View
                  className={`h-14 w-14 items-center justify-center rounded-2xl ${
                    toneClass[stretch.tone]
                  }`}
                >
                  <Ionicons
                    color={toneIcon[stretch.tone]}
                    name={stretch.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-extrabold text-typography-900">
                        {t(stretch.titleKey)}
                      </Text>
                      <Text className="mt-1 text-sm font-semibold text-typography-500">
                        {t(stretch.targetKey)}
                      </Text>
                    </View>
                    <View className="rounded-full bg-background-muted px-3 py-1">
                      <Text className="text-xs font-bold text-typography-600">
                        {t(stretch.durationKey)}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-3 text-base leading-6 text-typography-600">
                    {t(stretch.descriptionKey)}
                  </Text>

                  <Pressable
                    accessibilityState={{ disabled: isDisabled }}
                    className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ${buttonClassName}`}
                    disabled={isDisabled}
                    onPress={() => completeStretch(stretch.id)}
                  >
                    <Ionicons
                      color={buttonIconColor}
                      name={buttonIconName}
                      size={18}
                    />
                    <Text className={`font-bold ${buttonTextClassName}`}>
                      {buttonLabel}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Box>
          );
        })}
      </View>
    </ScreenScrollView>
  );
}
