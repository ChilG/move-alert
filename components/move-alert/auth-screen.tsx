import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/components/move-alert/auth-state';
import {
  authEmailSchema,
  authFormSchema,
  getValidationMessage,
} from '@/components/move-alert/auth-validation';
import { t } from '@/components/move-alert/i18n';
import { Box } from '@/components/ui/box';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen() {
  const { errorMessage, isLoading, resendEmailVerification, signIn, signUp } =
    useAuth();
  const [email, setEmail] = useState('');
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [password, setPassword] = useState('');

  const isSignIn = mode === 'sign-in';

  const submitLabel = isSignIn
    ? t('auth.screen.signInSubmit')
    : t('auth.screen.signUpSubmit');
  const title = isSignIn
    ? t('auth.screen.signInTitle')
    : t('auth.screen.signUpTitle');

  async function submitAuthForm() {
    setFormMessage(null);

    const authForm = authFormSchema.safeParse({ email, password });
    if (!authForm.success) {
      setFormMessage(getValidationMessage(authForm.error));
      return;
    }

    const isSuccess = isSignIn
      ? await signIn(authForm.data.email, authForm.data.password)
      : await signUp(authForm.data.email, authForm.data.password);

    if (isSuccess && !isSignIn) {
      setFormMessage(t('auth.screen.signUpSuccess'));
    }
  }

  async function resendVerificationEmail() {
    setFormMessage(null);

    const authEmail = authEmailSchema.safeParse({ email });
    if (!authEmail.success) {
      setFormMessage(t('auth.screen.invalidEmailBeforeResend'));
      return;
    }

    const isSuccess = await resendEmailVerification(authEmail.data.email);

    if (isSuccess) {
      setFormMessage(t('auth.screen.resendSuccess'));
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background-muted">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        className="flex-1 justify-center px-5"
      >
        <View className="mb-8 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-success-100">
            <Ionicons color="#166534" name="walk-outline" size={34} />
          </View>
          <Text className="mt-4 text-3xl font-extrabold text-typography-950">
            {title}
          </Text>
          <Text className="mt-2 text-center text-base leading-6 text-typography-600">
            {t('auth.screen.subtitle')}
          </Text>
        </View>

        <Box className="rounded-3xl bg-background-0 p-5 shadow-soft-1">
          <Text className="text-sm font-bold uppercase text-info-600">
            {t('auth.screen.providerLabel')}
          </Text>

          <View className="mt-4 gap-3">
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              className="rounded-2xl border border-outline-200 bg-background-0 px-4 py-4 text-base text-typography-900"
              inputMode="email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8a8a8a"
              textContentType="emailAddress"
              value={email}
            />
            <TextInput
              autoCapitalize="none"
              className="rounded-2xl border border-outline-200 bg-background-0 px-4 py-4 text-base text-typography-900"
              onChangeText={setPassword}
              placeholder={t('auth.screen.passwordPlaceholder')}
              placeholderTextColor="#8a8a8a"
              secureTextEntry
              textContentType="password"
              value={password}
            />
          </View>

          {formMessage || errorMessage ? (
            <Text className="mt-4 rounded-2xl bg-warning-50 px-4 py-3 text-sm font-semibold leading-5 text-warning-800">
              {formMessage ?? errorMessage}
            </Text>
          ) : null}

          <Pressable
            className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-4"
            disabled={isLoading}
            onPress={() => {
              void submitAuthForm();
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Ionicons color="#ffffff" name="log-in-outline" size={20} />
            )}
            <Text className="font-bold text-typography-0">{submitLabel}</Text>
          </Pressable>

          <Pressable
            className="mt-3 items-center px-4 py-3"
            disabled={isLoading}
            onPress={() => {
              setFormMessage(null);
              setMode(isSignIn ? 'sign-up' : 'sign-in');
            }}
          >
            <Text className="font-bold text-info-700">
              {isSignIn
                ? t('auth.screen.switchToSignUp')
                : t('auth.screen.switchToSignIn')}
            </Text>
          </Pressable>

          <Pressable
            className="items-center px-4 py-3"
            disabled={isLoading}
            onPress={() => {
              void resendVerificationEmail();
            }}
          >
            <Text className="font-bold text-typography-600">
              {t('auth.screen.resendVerificationEmail')}
            </Text>
          </Pressable>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
