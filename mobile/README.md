# ATLAS Ω Mobile

Platform: Android only
Architecture: Expo / React Native + Expo Router + Expo SQLite + Drizzle ORM
Distribution: EAS internal APK for testing; AAB for Play production

## Current bootstrap

- Expo SDK 57 baseline
- Android-only app config
- dark mobile shell
- local SQLite database in WAL mode
- Drizzle schema foundation
- EAS `preview` profile -> APK
- EAS `production` profile -> AAB

## Local setup

```bash
cd mobile
npm install
npx expo install --fix
npm run typecheck
npm run start
```

## Android preview APK

```bash
npm install -g eas-cli
eas login
cd mobile
eas build:configure
eas build -p android --profile preview
```

## Guardrails

- AI output is not canonical evidence by itself.
- Mobile state changes that affect canonical ATLAS data must be traceable in `audit_log`.
- CORE-00 is frozen and runtime-certified at UO 1.1 RC1 (30/30 physical harness).
- E2E-001 stays above CORE-00.
- Local-first persistence precedes remote sync.

## Next implementation slice

1. Validate Mobile CI with `npx tsc --noEmit` on Node 22.13.0.
2. Build the first Android preview APK through EAS when `EXPO_TOKEN` is available.
3. Connect repository-backed Portfolio, Watchlist, Evidence and AuditLog screens.
4. Keep CORE-00 frozen while integrating E2E-001 above it.

## CI final checkpoint

This branch exists only to expose the Mobile CI run, jobs and logs for the final APK checkpoint. No runtime behavior is changed by this documentation-only marker.
