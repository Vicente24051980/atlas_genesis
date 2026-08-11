# MARKET BOTTOM DETECTION Ω / BOTTOM SCORE Ω

Status: **canonical module — v1**  
Date: **2026-08-11**

## Mission

Detect a possible market or ticker bottom through a confirmation sequence, never through a single oscillator:

**capitulation → oversold exhaustion → divergence → breadth improvement → structural breakout**

The engine does not issue an autonomous BUY. It creates a bottom/recovery state that must be crossed with **QUALITY Ω / thesis integrity / ENTRY TIMING Ω**.

## Drawdown Gate

The engine is context-aware. A low BottomScore near all-time highs does not mean a bearish trend; it can simply mean there is no bottom event to detect.

| Drawdown from relevant peak | Gate |
|---:|---|
| < 5% | DORMANT / NO BOTTOM EVENT |
| 5–10% | WATCH |
| 10–20% | CORRECTION MODE |
| ≥ 20% | BEAR / FULL BOTTOM DETECTION |

## Score

```text
BottomScore =
0.25 * Breadth
+ 0.20 * CapitulationVolume
+ 0.20 * Divergences
+ 0.15 * PriceStructure
+ 0.10 * VolatilitySentiment
+ 0.10 * LeadershipRotation
```

Every component is normalized to **0–100**.

### Components

**Breadth — 25%**
- % stocks above SMA200 and SMA50.
- 52-week new lows.
- Advance/decline line.
- Breadth thrusts.
- 90% downside/upside days.
- NYSE up/down volume.
- McClellan Oscillator/Summation when reliable data is available.

**Capitulation / Volume — 20%**
- Accelerating multi-session selloff.
- Wide-range bearish candle.
- Volume around 1.5–2x 20-day average or stronger.
- High-volume reversal.
- Retest with less selling volume.
- Rising buying volume during recovery.

**Divergences — 20%**
- Price makes a lower low while RSI makes a higher low.
- MACD histogram becomes less negative.
- Index makes a new low while fewer stocks make 52-week lows.
- Price makes a new low while VIX/credit stress fails to confirm.

**Price Structure — 15%**
- Stops printing lower highs/lower lows.
- Double bottom or rounded base.
- Higher low.
- Break of the reaction high.
- Recovery of SMA20 and SMA50.

**Volatility / Sentiment — 10%**
- VIX spike and subsequent reversal.
- VIX non-confirmation on a new price low.
- Put/call stress.
- Credit spreads stabilizing.
- VIX term structure / VVIX where available.

**Leadership / Rotation — 10%**
- Russell 2000 vs S&P 500.
- S&P Equal Weight vs cap-weighted S&P 500.
- Industrials, financials and materials vs market.
- Semiconductors vs Nasdaq.
- High yield vs Treasuries / HYG-LQD.
- Europe, Japan and emerging markets vs US where useful.

## Score states

| Score | State | Interpretation |
|---:|---|---|
| 0–39 | BEAR TREND ACTIVE | no bottom confirmation |
| 40–59 | WATCH | possible exhaustion, insufficient confirmation |
| 60–74 | TACTICAL BOTTOM | partial entry may be eligible after ATLAS cross |
| 75–100 | CONFIRMED BOTTOM | multi-layer bottom candidate after ATLAS cross |

## Data coverage guardrail

Missing data is **not** silently imputed as bullish or bearish.

- The API reports total component coverage.
- Minimum coverage to emit TACTICAL or CONFIRMED states: **75% of score weight**.
- Below that threshold the state is `INSUFFICIENT_COVERAGE`.
- `availableScore` is informational only; canonical `score` only includes observed weighted points.

This prevents two strong indicators from masquerading as a full six-layer confirmation.

## Synthetic canonical examples

These examples demonstrate engine behavior. They are **not claims about current market data**.

### Example A — Near ATH / no bottom event

```text
Drawdown: -2.1%
Breadth: 58
Capitulation: 10
Divergences: 35
Price structure: 72
Volatility/sentiment: 45
Leadership/rotation: 62

Gate: DORMANT_NO_BOTTOM_EVENT
State: DORMANT
Action: NONE
```

A weak capitulation score here does not mean bearishness; there is simply no material drawdown requiring a bottom detector.

### Example B — False bottom

```text
Drawdown: -14.0%
Breadth: 25
Capitulation: 70
Divergences: 45
Price structure: 20
Volatility/sentiment: 70
Leadership/rotation: 20

BottomScore: 41.3
State: WATCH
```

Interpretation: strong fear/selling climax, but breadth, leadership and price structure do not confirm. **No BUY from RSI or volume alone.**

### Example C — Tactical bottom

```text
Drawdown: -17.5%
Breadth: 65
Capitulation: 80
Divergences: 75
Price structure: 58
Volatility/sentiment: 72
Leadership/rotation: 60

BottomScore: 69.2
State: TACTICAL_BOTTOM
```

Interpretation: capitulation and divergences are credible, breadth is improving, structure is not yet fully mature. Partial entry can only be considered after quality/thesis and timing checks.

### Example D — Confirmed multi-layer bottom

```text
Drawdown: -23.0%
Breadth: 82
Capitulation: 88
Divergences: 84
Price structure: 80
Volatility/sentiment: 76
Leadership/rotation: 78

BottomScore: 82.3
State: CONFIRMED_BOTTOM
```

Interpretation: breadth thrust, exhaustion, divergences, higher low and reaction-high breakout align across layers.

### Example E — Quality industrial recovery

```text
Drawdown: -31.0%
Breadth: 70
Capitulation: 75
Divergences: 82
Price structure: 77
Volatility/sentiment: 65
Leadership/rotation: 84

BottomScore: 75.4
State: CONFIRMED_BOTTOM
```

For an industrial ticker, the score is insufficient by itself. Require an additional fundamental gate:

- ROIC stable.
- FCF positive.
- Net debt / EBITDA < 3x.
- Backlog not deteriorating.
- EPS revisions stabilizing.
- Weekly support respected.
- Selling volume declining on retest.
- Relative strength vs XLI improving.
- SMA20/SMA50 recovery.

Preferred setup:

**quality intact + deep drawdown + capitulation + bullish divergence + lower-volume retest + reaction-high breakout + improving RS vs XLI**

## API implementation

Implemented in `api/bottom_score.py` and registered in `api/app.py`.

### POST `/v1/atlas/bottom-score`

Example request:

```json
{
  "label": "S&P 500",
  "drawdown_pct": -17.5,
  "components": {
    "breadth": 65,
    "capitulation": 80,
    "divergences": 75,
    "price_structure": 58,
    "volatility_sentiment": 72,
    "leadership_rotation": 60
  },
  "evidence": {
    "breadth_source": "provider/reference",
    "notes": "example only"
  }
}
```

### GET `/v1/atlas/bottom-score/examples`

Returns the five synthetic canonical scenarios with computed states.

### GET `/v1/atlas/bottom-score/methodology`

Returns weights, score bands, drawdown gates, minimum coverage and guardrail.

## Integration with other ATLAS Ω engines

Two distinct entry paths remain separate:

```text
Momentum / continuity:
QUALITY Ω
→ GREEN CONTINUITY Ω
→ ENTRY TIMING Ω

Recovery / bottom:
QUALITY Ω
→ DRAWDOWN
→ BOTTOM SCORE Ω
→ RECOVERY INFLECTION Ω
→ ENTRY TIMING Ω
```

A recovering company should not be forced to pass GREEN CONTINUITY 5/5 before the recovery engine is allowed to identify it.

## Non-negotiable guardrails

1. RSI < 30 is never a standalone BUY.
2. A high VIX is never a standalone BUY.
3. One capitulation day is not a confirmed bottom.
4. Missing layers cannot be fabricated or silently filled.
5. A BottomScore does not repair a broken business thesis.
6. TACTICAL / CONFIRMED must still pass ENTRY TIMING Ω.
7. For new US-stock purchases, OPENING GATE 15M remains authoritative.
