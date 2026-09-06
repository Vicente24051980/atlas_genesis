# ATLAS Ω — CURRENT PORTFOLIO INFORMATION FIREWALL

For the strongest blind-rebuild implementation, the selection worker should not receive the current operational portfolio until its clean result is committed/frozen.

The orchestration layer may know that an operational snapshot exists, but should withhold its names/order/N from the selection context.

After freeze, a separate reconciliation worker/process may compare states.

This prevents accidental anchoring, incumbent defense and N anchoring that prose-only instructions cannot fully eliminate.
