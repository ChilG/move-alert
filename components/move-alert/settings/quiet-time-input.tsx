import { useEffect, useState } from 'react';

import { t } from '@/components/move-alert/i18n';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { isValidQuietTime } from './settings-helpers';

type QuietTimeInputProps = {
  label: string;
  onCommit: (time: string) => void;
  value: string;
};

export function QuietTimeInput({
  label,
  onCommit,
  value,
}: QuietTimeInputProps) {
  const [draftValue, setDraftValue] = useState(value);
  const colors = useThemeColors();
  const isValid = isValidQuietTime(draftValue);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  function commitValue() {
    if (isValid && draftValue !== value) {
      onCommit(draftValue);
    }
  }

  return (
    <VStack className="flex-1" space="xs">
      <Text className="text-sm font-bold text-typography-600">{label}</Text>
      <Input className="rounded-2xl" isInvalid={!isValid} size="lg">
        <InputField
          inputMode="text"
          maxLength={5}
          onBlur={commitValue}
          onChangeText={setDraftValue}
          onSubmitEditing={commitValue}
          placeholder="22:00"
          placeholderTextColor={colors.placeholder}
          value={draftValue}
        />
      </Input>
      {isValid ? null : (
        <Text className="mt-2 text-xs font-semibold text-error-700">
          {t('settings.quietHoursInvalidTime')}
        </Text>
      )}
    </VStack>
  );
}
