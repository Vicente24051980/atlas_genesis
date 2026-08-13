# KRONOS MARKET FORECAST Ω — Experimental Integration

Status: `EXPERIMENTAL / NON-CANONICAL / NO DECISION AUTHORITY`

Upstream: `shiyu-coder/Kronos` (MIT)
Pinned upstream commit: `67b630e67f6a18c9e9be918d9b4337c960db1e9a`

## Purpose

Integrate Kronos as an isolated market-forecasting signal provider for ATLAS Ω. Kronos may contribute probabilistic market-structure and entry-timing evidence, but it must never emit or override portfolio BUY/SELL decisions, Quality Ω, Valuation Ω, thesis integrity, or fundamental falsifiers.

## Runtime architecture

The core FastAPI backend does not import PyTorch or download model weights at startup. `api/kronos_adapter.py` lazy-loads the upstream Kronos classes only when `/v1/atlas/kronos/predict` is called and the runtime has explicitly opted in.

Runtime controls:

- `ATLAS_KRONOS_ENABLED=true` — explicit inference opt-in. Default is false.
- `KRONOS_SOURCE_PATH=/opt/kronos` — checkout of the pinned upstream source.
- `KRONOS_MODEL_ID=NeoQuasar/Kronos-small` — configured predictor model.
- `KRONOS_TOKENIZER_ID=NeoQuasar/Kronos-Tokenizer-base` — configured tokenizer.
- `KRONOS_DEVICE=cpu|cuda:0|...` — runtime device.
- `api/requirements-kronos.txt` — optional heavy dependencies, isolated from the normal API requirements.
- `scripts/bootstrap_kronos.sh` — checks out the pinned upstream commit; it does not commit or vendor model weights.

## API surface

- `GET /v1/atlas/kronos/manifest` — immutable integration contract and guardrails.
- `GET /v1/atlas/kronos/status` — runtime availability without loading model weights.
- `POST /v1/atlas/kronos/validate` — validates OHLC and timestamp contract without inference.
- `POST /v1/atlas/kronos/predict` — guarded lazy inference using the configured Kronos-small runtime.

## Allowed inputs

- OHLC required: `open`, `high`, `low`, `close`
- Optional: `volume`, `amount`
- Strictly increasing, unique timestamp series
- Forecast horizon: 5D, 20D or 60D
- Sampling configuration
- Lookback: 32–512 bars

## Allowed outputs

ATLAS-normalized forecast metadata and raw predicted bars. The adapter currently exposes terminal predicted close and predicted close-change metadata. These are experimental signals, not portfolio instructions.

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
KronosSmallAdapter (isolated / lazy)
      ↓
Pinned upstream Kronos source
      ↓
Kronos-small + tokenizer
      ↓
forecast paths
      ↓
ATLAS-normalized KronosMarketForecastResult
      ↓
Market Structure Ω / Entry Timing Ω / Bottom Score Ω / Money Rotation Ω
```

The downstream ATLAS engines decide how much weight, if any, to give the signal.

## Dependency policy

Kronos model weights must not be committed to Atlas Genesis. Runtime model downloads/storage remain external. The upstream source is pinned for reproducibility and treated as a replaceable dependency, not copied wholesale into ATLAS.

## Promotion gate

This module remains experimental until reproducible out-of-sample validation demonstrates incremental signal after realistic frictions and leakage controls. Promotion to canonical status requires an explicit ATLAS governance decision.
