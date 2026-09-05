# ATLAS Ω Mobile rebuild trigger

Triggered on 2026-09-05 by explicit user request to launch a fresh certified APK from current `main`.

Target branch: main
Target APK workflow: .github/workflows/mobile-ci-eas-apk.yml
Expected workflow: api-unit → typecheck → build release APK → Android launch/navigation gate → certified release workflow.

Launch scope:
- Full mobile clean rebuild from current main.
- Mobile audit endpoint certification.
- Trading 212 bridge compatibility checks.
- CAPEX, screener, deployment, and entrypoint tests.
- Exact-SHA live Render backend certification before GitHub Release publication.

Hard gates preserved:
- No fabricated audit result.
- Trading 212 credentials remain server-side only.
- Live orders remain blocked unless explicitly enabled server-side.
- Provider/API secrets must not be embedded in the APK.
- APK is publishable only after backend tests, TypeScript, release build, emulator launch/navigation and exact-SHA backend certification pass.
