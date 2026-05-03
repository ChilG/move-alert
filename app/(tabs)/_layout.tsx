import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/components/move-alert/i18n';
import { useThemeColors } from '@/components/move-alert/theme-colors';

type TabIconName = keyof typeof Ionicons.glyphMap;

const iconMap = {
  index: ['grid', 'grid-outline'],
  stretches: ['accessibility', 'accessibility-outline'],
  settings: ['options', 'options-outline'],
} satisfies Record<string, [TabIconName, TabIconName]>;

function TabIcon({
  color,
  focused,
  route,
}: {
  color: string;
  focused: boolean;
  route: keyof typeof iconMap;
}) {
  const [activeIcon, inactiveIcon] = iconMap[route];

  return (
    <Ionicons
      color={color}
      name={focused ? activeIcon : inactiveIcon}
      size={22}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          height: 64 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} route="index" />
          ),
        }}
      />
      <Tabs.Screen
        name="stretches"
        options={{
          title: t('tabs.stretches'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} route="stretches" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} route="settings" />
          ),
        }}
      />
    </Tabs>
  );
}
