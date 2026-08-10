# CONSPIRACIONES ATLAS Ω — Economist / Phoenix — estado de implementación

**Fecha:** 2026-08-10  
**Tipo:** información de repositorio / historial técnico.  
**Objetivo:** preservar qué se implementó, dónde quedó y qué debe considerarse antes de tocar el código en el futuro.

---

## Implementación original

Rama histórica:

`feat/conspiraciones-atlas-phoenix-2026`

Pull request:

`#25 — feat: Conspiraciones Atlas Ω Economist/Phoenix engine`

La implementación original añadió:

- `Narrative Saturation Ω` determinista 0–100.
- Clasificación de portadas: `PREDICTIVE / CONTRARIAN / SATURATION / NULL`.
- Estado `PENDING_OUTCOME` antes del cierre de ventanas prospectivas.
- Checks anti-lookahead para fechas de portada, métricas y outcomes.
- Clasificador cross-asset con régimen `RESERVE_ARCHITECTURE_STRESS` para `USD↓ + gold↑ + UST yields↑`.
- `Phoenix 2026 Ω` con baseline congelado.
- Pesos explícitos por señal y deduplicación causal.
- Exclusión explícita del eclipse del 12-ago-2026 con peso cero.
- Schema de dataset para estudiar aproximadamente 2.080 ediciones 1986–2026.
- Matched-control event-study primitives.
- Routing hacia `CONSPIRACIONES_ATLAS`, `NARRATIVE_SATURATION_OMEGA`, `PHOENIX_2026_MONITOR_OMEGA`, `MONEY_ROTATION_OMEGA` y `HISTORICAL_DISLOCATION_OMEGA`.
- Regla de seguridad: el motor de investigación no emite BUY/SELL.

Archivos históricos principales de esa rama:

- `docs/canon/CONSPIRACIONES_ATLAS_ECONOMIST_PHOENIX_OMEGA_v1.md`
- `mobile/domain/conspiracionesAtlasEconomist.ts`
- `src/atlas/algorithm/conspiraciones-atlas-economist-omega.ts`
- cambios de routing en Evidence Ingestion / tipos / pipeline.

---

## Baseline Phoenix 2026 original

- Portada: `The Global Currency Beef`.
- Fecha portada: `2026-08-08`.
- Baseline congelado: `2026-08-09`.
- Regla: **No moving goalposts / no retrospective reinterpretation.**
- Sólo observaciones `FACT` con evidencia trazable puntúan.
- Señales causales duplicadas cuentan una vez.
- BRICS local rails / monedas locales: contexto de fragmentación, no confirmación Phoenix.
- Eclipse y simbolismo social 12-ago-2026: excluidos, score 0.

Señales monitorizadas:

1. repetición de `USD↓ + gold↑ + UST yields↑`;
2. cuota de reservas USD <55% por reasignación real;
3. aumento material de RMB en reservas;
4. compras elevadas de oro por bancos centrales;
5. unidad monetaria común BRICS formal;
6. migración material de contratos energéticos fuera del USD;
7. expansión extraordinaria del SDR;
8. uso privado/minorista del SDR;
9. unidad monetaria transnacional de uso comercial;
10. BRICS local rails only = contexto, peso 0;
11. eclipse 12-ago = excluido, peso 0.

---

## Validación obtenida en la rama histórica

Durante el PR #25 se observó:

- `API Syntax & Broker Guardrail Verification`: PASS.
- `TypeScript Check & Schema Verification`: PASS.
- Build Android Candidate APK llegó a ejecutarse después de esos gates.

El PR #25 quedó inicialmente listo para review.

---

## Estado actual respecto a `main`

Desde entonces `main` avanzó mediante múltiples PRs y releases (Mobile v2, Energy Rotation Ω, AI Infrastructure Rotation Ω, nuevas correcciones móviles, etc.).

Por ello, a fecha 2026-08-10:

- PR #25 sigue **abierto**.
- No está fusionado.
- Aparece como no mergeable frente al `main` actual debido a divergencia/conflictos posteriores.

### Regla de seguridad de repositorio

**No fusionar PR #25 wholesale sobre el `main` actual sin reconciliación.**

Si se desea activar ese motor en el producto vigente:

1. partir del `main` actual;
2. extraer sólo los archivos/lógica de Conspiraciones Atlas / Narrative Saturation / Phoenix que sigan siendo necesarios;
3. reconciliar IDs y routing con los motores actuales;
4. mantener Evidence Integrity Ω;
5. ejecutar typecheck, tests, API gates, APK y emulator gate;
6. abrir un PR limpio y pequeño.

El documento completo de investigación se conserva en:

`docs/research/CONSPIRACIONES_ATLAS_ECONOMIST_DINERO_PODER_1986_2026_FULL.md`

Éste es el archivo informativo persistente y no depende de que la rama histórica permanezca mergeable.
