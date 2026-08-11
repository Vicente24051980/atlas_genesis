# ATLAS Ω Mobile — App Center OAuth Audit

**Date:** 2026-08-11
**Scope:** determine whether the newly authorized GitHub OAuth app named `App Center` is part of the current ATLAS Ω APK delivery path and whether it can improve Android builds.

## Findings

1. No `appcenter` configuration or source reference was found in the current repository code search.
2. The current certified Android pipeline is already GitHub Actions + Expo/Gradle:
   - `.github/workflows/mobile-ci-eas-apk.yml` validates the live Render backend, runs TypeScript checks, performs `expo prebuild`, builds a release APK locally with Gradle, verifies the production URL embedded in the APK, runs an Android emulator ONLINE gate, and uploads the certified APK artifact.
   - GitHub Actions run `31428127140` passed all four jobs: live backend contract, TypeScript compatibility, production APK build, and Android ONLINE gate.
   - Certified artifact: `atlas-omega-ONLINE-CERTIFIED-PHONE-APK`, artifact id `9078849144`, non-expired at audit time.
3. A separate manual cloud-build path already exists:
   - `.github/workflows/atlas-eas-build-and-release.yml`
   - requires `EXPO_TOKEN`
   - links/validates the EAS project, builds Android using EAS `preview`, downloads the APK and publishes it as both GitHub Actions artifact and GitHub Release.
4. `mobile/eas.json` explicitly configures Android `apk` output for both `preview` and `production`, pointing production builds to `https://atlas-genesis.onrender.com`.
5. `mobile/app.json` declares Expo owner `vbf1980s-team` but does not currently persist an `expo.extra.eas.projectId`; the manual EAS workflow compensates by running `eas init` when needed.

## App Center assessment

If the authorized OAuth application is Microsoft's Visual Studio App Center, it should NOT be added to the APK build path. Microsoft retired App Center Build, Test and Distribution on 2025-03-31. Analytics & Diagnostics were temporarily extended only through 2026-06-30, which is already past as of this audit.

Official retirement reference:
- https://learn.microsoft.com/en-us/appcenter/retirement

Therefore, authorizing the OAuth app does not improve the current ATLAS Ω APK factory. The repository already has a functioning and more appropriate stack:

`GitHub Actions -> live backend gate -> TypeScript -> Expo prebuild -> Gradle APK -> emulator ONLINE certification -> GitHub artifact`

with optional:

`GitHub Actions -> EAS cloud build -> APK -> GitHub Release`

## OAuth identity limitation

The private GitHub OAuth application metadata behind the user's authorization page is not exposed by the available repository connector. The app name alone is not sufficient to cryptographically prove that the OAuth application is Microsoft's retired Visual Studio App Center. The authorization should therefore be treated as unnecessary for ATLAS until its vendor/homepage is confirmed in GitHub's Authorized OAuth Apps UI.

## Recommendation

- Keep the current GitHub Actions/Gradle certified pipeline as PRIMARY APK path.
- Keep EAS as SECONDARY/manual signed cloud-build path.
- Do not modify the repository to depend on App Center.
- If the OAuth authorization was only created to help build ATLAS and is confirmed to be Microsoft's old App Center, it can be revoked without affecting the current APK pipeline.
- Do not revoke it automatically without the user's explicit instruction.
