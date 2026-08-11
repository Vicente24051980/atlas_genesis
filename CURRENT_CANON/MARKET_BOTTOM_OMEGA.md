# MARKET BOTTOM Ω / STOCK RECOVERY Ω

Status: Canonical higher-layer market/recovery module
Date: 2026-08-11

> This module does **not** modify or expand CORE-00. It operates above the frozen five-engine ingestion pipeline and must consume admissible evidence under existing epistemic governance.

## Mission

Detect probable market and single-stock bottoms through a **sequence of confirmation**, never from one isolated indicator:

`capitulation -> oversold -> divergence -> breadth improvement -> structural break`

The objective is not to predict the exact lowest print. The objective is to identify when selling pressure is exhausted, breadth starts healing and price structure confirms that sellers are losing control.

---

## 1. MARKET BOTTOM Ω — score 0–100

### Components

- **Breadth — 25%**
- **Capitulation / volume — 20%**
- **Divergences — 20%**
- **Price structure — 20%**
- **Volatility / credit / sentiment — 10%**
- **Relative leadership — 5%**

Formula:

`BottomScore = 0.25A + 0.20C + 0.20D + 0.20P + 0.10V + 0.05L`

Where each subscore is normalized to 0–100.

### Operational states

- **0–39 RED** — active downtrend.
- **40–59 WATCH** — oversold / potential bottom.
- **60–69 STARTER** — initial partial entry can be reviewed.
- **70–79 BUY** — bottom supported by multiple layers.
- **80–100 STRONG BOTTOM** — capitulation + breadth + divergence + structural confirmation.

### Hard confirmation gate

`BottomScore >= 75` **without** recovery of the SMA50 **or** a break above the prior reaction high is **not CONFIRMED**.

High score from RSI, VIX or breadth cannot override a still-broken price structure.

---

## 2. Breadth

Track at minimum:

- % constituents above SMA200.
  - <20% = broad weakness.
  - <10% = potential capitulation zone.
  - More reliable when it rebounds from the extreme and recovers 20–30%.
- % constituents above SMA50.
  - <10–15% = severe oversold condition.
  - Improvement when it recovers 20–30%.
- New 52-week lows.
  - Bullish divergence when the index makes a lower low but fewer constituents make new lows.
- Advance/decline line.
  - Bullish divergence when index makes a lower low but A/D makes a higher low.
  - Confirmation when A/D clears its prior reaction high.

Breadth must distinguish a genuine market recovery from a rebound driven only by a small group of mega-caps.

---

## 3. Capitulation and volume

Preferred sequence:

`selling climax -> first rebound -> retest -> equal/higher low -> break of rebound high`

Evidence to track:

- Accelerating decline over several sessions.
- Wide-range bearish candle.
- Volume >1.5–2.0x 20-day average.
- High-volume reversal session.
- Retest with lower selling volume.
- Increasing buy volume during recovery.

One extreme-volume day is insufficient by itself.

---

## 4. Momentum divergences

### RSI14

- <30 = extreme oversold, not an automatic BUY.
- Weekly RSI 30–40 = heavy bearish pressure.
- Bullish divergence = lower price low + higher RSI low.
- Confirmation improves on recovery of RSI 40 and later 50.

### CMO

- Use as confirmation when RSI and CMO reach extremes together.
- Do not use mechanically against a structurally bearish weekly trend.

### MACD

Preferred pattern:

- New price low.
- Less-negative MACD histogram.
- Bullish MACD cross.
- Stronger when the second decline occurs near support with lower selling volume.

Oscillators detect exhaustion; they do not independently confirm a trend reversal.

---

## 5. Price structure

Key confirmation layer:

- Price stops making lower lows and lower highs.
- Double bottom or rounded bottom may form.
- Second low equal to or slightly below first low.
- Higher low develops.
- Price breaks the intermediate reaction high.
- SMA20 and SMA50 are recovered.

Preferred pattern:

`Low 1 -> rebound -> Low 2 -> bullish divergence -> break of intermediate high`

Use support zones rather than exact single-price levels.

---

## 6. Volatility, credit and sentiment

Track:

- VIX spike followed by reversal lower.
- Index makes a lower low while VIX fails to make a higher high.
- Elevated put/call.
- Extreme bearish sentiment surveys.
- Credit spreads stop widening.
- Fund outflows moderate.

A high VIX is not itself a BUY signal. The useful information is whether fear stops worsening while price retests lows.

---

## 7. Relative leadership and rotation

Track relative behavior of:

- Russell 2000 vs S&P 500.
- S&P 500 Equal Weight vs cap-weighted S&P 500.
- Industrials / financials / materials vs broad market.
- Semiconductors vs Nasdaq.
- High yield vs Treasuries.
- Europe / Japan / emerging markets vs United States.

Positive evidence appears when these groups stop falling before the index or begin improving relative strength.

---

## 8. Daily MARKET BOTTOM Ω template

```text
Index:
Drawdown from high:
% above SMA200:
% above SMA50:
New 52-week lows:
Advance/Decline line:
RSI14:
CMO:
MACD histogram:
Relative volume:
VIX + divergence:
Put/call:
Credit spreads:
Russell 2000 vs S&P 500:
Equal Weight vs cap-weighted:
Industrials vs market:
Higher low:
Break of reaction high:
SMA20 recovered:
SMA50 recovered:
BottomScore:
State:
```

---

# STOCK RECOVERY Ω

## Mission

Detect high-quality companies whose share price has suffered a major drawdown but whose business has not structurally broken, and identify the transition from falling knife to defensible recovery.

## Base discovery filter

Preferred configuration:

- **Quality Ω >= 85**.
- Prior drawdown approximately **20–60%**.
- Profitable business.
- Positive FCF.
- Healthy/stable ROIC.
- Business thesis structurally intact.
- Price stops making new lows.
- BottomScore >=60.
- 1M return positive.
- 3M trend improving, preferably positive.
- Preferably 6M turning positive later in confirmation.
- SMA50 recovered.
- Selling volume declining on retest.
- Relative strength stops deteriorating.

### Industrial-specific fundamental gates

For industrial companies additionally review:

- Stable ROIC.
- Positive FCF.
- Net debt / EBITDA <3x, unless sector economics justify otherwise.
- Backlog not deteriorating.
- EPS revisions stabilizing.
- Weekly support respected.
- Relative strength improving vs XLI.

Preferred industrial configuration:

`fundamental quality intact + decline into support + capitulation + bullish divergence + retest on lower volume + break of intermediate high + rising relative strength vs XLI`

---

## Hard gates / anti-false-positive rules

- RSI <30 alone = **NO BUY**.
- High VIX alone = **NO BUY**.
- One capitulation day alone = **NO BUY**.
- Large drawdown alone = **NO BUY**.
- BottomScore without price confirmation = **not confirmed**.
- For individual stocks, broken business / negative structural FCF / thesis falsifier overrides technical recovery.
- Technical recovery must never convert a structurally impaired business into a quality recovery candidate.

---

## Integration with ATLAS Ω

The canonical cross-check is:

`QUALITY Ω × MARKET BOTTOM Ω × STOCK RECOVERY Ω × GREEN CONTINUITY Ω × ENTRY TIMING Ω`

Interpretation:

- **QUALITY Ω** asks whether the business deserves capital.
- **MARKET BOTTOM Ω** asks whether the broad market/sector is stabilizing.
- **STOCK RECOVERY Ω** asks whether the individual equity is transitioning from decline to recovery.
- **GREEN CONTINUITY Ω** validates multihorizon price continuity.
- **ENTRY TIMING Ω / NO-CHASE** prevents buying an already-extended recovery.

The modules remain logically independent. A strong result in one module cannot silently override a hard failure in another.

---

## Master recovery rule

> The best recovery BUY is not the stock with the lowest RSI. It is the highest-quality company whose price stops falling before its sector while the underlying business never broke.

---

## Evidence governance

All live scores must record timestamp, universe/index definition, source, calculation method and missing-data flags. If a metric cannot be measured consistently, it must be marked `UNKNOWN`; it must not be replaced with invented precision.
