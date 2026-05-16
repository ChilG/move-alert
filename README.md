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

This repository contains the Expo/React Native Move Alert app, with authenticated movement state synced to normalized Supabase tables, Android local reminder scheduling, and Google Play release preparation work.

Current setup includes:

- Expo Router app structure
- React Native with TypeScript
- Gluestack UI v3 base provider/configuration
- NativeWind styling setup
- Bottom tab navigation
- Shared movement state provider
- Supabase Auth and per-user state sync
- Android local reminder scheduling with `expo-notifications`
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

Run lint:

```bash
npm run lint
```

Check formatting:

```bash
npm run format:check
```

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

Move Alert now includes Android local reminder scheduling with
`expo-notifications`. For reliable release-like behavior, test notifications in
a development build or production build. Expo Go support is limited compared to
native builds.

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

## Development Plan

1. Persist movement state with Supabase.
2. Add local notification scheduling with a development build.
3. Add real reminder history by date.
4. Expand the stretch library with categories and images.
5. Add charts for weekly movement trends.
6. Test with target users and refine the experience.

## Project Members

Add member names, class or group, and each member's role here.
