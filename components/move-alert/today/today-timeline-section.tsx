import { View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

import { MoveAlertTimeline } from './today-helpers';

type TodayTimelineSectionProps = {
  timeline: MoveAlertTimeline;
  title: string;
};

export function TodayTimelineSection({
  timeline,
  title,
}: TodayTimelineSectionProps) {
  const colors = useThemeColors();
  const statusColor = {
    done: colors.success,
    next: colors.info,
    skipped: colors.warning,
  } satisfies Record<MoveAlertTimeline[number]['status'], string>;

  return (
    <>
      <Text className="mb-3 text-lg font-extrabold text-typography-900">
        {title}
      </Text>

      <SectionCard>
        {timeline.length === 0 ? (
          <Text className="text-base text-typography-500">
            {t('today.timelineEmpty')}
          </Text>
        ) : (
          timeline.map((item, index) => (
            <View
              className={`flex-row gap-3 ${index === 0 ? '' : 'mt-4'}`}
              key={`${item.time}-${item.labelKey}-${item.status}-${index}`}
            >
              <View className="w-14">
                <Text className="text-sm font-bold text-typography-500">
                  {item.time}
                </Text>
              </View>
              <View className="items-center pt-1.5">
                <View
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: statusColor[item.status] }}
                />
                {index < timeline.length - 1 ? (
                  <View className="mt-2 h-8 w-px bg-outline-100" />
                ) : null}
              </View>
              <Text className="flex-1 text-base text-typography-700">
                {t(item.labelKey)}
              </Text>
            </View>
          ))
        )}
      </SectionCard>
    </>
  );
}
