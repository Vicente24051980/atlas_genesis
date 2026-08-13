# KRONOS MARKET FORECAST Ω — Experimental Integration

Status: `EXPERIMENTAL / NON-CANONICAL / NO DECISION AUTHORITY`

Upstream: `shiyu-coder/Kronos` (MIT)

## Purpose

Integrate Kronos as an isolated market-forecasting signal provider for ATLAS Ω. Kronos may contribute probabilistic market-structure and entry-timing evidence, but it must never emit or override portfolio BUY/SELL decisions, Quality Ω, Valuation Ω, thesis integrity, or fundamental falsifiers.

## Allowed inputs

- OHLC required: `open`, `high`, `low`, `close`
- Optional: `volume`, `amount`
- Timestamp series
- Forecast horizon
- Sampling configuration

## Allowed outputs

ATLAS-normalized forecast metadata and probabilistic signal fields, including expected return/range, downside-tail estimates, dispersion/uncertainty, and directional probabilities when calculated from forecast paths.

## Forbidden authority

Kronos MUST NOT:

- issue standalone BUY or SELL decisions;
- remove a company from the portfolio;
- modify Business Quality, Growth, Moat, Financial Quality, Management or Valuation scores;
- invalidate fundamental evidence or falsifiers;
- silently impute unavailable source data;
- become canonical evidence before ATLAS validation gates are passed.

## Initial validation protocol

1. Start with `Kronos-small`.
2. Test pretrained inference before any fine-tuning.
3. Use walk-forward evaluation with strict train/test chronology.
4. Evaluate separate 5D, 20D and 60D horizons.
5. Benchmark against naive zero-return, simple momentum and simple technical baselines.
6. Measure directional accuracy, rank IC/Spearman IC, calibration, drawdown hit-rate and forecast dispersion.
7. Add transaction costs, slippage, turnover and factor-exposure controls before any alpha claim.
8. Perform explicit leakage checks against Kronos pretraining coverage.
9. Fine-tuning is permitted only after the pretrained model demonstrates incremental value.

## Integration boundary

```text
ATLAS market data
      ↓
KronosMarketForecastRequest
      ↓
Kronos adapter (isolated)
      ↓
Kronos-small / future approved model
      ↓
forecast paths
      ↓
ATLAS-normalized KronosMarketForecastResult
      ↓
Market Structure Ω / Entry Timing Ω / Bottom Score Ω / Money Rotation Ω
```

The downstream ATLAS engines decide how much weight, if any, to give the signal.

## Dependency policy

Kronos model weights must not be committed to Atlas Genesis. Runtime model downloads/storage must be external and version-pinned. The upstream repository is treated as a replaceable dependency, not copied wholesale into ATLAS.

## Promotion gate

This module remains experimental until reproducible out-of-sample validation demonstrates incremental signal after realistic frictions and leakage controls. Promotion to canonical status requires an explicit ATLAS governance decision.
