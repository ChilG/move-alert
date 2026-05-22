import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFormCard } from '@/components/move-alert/auth/auth-form-card';
import { AuthHero } from '@/components/move-alert/auth/auth-hero';
import { useAuth } from '@/components/move-alert/auth-state';
import { getAuthEmailSchema, getAuthFormSchema, getValidationMessage } from '@/components/move-alert/auth-validation';
import { t } from '@/components/move-alert/i18n';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen() {
  const { errorMessage, isLoading, resendEmailVerification, signIn, signInAsGuest, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [password, setPassword] = useState('');

  const isSignIn = mode === 'sign-in';

  const submitLabel = isSignIn ? t('auth.screen.signInSubmit') : t('auth.screen.signUpSubmit');
  const title = isSignIn ? t('auth.screen.signInTitle') : t('auth.screen.signUpTitle');

  async function submitAuthForm() {
    setFormMessage(null);

    const authForm = getAuthFormSchema().safeParse({ email, password });
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

    const authEmail = getAuthEmailSchema().safeParse({ email });
    if (!authEmail.success) {
      setFormMessage(t('auth.screen.invalidEmailBeforeResend'));
      return;
    }

    const isSuccess = await resendEmailVerification(authEmail.data.email);

    if (isSuccess) {
      setFormMessage(t('auth.screen.resendSuccess'));
    }
  }

  async function continueAsGuest() {
    setFormMessage(null);
    await signInAsGuest();
  }

  return (
    <SafeAreaView className="flex-1 bg-background-muted">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        className="flex-1 justify-center px-5"
      >
        <AuthHero subtitle={t('auth.screen.subtitle')} title={title} />

        <AuthFormCard
          email={email}
          isLoading={isLoading}
          isSignIn={isSignIn}
          message={formMessage ?? errorMessage}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onResendVerification={() => {
            void resendVerificationEmail();
          }}
          onSignInAsGuest={() => {
            void continueAsGuest();
          }}
          onSubmit={() => {
            void submitAuthForm();
          }}
          onToggleMode={() => {
            setFormMessage(null);
            setMode(isSignIn ? 'sign-up' : 'sign-in');
          }}
          password={password}
          hidePasswordLabel={t('auth.screen.hidePassword')}
          passwordPlaceholder={t('auth.screen.passwordPlaceholder')}
          providerLabel={t('auth.screen.providerLabel')}
          resendLabel={t('auth.screen.resendVerificationEmail')}
          showPasswordLabel={t('auth.screen.showPassword')}
          guestLabel={t('auth.screen.continueAsGuest')}
          emailPlaceholder={t('auth.screen.emailPlaceholder')}
          submitLabel={submitLabel}
          switchModeLabel={isSignIn ? t('auth.screen.switchToSignUp') : t('auth.screen.switchToSignIn')}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
