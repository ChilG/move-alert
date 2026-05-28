import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

type SupabaseAuthStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  removeItem: (key: string) => Promise<void> | void;
  setItem: (key: string, value: string) => Promise<void> | void;
};

const resolvedSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const resolvedSupabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!resolvedSupabaseUrl || !resolvedSupabasePublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabaseUrl = resolvedSupabaseUrl;
export const supabasePublishableKey = resolvedSupabasePublishableKey;

function createMemoryStorage(): SupabaseAuthStorage {
  const store = new Map<string, string>();

  return {
    getItem: (key) => store.get(key) ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

const authStorage = Platform.OS === 'web' && typeof window === 'undefined' ? createMemoryStorage() : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
