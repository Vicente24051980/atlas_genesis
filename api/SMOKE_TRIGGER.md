# ATLAS Live Backend Smoke Trigger

Triggered on 2026-08-23 06:48 CEST to run the current hardened `mobile-live-backend-smoke.yml` workflow, not the obsolete failed rerun attempt 32606342922.

Expected behavior:
- local production route contract must pass;
- authenticated Render deploy runs only when Render credentials are configured;
- absent Render credentials skip live smoke instead of failing with false 404 probes.
