# Google Play Release Guide

This document captures the release workflow for `Move Alert` on Google Play.

## App identity

- App name: `Move Alert`
- Android package: `com.chilgoe.movealert`
- Current Expo config: `app.json`
- EAS config: `eas.json`

## Prerequisites

1. Install `eas-cli`

```bash
npm install -g eas-cli
eas login
```

2. Ensure Google Play Console app exists with package `com.chilgoe.movealert`
3. Ensure Supabase migrations are applied, including account deletion support
4. Ensure `.env` contains:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_LEGAL_BASE_URL=https://<username>.github.io/move-alert
```

## Build profiles

- `preview`
  - internal QA/testing build
  - Android output: `apk`
- `production`
  - Play release build
  - Android output: `aab`
  - version code auto-increments on EAS

## Legal pages

The legal pages are committed directly in the repository root:

- `privacy-policy.html`
- `account-deletion.html`

Recommended setup:

1. In GitHub repository settings, enable **Pages**
2. Set source to `Deploy from a branch`
3. Choose branch `master`
4. Choose folder `/(root)`
5. Set `EXPO_PUBLIC_LEGAL_BASE_URL` in the app env to your Pages URL

Expected public URLs:

- `https://<username>.github.io/move-alert/privacy-policy.html`
- `https://<username>.github.io/move-alert/account-deletion.html`

These URLs are also the ones used inside the app.

## Android build and release

### First release

1. Configure EAS once:

```bash
eas build:configure
```

2. Create the production bundle:

```bash
eas build --platform android --profile production
```

3. Download the generated `.aab`
4. Upload the first `.aab` **manually** in Play Console

### Later releases

```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

Before using `eas submit`, upload a Google Play service account key in Expo credentials.

## Google Play Console checklist

### Store listing

- App name
- Short description
- Full description
- App icon
- Feature graphic
- At least 2 phone screenshots
- Support contact email

### App content

- Privacy Policy URL
- Data safety form
- Health apps declaration
- Ads declaration
- Content rating
- Target audience
- App access instructions for review

### Account type branch

- If the developer account is a **new personal account created after November 13, 2023**:
  - run a **closed test**
  - keep **12 opted-in testers**
  - maintain testing for **14 continuous days**
  - apply for production access after meeting the requirement

## Data safety draft

Review and confirm the answers against production behavior before submission.

- Account data:
  - email address used for authentication
- App activity / settings:
  - reminder interval
  - quiet-hours preferences
  - reminder enabled state
  - stretch completion counts and movement history
- Device interaction:
  - notifications for local reminders
- Infrastructure / processors:
  - Supabase Auth
  - Supabase Postgres

## Health apps declaration note

The app includes movement and stretch reminder functionality. Treat it as a
potential wellness-related app and review the Health apps declaration
carefully before certifying the final answers in Play Console.

## Reviewer access

If login is required during review, provide:

- test email
- test password
- short description of the main user flow

## Draft store text

### Thai short description

`เตือนให้ลุก ยืดเส้น และติดตามความสม่ำเสมอในการขยับร่างกายระหว่างวัน`

### English short description

`Timed stretch reminders with simple progress tracking for healthier work days`
