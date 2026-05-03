import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';
import type { ThemeMode } from '@/components/move-alert/theme-state';

type SettingsThemeSectionProps = {
  description: string;
  mode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  themeDarkLabel: string;
  themeLightLabel: string;
  themeSystemLabel: string;
  title: string;
};

const themeOptions: ThemeMode[] = ['system', 'light', 'dark'];

export function SettingsThemeSection({
  description,
  mode,
  onSelectTheme,
  themeDarkLabel,
  themeLightLabel,
  themeSystemLabel,
  title,
}: SettingsThemeSectionProps) {
  const labels: Record<ThemeMode, string> = {
    dark: themeDarkLabel,
    light: themeLightLabel,
    system: themeSystemLabel,
  };

  return (
    <SectionCard className="mt-6">
      <Text className="text-lg font-extrabold text-typography-900">
        {title}
      </Text>
      <Text className="mt-1 text-sm text-typography-500">{description}</Text>

      <HStack className="mt-5" space="md">
        {themeOptions.map((option) => {
          const isSelected = option === mode;

          return (
            <Button
              action={isSelected ? 'primary' : 'default'}
              className={`flex-1 rounded-2xl ${
                isSelected ? '' : 'bg-background-muted'
              }`}
              key={option}
              onPress={() => {
                void onSelectTheme(option);
              }}
              size="xl"
            >
              <Text
                className={`text-center text-sm font-extrabold ${
                  isSelected ? 'text-typography-0' : 'text-typography-700'
                }`}
              >
                {labels[option]}
              </Text>
            </Button>
          );
        })}
      </HStack>
    </SectionCard>
  );
}
