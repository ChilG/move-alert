export type AppUpdatePolicy = {
  forceUpdate: boolean;
  latestVersion: string;
  messageEn: string | null;
  messageTh: string | null;
  minimumSupportedVersion: string;
  storeUrl: string;
};

export type AppUpdatePrompt = {
  kind: 'forced' | 'optional';
  message: string | null;
  storeUrl: string;
  targetVersion: string;
};

type DetermineAppUpdatePromptInput = {
  currentVersion: string;
  dismissedLatestVersion: string | null;
  language: 'en' | 'th';
  policy: AppUpdatePolicy | null;
};

const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

function parseSemver(version: string) {
  const match = version.trim().match(SEMVER_PATTERN);

  if (!match) {
    return null;
  }

  return match.slice(1).map((segment) => Number(segment));
}

export function compareAppVersions(leftVersion: string, rightVersion: string) {
  const left = parseSemver(leftVersion);
  const right = parseSemver(rightVersion);

  if (!left || !right) {
    return leftVersion.localeCompare(rightVersion);
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftSegment = left[index] ?? 0;
    const rightSegment = right[index] ?? 0;

    if (leftSegment !== rightSegment) {
      return leftSegment > rightSegment ? 1 : -1;
    }
  }

  return 0;
}

function getLocalizedPolicyMessage(policy: AppUpdatePolicy, language: 'en' | 'th') {
  return language === 'en' ? policy.messageEn ?? policy.messageTh : policy.messageTh ?? policy.messageEn;
}

export function determineAppUpdatePrompt({
  currentVersion,
  dismissedLatestVersion,
  language,
  policy,
}: DetermineAppUpdatePromptInput): AppUpdatePrompt | null {
  if (!policy) {
    return null;
  }

  const isBelowMinimum = compareAppVersions(currentVersion, policy.minimumSupportedVersion) < 0;
  const isBelowLatest = compareAppVersions(currentVersion, policy.latestVersion) < 0;

  if (isBelowMinimum || (policy.forceUpdate && isBelowLatest)) {
    return {
      kind: 'forced',
      message: getLocalizedPolicyMessage(policy, language),
      storeUrl: policy.storeUrl,
      targetVersion: policy.latestVersion,
    };
  }

  if (isBelowLatest && dismissedLatestVersion !== policy.latestVersion) {
    return {
      kind: 'optional',
      message: getLocalizedPolicyMessage(policy, language),
      storeUrl: policy.storeUrl,
      targetVersion: policy.latestVersion,
    };
  }

  return null;
}
