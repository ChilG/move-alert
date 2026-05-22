import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

import type { LanguageMode } from '@/components/move-alert/i18n';
import { SectionCard } from '@/components/move-alert/shared/section-card';

type SettingsLanguageSectionProps = {
  description: string;
  languageEnglishLabel: string;
  languageSystemLabel: string;
  languageThaiLabel: string;
  mode: LanguageMode;
  onSelectLanguage: (mode: LanguageMode) => void;
  title: string;
};

const languageOptions: LanguageMode[] = ['system', 'th', 'en'];

export function SettingsLanguageSection({
  description,
  languageEnglishLabel,
  languageSystemLabel,
  languageThaiLabel,
  mode,
  onSelectLanguage,
  title,
}: SettingsLanguageSectionProps) {
  const labels: Record<LanguageMode, string> = {
    en: languageEnglishLabel,
    system: languageSystemLabel,
    th: languageThaiLabel,
  };

  return (
    <SectionCard className="mt-6">
      <Text className="text-lg font-extrabold text-typography-900">{title}</Text>
      <Text className="mt-1 text-sm text-typography-500">{description}</Text>

      <HStack className="mt-5" space="md">
        {languageOptions.map((option) => {
          const isSelected = option === mode;

          return (
            <Button
              action={isSelected ? 'primary' : 'default'}
              className={`flex-1 rounded-2xl ${isSelected ? '' : 'bg-background-muted'}`}
              key={option}
              onPress={() => {
                void onSelectLanguage(option);
              }}
              size="xl"
            >
              <Text
                className={`text-center text-sm font-extrabold ${isSelected ? 'text-typography-0' : 'text-typography-700'}`}
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
