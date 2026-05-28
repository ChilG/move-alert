import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { t, tf } from '@/components/move-alert/i18n';
import { useLanguagePreference } from '@/components/move-alert/language-state';
import { clearReminderOnboardingSeenAsync } from '@/components/move-alert/reminder-onboarding-storage';
import {
  getServerReminderDebugInfoAsync,
  invokeServerReminderPushFunctionAsync,
  syncServerReminderPushTokenAsync,
  type ServerReminderDebugInfo,
  type ServerReminderFunctionSummary,
  type ServerReminderPushTokenResult,
} from '@/components/move-alert/reminder-notifications';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { SectionCard } from '@/components/move-alert/shared/section-card';
import { getButtonForegroundColor, useThemeColors } from '@/components/move-alert/theme-colors';
import { Alert, AlertText } from '@/components/ui/alert';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

function getServerPushRegisterMessage(result: ServerReminderPushTokenResult) {
  switch (result) {
    case 'missing-project-id':
      return t('settings.serverPushRegisterMissingProject');
    case 'permission-denied':
      return t('settings.serverPushRegisterPermissionDenied');
    case 'registered':
      return t('settings.serverPushRegisterRegistered');
    case 'signed-out':
      return t('settings.serverPushRegisterSignedOut');
    case 'unsupported':
      return t('settings.serverPushRegisterUnsupported');
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isMissingAndroidFcmConfigError(message: string) {
  return message.includes('Default FirebaseApp is not initialized') || message.includes('/fcm-credentials/');
}

function getServerPushRegisterErrorMessage(error: unknown) {
  const message = getErrorMessage(error);

  if (isMissingAndroidFcmConfigError(message)) {
    return `${t('settings.serverPushRegisterFailed')}: ${t('settings.serverPushRegisterFcmMissing')}`;
  }

  return `${t('settings.serverPushRegisterFailed')}: ${message}`;
}

function formatServerPushInvokeMessage(summary: ServerReminderFunctionSummary) {
  return tf('settings.serverPushInvokeSuccess', {
    failed: summary.failed,
    sent: summary.sent,
    skipped: summary.skipped,
  });
}

function formatDebugDateTime(value: string | null) {
  if (!value) {
    return t('settings.serverPushSettingsEmptyValue');
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function SettingsDebugScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { resolvedLanguage } = useLanguagePreference();
  const [isLoadingServerPushDebug, setIsLoadingServerPushDebug] = useState(false);
  const [isInvokingServerPushFunction, setIsInvokingServerPushFunction] = useState(false);
  const [isRegisteringServerPush, setIsRegisteringServerPush] = useState(false);
  const [isClearingOnboarding, setIsClearingOnboarding] = useState(false);
  const [serverPushDebugInfo, setServerPushDebugInfo] = useState<ServerReminderDebugInfo | null>(null);
  const [serverPushDebugMessage, setServerPushDebugMessage] = useState<string | null>(null);
  const [onboardingDebugMessage, setOnboardingDebugMessage] = useState<string | null>(null);

  async function refreshServerPushDebugInfo(options?: { preserveMessage?: boolean }) {
    setIsLoadingServerPushDebug(true);

    if (!options?.preserveMessage) {
      setServerPushDebugMessage(null);
    }

    try {
      setServerPushDebugInfo(await getServerReminderDebugInfoAsync());
    } catch (error) {
      setServerPushDebugInfo(null);
      setServerPushDebugMessage(`${t('settings.serverPushDebugLoadFailed')}: ${getErrorMessage(error)}`);
    } finally {
      setIsLoadingServerPushDebug(false);
    }
  }

  async function registerServerPushToken() {
    setIsRegisteringServerPush(true);
    setServerPushDebugMessage(null);

    try {
      const result = await syncServerReminderPushTokenAsync(resolvedLanguage);

      setServerPushDebugMessage(getServerPushRegisterMessage(result));
      await refreshServerPushDebugInfo({ preserveMessage: true });
    } catch (error) {
      setServerPushDebugMessage(getServerPushRegisterErrorMessage(error));
    } finally {
      setIsRegisteringServerPush(false);
    }
  }

  async function invokeServerPushFunction() {
    setIsInvokingServerPushFunction(true);
    setServerPushDebugMessage(null);

    try {
      const summary = await invokeServerReminderPushFunctionAsync();

      setServerPushDebugMessage(formatServerPushInvokeMessage(summary));
      await refreshServerPushDebugInfo({ preserveMessage: true });
    } catch (error) {
      setServerPushDebugMessage(`${t('settings.serverPushInvokeFailed')}: ${getErrorMessage(error)}`);
    } finally {
      setIsInvokingServerPushFunction(false);
    }
  }

  async function clearReminderOnboarding() {
    setIsClearingOnboarding(true);

    try {
      await clearReminderOnboardingSeenAsync();
      setOnboardingDebugMessage(t('settings.onboardingDebugCleared'));
    } finally {
      setIsClearingOnboarding(false);
    }
  }

  useEffect(() => {
    void refreshServerPushDebugInfo();
  }, []);

  return (
    <ScreenScrollView>
      <ScreenHeader
        description={t('settings.debugPageDescription')}
        eyebrow={t('settings.eyebrow')}
        eyebrowClassName="text-warning-600"
        title={t('settings.debugPageTitle')}
        trailing={
          <Button
            action="default"
            className="mt-1 h-11 w-11 rounded-2xl bg-background-0 p-0 shadow-soft-1"
            onPress={() => {
              router.replace('/');
            }}
            variant="solid"
          >
            <Ionicons color={colors.textDefault} name="chevron-back" size={22} />
          </Button>
        }
      />

      <VStack className="mt-6" space="lg">
        <SectionCard>
          <View>
            <Text className="text-lg font-extrabold text-typography-900">{t('settings.serverPushDebugTitle')}</Text>
            <Text className="mt-2 text-sm leading-6 text-typography-600">
              {t('settings.serverPushDebugDescription')}
            </Text>
          </View>

          {serverPushDebugMessage ? (
            <Alert action="info" className="mt-4 rounded-2xl">
              <AlertText>{serverPushDebugMessage}</AlertText>
            </Alert>
          ) : null}

          <Button
            action="secondary"
            className="mt-4 rounded-xl"
            disabled={isLoadingServerPushDebug}
            onPress={() => {
              void refreshServerPushDebugInfo();
            }}
            size="lg"
          >
            {isLoadingServerPushDebug ? (
              <ButtonSpinner />
            ) : (
              <Ionicons color={getButtonForegroundColor(colors, 'secondary', 'solid')} name="cloud-outline" size={18} />
            )}
            <ButtonText>{t('settings.serverPushDebugRefresh')}</ButtonText>
          </Button>

          <Button
            className="mt-3 rounded-xl"
            disabled={isRegisteringServerPush}
            onPress={() => {
              void registerServerPushToken();
            }}
            size="lg"
          >
            {isRegisteringServerPush ? (
              <ButtonSpinner />
            ) : (
              <Ionicons color={getButtonForegroundColor(colors, 'primary', 'solid')} name="key-outline" size={18} />
            )}
            <ButtonText>{t('settings.serverPushRegister')}</ButtonText>
          </Button>

          <Button
            action="secondary"
            className="mt-3 rounded-xl"
            disabled={isInvokingServerPushFunction}
            onPress={() => {
              void invokeServerPushFunction();
            }}
            size="lg"
          >
            {isInvokingServerPushFunction ? (
              <ButtonSpinner />
            ) : (
              <Ionicons color={getButtonForegroundColor(colors, 'secondary', 'solid')} name="flash-outline" size={18} />
            )}
            <ButtonText>{t('settings.serverPushInvoke')}</ButtonText>
          </Button>

          {serverPushDebugInfo ? (
            <VStack className="mt-4" space="md">
              <View>
                <Text className="text-sm font-extrabold text-typography-800">
                  {t('settings.serverPushSettingsTitle')}
                </Text>
                {serverPushDebugInfo.settings ? (
                  <View className="mt-2 rounded-xl border border-outline-100 bg-background-50 p-4">
                    <Text className="text-sm font-extrabold text-typography-900">
                      {serverPushDebugInfo.settings.reminderEnabled
                        ? t('settings.serverPushSettingsEnabled')
                        : t('settings.serverPushSettingsDisabled')}{' '}
                      · {serverPushDebugInfo.settings.timezone}
                    </Text>
                    <Text className="mt-2 text-xs font-semibold text-typography-500">
                      {t('settings.serverPushSettingsNextReminder')}:&nbsp;
                      {formatDebugDateTime(serverPushDebugInfo.settings.nextReminderAt)}
                    </Text>
                    <Text className="mt-1 text-xs font-semibold text-typography-500">
                      {t('settings.serverPushSettingsLastSent')}:&nbsp;
                      {formatDebugDateTime(serverPushDebugInfo.settings.lastReminderSentAt)}
                    </Text>
                    {serverPushDebugInfo.settings.reminderProcessingAt ? (
                      <Text className="mt-1 text-xs font-semibold text-warning-700">
                        {t('settings.serverPushSettingsProcessing')}:&nbsp;
                        {formatDebugDateTime(serverPushDebugInfo.settings.reminderProcessingAt)}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <Text className="mt-2 rounded-xl bg-background-50 p-4 text-sm leading-5 text-typography-600">
                    {t('settings.serverPushSettingsEmpty')}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-extrabold text-typography-800">
                  {t('settings.serverPushTokensTitle')}
                </Text>
                <VStack className="mt-2" space="sm">
                  {serverPushDebugInfo.tokens.length === 0 ? (
                    <Text className="rounded-xl bg-background-50 p-4 text-sm leading-5 text-typography-600">
                      {t('settings.serverPushTokensEmpty')}
                    </Text>
                  ) : (
                    serverPushDebugInfo.tokens.map((token) => (
                      <View className="rounded-xl border border-outline-100 bg-background-50 p-4" key={token.id}>
                        <Text className="text-sm font-extrabold text-typography-900">
                          {token.platform} · {token.timezone} · {token.language}
                        </Text>
                        <Text className="mt-1 text-xs font-semibold text-typography-500">
                          {token.isActive ? t('settings.serverPushTokenActive') : t('settings.serverPushTokenInactive')}{' '}
                          · {new Date(token.lastSeenAt).toLocaleString()}
                        </Text>
                      </View>
                    ))
                  )}
                </VStack>
              </View>

              <View>
                <Text className="text-sm font-extrabold text-typography-800">{t('settings.serverPushLogsTitle')}</Text>
                <VStack className="mt-2" space="sm">
                  {serverPushDebugInfo.logs.length === 0 ? (
                    <Text className="rounded-xl bg-background-50 p-4 text-sm leading-5 text-typography-600">
                      {t('settings.serverPushLogsEmpty')}
                    </Text>
                  ) : (
                    serverPushDebugInfo.logs.map((log) => (
                      <View
                        className="rounded-xl border border-outline-100 bg-background-50 p-4"
                        key={`${log.createdAt}:${log.status}`}
                      >
                        <Text className="text-sm font-extrabold text-typography-900">{log.status}</Text>
                        <Text className="mt-1 text-xs font-semibold text-typography-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </Text>
                        {log.errorMessage ? (
                          <Text className="mt-2 text-xs leading-4 text-error-700">{log.errorMessage}</Text>
                        ) : null}
                      </View>
                    ))
                  )}
                </VStack>
              </View>
            </VStack>
          ) : null}
        </SectionCard>

        <SectionCard>
          <View>
            <Text className="text-lg font-extrabold text-typography-900">{t('settings.onboardingDebugTitle')}</Text>
            <Text className="mt-2 text-sm leading-6 text-typography-600">
              {t('settings.onboardingDebugDescription')}
            </Text>
          </View>

          {onboardingDebugMessage ? (
            <Alert action="info" className="mt-4 rounded-2xl">
              <AlertText>{onboardingDebugMessage}</AlertText>
            </Alert>
          ) : null}

          <Button
            action="secondary"
            className="mt-4 rounded-xl"
            disabled={isClearingOnboarding}
            onPress={() => {
              void clearReminderOnboarding();
            }}
            size="lg"
          >
            <Ionicons color={getButtonForegroundColor(colors, 'secondary', 'solid')} name="refresh-outline" size={18} />
            <ButtonText>{t('settings.onboardingDebugClear')}</ButtonText>
          </Button>
        </SectionCard>
      </VStack>
    </ScreenScrollView>
  );
}
