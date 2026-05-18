import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import {
  getButtonForegroundColor,
  useThemeColors,
} from '@/components/move-alert/theme-colors';
import { Alert, AlertText } from '@/components/ui/alert';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { SectionCard } from '@/components/move-alert/shared/section-card';

type AuthFormCardProps = {
  email: string;
  emailPlaceholder: string;
  guestLabel: string;
  isLoading: boolean;
  isSignIn: boolean;
  message: string | null;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onResendVerification: () => void;
  onSignInAsGuest: () => void;
  onSubmit: () => void;
  onToggleMode: () => void;
  password: string;
  hidePasswordLabel: string;
  passwordPlaceholder: string;
  providerLabel: string;
  resendLabel: string;
  showPasswordLabel: string;
  submitLabel: string;
  switchModeLabel: string;
};

export function AuthFormCard({
  email,
  emailPlaceholder,
  guestLabel,
  isLoading,
  message,
  onChangeEmail,
  onChangePassword,
  onResendVerification,
  onSignInAsGuest,
  onSubmit,
  onToggleMode,
  password,
  hidePasswordLabel,
  passwordPlaceholder,
  providerLabel,
  resendLabel,
  showPasswordLabel,
  submitLabel,
  switchModeLabel,
}: AuthFormCardProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const colors = useThemeColors();

  return (
    <SectionCard>
      <Text className="text-sm font-bold uppercase text-info-600">
        {providerLabel}
      </Text>

      <VStack className="mt-4" space="md">
        <Input className="rounded-2xl" size="xl">
          <InputField
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            inputMode="email"
            onChangeText={onChangeEmail}
            placeholder={emailPlaceholder}
            placeholderTextColor={colors.placeholder}
            textContentType="emailAddress"
            value={email}
          />
        </Input>
        <Input className="rounded-2xl" size="xl">
          <InputField
            autoCapitalize="none"
            onChangeText={onChangePassword}
            placeholder={passwordPlaceholder}
            placeholderTextColor={colors.placeholder}
            textContentType="password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
          />
          <Pressable
            accessibilityLabel={
              isPasswordVisible ? hidePasswordLabel : showPasswordLabel
            }
            className="h-full items-center justify-center px-4"
            onPress={() => {
              setIsPasswordVisible((current) => !current);
            }}
          >
            <Ionicons
              color={colors.textMuted}
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
            />
          </Pressable>
        </Input>
      </VStack>

      {message ? (
        <Alert action="warning" className="mt-4 rounded-2xl">
          <AlertText>{message}</AlertText>
        </Alert>
      ) : null}

      <Button
        className="mt-5 rounded-2xl"
        disabled={isLoading}
        onPress={onSubmit}
        size="xl"
      >
        {isLoading ? (
          <ButtonSpinner />
        ) : (
          <Ionicons
            color={getButtonForegroundColor(colors, 'primary', 'solid')}
            name="log-in-outline"
            size={20}
          />
        )}
        <ButtonText>{submitLabel}</ButtonText>
      </Button>

      <Button
        action="default"
        className="mt-3 rounded-2xl"
        disabled={isLoading}
        onPress={onSignInAsGuest}
        size="xl"
        variant="outline"
      >
        <Ionicons
          color={getButtonForegroundColor(colors, 'default', 'outline')}
          name="walk-outline"
          size={20}
        />
        <ButtonText>{guestLabel}</ButtonText>
      </Button>

      <Button
        action="primary"
        className="mt-3 self-center"
        disabled={isLoading}
        onPress={onToggleMode}
        variant="link"
      >
        <ButtonText>{switchModeLabel}</ButtonText>
      </Button>

      <Button
        action="default"
        className="self-center"
        disabled={isLoading}
        onPress={onResendVerification}
        variant="link"
      >
        <ButtonText>{resendLabel}</ButtonText>
      </Button>
    </SectionCard>
  );
}
