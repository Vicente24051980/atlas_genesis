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
- CORE-00 stays outside the UI layer and remains frozen at UO 1.1 RC1 until runtime parity is proven.
- E2E-001 stays above CORE-00.
- Local-first persistence precedes remote sync.

## Next implementation slice

1. Generate/bundle Drizzle migrations.
2. Add repository layer for Portfolio, Watchlist, Evidence and AuditLog.
3. Replace static Home cards with navigable screens.
4. Materialize canonical CORE-00 CASE-001..CASE-030 fixtures.
5. Execute runtime suite before connecting E2E-001 to production flows.
