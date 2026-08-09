# AGENTIC SECURITY DISCOVERY Ω v1.0

Status: candidate canonical discovery motor
Date: 2026-08-09
Scope: discovery only; it never emits BUY/SELL.

## Mission

Detect listed companies exposed to the emerging security layer created by autonomous/agentic AI before the theme becomes consensus. The motor is independent from portfolio membership, watchlists, preferred sectors and the ATLAS quality score.

## Canonical order

GLOBAL DISCOVERY → AGENTIC SECURITY Ω → MARKET FILTERS → BUSINESS QUALITY Ω → GROWTH Ω → CAPEX PRODUCTIVITY Ω → VALUATION Ω → RISK Ω → CATALYSTS Ω → FINAL SCORE Ω.

Agentic Security Ω can only promote a candidate to the ATLAS full scorer. It cannot bypass valuation, quality or falsifiers.

## Seed profiles

The initial similarity anchors are PANW, NET, CRWD, OKTA and ZS. Seeds are heuristic capability profiles, not certified investments and not automatic BUYs.

## Capability dimensions

1. Direct Agentic Security — 25%
2. Agent / non-human identity — 15%
3. Runtime and tool-access control — 15%
4. Zero Trust / network egress — 10%
5. Data and model protection — 10%
6. Secrets / privileged access — 10%
7. AI gateway / prompt-injection security — 10%
8. Agent observability — 5%

## Evidence rules

Primary evidence dominates. Repeated marketing language must not manufacture a high score. Candidates without primary evidence receive a penalty and cannot reach DISCOVER. A direct agentic-security claim without breadth across adjacent control planes is insufficient on its own.

Evidence classes:
- PRIMARY: issuer IR, filings, official product/security documentation.
- SECONDARY: reputable independent reporting/research.
- UNVERIFIED: claims not independently established.

## Scoring

Discovery score 0–100:
- capability score: 55%
- nearest-seed cosine similarity: 20%
- evidence quality: 15%
- commercial traction: 5%
- enterprise distribution strength: 5%

Penalties:
- no primary evidence: -15
- fewer than two meaningful agentic-security dimensions: -15
- no direct agentic-product evidence: -5
- not listed: reject

## States

- DISCOVER: score >=70, at least 3 meaningful dimensions and primary evidence. Route to ATLAS_FULL_SCORER.
- WATCH: score >=50 and at least 2 meaningful dimensions. Route to RESEARCH_QUEUE.
- REJECT: insufficient structural fit or non-listed.
- INSUFFICIENT_EVIDENCE: evidence is missing or too weak.

## Anti-bias rules

- Never award points because a ticker is already in Portfolio/Watchlist.
- Never require membership in cybersecurity sector classifications.
- Never prefer US companies by construction.
- Search capability signals first, then identify/normalize ticker.
- Seed similarity is only 20% of score, preventing clones of the initial five from monopolizing discovery.
- No BUY/SELL output exists in this engine.

## Falsification / downgrade signals

- Agentic-security product remains marketing-only with no production evidence.
- Product lacks real enforcement and is limited to dashboards/advisory output.
- No identity/tool/runtime isolation despite agent claims.
- Material security incidents contradict claimed control capability.
- Commercial traction fails to emerge while competitors demonstrate adoption.
- Acquired capability is not integrated into the platform.

## Implementation

`mobile/domain/agenticSecurityDiscovery.ts`

Exports:
- `AGENTIC_SECURITY_SEEDS`
- `evaluateAgenticSecurityCandidate()`
- `rankAgenticSecurityCandidates()`
- `agenticSecurityDiscoveryContractCheck()`

The engine consumes evidence bundles from the existing data/evidence pipeline. It extracts capability signals, ranks candidates by structural fit and routes only DISCOVER candidates into the complete ATLAS Ω scoring process.
