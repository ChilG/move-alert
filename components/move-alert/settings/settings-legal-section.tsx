import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import {
  getButtonForegroundColor,
  useThemeColors,
} from '@/components/move-alert/theme-colors';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { SectionCard } from '@/components/move-alert/shared/section-card';

type SettingsLegalSectionProps = {
  accountDeletionLabel: string;
  description: string;
  onOpenAccountDeletion: () => void;
  onOpenPrivacyPolicy: () => void;
  privacyPolicyLabel: string;
  title: string;
};

export function SettingsLegalSection({
  accountDeletionLabel,
  description,
  onOpenAccountDeletion,
  onOpenPrivacyPolicy,
  privacyPolicyLabel,
  title,
}: SettingsLegalSectionProps) {
  const colors = useThemeColors();
  const iconColor = getButtonForegroundColor(colors, 'default', 'outline');

  return (
    <SectionCard className="mt-6">
      <View>
        <Text className="text-lg font-extrabold text-typography-900">
          {title}
        </Text>
        <Text className="mt-2 text-sm leading-6 text-typography-600">
          {description}
        </Text>
      </View>

      <Button
        action="default"
        className="mt-4"
        onPress={onOpenPrivacyPolicy}
        size="xl"
        variant="outline"
      >
        <Ionicons color={iconColor} name="document-text-outline" size={18} />
        <Text className="font-bold">{privacyPolicyLabel}</Text>
      </Button>

      <Button
        action="default"
        className="mt-3"
        onPress={onOpenAccountDeletion}
        size="xl"
        variant="outline"
      >
        <Ionicons color={iconColor} name="trash-outline" size={18} />
        <Text className="font-bold">{accountDeletionLabel}</Text>
      </Button>
    </SectionCard>
  );
}
