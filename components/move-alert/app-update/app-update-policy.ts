import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';

import { AppUpdatePolicy } from './app-update-decision';

const APP_UPDATE_POLICY_CACHE_KEY_PREFIX = 'move-alert.app-update.policy';
const APP_UPDATE_DISMISSED_VERSION_KEY_PREFIX = 'move-alert.app-update.dismissed-latest-version';
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

const appUpdatePolicyRowSchema = z.object({
  force_update: z.boolean().catch(false),
  latest_version: z.string().regex(SEMVER_PATTERN),
  message_en: z.string().nullable().catch(null),
  message_th: z.string().nullable().catch(null),
  minimum_supported_version: z.string().regex(SEMVER_PATTERN),
  store_url: z.string().url(),
});

type AppUpdatePolicyRow = z.infer<typeof appUpdatePolicyRowSchema>;

function getStorageKey(prefix: string, platform: string) {
  return `${prefix}.${platform}`;
}

function toAppUpdatePolicy(row: AppUpdatePolicyRow): AppUpdatePolicy {
  return {
    forceUpdate: row.force_update,
    latestVersion: row.latest_version,
    messageEn: row.message_en,
    messageTh: row.message_th,
    minimumSupportedVersion: row.minimum_supported_version,
    storeUrl: row.store_url,
  };
}

async function readCachedPolicy(platform: string) {
  const cachedPolicyText = await AsyncStorage.getItem(getStorageKey(APP_UPDATE_POLICY_CACHE_KEY_PREFIX, platform));

  if (!cachedPolicyText) {
    return null;
  }

  let cachedPolicyJson: unknown;

  try {
    cachedPolicyJson = JSON.parse(cachedPolicyText);
  } catch {
    return null;
  }

  const cachedPolicy = appUpdatePolicyRowSchema.safeParse(cachedPolicyJson);

  return cachedPolicy.success ? toAppUpdatePolicy(cachedPolicy.data) : null;
}

async function writeCachedPolicy(platform: string, row: AppUpdatePolicyRow) {
  await AsyncStorage.setItem(getStorageKey(APP_UPDATE_POLICY_CACHE_KEY_PREFIX, platform), JSON.stringify(row));
}

export function getCurrentAppVersion() {
  return Constants.nativeApplicationVersion ?? Constants.expoConfig?.version ?? '0.0.0';
}

export function getAppUpdatePlatform() {
  return Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : null;
}

export async function getDismissedLatestVersion(platform: string) {
  return AsyncStorage.getItem(getStorageKey(APP_UPDATE_DISMISSED_VERSION_KEY_PREFIX, platform));
}

export async function setDismissedLatestVersion(platform: string, version: string) {
  await AsyncStorage.setItem(getStorageKey(APP_UPDATE_DISMISSED_VERSION_KEY_PREFIX, platform), version);
}

export async function fetchAppUpdatePolicy(platform: string): Promise<AppUpdatePolicy | null> {
  const { data, error } = await supabase
    .from('app_update_policies')
    .select('force_update, latest_version, message_en, message_th, minimum_supported_version, store_url')
    .eq('platform', platform)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return readCachedPolicy(platform);
  }

  if (!data) {
    return null;
  }

  const parsedPolicy = appUpdatePolicyRowSchema.safeParse(data);

  if (!parsedPolicy.success) {
    return readCachedPolicy(platform);
  }

  await writeCachedPolicy(platform, parsedPolicy.data).catch(() => {});

  return toAppUpdatePolicy(parsedPolicy.data);
}
