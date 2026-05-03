import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/components/move-alert/auth-state';
import { reminderIntervals } from '@/components/move-alert/demo-data';
import { t } from '@/components/move-alert/i18n';
import { useMoveAlert } from '@/components/move-alert/demo-state';
import { ScreenScrollView } from '@/components/move-alert/screen-scroll-view';
import { Box } from '@/components/ui/box';

function SettingSwitch({
  icon,
  isEnabled,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  isEnabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-2xl bg-background-0 p-4 shadow-soft-1"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-info-50">
          <Ionicons color="#0369a1" name={icon} size={22} />
        </View>
        <Text className="text-base font-bold text-typography-800">{label}</Text>
      </View>

      <View
        className={`h-7 w-12 rounded-full p-1 ${
          isEnabled ? 'items-end bg-success-500' : 'items-start bg-outline-200'
        }`}
      >
        <View className="h-5 w-5 rounded-full bg-background-0" />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { isLoading, signOut, user } = useAuth();
  const {
    errorMessage,
    isSyncing,
    resetDemo,
    setIntervalMinutes,
    state,
    syncStatus,
    toggleQuietHours,
    toggleReminder,
  } = useMoveAlert();
  const syncLabel = isSyncing
    ? t('settings.syncing')
    : syncStatus === 'error'
      ? t('settings.syncError')
      : t('settings.synced');

  return (
    <ScreenScrollView>
      <Text className="text-sm font-bold uppercase text-warning-600">
        {t('settings.eyebrow')}
      </Text>
      <Text className="mt-1 text-3xl font-extrabold text-typography-950">
        {t('settings.title')}
      </Text>

      <Box className="mt-6 rounded-3xl bg-background-0 p-5 shadow-soft-1">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-success-50">
            <Ionicons color="#15803d" name="person-circle-outline" size={28} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-typography-500">
              {t('settings.signedInAccount')}
            </Text>
            <Text className="mt-1 text-base font-extrabold text-typography-900">
              {user?.email ?? t('settings.unknownUser')}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-typography-500">
              {syncLabel}
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <Text className="mt-4 rounded-2xl bg-error-50 px-4 py-3 text-sm font-semibold text-error-700">
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-outline-200 bg-background-0 px-4 py-4"
          disabled={isLoading}
          onPress={() => {
            void signOut();
          }}
        >
          <Ionicons color="#525252" name="log-out-outline" size={20} />
          <Text className="font-bold text-typography-700">
            {t('settings.signOut')}
          </Text>
        </Pressable>
      </Box>

      <Box className="mt-6 rounded-3xl bg-background-0 p-5 shadow-soft-1">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-extrabold text-typography-900">
              {t('settings.reminderInterval')}
            </Text>
            <Text className="mt-1 text-sm text-typography-500">
              {t('settings.reminderIntervalDescription')}
            </Text>
          </View>
          <Ionicons color="#525252" name="alarm-outline" size={26} />
        </View>

        <View className="mt-5 flex-row gap-3">
          {reminderIntervals.map((interval) => {
            const isSelected = state.intervalMinutes === interval;

            return (
              <Pressable
                className={`flex-1 rounded-2xl px-3 py-4 ${
                  isSelected ? 'bg-primary-500' : 'bg-background-muted'
                }`}
                key={interval}
                onPress={() => setIntervalMinutes(interval)}
              >
                <Text
                  className={`text-center text-lg font-extrabold ${
                    isSelected ? 'text-typography-0' : 'text-typography-800'
                  }`}
                >
                  {interval}
                </Text>
                <Text
                  className={`text-center text-xs font-semibold ${
                    isSelected ? 'text-typography-0' : 'text-typography-500'
                  }`}
                >
                  {t('settings.minutes')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Box>

      <View className="mt-5 gap-3">
        <SettingSwitch
          icon="notifications-outline"
          isEnabled={state.reminderEnabled}
          label={t('settings.movementReminders')}
          onPress={toggleReminder}
        />
        <SettingSwitch
          icon="moon-outline"
          isEnabled={state.quietHoursEnabled}
          label={t('settings.quietHours')}
          onPress={toggleQuietHours}
        />
      </View>

      <Box className="mt-5 rounded-3xl bg-warning-50 p-5">
        <View className="flex-row gap-3">
          <Ionicons color="#b45309" name="construct-outline" size={24} />
          <View className="flex-1">
            <Text className="font-extrabold text-warning-900">
              {t('settings.prototypeNoteTitle')}
            </Text>
            <Text className="mt-2 leading-6 text-warning-800">
              {t('settings.prototypeNoteBody')}
            </Text>
          </View>
        </View>
      </Box>

      <Pressable
        className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl border border-outline-200 bg-background-0 px-4 py-4"
        onPress={resetDemo}
      >
        <Ionicons color="#525252" name="refresh-outline" size={20} />
        <Text className="font-bold text-typography-700">
          {t('settings.resetDemo')}
        </Text>
      </Pressable>
    </ScreenScrollView>
  );
}
