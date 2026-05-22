import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PropsWithChildren } from 'react';

import { t } from '@/components/move-alert/i18n';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { ScreenHeader } from '@/components/move-alert/shared/screen-header';
import { useThemeColors } from '@/components/move-alert/theme-colors';
import { Pressable } from '@/components/ui/pressable';

type SettingsScreenShellProps = PropsWithChildren<{
  description?: string;
  title: string;
}>;

export function SettingsScreenShell({ children, description, title }: SettingsScreenShellProps) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <ScreenScrollView>
      <ScreenHeader
        description={description}
        eyebrow={t('settings.eyebrow')}
        eyebrowClassName="text-warning-600"
        title={title}
        trailing={
          <Pressable
            className="mt-1 h-11 w-11 items-center justify-center rounded-2xl bg-background-0 shadow-soft-1"
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons color={colors.textDefault} name="chevron-back" size={22} />
          </Pressable>
        }
      />
      {children}
    </ScreenScrollView>
  );
}
