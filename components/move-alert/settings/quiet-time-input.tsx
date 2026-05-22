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
  placeholder: string;
  value: string;
};

function getQuietTimeDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function formatQuietTimeDigits(digits: string) {
  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function QuietTimeInput({ label, onCommit, placeholder, value }: QuietTimeInputProps) {
  const [draftDigits, setDraftDigits] = useState(() => getQuietTimeDigits(value));
  const colors = useThemeColors();
  const draftValue = formatQuietTimeDigits(draftDigits);
  const isValid = isValidQuietTime(draftValue);

  useEffect(() => {
    setDraftDigits(getQuietTimeDigits(value));
  }, [value]);

  function commitValue() {
    if (!isValid || draftDigits.length !== 4) {
      setDraftDigits(getQuietTimeDigits(value));
      return;
    }

    if (isValid && draftValue !== value) {
      onCommit(draftValue);
    }
  }

  return (
    <VStack className="flex-1" space="xs">
      <Text className="text-sm font-bold text-typography-600">{label}</Text>
      <Input className="rounded-2xl" isInvalid={draftDigits.length === 4 && !isValid} size="lg">
        <InputField
          inputMode="numeric"
          maxLength={5}
          onBlur={commitValue}
          onChangeText={(nextValue) => {
            setDraftDigits(getQuietTimeDigits(nextValue));
          }}
          onSubmitEditing={commitValue}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          value={draftValue}
        />
      </Input>
      {draftDigits.length === 4 && !isValid ? (
        <Text className="mt-2 text-xs font-semibold text-error-700">{t('settings.quietHoursInvalidTime')}</Text>
      ) : null}
    </VStack>
  );
}
