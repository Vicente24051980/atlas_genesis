# ATLAS Ω Earnings Learning System — Recovered Design

## RFC-PEV-001 — Post-Earnings Validation Ω

Purpose: measure whether the market validates and retains a fundamental improvement after results.

Canonical flow:

Results → Guidance → Reaction → Persistence.

### PEV score — 0 to 100

- EPS Surprise Ω — 15%
- Revenue Surprise Ω — 15%
- Guidance Revision Ω — 25%
- Earnings Reaction Ω — 15%
- Gap Retention Ω — 20%
- Estimate Revisions Ω — 10%

### Gap Retention Ω

Measures how much of the initial post-earnings repricing survives after roughly 5–10 sessions.

Example used in the thread: Coca-Cola.

- Pre-report close: 84.07
- Post-report close: 88.27
- Subsequent high: 89.08
- Later close: 87.03

Initial jump ≈ +5.0%. Retained gain ≈ +3.52%. Retention ≈ 70%.

Interpretation: the market did not merely react intraday; a meaningful portion of the repricing survived.

### Fundamental Confirmation Gate Ω

PEV can be considered confirmed only when at least two of these are true:

1. EPS > consensus.
2. Revenue > consensus.
3. Guidance maintained or raised.
4. Post-report estimates do not deteriorate.

If this gate fails, post-earnings price action is classified as market movement, not fundamental evidence.

### Earnings Quality Signal Ω

- A+ — Structural Beat
- A — Confirmed Beat
- B — Beat not confirmed
- C — Neutral
- D — Warning
- F — Structural deterioration

The Coca-Cola example was provisionally categorized as `A — Confirmed Beat` using the data supplied in-thread.

---

## RFC-PEA-001 — Pre-Earnings Anticipation Ω

Purpose: estimate whether evidence available before earnings points toward positive or negative surprise. It is not designed to “guess” the earnings result.

### PEA score — 0 to 100

- Estimate Revisions Ω — 20%
- Guidance Drift Ω — 15%
- Peer Read-Through Ω — 15%
- Demand / Backlog Ω — 15%
- Margin Setup Ω — 10%
- Relative Strength Ω — 10%
- Options / Expectations Ω — 5%
- Management Credibility Ω — 10%

### Key signals emphasized in the thread

1. Estimate revisions.
2. Peer read-through.
3. Guidance consistency.

### Evidence Gate Ω

PEA cannot exceed 85/100 unless at least three independent signals are aligned. Price strength by itself is never enough.

### Expectations Gap Ω

Strong company performance does not automatically imply a favorable earnings trade. ATLAS must compare fundamental improvement against expectations already embedded in price/consensus.

Concept:

`Expectations Gap Ω = fundamental improvement - expectations already discounted`

A business can produce excellent numbers and still fall if expectations were higher.

### Earnings Opportunity Ω

Before earnings:

`PEA Ω + Expectations Gap Ω + Valuation Ω → Earnings Opportunity Ω`

Possible tactical outputs:

- Anticipatory buy
- Wait for results
- Buy post-beat
- Avoid
- Reduce risk

These tactical outputs do not supersede the long-term thesis/falsifier framework.

---

## Learning Loop Ω

Every earnings cycle should store:

PEA before → actual result → PEV after → model error.

Over time, the model should learn company-specific tendencies:

- conservative vs aggressive guidance;
- beat frequency and magnitude;
- estimate-revision behavior;
- sell-the-news patterns;
- gap retention;
- post-report reversals;
- management calibration quality.

### Calibration rule

ATLAS should record not only wins, but prediction probabilities and errors. A model that archives only correct calls will become falsely confident.

Suggested fields:

- prediction
- probability
- evidence set
- falsifier
- horizon
- actual result
- calibration error
- postmortem
- model adjustment

This turns earnings analysis into a cumulative learning system rather than a sequence of isolated calls.
