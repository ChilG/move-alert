# App Update and Battery Investigation

## Forced app update notification

Move Alert can support forced updates in two layers:

1. JavaScript-only updates through `expo-updates`.
   - Good for fixes that do not require new native code.
   - The app can call `Updates.checkForUpdateAsync()`, then `Updates.fetchUpdateAsync()`, then `Updates.reloadAsync()` when an update is available.
   - This requires an EAS Update setup with `updates.url` and `runtimeVersion`.

2. Store binary updates for native/runtime changes.
   - Android supports Play In-App Updates through `AppUpdateManager`.
   - Immediate updates are the right fit for a forced update because Google Play owns the blocking update UI.
   - This needs native Play Core integration or a React Native/Expo module that wraps it; it is not available from the current dependencies.

Recommended app-level design:

- Store a small remote version policy, for example `minimum_supported_version`, `minimum_supported_build`, `latest_version`, `store_url`, `force_update`, and localized message.
- Read current app version/build at runtime with `expo-application`.
- If the installed build is below the minimum:
  - Android production Play build: start an immediate in-app update flow if Play Core is integrated.
  - Fallback for Android/iOS: show a non-dismissible dialog that opens the store URL.
- Keep `expo-updates` as a separate path for compatible OTA updates and show a lighter “restart to update” prompt when an update has already downloaded.

Official references:

- Expo Updates: https://docs.expo.dev/versions/latest/sdk/updates/
- Expo app versions and `expo-application`: https://docs.expo.dev/build-reference/app-versions
- Android `AppUpdateManager`: https://developer.android.com/reference/com/google/android/play/core/appupdate/AppUpdateManager

## Battery optimization state

The current app already opens Android battery settings through an intent, but it cannot read whether Move Alert is exempt from optimization.

What Android exposes:

- `PowerManager.isIgnoringBatteryOptimizations(packageName)` returns whether the package is on the power allowlist.
- `Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` asks the user to allow the app to ignore battery optimization.
- Android notes that most apps should avoid this request; it should be reserved for unusual cases that truly need deep control over background execution.

Implementation options:

1. Native Expo module, preferred if we want a precise status in-app.
   - Add a small Android module exposing `isIgnoringBatteryOptimizations()` and `requestIgnoreBatteryOptimizations()`.
   - Add the `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` permission only if the product decision is approved.
   - iOS has no equivalent user-facing allowlist; show platform-specific copy instead.

2. Settings-only UX, lowest risk.
   - Keep opening battery settings.
   - Add a checklist screen explaining what to enable, without claiming the app can verify the setting.

3. Third-party package.
   - Faster, but should be reviewed carefully because battery optimization permissions are sensitive and OEM behavior varies.

Recommended first version:

- Start with settings-only UX plus clear Android copy.
- Add native status reading only after Play policy review and device testing on Samsung, Pixel, Xiaomi/Oppo/Vivo if those devices are in scope.

Official references:

- Android `PowerManager.isIgnoringBatteryOptimizations`: https://developer.android.com/reference/android/os/PowerManager#isIgnoringBatteryOptimizations(java.lang.String)
- Android battery optimization request action: https://developer.android.com/reference/android/provider/Settings#ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
- Expo Linking notes that Android `sendIntent` exists, but recommends `expo-intent-launcher`: https://docs.expo.dev/versions/latest/sdk/linking/
