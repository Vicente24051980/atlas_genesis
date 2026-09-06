import {
  evaluatePortfolioSetV2,
  runEndogenousPortfolioEngineV2,
  type PortfolioCandidateV2,
  type PortfolioEnginePolicyV2,
} from './endogenous-portfolio-engine-v2';

export const STRUCTURAL_PORTFOLIO_PUBLICATION_GATE_VERSION = '2026-09-06-v1.0.0' as const;

export type StructuralPublicationState =
  | 'CANONICAL_READY'
  | 'BLOCKED_METADATA_MISSING'
  | 'BLOCKED_UNIVERSE_MISMATCH'
  | 'BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE'
  | 'BLOCKED_CONFLICTING_ENTITY_ROWS'
  | 'BLOCKED_ENGINE_PENDING'
  | 'FAIL_NON_DETERMINISTIC_PORTFOLIO_SELECTION'
  | 'BLOCKED_SIZING_NOT_IMPLEMENTED'
  | 'BLOCKED_INVALID_SIZING';

export type MarginalRow = {
  ticker: string;
  canonicalEntityId: string;
  selected: boolean;
  deltaUAdd: number;
  bestDeltaUSwap: number | null;
  bestSwapAgainst: string | null;
};

export type StructuralSizingEvidence = {
  method: 'COVARIANCE_AWARE';
  portfolioVolatilityModelHash: string;
  weights: Record<string, number>;
};

export type StructuralPortfolioRunRequest = {
  rawUniverseSource: string;
  normalizedUniverseHash: string;
  snapshotHash: string;
  policyHash: string;
  allowedTickers: string[];
  expectedCanonicalEntityCount: number;
  candidates: PortfolioCandidateV2[];
  policy?: PortfolioEnginePolicyV2;
  reproducibilityRuns?: number;
  sizing?: StructuralSizingEvidence;
};

export type StructuralPortfolioRun = {
  publicationState: StructuralPublicationState;
  reason: string;
  selectedTickers: string[];
  optimalN: number | null;
  portfolioHash: string | null;
  reproducibilityRuns: number;
  marginalRanking: MarginalRow[];
  weights: Record<string, number> | null;
  globalOptimalityProven: false;
  searchMode: 'DETERMINISTIC_LOCAL_SEARCH';
};

export type FourSessionExperiment = {
  mode: 'EXPERIMENT_4D_EQUAL_WEIGHT';
  authority: 'EXPERIMENT_ONLY';
  tickers: string[];
  equalWeight: number;
  amountPerPosition: number;
  totalCapital: number;
};

function finite(x: number): boolean { return Number.isFinite(x); }
function upper(x: string): string { return x.trim().toUpperCase(); }

function stableFingerprint(value: unknown): string {
  const s = JSON.stringify(value);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function evidenceFingerprint(c: PortfolioCandidateV2): string {
  return JSON.stringify({
    hardGatesPassed: c.hardGatesPassed,
    falsifierVetoPassed: c.falsifierVetoPassed,
    expectedReturn: c.expectedReturn,
    permanentLossRisk: c.permanentLossRisk,
    tailRisk: c.tailRisk,
    volatilityRisk: c.volatilityRisk,
    fragility: c.fragility,
    convexity: c.convexity,
    confidence: c.confidence,
    individualScore: c.individualScore,
    causalDrivers: Object.entries(c.causalDrivers ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    fundingSources: [...(c.fundingSources ?? [])].map(upper).sort(),
    scenarios: Object.entries(c.scenarios ?? {}).sort(([a], [b]) => a.localeCompare(b)),
  });
}

function canonicalizeEntities(candidates: PortfolioCandidateV2[]): PortfolioCandidateV2[] | null {
  const sorted = [...candidates].sort((a, b) => {
    const ea = upper(a.canonicalEntityId ?? '');
    const eb = upper(b.canonicalEntityId ?? '');
    return ea.localeCompare(eb) || upper(a.ticker).localeCompare(upper(b.ticker));
  });
  const out = new Map<string, PortfolioCandidateV2>();
  const fp = new Map<string, string>();
  for (const c of sorted) {
    const entity = upper(c.canonicalEntityId ?? '');
    if (!entity) return null;
    const current = fp.get(entity);
    const next = evidenceFingerprint(c);
    if (current !== undefined && current !== next) return null;
    if (!out.has(entity)) out.set(entity, { ...c, ticker: upper(c.ticker), canonicalEntityId: entity });
    fp.set(entity, next);
  }
  return [...out.values()];
}

function portfolioFingerprint(selectedTickers: string[], optimalN: number | null): string {
  return stableFingerprint({ optimalN, selectedTickers: [...selectedTickers].map(upper).sort() });
}

function validateSizing(selected: string[], sizing?: StructuralSizingEvidence): StructuralPublicationState | null {
  if (!sizing) return 'BLOCKED_SIZING_NOT_IMPLEMENTED';
  if (sizing.method !== 'COVARIANCE_AWARE' || !sizing.portfolioVolatilityModelHash.trim()) return 'BLOCKED_INVALID_SIZING';
  const selectedSet = new Set(selected.map(upper));
  const entries = Object.entries(sizing.weights).map(([t, w]) => [upper(t), w] as const);
  if (entries.length !== selectedSet.size) return 'BLOCKED_INVALID_SIZING';
  if (entries.some(([t, w]) => !selectedSet.has(t) || !finite(w) || w < 0)) return 'BLOCKED_INVALID_SIZING';
  const sum = entries.reduce((a, [, w]) => a + w, 0);
  if (Math.abs(sum - 1) > 1e-8) return 'BLOCKED_INVALID_SIZING';
  return null;
}

function marginalRanking(
  canonical: PortfolioCandidateV2[],
  selectedTickers: string[],
  policy: PortfolioEnginePolicyV2,
): MarginalRow[] {
  const byTicker = new Map(canonical.map(c => [upper(c.ticker), c]));
  const selected = selectedTickers.map(t => byTicker.get(upper(t))).filter(Boolean) as PortfolioCandidateV2[];
  const selectedSet = new Set(selected.map(c => upper(c.ticker)));
  const eligible = canonical.filter(c => c.hardGatesPassed && c.falsifierVetoPassed);
  const baseUtility = selected.length ? evaluatePortfolioSetV2(selected, policy).utility : 0;
  const outsiders = eligible.filter(c => !selectedSet.has(upper(c.ticker)));

  const rows = eligible.map(c => {
    const ticker = upper(c.ticker);
    const isSelected = selectedSet.has(ticker);
    let deltaUAdd: number;
    if (isSelected) {
      const without = selected.filter(x => upper(x.ticker) !== ticker);
      const withoutUtility = without.length ? evaluatePortfolioSetV2(without, policy).utility : 0;
      deltaUAdd = baseUtility - withoutUtility;
    } else {
      const withCandidate = [...selected, c];
      deltaUAdd = evaluatePortfolioSetV2(withCandidate, policy).utility - baseUtility;
    }

    let bestDeltaUSwap: number | null = null;
    let bestSwapAgainst: string | null = null;
    if (!isSelected && selected.length) {
      for (let i = 0; i < selected.length; i++) {
        const trial = [...selected];
        const incumbent = upper(trial[i].ticker);
        trial[i] = c;
        const delta = evaluatePortfolioSetV2(trial, policy).utility - baseUtility;
        if (bestDeltaUSwap === null || delta > bestDeltaUSwap + 1e-12 ||
          (Math.abs(delta - bestDeltaUSwap) <= 1e-12 && incumbent.localeCompare(bestSwapAgainst ?? '') < 0)) {
          bestDeltaUSwap = delta;
          bestSwapAgainst = incumbent;
        }
      }
    } else if (isSelected && outsiders.length) {
      const idx = selected.findIndex(x => upper(x.ticker) === ticker);
      for (const challenger of outsiders) {
        const trial = [...selected];
        trial[idx] = challenger;
        const delta = evaluatePortfolioSetV2(trial, policy).utility - baseUtility;
        const challengerTicker = upper(challenger.ticker);
        if (bestDeltaUSwap === null || delta > bestDeltaUSwap + 1e-12 ||
          (Math.abs(delta - bestDeltaUSwap) <= 1e-12 && challengerTicker.localeCompare(bestSwapAgainst ?? '') < 0)) {
          bestDeltaUSwap = delta;
          bestSwapAgainst = challengerTicker;
        }
      }
    }

    return { ticker, canonicalEntityId: upper(c.canonicalEntityId!), selected: isSelected, deltaUAdd, bestDeltaUSwap, bestSwapAgainst };
  });

  return rows.sort((a, b) => b.deltaUAdd - a.deltaUAdd || a.ticker.localeCompare(b.ticker));
}

export function runStructuralPortfolioPublicationGate(req: StructuralPortfolioRunRequest): StructuralPortfolioRun {
  const repeats = Math.max(2, Math.floor(req.reproducibilityRuns ?? 100));
  const base = (state: StructuralPublicationState, reason: string): StructuralPortfolioRun => ({
    publicationState: state, reason, selectedTickers: [], optimalN: null, portfolioHash: null,
    reproducibilityRuns: repeats, marginalRanking: [], weights: null,
    globalOptimalityProven: false, searchMode: 'DETERMINISTIC_LOCAL_SEARCH',
  });

  if (!req.rawUniverseSource.trim() || !req.normalizedUniverseHash.trim() || !req.snapshotHash.trim() || !req.policyHash.trim())
    return base('BLOCKED_METADATA_MISSING', 'Universe/snapshot/policy provenance is incomplete.');

  const allowed = new Set(req.allowedTickers.map(upper));
  if (!allowed.size || req.candidates.some(c => !allowed.has(upper(c.ticker))))
    return base('BLOCKED_UNIVERSE_MISMATCH', 'At least one candidate is outside the canonical universe whitelist.');

  const canonical = canonicalizeEntities(req.candidates);
  if (!canonical) return base('BLOCKED_CONFLICTING_ENTITY_ROWS', 'Canonical entity IDs are missing or duplicate entity rows disagree on evidence.');
  if (canonical.length !== req.expectedCanonicalEntityCount)
    return base('BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE', `Expected ${req.expectedCanonicalEntityCount} canonical entities but received ${canonical.length}.`);

  const policy = req.policy ?? {};
  let firstHash: string | null = null;
  let firstResult: ReturnType<typeof runEndogenousPortfolioEngineV2> | null = null;
  for (let i = 0; i < repeats; i++) {
    // Deliberately perturb caller order, then canonicalize again. Same evidence must be order-invariant.
    const rotated = canonical.slice(i % canonical.length).concat(canonical.slice(0, i % canonical.length));
    const supplied = i % 2 ? [...rotated].reverse() : rotated;
    const rerunInput = canonicalizeEntities(supplied)!;
    const result = runEndogenousPortfolioEngineV2(rerunInput, policy);
    if (result.status !== 'SELECTED') return base('BLOCKED_ENGINE_PENDING', `Selector returned ${result.status}.`);
    const hash = portfolioFingerprint(result.selectedTickers, result.optimalN);
    if (firstHash === null) { firstHash = hash; firstResult = result; }
    else if (hash !== firstHash) return base('FAIL_NON_DETERMINISTIC_PORTFOLIO_SELECTION', 'Identical evidence produced different portfolio composition/N across order-perturbed reruns.');
  }

  const result = firstResult!;
  const sizingState = validateSizing(result.selectedTickers, req.sizing);
  const ranking = marginalRanking(canonical, result.selectedTickers, policy);
  if (sizingState) return {
    publicationState: sizingState,
    reason: sizingState === 'BLOCKED_SIZING_NOT_IMPLEMENTED'
      ? 'Selection is reproducible, but structural MAX RETURN / LOW VOL publication is blocked until covariance-aware sizing exists.'
      : 'Sizing evidence is incomplete or invalid.',
    selectedTickers: result.selectedTickers,
    optimalN: result.optimalN,
    portfolioHash: firstHash,
    reproducibilityRuns: repeats,
    marginalRanking: ranking,
    weights: null,
    globalOptimalityProven: false,
    searchMode: 'DETERMINISTIC_LOCAL_SEARCH',
  };

  return {
    publicationState: 'CANONICAL_READY',
    reason: 'Universe, PIT snapshot, deterministic selection, marginal ledger and covariance-aware sizing gates passed.',
    selectedTickers: result.selectedTickers,
    optimalN: result.optimalN,
    portfolioHash: firstHash,
    reproducibilityRuns: repeats,
    marginalRanking: ranking,
    weights: Object.fromEntries(Object.entries(req.sizing!.weights).map(([t, w]) => [upper(t), w])),
    globalOptimalityProven: false,
    searchMode: 'DETERMINISTIC_LOCAL_SEARCH',
  };
}

export function buildFourSessionEqualWeightExperiment(
  tickers: string[], totalCapital: number, allowedTickers: string[],
): FourSessionExperiment {
  const allowed = new Set(allowedTickers.map(upper));
  const canonical = [...new Set(tickers.map(upper))].sort();
  if (!canonical.length || !finite(totalCapital) || totalCapital <= 0 || canonical.some(t => !allowed.has(t)))
    throw new Error('INVALID_4D_EXPERIMENT_INPUT');
  return {
    mode: 'EXPERIMENT_4D_EQUAL_WEIGHT', authority: 'EXPERIMENT_ONLY', tickers: canonical,
    equalWeight: 1 / canonical.length, amountPerPosition: totalCapital / canonical.length, totalCapital,
  };
}
