import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { View } from 'react-native';

import { getCurrentLanguage, t } from '@/components/move-alert/i18n';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonSpinner } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { AppUpdatePrompt, determineAppUpdatePrompt } from './app-update-decision';
import {
  fetchAppUpdatePolicy,
  getAppUpdatePlatform,
  getCurrentAppVersion,
  getDismissedLatestVersion,
  setDismissedLatestVersion,
} from './app-update-policy';

export function AppUpdateGate() {
  const colors = useThemeColors();
  const [isOpeningStore, setIsOpeningStore] = useState(false);
  const [platform] = useState(() => getAppUpdatePlatform());
  const [prompt, setPrompt] = useState<AppUpdatePrompt | null>(null);

  useEffect(() => {
    if (!platform) {
      return;
    }

    let isMounted = true;
    const activePlatform = platform;

    async function checkUpdatePolicy() {
      try {
        const [policy, dismissedLatestVersion] = await Promise.all([
          fetchAppUpdatePolicy(activePlatform),
          getDismissedLatestVersion(activePlatform),
        ]);
        const nextPrompt = determineAppUpdatePrompt({
          currentVersion: getCurrentAppVersion(),
          dismissedLatestVersion,
          language: getCurrentLanguage(),
          policy,
        });

        if (isMounted) {
          setPrompt(nextPrompt);
        }
      } catch {
        if (isMounted) {
          setPrompt(null);
        }
      }
    }

    void checkUpdatePolicy();

    return () => {
      isMounted = false;
    };
  }, [platform]);

  const dismissOptionalUpdate = useCallback(() => {
    if (!platform || prompt?.kind !== 'optional') {
      return;
    }

    setPrompt(null);
    void setDismissedLatestVersion(platform, prompt.targetVersion);
  }, [platform, prompt]);

  const openStore = useCallback(() => {
    if (!prompt) {
      return;
    }

    setIsOpeningStore(true);
    void Linking.openURL(prompt.storeUrl).finally(() => {
      setIsOpeningStore(false);
    });
  }, [prompt]);

  if (!prompt) {
    return null;
  }

  const isForced = prompt.kind === 'forced';
  const title = isForced ? t('appUpdate.forcedTitle') : t('appUpdate.optionalTitle');
  const description =
    prompt.message ?? (isForced ? t('appUpdate.forcedDescription') : t('appUpdate.optionalDescription'));

  return (
    <AlertDialog isOpen onClose={isForced ? () => {} : dismissOptionalUpdate}>
      <AlertDialogBackdrop closeOnPress={!isForced} />
      <AlertDialogContent className="w-auto max-w-sm">
        <AlertDialogHeader>
          <View className="items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-info-50">
              <Ionicons color={colors.info} name="cloud-download-outline" size={30} />
            </View>
            <Text className="mt-4 text-center text-xl font-extrabold text-typography-950">{title}</Text>
          </View>
        </AlertDialogHeader>
        <AlertDialogBody className="mt-3">
          <Text className="text-center text-sm leading-6 text-typography-600">{description}</Text>
        </AlertDialogBody>
        <AlertDialogFooter className="justify-center">
          {isForced ? null : (
            <Button
              action="default"
              disabled={isOpeningStore}
              onPress={dismissOptionalUpdate}
              size="md"
              variant="outline"
            >
              <Text className="font-bold">{t('appUpdate.later')}</Text>
            </Button>
          )}
          <Button action="primary" disabled={isOpeningStore} onPress={openStore} size="md">
            {isOpeningStore ? <ButtonSpinner /> : null}
            <Text className="font-bold text-typography-0">{t('appUpdate.update')}</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
