# ATLAS Ω Mobile rebuild trigger

Triggered on 2026-08-23 01:50 CEST after fixing mobile audit production routing, Trading 212 bridge 404 compatibility, and Render route contract gates.

Target branch: main
Target APK workflow: .github/workflows/mobile-ci-eas-apk.yml
Expected workflow: api-unit → typecheck → build release APK → Android launch/navigation gate.
