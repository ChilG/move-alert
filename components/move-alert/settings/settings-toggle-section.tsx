import { VStack } from '@/components/ui/vstack';

import { SettingSwitchCard } from './setting-switch-card';

type SettingsToggleSectionProps = {
  isQuietHoursEnabled: boolean;
  isReminderEnabled: boolean;
  movementRemindersLabel: string;
  onToggleQuietHours: () => void;
  onToggleReminder: () => void;
  quietHoursLabel: string;
};

export function SettingsToggleSection({
  isQuietHoursEnabled,
  isReminderEnabled,
  movementRemindersLabel,
  onToggleQuietHours,
  onToggleReminder,
  quietHoursLabel,
}: SettingsToggleSectionProps) {
  return (
    <VStack className="mt-5" space="md">
      <SettingSwitchCard
        icon="notifications-outline"
        isEnabled={isReminderEnabled}
        label={movementRemindersLabel}
        onPress={onToggleReminder}
      />
      <SettingSwitchCard
        icon="moon-outline"
        isEnabled={isQuietHoursEnabled}
        label={quietHoursLabel}
        onPress={onToggleQuietHours}
      />
    </VStack>
  );
}
