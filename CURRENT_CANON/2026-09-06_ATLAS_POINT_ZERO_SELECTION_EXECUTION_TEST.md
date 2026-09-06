# ATLAS Ω — SELECTION / EXECUTION SEPARATION TEST

Clean selector output must not change when tax, turnover, entry timing, broker, position size or replacement-hysteresis inputs change.

Those fields may change a downstream execution plan only.

The clean selector emits neither target weights nor entry timing.
