# CAPITAL INTELLIGENCE Ω — Innovation Public-Copy Backtest v2

**Date:** 2026-09-06  
**Status:** COMPLETED PILOT / HOMOGENEOUS PRICE SOURCE  
**Purpose:** Re-run the Innovation public-copy pilot using one homogeneous daily OHLCV source (Tiingo via LONA), authority-blind equal weighting, and an execution date strictly after public attribution.

## Cohort
Innovation-confirmed names used in the public attribution cohort:
- NVDA
- TSM
- ASML
- NOW
- RXRX
- AUR
- PONY
- TEM

Benchmark: QQQ.

## Timing law
Public attribution date used by the prior pilot: 2025-05-23.
The first intended post-publication trading date was 2025-05-27, but the backtest engine's actual first filled close was **2025-05-28**. This actual execution date is canonical for v2.

`SIGNAL_DATE != EXECUTION_DATE`

`EXECUTION_DATE = first actual fill produced by the point-in-time backtest engine`

## Method
- Daily OHLCV source: TIINGO through LONA Trading Assistant.
- Start request: 2025-05-27.
- Actual fills: 2025-05-28.
- End date: 2026-09-04.
- Portfolio: equal-weight buy-and-hold across the 8 Innovation names.
- Benchmark: standalone QQQ buy-and-hold on identical requested dates.
- Commission: 0 for signal-isolation pilot.
- Leverage: 1x.
- No authority/allocator score enters position sizing.

## Results
### Innovation basket
- Final portfolio value from $100,000: **$123,427.49**
- Total return: **+23.43%**
- CAGR: **17.98%**
- Maximum drawdown: **26.47%**
- Annualized volatility: **33.24%**
- Annualized Sharpe reported by engine: **1.14**
- Sortino: **0.90**

### QQQ benchmark
- Final portfolio value from $100,000: **$136,746.74**
- Total return: **+36.75%**
- CAGR: **27.87%**
- Maximum drawdown: **11.45%**
- Annualized volatility: **17.43%**

### Relative outcome
- Innovation minus QQQ total-return spread: **-13.32 percentage points**.
- Innovation maximum drawdown exceeds QQQ by **15.02 percentage points**.
- Innovation annualized volatility is approximately **1.91x** QQQ's in this window.

## Interpretation
This homogeneous-source rerun confirms the earlier qualitative conclusion and strengthens it:

`INNOVATION_PUBLIC_COPY_ALPHA = NOT_DEMONSTRATED_V2`

The public-copy basket underperformed QQQ materially while taking substantially more drawdown and volatility.

This does **not** prove that the underlying private Innovation strategy lacked alpha. The test measures only whether an outside investor copying the publicly identifiable cohort after it became observable would have earned excess return.

## Governance consequence
- `INNOVATION_PROCESS_PERSISTENCE = DISTINCTIVE_CANDIDATE` may remain true.
- `INNOVATION_PUBLIC_COPY_ALPHA = NOT_DEMONSTRATED_V2` is separately true.
- Persistence is not promoted into a BUY signal.
- CAPITAL INTELLIGENCE remains corroborative only and contributes 0 direct score points.

## Reproducibility references
LONA reports:
- Innovation basket report: `f819b930-030c-45b5-8f1d-2981b5c9b1f2`
- QQQ report: `d102d1b7-fc98-4030-a94e-118d80bd4531`

Strategy:
- `ATLAS Ω Authority-Blind Baseline` — strategy id `c40f7e6e-9e46-4528-adcd-0f970dd93d40`

## Next gate
Build the same point-in-time price panel for every eligible manager-aggregate 13F event, using each filing acceptance/publication date and first actual executable fill. Compare:
1. MANAGER_AGGREGATE_PUBLIC_COPY
2. INNOVATION_PUBLIC_COPY
3. INTERSECTION_PUBLIC_COPY
4. QQQ / SPY / sector benchmark as preregistered per cohort

No aggregate-alpha claim is allowed before this full event population is complete.
