# ATLAS Ω Mobile rebuild trigger

Triggered on 2026-08-23 06:42 CEST after hardening the live backend smoke workflow and separating local production contract validation from authenticated Render certification.

Target branch: main
Target APK workflow: .github/workflows/mobile-ci-eas-apk.yml
Expected workflow: api-unit → typecheck → build release APK → Android launch/navigation gate.

Hard gates preserved:
- No fabricated audit result.
- Trading 212 credentials remain server-side only.
- Live orders remain blocked unless explicitly enabled server-side.
- Render live smoke requires real deploy credentials; absent credentials skip live certification instead of creating false 404 failures.
