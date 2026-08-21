export type MarketTapeSourceClass =
  | 'EXCHANGE_OFFICIAL'
  | 'BROKER_LIVE'
  | 'REGULATED_FEED'
  | 'VENDOR_REALTIME'
  | 'USER_CAPTURE'
  | 'WEB_AGGREGATOR'
  | 'SECONDARY_RESEARCH'
  | 'SEARCH_SNIPPET';

export type MarketTapeObservationType = 'OFFICIAL_CLOSE' | 'INTRADAY_SNAPSHOT';
export type MarketSessionState = 'PREMARKET' | 'OPEN' | 'AFTER_HOURS' | 'CLOSED' | 'UNKNOWN';
export type MarketReturnWindow = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y';
export type MarketReturnKind = 'PRICE_RETURN' | 'TOTAL_RETURN';
export type MarketTapeStatus =
  | 'PASS'
  | 'FAIL_MISSING'
  | 'FAIL_STALE'
  | 'FAIL_CONFLICT'
  | 'FAIL_IDENTITY'
  | 'FAIL_CORPORATE_ACTION';

export interface MarketTapeReturnObservation {
  valuePct: number;
  kind: MarketReturnKind;
  sourceEvidenceId?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  calculatedFromVerifiedPrices?: boolean;
}

export interface MarketTapeObservation {
  ticker: string;
  primaryListing: string;
  currency: string;
  quotationUnit: string;
  observationDate: string;
  observationType: MarketTapeObservationType;
  observationTimestamp?: string;
  sessionState: MarketSessionState;
  price: number;
  sourceId: string;
  sourceClass: MarketTapeSourceClass;
  capturedAt: string;
  corporateActionsReconciled: boolean;
  returns?: Partial<Record<MarketReturnWindow, MarketTapeReturnObservation>>;
}

export interface UniversalMarketTapeIntegrityInput {
  ticker: string;
  primaryListing: string;
  currency: string;
  quotationUnit: string;
  asOfTimestamp: string;
  expectedSessionState: MarketSessionState;
  requiredReturnWindows?: readonly MarketReturnWindow[];
  requiredReturnKind?: MarketReturnKind;
  observations: readonly MarketTapeObservation[];
  maxOpenAgeMinutes?: number;
  maxUnknownAgeMinutes?: number;
  coherenceWindowMinutes?: number;
  priceConflictTolerancePct?: number;
  returnConflictTolerancePp?: number;
}

export interface SelectedMarketReturn {
  window: MarketReturnWindow;
  valuePct: number;
  kind: MarketReturnKind;
  sourceId: string;
  sourceClass: MarketTapeSourceClass;
  observationTimestamp: string | null;
}

export interface UniversalMarketTapeIntegrityResult {
  status: MarketTapeStatus;
  canonicalVerified: boolean;
  selectedTicker: string | null;
  selectedPrimaryListing: string | null;
  selectedCurrency: string | null;
  selectedQuotationUnit: string | null;
  selectedPrice: number | null;
  selectedSourceId: string | null;
  selectedSourceClass: MarketTapeSourceClass | null;
  selectedObservationDate: string | null;
  selectedObservationType: MarketTapeObservationType | null;
  selectedObservationTimestamp: string | null;
  selectedReturns: Partial<Record<MarketReturnWindow, SelectedMarketReturn>>;
  freshnessMinutes: number | null;
  evidenceIds: readonly string[];
  violations: readonly string[];
  guardrails: readonly string[];
}

const SOURCE_PRIORITY: Readonly<Record<MarketTapeSourceClass, number>> = {
  EXCHANGE_OFFICIAL: 100,
  BROKER_LIVE: 95,
  REGULATED_FEED: 90,
  VENDOR_REALTIME: 85,
  USER_CAPTURE: 80,
  WEB_AGGREGATOR: 60,
  SECONDARY_RESEARCH: 30,
  SEARCH_SNIPPET: 10,
};

const CANONICAL_SOURCE_CLASSES = new Set<MarketTapeSourceClass>([
  'EXCHANGE_OFFICIAL',
  'BROKER_LIVE',
  'REGULATED_FEED',
  'VENDOR_REALTIME',
  'USER_CAPTURE',
  'WEB_AGGREGATOR',
]);

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function parseTimestamp(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function datePart(isoLike: string): string {
  return isoLike.slice(0, 10);
}

function minutesBetween(aMs: number, bMs: number): number {
  return Math.abs(aMs - bMs) / 60_000;
}

function pctDifference(a: number, b: number): number {
  const denominator = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return Math.abs(a - b) / denominator * 100;
}

function identityMatches(input: UniversalMarketTapeIntegrityInput, observation: MarketTapeObservation): boolean {
  return (
    observation.ticker === input.ticker &&
    observation.primaryListing === input.primaryListing &&
    observation.currency === input.currency &&
    observation.quotationUnit === input.quotationUnit
  );
}

function observationTimeMs(observation: MarketTapeObservation): number | null {
  if (observation.observationType === 'INTRADAY_SNAPSHOT') return parseTimestamp(observation.observationTimestamp);
  return parseTimestamp(observation.capturedAt);
}

function sourceCanBeCanonical(sourceClass: MarketTapeSourceClass): boolean {
  return CANONICAL_SOURCE_CLASSES.has(sourceClass);
}

function sessionFreshnessLimit(input: UniversalMarketTapeIntegrityInput): number {
  if (['PREMARKET', 'OPEN', 'AFTER_HOURS'].includes(input.expectedSessionState)) {
    return input.maxOpenAgeMinutes ?? 20;
  }
  return input.maxUnknownAgeMinutes ?? 60;
}

function isFresh(input: UniversalMarketTapeIntegrityInput, observation: MarketTapeObservation, asOfMs: number): boolean {
  if (input.expectedSessionState === 'CLOSED' && observation.observationType === 'OFFICIAL_CLOSE') {
    return observation.observationDate === datePart(input.asOfTimestamp);
  }

  const observedMs = observationTimeMs(observation);
  if (observedMs == null || observedMs > asOfMs + 60_000) return false;
  return minutesBetween(observedMs, asOfMs) <= sessionFreshnessLimit(input);
}

function sortCandidates(
  observations: readonly MarketTapeObservation[],
  asOfMs: number,
): MarketTapeObservation[] {
  return [...observations].sort((a, b) => {
    const aTime = observationTimeMs(a) ?? 0;
    const bTime = observationTimeMs(b) ?? 0;
    const aAge = Math.abs(asOfMs - aTime);
    const bAge = Math.abs(asOfMs - bTime);
    if (aAge !== bAge) return aAge - bAge;
    return SOURCE_PRIORITY[b.sourceClass] - SOURCE_PRIORITY[a.sourceClass];
  });
}

function coherentWithSelected(
  input: UniversalMarketTapeIntegrityInput,
  selected: MarketTapeObservation,
  candidate: MarketTapeObservation,
): boolean {
  if (selected.observationType === 'OFFICIAL_CLOSE' && candidate.observationType === 'OFFICIAL_CLOSE') {
    return selected.observationDate === candidate.observationDate;
  }
  const selectedMs = observationTimeMs(selected);
  const candidateMs = observationTimeMs(candidate);
  if (selectedMs == null || candidateMs == null) return false;
  return minutesBetween(selectedMs, candidateMs) <= (input.coherenceWindowMinutes ?? 5);
}

function result(
  status: MarketTapeStatus,
  violations: string[],
  selected: MarketTapeObservation | null,
  selectedReturns: Partial<Record<MarketReturnWindow, SelectedMarketReturn>>,
  asOfMs: number,
  evidenceIds: string[],
): UniversalMarketTapeIntegrityResult {
  const selectedMs = selected ? observationTimeMs(selected) : null;
  return {
    status,
    canonicalVerified: status === 'PASS',
    selectedTicker: selected?.ticker ?? null,
    selectedPrimaryListing: selected?.primaryListing ?? null,
    selectedCurrency: selected?.currency ?? null,
    selectedQuotationUnit: selected?.quotationUnit ?? null,
    selectedPrice: selected?.price ?? null,
    selectedSourceId: selected?.sourceId ?? null,
    selectedSourceClass: selected?.sourceClass ?? null,
    selectedObservationDate: selected?.observationDate ?? null,
    selectedObservationType: selected?.observationType ?? null,
    selectedObservationTimestamp: selected?.observationTimestamp ?? null,
    selectedReturns,
    freshnessMinutes: selectedMs == null ? null : Math.round(minutesBetween(selectedMs, asOfMs) * 100) / 100,
    evidenceIds: [...new Set(evidenceIds)],
    violations,
    guardrails: [
      'Market tape is fail-closed: stale, identity-mismatched, corporate-action-unreconciled or conflicting observations cannot be canonical.',
      'Search snippets and secondary research can corroborate context but can never be the sole canonical market-tape source.',
      'Freshness is evaluated before source prestige; a stale high-priority source cannot override a current coherent observation.',
      'Price and historical-return windows must be coherent in time, listing, currency and quotation unit.',
      'PRICE_RETURN and TOTAL_RETURN are distinct metrics and may never be silently substituted.',
      'A user capture is admissible market-tape evidence only when identity, timestamp, quotation unit and corporate-action status are explicit.',
      'Downstream consumers must re-bind the selected ticker/listing/currency/quotation unit to their own input identity before scoring.',
    ],
  };
}

export function evaluateUniversalMarketTapeIntegrity(
  input: UniversalMarketTapeIntegrityInput,
): UniversalMarketTapeIntegrityResult {
  const violations: string[] = [];
  const selectedReturns: Partial<Record<MarketReturnWindow, SelectedMarketReturn>> = {};
  const evidenceIds: string[] = [];
  const asOfMs = parseTimestamp(input.asOfTimestamp);

  if (!input.ticker.trim() || !input.primaryListing.trim() || !input.currency.trim() || !input.quotationUnit.trim() || asOfMs == null) {
    return result('FAIL_IDENTITY', ['invalid_request_identity_or_as_of'], null, selectedReturns, asOfMs ?? 0, evidenceIds);
  }

  if (input.observations.length === 0) {
    return result('FAIL_MISSING', ['no_market_tape_observations'], null, selectedReturns, asOfMs, evidenceIds);
  }

  const identityMatched = input.observations.filter((observation) => identityMatches(input, observation));
  if (identityMatched.length === 0) {
    return result('FAIL_IDENTITY', ['no_observation_matches_ticker_listing_currency_and_quotation_unit'], null, selectedReturns, asOfMs, evidenceIds);
  }

  const structurallyValid = identityMatched.filter((observation) => {
    if (!finitePositive(observation.price)) return false;
    if (!observation.sourceId.trim()) return false;
    if (!parseTimestamp(observation.capturedAt)) return false;
    if (observation.observationType === 'INTRADAY_SNAPSHOT' && parseTimestamp(observation.observationTimestamp) == null) return false;
    return true;
  });

  if (structurallyValid.length === 0) {
    return result('FAIL_MISSING', ['market_tape_metadata_incomplete'], null, selectedReturns, asOfMs, evidenceIds);
  }

  const corporateSafe = structurallyValid.filter((observation) => observation.corporateActionsReconciled);
  if (corporateSafe.length === 0) {
    return result('FAIL_CORPORATE_ACTION', ['corporate_actions_not_reconciled'], null, selectedReturns, asOfMs, evidenceIds);
  }

  const canonicalSources = corporateSafe.filter((observation) => sourceCanBeCanonical(observation.sourceClass));
  if (canonicalSources.length === 0) {
    return result('FAIL_MISSING', ['no_canonical_market_tape_source'], null, selectedReturns, asOfMs, evidenceIds);
  }

  const fresh = canonicalSources.filter((observation) => isFresh(input, observation, asOfMs));
  if (fresh.length === 0) {
    return result('FAIL_STALE', ['all_market_tape_observations_stale_for_requested_session'], null, selectedReturns, asOfMs, evidenceIds);
  }

  const sorted = sortCandidates(fresh, asOfMs);
  const selected = sorted[0];
  evidenceIds.push(selected.sourceId);

  const coherentPricePeers = fresh.filter((candidate) => coherentWithSelected(input, selected, candidate));
  const priceTolerance = input.priceConflictTolerancePct ?? 0.75;
  const priceConflicts = coherentPricePeers.filter((candidate) => pctDifference(candidate.price, selected.price) > priceTolerance);
  if (priceConflicts.length > 0) {
    violations.push(
      ...priceConflicts.map((candidate) =>
        `price_conflict:${selected.sourceId}:${candidate.sourceId}:${pctDifference(selected.price, candidate.price).toFixed(3)}pct`,
      ),
    );
    return result('FAIL_CONFLICT', violations, selected, selectedReturns, asOfMs, evidenceIds.concat(priceConflicts.map((x) => x.sourceId)));
  }

  const requiredWindows = input.requiredReturnWindows ?? [];
  const requiredKind = input.requiredReturnKind;
  const returnTolerance = input.returnConflictTolerancePp ?? 1.0;

  for (const window of requiredWindows) {
    const returnCandidates = coherentPricePeers
      .map((observation) => ({ observation, value: observation.returns?.[window] }))
      .filter((entry): entry is { observation: MarketTapeObservation; value: MarketTapeReturnObservation } => entry.value != null)
      .filter((entry) => requiredKind == null || entry.value.kind === requiredKind)
      .filter((entry) => Number.isFinite(entry.value.valuePct))
      .filter((entry) => entry.value.calculatedFromVerifiedPrices !== false);

    if (returnCandidates.length === 0) {
      violations.push(`missing_required_return_window:${window}${requiredKind ? `:${requiredKind}` : ''}`);
      continue;
    }

    returnCandidates.sort((a, b) => {
      const sourceDelta = SOURCE_PRIORITY[b.observation.sourceClass] - SOURCE_PRIORITY[a.observation.sourceClass];
      if (sourceDelta !== 0) return sourceDelta;
      const aMs = observationTimeMs(a.observation) ?? 0;
      const bMs = observationTimeMs(b.observation) ?? 0;
      const selectedMs = observationTimeMs(selected) ?? asOfMs;
      return Math.abs(aMs - selectedMs) - Math.abs(bMs - selectedMs);
    });

    const chosen = returnCandidates[0];
    const conflicting = returnCandidates.filter(
      (candidate) =>
        candidate.value.kind === chosen.value.kind &&
        Math.abs(candidate.value.valuePct - chosen.value.valuePct) > returnTolerance,
    );

    if (conflicting.length > 0) {
      violations.push(
        ...conflicting.map((candidate) =>
          `return_conflict:${window}:${chosen.observation.sourceId}:${candidate.observation.sourceId}:${Math.abs(chosen.value.valuePct - candidate.value.valuePct).toFixed(3)}pp`,
        ),
      );
      continue;
    }

    selectedReturns[window] = {
      window,
      valuePct: chosen.value.valuePct,
      kind: chosen.value.kind,
      sourceId: chosen.value.sourceEvidenceId ?? chosen.observation.sourceId,
      sourceClass: chosen.observation.sourceClass,
      observationTimestamp: chosen.observation.observationTimestamp ?? null,
    };
    evidenceIds.push(chosen.value.sourceEvidenceId ?? chosen.observation.sourceId);
  }

  if (violations.some((violation) => violation.startsWith('return_conflict:'))) {
    return result('FAIL_CONFLICT', violations, selected, selectedReturns, asOfMs, evidenceIds);
  }
  if (violations.some((violation) => violation.startsWith('missing_required_return_window:'))) {
    return result('FAIL_MISSING', violations, selected, selectedReturns, asOfMs, evidenceIds);
  }

  return result('PASS', [], selected, selectedReturns, asOfMs, evidenceIds);
}

export function marketTapePasses(result: UniversalMarketTapeIntegrityResult | undefined): boolean {
  return result?.status === 'PASS' && result.canonicalVerified === true;
}

export const UNIVERSAL_MARKET_TAPE_INTEGRITY_OMEGA_V1 = {
  id: 'UNIVERSAL_MARKET_TAPE_INTEGRITY_OMEGA_V1_1',
  status: 'canonical',
  mission: 'Make one fail-closed market-tape gate govern price, historical-return and equity-monetization consumers before any ranking or interpretation.',
  sourcePriority: SOURCE_PRIORITY,
  evaluate: evaluateUniversalMarketTapeIntegrity,
} as const;
