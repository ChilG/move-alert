import { Image, View } from 'react-native';

import { t } from '@/components/move-alert/i18n';
import { Text } from '@/components/ui/text';

export function AppLoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background-muted px-8">
      <View className="items-center">
        <Image source={require('@/assets/images/icon.png')} style={{ width: 88, height: 88, borderRadius: 24 }} />
        <Text className="mt-5 text-2xl font-extrabold text-typography-950">{t('common.appName')}</Text>
        <Text className="mt-2 text-sm font-semibold text-typography-500">{t('common.loading')}</Text>
      </View>
    </View>
  );
}
