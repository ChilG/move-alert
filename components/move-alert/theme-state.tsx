import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemeMode = 'dark' | 'light' | 'system';

const THEME_STORAGE_KEY = 'move-alert-theme-mode';

const ThemePreferenceContext = createContext<{
  resolvedTheme: Exclude<ThemeMode, 'system'>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  themeMode: ThemeMode;
}>({
  resolvedTheme: 'light',
  setThemeMode: async () => undefined,
  themeMode: 'system',
});

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let isMounted = true;

    async function loadThemeMode() {
      const storedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (
        isMounted &&
        (storedThemeMode === 'light' ||
          storedThemeMode === 'dark' ||
          storedThemeMode === 'system')
      ) {
        setThemeModeState(storedThemeMode);
      }
    }

    void loadThemeMode();

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const resolvedTheme = useMemo<Exclude<ThemeMode, 'system'>>(
    () =>
      themeMode === 'system'
        ? systemColorScheme === 'dark'
          ? 'dark'
          : 'light'
        : themeMode,
    [systemColorScheme, themeMode],
  );

  return (
    <ThemePreferenceContext.Provider
      value={{ resolvedTheme, setThemeMode, themeMode }}
    >
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
