# Move Alert

Move Alert is a mobile application project for encouraging regular body movement during long study or work sessions. The goal is to reduce the risk of Office Syndrome by reminding users to stand up, stretch, and build healthier daily habits.

## Project Background

Many students, university staff, and office workers spend long periods sitting in front of a computer. This can lead to neck pain, shoulder pain, back pain, stiffness, and other symptoms commonly associated with Office Syndrome.

Move Alert is designed as a reminder-based wellness app. It will notify users at selected intervals, suggest simple stretching exercises, and help users track their movement habits over time.

## SDG Alignment

This project supports **SDG 3: Good Health and Well-being** by promoting healthier behavior, reducing the negative effects of prolonged sitting, and encouraging preventive self-care.

## Objectives

1. Build a movement reminder application.
2. Encourage users to take regular stretch breaks.
3. Reduce the risk of Office Syndrome caused by prolonged sitting.
4. Track user responses and movement activity.
5. Present activity statistics and streaks to motivate consistency.

## Target Users

- Students
- University staff
- Office workers
- People who study or work at a computer for long periods

## Features

- Three-tab app structure: Today, Stretch, and Settings
- Reminder interval settings, such as 30, 45, or 60 minutes
- UI-only movement reminder controls for start, pause, and skip
- Stretching exercise recommendations
- User response tracking for completed and skipped breaks
- Daily progress, streak, and timeline cards
- Personal settings for reminders and quiet hours

## Current Project Status

This repository contains the Expo/React Native Move Alert app, with authenticated movement state synced to normalized Supabase tables, server-side Expo push reminders, and Google Play release preparation work.

Current setup includes:

- Expo Router app structure
- React Native with TypeScript
- Gluestack UI v3 base provider/configuration
- NativeWind styling setup
- Bottom tab navigation
- Shared movement state provider
- Supabase Auth and per-user state sync
- Server-side Expo push reminders through Supabase Edge Functions
- Account deletion support and public legal page generation
- Gluestack MCP server configuration for component guidance

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Gluestack UI v3
- NativeWind
- npm

## Project Structure

```text
app/                         App screens and routing
app/(tabs)/                  App tab screens
components/move-alert/       App data and shared state
components/ui/               Gluestack UI provider and UI components
.codex/config.toml           Codex MCP configuration
global.css                   Global NativeWind styles
tailwind.config.js           Tailwind/NativeWind configuration
app.json                     Expo application configuration
```

## Installation

Install dependencies:

```bash
npm install
```

## Running the App

Start the Expo development server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

Check local Android and iOS device build setup:

```bash
npm run setup:android
npm run setup:ios
npm run setup:devices
```

Run a native development build on a connected device or emulator:

```bash
npm run device:android
npm run device:ios
```

The `device:*` scripts run the matching `setup:*` preflight first. Android
checks for the required SDK, Build Tools, NDK, CMake, Java, and ADB setup. iOS
checks for macOS, Xcode command line tools, Simulator tools, and CocoaPods.

Run lint:

```bash
npm run lint
```

Check formatting:

```bash
npm run format:check
```

## Builds

Create preview builds with EAS:

```bash
npm run build:preview:android
npm run build:preview:ios
```

Create production builds with EAS:

```bash
npm run build:production:android
npm run build:production:ios
```

Create production builds locally with EAS local build:

```bash
npm run build:local:android
npm run build:local:ios
```

The local build scripts run the matching `setup:*` preflight first. Android uses
the EAS `production` profile and outputs an Android App Bundle (`.aab`). iOS
local builds require macOS, Xcode, and valid iOS credentials.

## Supabase Setup

Create a Supabase project, copy `.env.example` to `.env`, and fill in:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
EXPO_PUBLIC_LEGAL_BASE_URL=https://your-username.github.io/move-alert
```

Apply the Supabase migrations in:

```text
supabase/migrations/
```

The app stores reusable movement activities in
`move_alert_activity_templates`, then stores each user's movement data in
normalized tables: `move_alert_settings`, `move_alert_daily_summaries`,
`move_alert_completed_stretches`, and `move_alert_timeline_items`. Row Level
Security is enabled so authenticated users can read active activity templates
and can only read or update their own movement data. `move_alert_settings`
also stores each user's quiet-hours time window and selected quiet days, while
`move_alert_completed_stretches` stores per-activity completion counts for the
day.

## Gluestack UI

This project uses **Gluestack UI v3** as the base UI system. The provider is located at:

```text
components/ui/gluestack-ui-provider/
```

The app layout should wrap screens with `GluestackUIProvider` so Gluestack and NativeWind styles are available across the app.

## Gluestack MCP

The project includes Codex MCP configuration for the Gluestack MCP server:

```text
.codex/config.toml
```

The MCP server is intended to help reference Gluestack component patterns while building the UI.

## Notification Note

Move Alert uses server-side Expo push notifications for real reminders.
`expo-notifications` is still required in the app for notification permission,
Expo push-token registration, channel setup, and response handling. Expo Go
support is limited compared to development and production builds.

## Server-Side Reminders

Move Alert uses Expo push notifications for production reminders. The mobile app
registers an Expo push token in Supabase, then a scheduled Supabase Edge
Function sends due reminders through the Expo Push API.

Android builds must include Firebase Cloud Messaging configuration before Expo
can create an Expo push token. Download `google-services.json` from the
Firebase console for the Android package `com.chilgoe.movealert`, place it at
the repository root, and rebuild the native app. `app.json` already points Expo
at `./google-services.json`. A JavaScript reload is not enough because the file
is bundled into the Android binary during the native build.

Apply the latest Supabase migrations. Move Alert sends through Expo Push Service
with the registered Expo push token and does not require an Expo access token in
v1.

The cron migration expects these Vault secrets for invoking the Edge Function:

```sql
select vault.create_secret('https://your-project-ref.supabase.co', 'project_url');
select vault.create_secret('your-supabase-secret-key', 'secret_key');
```

Deploy the reminder function:

```bash
supabase functions deploy send-reminder-push
supabase functions deploy run-reminder-scheduler
```

The functions are configured with `verify_jwt = false` in `supabase/config.toml`
so they can use explicit authorization checks internally:
`send-reminder-push` is cron-only and requires the configured `secret_key`;
`run-reminder-scheduler` is the in-app manual debug trigger, requires the public
Supabase key in the `apikey` header, verifies the current user session from the
`Authorization` bearer token, and sends only to that session user's active Expo
push tokens. It does not claim due reminders or advance `next_reminder_at`.

The scheduled job runs every minute with `pg_cron` and invokes:

```text
/functions/v1/send-reminder-push
```

Legacy local scheduled reminders are cleared on app startup after authentication
is ready. The real reminder flow is server-only; local scheduling is no longer
used for reminders or debug sends.

## Legal Pages

The public legal pages live directly at the repository root:

```text
privacy-policy.html
account-deletion.html
```

When GitHub Pages is configured to publish from `master / (root)`, these files
are available at:

```text
https://<username>.github.io/<repo>/privacy-policy.html
https://<username>.github.io/<repo>/account-deletion.html
```

Set `EXPO_PUBLIC_LEGAL_BASE_URL` so the app opens those same public URLs.

## Google Play Release

Release guidance is documented in:

```text
docs/google-play-release.md
```

Build the Android production App Bundle locally:

```bash
npm run build:local:android
```

This command uses the EAS `production` profile with `--local`. The production
Android profile is configured to output an Android App Bundle (`.aab`).

## Development Plan

1. Persist movement state with Supabase.
2. Operate server-side Expo push reminders with Supabase cron.
3. Add real reminder history by date.
4. Expand the stretch library with categories and images.
5. Add charts for weekly movement trends.
6. Test with target users and refine the experience.

## Project Members

Add member names, class or group, and each member's role here.
