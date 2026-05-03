import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { stretches, StretchItem } from '@/components/move-alert/demo-data';
import { t } from '@/components/move-alert/i18n';
import { useMoveAlert } from '@/components/move-alert/demo-state';
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
  const { completeStretch, state } = useMoveAlert();

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
        {stretches.map((stretch) => {
          const isDone = state.completedStretchIds.includes(stretch.id);

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
                    className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ${
                      isDone ? 'bg-success-50' : 'bg-primary-500'
                    }`}
                    onPress={() => completeStretch(stretch.id)}
                  >
                    <Ionicons
                      color={isDone ? '#15803d' : '#ffffff'}
                      name={
                        isDone ? 'checkmark-circle' : 'checkmark-circle-outline'
                      }
                      size={18}
                    />
                    <Text
                      className={`font-bold ${
                        isDone ? 'text-success-700' : 'text-typography-0'
                      }`}
                    >
                      {isDone
                        ? t('stretches.completed')
                        : t('stretches.markDone')}
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
