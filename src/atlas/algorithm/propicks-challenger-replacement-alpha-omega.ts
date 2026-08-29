export const PROPICKS_CHALLENGER_REPLACEMENT_ALPHA_OMEGA_VERSION = '2026-08-29-v1.0.0' as const;

export type ExternalModelProvider = 'PROPICKS_AI' | 'OTHER_EXTERNAL_MODEL';
export type ProPicksSignalType = 'NEW_ENTRY' | 'REMOVED' | 'RETAINED' | 'RANK_UP' | 'RANK_DOWN';
export type AtlasGateVerdict = 'PASS' | 'WATCH' | 'REJECT' | 'DATA_INTEGRITY_REJECT' | 'FALSIFIER_VETO';
export type ChallengerDecision = 'PASS' | 'WATCH' | 'REJECT';
export type ExternalEvidenceState = 'AUDITABLE_MODEL' | 'TRACEABLE_SIGNAL_PROPRIETARY_METHOD' | 'MARKETING_ONLY' | 'UNTRACEABLE';

export type ReplacementAlphaState =
  | 'RA0_NO_ACTION_DATA_INSUFFICIENT'
  | 'RA1_KEEP_INCUMBENT'
  | 'RA2_WATCH_REPLACEMENT'
  | 'RA3_REPLACEMENT_CANDIDATE'
  | 'RA4_REPLACE_CONFIRMED'
  | 'RA5_EXIT_FUNDAMENTAL';

export interface ProPicksSignalInput {
  ticker: string;
  provider: ExternalModelProvider;
  signalType: ProPicksSignalType;
  reviewMonth: string;
  asOfDate: string;
  currentRank?: number;
  previousRank?: number;
  providerEvidenceIds: string[];
  providerMethodologyAuditable: boolean;
  providerPerformanceClaimAuditable: boolean;
  investingProAccessibleAtReview?: boolean;
}

export interface AtlasCandidateGateInput {
  atlasVerdict: AtlasGateVerdict;
  integrityGatePass: boolean;
  expectedReturnGatePass: boolean;
  valuationGatePass: boolean;
  economicProofGatePass: boolean;
  competitionForCapitalPass: boolean;
  falsifierVeto: boolean;
  trading212Available?: boolean;
  evidenceIds: string[];
  expectedCagrPct?: number;
  atlasScore?: number;
}

export interface ProPicksChallengerInput {
  signal: ProPicksSignalInput;
  atlas: AtlasCandidateGateInput;
}

export interface ProPicksChallengerResult {
  ticker: string;
  reviewMonth: string;
  signalType: ProPicksSignalType;
  decision: ChallengerDecision;
  externalEvidenceState: ExternalEvidenceState;
  independentConfirmation: boolean;
  externalSignalCanTrade: false;
  portfolioChangeAuthorized: false;
  reasons: string[];
}

export interface ReplacementAlphaInput {
  incumbentTicker: string;
  challengerTicker: string;
  reviewDate: string;
  incumbentExpectedCagrPct: number;
  challengerExpectedCagrPct: number;
  marginalPortfolioContributionDeltaPct: number;
  rotationFrictionPct: number;
  incrementalRiskPenaltyPct: number;
  evidenceUncertaintyPenaltyPct: number;
  concentrationPenaltyPct: number;
  taxFrictionPct?: number;
  minimumOrdinaryReplacementAlphaPct?: number;
  watchReplacementAlphaPct?: number;
  incumbentFalsifierVeto?: boolean;
  challengerFalsifierVeto?: boolean;
  trading212AvailabilityGatePass: boolean;
  valuationGatePass: boolean;
  economicProofGatePass: boolean;
  dataIntegrityGatePass: boolean;
  competitionForCapitalPass: boolean;
  incumbentEvidenceIds: string[];
  challengerEvidenceIds: string[];
}

export interface ReplacementAlphaResult {
  incumbentTicker: string;
  challengerTicker: string;
  state: ReplacementAlphaState;
  grossReplacementSpreadPct: number | null;
  netReplacementAlphaPct: number | null;
  hurdlePct: number;
  watchThresholdPct: number;
  missingGates: string[];
  replacementAuthorized: boolean;
  portfolioChangeAuthorized: boolean;
  reasons: string[];
}

export interface MonthlyChallengerReview {
  reviewMonth: string;
  generatedAt: string;
  results: ProPicksChallengerResult[];
  passTickers: string[];
  watchTickers: string[];
  rejectTickers: string[];
  portfolioChangeAuthorized: false;
}

const finite = (...values: Array<number | undefined | null>): boolean =>
  values.every((value) => typeof value === 'number' && Number.isFinite(value));

const nonBlank = (values: string[]): boolean =>
  Array.isArray(values) && values.length > 0 && values.every((value) => Boolean(value?.trim()));

const validDate = (value: string): boolean => Boolean(value?.trim()) && Number.isFinite(Date.parse(value));

function externalEvidenceState(signal: ProPicksSignalInput): ExternalEvidenceState {
  if (!nonBlank(signal.providerEvidenceIds) || !validDate(signal.asOfDate) || !signal.reviewMonth.trim()) return 'UNTRACEABLE';
  if (signal.providerMethodologyAuditable && signal.providerPerformanceClaimAuditable) return 'AUDITABLE_MODEL';
  if (signal.investingProAccessibleAtReview) return 'TRACEABLE_SIGNAL_PROPRIETARY_METHOD';
  return 'MARKETING_ONLY';
}

function atlasHardReject(atlas: AtlasCandidateGateInput): boolean {
  return atlas.falsifierVeto || atlas.atlasVerdict === 'FALSIFIER_VETO' || atlas.atlasVerdict === 'DATA_INTEGRITY_REJECT' || atlas.atlasVerdict === 'REJECT';
}

function atlasFullyAgrees(atlas: AtlasCandidateGateInput): boolean {
  return atlas.atlasVerdict === 'PASS'
    && atlas.integrityGatePass
    && atlas.expectedReturnGatePass
    && atlas.valuationGatePass
    && atlas.economicProofGatePass
    && atlas.competitionForCapitalPass
    && atlas.falsifierVeto === false
    && nonBlank(atlas.evidenceIds);
}

function isBullishSignal(signalType: ProPicksSignalType): boolean {
  return signalType === 'NEW_ENTRY' || signalType === 'RETAINED' || signalType === 'RANK_UP';
}

function missingReplacementGates(input: ReplacementAlphaInput): string[] {
  const missing: string[] = [];
  if (!input.trading212AvailabilityGatePass) missing.push('TRADING_212_AVAILABILITY_GATE');
  if (!input.valuationGatePass) missing.push('VALUATION_GATE');
  if (!input.economicProofGatePass) missing.push('ECONOMIC_PROOF_GATE');
  if (!input.competitionForCapitalPass) missing.push('COMPETITION_FOR_CAPITAL_GATE');
  return missing;
}

export function evaluateProPicksChallenger(input: ProPicksChallengerInput): ProPicksChallengerResult {
  const { signal, atlas } = input;
  const reasons: string[] = [];
  const state = externalEvidenceState(signal);
  const bullish = isBullishSignal(signal.signalType);
  const fullAtlasAgreement = atlasFullyAgrees(atlas);

  if (!signal.ticker.trim()) reasons.push('Ticker is required.');
  if (state === 'UNTRACEABLE') reasons.push('External model signal lacks traceable evidence, date, or review month.');
  if (state === 'MARKETING_ONLY') reasons.push('External model can be used only as discovery because the signal is not reviewable in InvestingPro at this audit cut.');
  if (state === 'TRACEABLE_SIGNAL_PROPRIETARY_METHOD') reasons.push('Signal is traceable, but the underlying model remains proprietary; performance claims stay calibration-only.');
  if (!nonBlank(atlas.evidenceIds)) reasons.push('ATLAS evidence packet is incomplete.');

  let decision: ChallengerDecision = 'WATCH';
  let independentConfirmation = false;

  if (!signal.ticker.trim() || state === 'UNTRACEABLE' || atlasHardReject(atlas)) {
    decision = 'REJECT';
    if (atlasHardReject(atlas)) reasons.push('ATLAS hard reject, data-integrity failure or Falsifiers Omega veto blocks the challenger signal.');
  } else if (bullish && fullAtlasAgreement && state !== 'MARKETING_ONLY') {
    decision = 'PASS';
    independentConfirmation = true;
    reasons.push('ProPicks and ATLAS independently point in the same direction; this strengthens evidence but does not authorize a portfolio change.');
  } else if (!bullish && fullAtlasAgreement) {
    decision = 'WATCH';
    reasons.push('ProPicks deterioration/removal conflicts with a still-valid ATLAS thesis; force thesis defense at the monthly review.');
  } else if (bullish && !fullAtlasAgreement) {
    decision = 'WATCH';
    reasons.push('ProPicks discovered a candidate, but ATLAS gates are not yet strong enough for PASS.');
  } else {
    reasons.push('External signal is retained as challenger evidence only; no automatic promotion or deletion.');
  }

  return {
    ticker: signal.ticker,
    reviewMonth: signal.reviewMonth,
    signalType: signal.signalType,
    decision,
    externalEvidenceState: state,
    independentConfirmation,
    externalSignalCanTrade: false,
    portfolioChangeAuthorized: false,
    reasons,
  };
}

export function calculateReplacementAlpha(input: ReplacementAlphaInput): ReplacementAlphaResult {
  const hurdlePct = input.minimumOrdinaryReplacementAlphaPct ?? 2.0;
  const watchThresholdPct = input.watchReplacementAlphaPct ?? 0.75;
  const taxFrictionPct = input.taxFrictionPct ?? 0;
  const reasons: string[] = [];

  const identityOk = Boolean(input.incumbentTicker.trim() && input.challengerTicker.trim() && validDate(input.reviewDate));
  const numbersOk = finite(
    input.incumbentExpectedCagrPct,
    input.challengerExpectedCagrPct,
    input.marginalPortfolioContributionDeltaPct,
    input.rotationFrictionPct,
    input.incrementalRiskPenaltyPct,
    input.evidenceUncertaintyPenaltyPct,
    input.concentrationPenaltyPct,
    taxFrictionPct,
    hurdlePct,
    watchThresholdPct,
  );
  const evidenceOk = nonBlank(input.incumbentEvidenceIds) && nonBlank(input.challengerEvidenceIds) && input.dataIntegrityGatePass;

  if (!identityOk || !numbersOk || !evidenceOk) {
    if (!identityOk) reasons.push('Replacement review requires incumbent, challenger and a valid review date.');
    if (!numbersOk) reasons.push('Expected return, contribution, friction and hurdle inputs must be finite.');
    if (!evidenceOk) reasons.push('Replacement Alpha requires traceable evidence and a passing data-integrity gate for both sides.');
    return {
      incumbentTicker: input.incumbentTicker,
      challengerTicker: input.challengerTicker,
      state: 'RA0_NO_ACTION_DATA_INSUFFICIENT',
      grossReplacementSpreadPct: null,
      netReplacementAlphaPct: null,
      hurdlePct,
      watchThresholdPct,
      missingGates: [],
      replacementAuthorized: false,
      portfolioChangeAuthorized: false,
      reasons,
    };
  }

  const grossReplacementSpreadPct = input.challengerExpectedCagrPct - input.incumbentExpectedCagrPct;
  const totalPenaltyPct = input.rotationFrictionPct
    + input.incrementalRiskPenaltyPct
    + input.evidenceUncertaintyPenaltyPct
    + input.concentrationPenaltyPct
    + taxFrictionPct;
  const netReplacementAlphaPct = grossReplacementSpreadPct + input.marginalPortfolioContributionDeltaPct - totalPenaltyPct;

  if (input.incumbentFalsifierVeto) {
    reasons.push('Incumbent has a confirmed fundamental falsifier; exit logic is separate from buying the challenger.');
    return {
      incumbentTicker: input.incumbentTicker,
      challengerTicker: input.challengerTicker,
      state: 'RA5_EXIT_FUNDAMENTAL',
      grossReplacementSpreadPct,
      netReplacementAlphaPct,
      hurdlePct,
      watchThresholdPct,
      missingGates: missingReplacementGates(input),
      replacementAuthorized: false,
      portfolioChangeAuthorized: false,
      reasons,
    };
  }

  if (input.challengerFalsifierVeto) {
    reasons.push('Challenger has a confirmed falsifier; it cannot displace the incumbent regardless of spread.');
    return {
      incumbentTicker: input.incumbentTicker,
      challengerTicker: input.challengerTicker,
      state: 'RA1_KEEP_INCUMBENT',
      grossReplacementSpreadPct,
      netReplacementAlphaPct,
      hurdlePct,
      watchThresholdPct,
      missingGates: missingReplacementGates(input),
      replacementAuthorized: false,
      portfolioChangeAuthorized: false,
      reasons,
    };
  }

  const missingGates = missingReplacementGates(input);
  let state: ReplacementAlphaState = 'RA1_KEEP_INCUMBENT';
  let replacementAuthorized = false;

  if (netReplacementAlphaPct >= hurdlePct && missingGates.length === 0) {
    state = 'RA4_REPLACE_CONFIRMED';
    replacementAuthorized = true;
    reasons.push('Net Replacement Alpha clears the ordinary hurdle after friction, risk, evidence and concentration penalties.');
  } else if (netReplacementAlphaPct >= hurdlePct) {
    state = 'RA3_REPLACEMENT_CANDIDATE';
    reasons.push('Net Replacement Alpha clears the numeric hurdle, but one or more gates still block confirmation.');
  } else if (netReplacementAlphaPct >= watchThresholdPct) {
    state = 'RA2_WATCH_REPLACEMENT';
    reasons.push('Net Replacement Alpha is positive but below the ordinary replacement hurdle; keep on monthly watch.');
  } else {
    reasons.push('Replacement spread is too small after friction and risk penalties; avoid decimal-point rotation.');
  }

  return {
    incumbentTicker: input.incumbentTicker,
    challengerTicker: input.challengerTicker,
    state,
    grossReplacementSpreadPct,
    netReplacementAlphaPct,
    hurdlePct,
    watchThresholdPct,
    missingGates,
    replacementAuthorized,
    portfolioChangeAuthorized: replacementAuthorized,
    reasons,
  };
}

export function createMonthlyChallengerReview(reviewMonth: string, generatedAt: string, inputs: ProPicksChallengerInput[]): MonthlyChallengerReview {
  const results = inputs.map(evaluateProPicksChallenger);
  return {
    reviewMonth,
    generatedAt,
    results,
    passTickers: results.filter((r) => r.decision === 'PASS').map((r) => r.ticker),
    watchTickers: results.filter((r) => r.decision === 'WATCH').map((r) => r.ticker),
    rejectTickers: results.filter((r) => r.decision === 'REJECT').map((r) => r.ticker),
    portfolioChangeAuthorized: false,
  };
}
