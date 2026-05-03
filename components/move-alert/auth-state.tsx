import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import {
  authEmailSchema,
  authFormSchema,
  getValidationMessage,
} from '@/components/move-alert/auth-validation';
import { t } from '@/components/move-alert/i18n';
import { supabase } from '@/lib/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'signed-out';

type AuthState = {
  errorMessage: string | null;
  isLoading: boolean;
  resendEmailVerification: (email: string) => Promise<boolean>;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  status: AuthStatus;
  user: User | null;
};

const AuthContext = createContext<AuthState | null>(null);

function toFriendlyAuthMessage(message: string) {
  if (
    message.toLowerCase().includes('otp_expired') ||
    message.toLowerCase().includes('invalid or has expired')
  ) {
    return t('auth.errors.verificationExpired');
  }

  if (message.toLowerCase().includes('invalid login credentials')) {
    return t('auth.errors.invalidCredentials');
  }

  if (message.toLowerCase().includes('email not confirmed')) {
    return t('auth.errors.emailNotConfirmed');
  }

  return message;
}

function getEmailRedirectTo() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  return Linking.createURL('/');
}

function getAuthParams(url: string) {
  const params = new URLSearchParams();
  const parsedUrl = new URL(url);

  parsedUrl.searchParams.forEach((value, key) => {
    params.set(key, value);
  });

  const hash = parsedUrl.hash.replace(/^#\/?/, '');
  const hashQuery = hash.includes('?') ? hash.split('?').at(-1) : hash;

  new URLSearchParams(hashQuery).forEach((value, key) => {
    params.set(key, value);
  });

  return params;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function recoverSessionFromUrl(url: string | null) {
      if (!url) return;

      const params = getAuthParams(url);
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const code = params.get('code');

      if (errorDescription || errorCode) {
        setErrorMessage(
          toFriendlyAuthMessage(errorDescription ?? errorCode ?? ''),
        );
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setErrorMessage(toFriendlyAuthMessage(error.message));
        }

        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setErrorMessage(toFriendlyAuthMessage(error.message));
        }
      }
    }

    void Linking.getInitialURL().then(recoverSessionFromUrl);

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void recoverSessionFromUrl(url);
    });

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      void recoverSessionFromUrl(window.location.href);
    }

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          setErrorMessage(toFriendlyAuthMessage(error.message));
        }

        setSession(data.session);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setErrorMessage(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      linkingSubscription.remove();
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      errorMessage,
      isLoading,
      resendEmailVerification: async (email) => {
        const authEmail = authEmailSchema.safeParse({ email });
        if (!authEmail.success) {
          setErrorMessage(getValidationMessage(authEmail.error));
          return false;
        }

        setIsLoading(true);
        setErrorMessage(null);

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: authEmail.data.email,
          options: {
            emailRedirectTo: getEmailRedirectTo(),
          },
        });

        setIsLoading(false);

        if (error) {
          setErrorMessage(toFriendlyAuthMessage(error.message));
          return false;
        }

        return true;
      },
      session,
      signIn: async (email, password) => {
        const authForm = authFormSchema.safeParse({ email, password });
        if (!authForm.success) {
          setErrorMessage(getValidationMessage(authForm.error));
          return false;
        }

        setIsLoading(true);
        setErrorMessage(null);

        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.data.email,
          password: authForm.data.password,
        });

        setIsLoading(false);

        if (error) {
          setErrorMessage(toFriendlyAuthMessage(error.message));
          return false;
        }

        return true;
      },
      signOut: async () => {
        setIsLoading(true);
        setErrorMessage(null);

        const { error } = await supabase.auth.signOut();

        if (error) {
          setErrorMessage(toFriendlyAuthMessage(error.message));
        }

        setIsLoading(false);
      },
      signUp: async (email, password) => {
        const authForm = authFormSchema.safeParse({ email, password });
        if (!authForm.success) {
          setErrorMessage(getValidationMessage(authForm.error));
          return false;
        }

        setIsLoading(true);
        setErrorMessage(null);

        const { error } = await supabase.auth.signUp({
          email: authForm.data.email,
          password: authForm.data.password,
          options: {
            emailRedirectTo: getEmailRedirectTo(),
          },
        });

        setIsLoading(false);

        if (error) {
          setErrorMessage(toFriendlyAuthMessage(error.message));
          return false;
        }

        return true;
      },
      status: isLoading ? 'loading' : session ? 'authenticated' : 'signed-out',
      user: session?.user ?? null,
    }),
    [errorMessage, isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return value;
}
