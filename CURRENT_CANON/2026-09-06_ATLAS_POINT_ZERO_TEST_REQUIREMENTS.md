# ATLAS Ω — POINT ZERO TEST REQUIREMENTS

The canonical test suite should prove at least:

1. **Ownership invariance** — changing invested EUR, current weight, P/L, average cost and held status does not alter clean selection.
2. **Incumbency invariance** — toggling prior membership does not alter clean ranking.
3. **Duplicate invariance** — repeating an entity in raw input does not increase its score or chance of admission after deduplication.
4. **Market-cap invariance** — changing market cap alone does not create selection advantage.
5. **Fixed-N rejection** — no test encodes 20, 25, 27, 29, 30, 32, 35, 37 or 50 as a required target/floor/ceiling.
6. **Endogenous stop** — selection stops when N+1 fails marginal portfolio utility.
7. **Full-universe expansion** — if every additional eligible candidate materially improves utility, N may expand until the eligible universe is exhausted.
8. **Hard-gate supremacy** — arbitrarily high expected return cannot bypass a failed hard gate or falsifier veto.
9. **No aesthetic diversification route** — sector/geography/factor variety alone cannot admit a ticker.
10. **Real risk authority** — correlated financing/geopolitical/factor risk can affect utility when modeled as risk.
11. **Selection/execution separation** — clean selection emits neither target weights nor entry timing and ignores replacement friction.
12. **Unknown discipline** — missing required material data cannot be silently imputed as verified fact.

Legacy tests asserting fixed 20–35 or incumbent tie priority are historical and must not define current canonical behavior.
