# ATLAS Ω final ONLINE phone certification

This checkpoint triggers the consolidated production pipeline from current `main`.

The APK may be delivered only if all of these pass in the same run:

- LIVE Render API contract at `https://atlas-genesis.onrender.com`.
- Local ATLAS/Broker guardrails.
- TypeScript.
- Android release build with the production URL embedded.
- Android emulator showing `ONLINE` and `ATLAS + FINNHUB + MARKET` against the real deployed backend.
