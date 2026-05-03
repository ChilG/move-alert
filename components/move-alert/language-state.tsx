import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getCurrentLanguage,
  setLanguageModeOverride,
  type LanguageMode,
  type SupportedLanguage,
} from '@/components/move-alert/i18n';

const LANGUAGE_STORAGE_KEY = 'move-alert-language-mode';

const LanguagePreferenceContext = createContext<{
  languageMode: LanguageMode;
  resolvedLanguage: SupportedLanguage;
  setLanguageMode: (mode: LanguageMode) => Promise<void>;
}>({
  languageMode: 'system',
  resolvedLanguage: getCurrentLanguage(),
  setLanguageMode: async () => undefined,
});

export function LanguagePreferenceProvider({
  children,
}: PropsWithChildren) {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>('system');

  useEffect(() => {
    let isMounted = true;

    async function loadLanguageMode() {
      const storedLanguageMode = await AsyncStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      );

      if (
        isMounted &&
        (storedLanguageMode === 'system' ||
          storedLanguageMode === 'th' ||
          storedLanguageMode === 'en')
      ) {
        setLanguageModeState(storedLanguageMode);
      }
    }

    void loadLanguageMode();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setLanguageModeOverride(languageMode);
  }, [languageMode]);

  const setLanguageMode = useCallback(async (mode: LanguageMode) => {
    setLanguageModeState(mode);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, mode);
  }, []);

  const resolvedLanguage = getCurrentLanguage();

  return (
    <LanguagePreferenceContext.Provider
      value={{ languageMode, resolvedLanguage, setLanguageMode }}
    >
      {children}
    </LanguagePreferenceContext.Provider>
  );
}

export function useLanguagePreference() {
  return useContext(LanguagePreferenceContext);
}
