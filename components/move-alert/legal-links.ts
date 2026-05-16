const legalBaseUrl = process.env.EXPO_PUBLIC_LEGAL_BASE_URL;

function getLegalAssetUrl(fileName: string) {
  if (!legalBaseUrl) {
    return '';
  }

  return new URL(fileName, `${legalBaseUrl.replace(/\/$/, '')}/`).toString();
}

export const privacyPolicyUrl = getLegalAssetUrl('privacy-policy.html');
export const accountDeletionUrl = getLegalAssetUrl('account-deletion.html');
