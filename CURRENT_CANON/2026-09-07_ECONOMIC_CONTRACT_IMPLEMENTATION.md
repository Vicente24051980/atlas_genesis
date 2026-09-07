# ATLAS Ω — Economic contract implementation

Date: 2026-09-07. Authorization: Vicente's explicit implementation request following audit #184/#185. Tracking: #186.

This record authorizes the software contracts below inside E1–E6. It does not authorize capital orders, admit caller assertions as facts, or promote economic calibration.

## Executable mapping

| Host | Function | Integration | Status |
|---|---|---|---|
| E1/E2 | calculateScenarioOwnerReturn | expectedReturnPct and canonical structural publication | IMPLEMENTED, conditional on supplied assumptions |
| E3 | evaluateNetRotationAdvantage | evaluateReplacementV2 | IMPLEMENTED; permission to execute remains separate |
| E4/E5 | evaluateAiExposureControl | canonical structural publication and net rotation | IMPLEMENTED, evidence consuming |
| E2 | validateMeasuredCovariance / measuredPortfolioRisk | structural publication and shadow sizing | IMPLEMENTED, dimensional calculation |
| E4 | calculateShadowCovarianceSizing | E4 research sizing callable | IMPLEMENTED / SHADOW_ONLY |
| E6 | auditSmallUniverseSearchGap | bounded exhaustive comparison to existing selector | IMPLEMENTED / EVALUATION_ONLY |

No new canonical engine is created. R0 cannot authorize these calculations as capital decisions. The six-engine architecture remains unchanged.

## Return semantics

The scenario model requires entity, price per share, common currency, an integer 3–6 year horizon, source/version/publication/availability/expiry and exactly BEAR, BASE and BULL probabilities summing to one.

Each year contains revenue, normalized net margin, owner-earnings conversion, diluted shares and cash dividends per share. Terminal price is terminal normalized owner earnings per share times the explicit terminal multiple. Dividends are counted once and held as cash at zero reinvestment return. Share repurchases and dilution enter through share counts only; there is no second buyback-yield bonus.

The implementation reports separately:

- each scenario's annualized terminal-wealth return;
- probability-weighted annualized return, used by the selector;
- annualized return of probability-weighted terminal wealth, not confused with the preceding quantity;
- terminal-multiple sensitivity at 0.8x/1.0x/1.2x, a disclosed sensitivity grid, not a probability distribution.

This v1 covers nonnegative normalized earnings and internally covered dividends. Negative normalized margins, externally financed dividends, liquidation recoveries other than a zero terminal value, complex financing or incompatible security bases require a different explicit method; do not force them into this model. Price and all per-share projections must use the same security/share basis. Source fields establish traceability and temporal checks, not source authenticity or truth of a forward assumption. E1 admission is still required upstream.

The old additive bridge remains available to research/legacy callers. When scenarioReturn is present, its calculated expected CAGR replaces the bridge, without summing both. A mismatched/invalid scenario returns EVIDENCE_PENDING. Canonical publication requires comparable scenario models at one asOf, currency and horizon; old additive fields alone cannot pass publication.

## Net rotation semantics

The existing replacement helper still requires a positive portfolio-utility comparison above the applicable hysteresis threshold. It now additionally requires matching scenario models and the net-rotation context; absence fails closed.

Compare expected terminal wealth in one currency and horizon. Upfront transaction, spread, tax, financing and implementation costs reduce reinvestable sale proceeds; explicit uncertainty and lost-optionality reserves are subtracted at the terminal horizon. Require a strictly positive difference. Costs of zero must be explicit, not a missing field silently replaced by zero. The calculation assumes sale proceeds fund the rotation; asynchronous settlement, tax timing, specific lots and liquidity require upstream estimates/controls appropriate to the actual order.

Broker context requires a dated RECONCILED snapshot, adequate incumbent market value, cash and matching currency. AI control must use the same decision ID/asOf and include the challenger in proposed weights. These are declared, evidence-backed inputs to an assessment, not an authenticated broker-fetch or per-order capability. Result executionAuthorized is always false. api/trading212_controlled.py continues to block material live actions until its approval bridge exists.

## AI exposure semantics

AI_CORE requires a cited dependency basis and fraction greater than 50%; missing or stale classification evidence becomes unknown exposure. Position weights plus cash must sum to one; duplicate entity IDs and nonfinite/negative weights fail. Unknown exposure blocks the proposed increase.

At or below 30%, no override is needed. Above 30%, an increase requires all six assessed economic conditions plus approval. These condition assessments are consumed from E1/E2, not inferred from prices or invented by this evaluator. Source, availability and expiry are checked. Approval is bound to decision ID AND the exact normalized sizing scope; changing the proposed weights invalidates it. Evidence is not cryptographically authenticated by this pure helper; E5 remains the permission authority.

Passive drift with unsupported conditions returns AI_OVER_30_REVIEW and never AUTO_SELL. Review results do not authorize a new increase above the ceiling without a matching approval. Canonical publication matches the AI inputs against the actual supplied structural weights; arbitrary detached weights cannot bypass it.

## Risk and sizing semantics

Measured covariance is explicitly annual decimal-return covariance. Validate dimensions, exact entity mapping, finite values, symmetry and positive semidefiniteness; singular PSD matrices are supported. Portfolio variance is w-transpose Sigma w; volatility output is annual percent. Variance is not a measurement of permanent-loss probability.

The shadow sizing objective is expected annual decimal CAGR minus riskAversion times annual variance / 2. Risk aversion is an explicit caller parameter, not a calibrated economic constant. Starts include equal weights and each concentrated portfolio, then bounded pairwise transfers. No sector or driver variety bonus exists. No global optimality is claimed. The 64-entity and 1000-iteration limits are NON_CANONICAL_IMPLEMENTATION_LIMITS for the shadow routine, not limits on canonical portfolio N.

The existing permanent-loss, fragility and convexity score units are NOT made economically comparable by adding a covariance calculation. STRUCTURAL_RISK_UNIT_AUTHORITY and STRUCTURAL_SIZING_AUTHORITY remain RESEARCH_PENDING/canonicalReady=false until actual calibration, sensitivity and out-of-sample evidence supports promotion. New code is IMPLEMENTED; economic readiness is not asserted.

## Assurance and delivery

E6 can enumerate all subsets of at most 12 supplied eligible unique entities, including the empty set, to report the heuristic utility gap. This is an exact reference only for that bounded universe/objective. It cannot authorize production, select live capital or certify the global 487-entity optimum.

Regression cases cover known terminal wealth, dividend/dilution accounting, probability errors, look-ahead/expiry, wrong identity, AI condition omissions, wrong/reused approval scope, costs erasing rotation advantage, broker mismatch, covariance errors, canonical integration and the known multi-add heuristic counterexample. Synthetic fixtures prove software properties only.

The existing Endogenous Portfolio CI is extended to run the new contracts and a TypeScript type check on PRs and main pushes. Commit, CI and merge evidence is recorded in the implementation PR. No deployed-runtime claim is made by a merge alone.
