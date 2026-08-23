export const INVESTMENT_DISCIPLINE_COMPOUNDING_OMEGA_VERSION = '2026-08-24-v1.0.0' as const;

export type GateState = 'PASS' | 'CAUTION' | 'FAIL' | 'EVIDENCE_PENDING';

function finite(value: number | undefined): value is number {
  return value != null && Number.isFinite(value);
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function evidencePasses(traceable: boolean, ids: string[], minimum = 2): boolean {
  return traceable && ids.filter((id) => id.trim().length > 0).length >= minimum;
}

export interface BaseRateSurvivorshipInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  comparableCohortSize: number;
  survivorOnlyEvidence: boolean;
  documentedSuccessCount?: number;
  documentedFailureCount?: number;
}

export interface BaseRateSurvivorshipResult {
  gate: GateState;
  observedSuccessRatePct: number | null;
  reasons: string[];
}

export function evaluateBaseRateSurvivorship(input: BaseRateSurvivorshipInput): BaseRateSurvivorshipResult {
  const reasons: string[] = [];
  const evidenceOk = evidencePasses(input.evidenceTraceable, input.evidenceIds);
  if (!evidenceOk) reasons.push('Base-rate evidence is not sufficiently traceable.');
  if (input.survivorOnlyEvidence) reasons.push('Survivor-only evidence is prohibited: failed comparables must be included.');
  if (!Number.isFinite(input.comparableCohortSize) || input.comparableCohortSize < 10) reasons.push('Comparable cohort is too small for a robust base-rate prior.');

  const success = finite(input.documentedSuccessCount) ? Math.max(0, input.documentedSuccessCount) : null;
  const failure = finite(input.documentedFailureCount) ? Math.max(0, input.documentedFailureCount) : null;
  let observedSuccessRatePct: number | null = null;
  if (success != null && failure != null && success + failure > 0) {
    observedSuccessRatePct = (success / (success + failure)) * 100;
  }

  let gate: GateState = 'PASS';
  if (!evidenceOk) gate = 'EVIDENCE_PENDING';
  else if (input.survivorOnlyEvidence) gate = 'FAIL';
  else if (input.comparableCohortSize < 10) gate = 'CAUTION';

  return { gate, observedSuccessRatePct, reasons };
}

export type NarrativeStage =
  | 'TAM'
  | 'CUSTOMERS'
  | 'VOLUME_PRICE'
  | 'REVENUE'
  | 'MARGIN'
  | 'OCF'
  | 'FCF'
  | 'ROIC'
  | 'PER_SHARE';

const NARRATIVE_STAGE_ORDER: NarrativeStage[] = [
  'TAM', 'CUSTOMERS', 'VOLUME_PRICE', 'REVENUE', 'MARGIN', 'OCF', 'FCF', 'ROIC', 'PER_SHARE',
];

export interface NarrativeToNumbersInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  stages: Partial<Record<NarrativeStage, boolean>>;
}

export interface NarrativeToNumbersResult {
  gate: GateState;
  furthestContinuousStage: NarrativeStage | null;
  firstBrokenStage: NarrativeStage | null;
  economicProofReached: boolean;
  ownerEconomicsReached: boolean;
  reasons: string[];
}

export function evaluateNarrativeToNumbers(input: NarrativeToNumbersInput): NarrativeToNumbersResult {
  const reasons: string[] = [];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds)) {
    return {
      gate: 'EVIDENCE_PENDING', furthestContinuousStage: null, firstBrokenStage: 'TAM',
      economicProofReached: false, ownerEconomicsReached: false,
      reasons: ['Narrative-to-numbers bridge requires traceable evidence.'],
    };
  }

  let furthestContinuousStage: NarrativeStage | null = null;
  let firstBrokenStage: NarrativeStage | null = null;
  for (const stage of NARRATIVE_STAGE_ORDER) {
    if (input.stages[stage] === true) furthestContinuousStage = stage;
    else {
      firstBrokenStage = stage;
      break;
    }
  }

  const economicProofReached = NARRATIVE_STAGE_ORDER.indexOf(furthestContinuousStage ?? 'TAM') >= NARRATIVE_STAGE_ORDER.indexOf('FCF')
    && input.stages.FCF === true;
  const ownerEconomicsReached = input.stages.PER_SHARE === true && input.stages.ROIC === true;
  if (firstBrokenStage) reasons.push(`Narrative chain breaks at ${firstBrokenStage}; later narrative claims cannot be promoted to Economic Proof.`);

  return {
    gate: ownerEconomicsReached ? 'PASS' : economicProofReached ? 'CAUTION' : 'FAIL',
    furthestContinuousStage,
    firstBrokenStage,
    economicProofReached,
    ownerEconomicsReached,
    reasons,
  };
}

export interface ReinvestmentRunwayInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  runwayYears: number;
  incrementalRoicPct: number;
  waccPct: number;
  reinvestmentRatePct: number;
}

export type ReinvestmentRunwayState = 'ELITE' | 'STRONG' | 'LIMITED' | 'VALUE_DESTROYING' | 'EVIDENCE_PENDING';

export interface ReinvestmentRunwayResult {
  state: ReinvestmentRunwayState;
  roicSpreadPct: number | null;
  reasons: string[];
}

export function evaluateReinvestmentRunway(input: ReinvestmentRunwayInput): ReinvestmentRunwayResult {
  const reasons: string[] = [];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || ![input.runwayYears, input.incrementalRoicPct, input.waccPct, input.reinvestmentRatePct].every(Number.isFinite)) {
    return { state: 'EVIDENCE_PENDING', roicSpreadPct: null, reasons: ['Reinvestment runway requires traceable, finite inputs.'] };
  }
  const roicSpreadPct = input.incrementalRoicPct - input.waccPct;
  let state: ReinvestmentRunwayState = 'LIMITED';
  if (roicSpreadPct <= 0) state = 'VALUE_DESTROYING';
  else if (input.runwayYears >= 10 && roicSpreadPct >= 10 && input.reinvestmentRatePct >= 40) state = 'ELITE';
  else if (input.runwayYears >= 5 && roicSpreadPct >= 5 && input.reinvestmentRatePct >= 25) state = 'STRONG';
  if (state === 'LIMITED') reasons.push('Positive economics exist, but runway, ROIC spread or reinvestment rate is not strong enough for elite compounding.');
  if (state === 'VALUE_DESTROYING') reasons.push('Incremental ROIC does not exceed the cost of capital.');
  return { state, roicSpreadPct, reasons };
}

export interface PerShareEconomicsInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  revenueGrowthPct: number;
  fcfGrowthPct: number;
  fcfPerShareGrowthPct: number;
  epsPerShareGrowthPct: number;
  dilutedShareCountGrowthPct: number;
  sbcPctRevenue?: number;
}

export type PerShareEconomicsState = 'OWNER_ACCRETIVE' | 'MIXED' | 'DILUTION_WARNING' | 'DILUTION_SEVERE' | 'EVIDENCE_PENDING';

export interface PerShareEconomicsResult {
  state: PerShareEconomicsState;
  fcfOwnershipLeakagePct: number | null;
  reasons: string[];
}

export function evaluatePerShareEconomics(input: PerShareEconomicsInput): PerShareEconomicsResult {
  const values = [input.revenueGrowthPct, input.fcfGrowthPct, input.fcfPerShareGrowthPct, input.epsPerShareGrowthPct, input.dilutedShareCountGrowthPct];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !values.every(Number.isFinite)) {
    return { state: 'EVIDENCE_PENDING', fcfOwnershipLeakagePct: null, reasons: ['Per-share economics requires traceable growth and share-count evidence.'] };
  }
  const reasons: string[] = [];
  const fcfOwnershipLeakagePct = Math.max(0, input.fcfGrowthPct - input.fcfPerShareGrowthPct);
  let state: PerShareEconomicsState = 'MIXED';
  if (input.dilutedShareCountGrowthPct >= 5 || fcfOwnershipLeakagePct >= 10) state = 'DILUTION_SEVERE';
  else if (input.dilutedShareCountGrowthPct >= 2 || fcfOwnershipLeakagePct >= 5) state = 'DILUTION_WARNING';
  else if (input.fcfPerShareGrowthPct > 0 && input.epsPerShareGrowthPct > 0 && input.dilutedShareCountGrowthPct <= 0.5) state = 'OWNER_ACCRETIVE';
  if (state === 'DILUTION_WARNING' || state === 'DILUTION_SEVERE') reasons.push('Enterprise growth is leaking before it reaches the continuing shareholder on a per-share basis.');
  if (finite(input.sbcPctRevenue) && input.sbcPctRevenue >= 10) reasons.push('Stock-based compensation is material and must be treated as an economic cost.');
  return { state, fcfOwnershipLeakagePct, reasons };
}

export interface MoatMigrationInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  currentMoatScore: number;
  forwardMoatScore: number;
  dataAdvantageScore: number;
  workflowEmbeddednessScore: number;
  regulatoryOrCertificationScore: number;
  networkOrScaleScore: number;
  aiSubstitutionRiskScore: number;
}

export type MoatMigrationState = 'MIGRATING_STRONGER' | 'STABLE' | 'WEAKENING' | 'COLLAPSING' | 'EVIDENCE_PENDING';

export interface MoatMigrationResult {
  state: MoatMigrationState;
  moatDelta: number | null;
  structuralMoatScore: number | null;
  reasons: string[];
}

export function evaluateMoatMigration(input: MoatMigrationInput): MoatMigrationResult {
  const raw = [input.currentMoatScore, input.forwardMoatScore, input.dataAdvantageScore, input.workflowEmbeddednessScore, input.regulatoryOrCertificationScore, input.networkOrScaleScore, input.aiSubstitutionRiskScore];
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !raw.every(Number.isFinite)) {
    return { state: 'EVIDENCE_PENDING', moatDelta: null, structuralMoatScore: null, reasons: ['Moat migration requires traceable structural evidence.'] };
  }
  const structuralMoatScore = (
    clamp(input.dataAdvantageScore) + clamp(input.workflowEmbeddednessScore) +
    clamp(input.regulatoryOrCertificationScore) + clamp(input.networkOrScaleScore)
  ) / 4;
  const moatDelta = input.forwardMoatScore - input.currentMoatScore;
  const reasons: string[] = [];
  let state: MoatMigrationState = 'STABLE';
  if (moatDelta <= -15 || input.aiSubstitutionRiskScore >= 90) state = 'COLLAPSING';
  else if (moatDelta < -5 || input.aiSubstitutionRiskScore >= 70) state = 'WEAKENING';
  else if (moatDelta >= 5 && input.aiSubstitutionRiskScore < 60 && structuralMoatScore >= 70) state = 'MIGRATING_STRONGER';
  if (state === 'WEAKENING' || state === 'COLLAPSING') reasons.push('Current moat cannot be assumed durable; future workflow/data/regulatory position is deteriorating or exposed to substitution.');
  return { state, moatDelta, structuralMoatScore, reasons };
}

export interface CapitalAllocationQualityInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  incrementalRoicPct: number;
  waccPct: number;
  netShareCountChangePct: number;
  dividendYieldPct: number;
  acquisitionReturnSpreadPct?: number;
  netDebtChangePct?: number;
}

export type CapitalAllocationState = 'VALUE_CREATING' | 'MIXED' | 'VALUE_DESTROYING' | 'EVIDENCE_PENDING';

export interface CapitalAllocationQualityResult {
  state: CapitalAllocationState;
  roicSpreadPct: number | null;
  shareholderYieldFloorPct: number | null;
  reasons: string[];
}

export function evaluateCapitalAllocationQuality(input: CapitalAllocationQualityInput): CapitalAllocationQualityResult {
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || ![input.incrementalRoicPct, input.waccPct, input.netShareCountChangePct, input.dividendYieldPct].every(Number.isFinite)) {
    return { state: 'EVIDENCE_PENDING', roicSpreadPct: null, shareholderYieldFloorPct: null, reasons: ['Capital allocation quality requires traceable ROIC, dilution and distribution evidence.'] };
  }
  const reasons: string[] = [];
  const roicSpreadPct = input.incrementalRoicPct - input.waccPct;
  const netBuybackYieldPct = Math.max(0, -input.netShareCountChangePct);
  const shareholderYieldFloorPct = input.dividendYieldPct + netBuybackYieldPct;
  let state: CapitalAllocationState = 'MIXED';
  if (roicSpreadPct < 0 || (finite(input.acquisitionReturnSpreadPct) && input.acquisitionReturnSpreadPct < -3)) state = 'VALUE_DESTROYING';
  else if (roicSpreadPct >= 5 && input.netShareCountChangePct <= 1 && (!finite(input.acquisitionReturnSpreadPct) || input.acquisitionReturnSpreadPct >= 0)) state = 'VALUE_CREATING';
  if (finite(input.netDebtChangePct) && input.netDebtChangePct > 25) reasons.push('Rapid debt growth requires a separate balance-sheet and refinancing stress test.');
  return { state, roicSpreadPct, shareholderYieldFloorPct, reasons };
}

export interface ExpectedCagrDriverInput {
  normalizedFcfGrowthPct: number;
  shareholderYieldPct: number;
  annualizedMultipleChangePct: number;
  dilutionPct: number;
  fragilityPenaltyPct: number;
}

export interface ExpectedCagrDriverResult {
  expectedCagrApproxPct: number | null;
  components: ExpectedCagrDriverInput;
  rule: 'DIAGNOSTIC_BRIDGE_NOT_SCENARIO_REPLACEMENT';
}

export function decomposeExpectedCagrDrivers(input: ExpectedCagrDriverInput): ExpectedCagrDriverResult {
  const values = Object.values(input);
  const expectedCagrApproxPct = values.every(Number.isFinite)
    ? input.normalizedFcfGrowthPct + input.shareholderYieldPct + input.annualizedMultipleChangePct - input.dilutionPct - input.fragilityPenaltyPct
    : null;
  return { expectedCagrApproxPct, components: input, rule: 'DIAGNOSTIC_BRIDGE_NOT_SCENARIO_REPLACEMENT' };
}

export interface ValuationCompressionStressInput {
  expectedCagrPct: number;
  horizonYears: number;
  terminalMultipleCompressionPct: number;
}

export interface ValuationCompressionStressResult {
  stressedCagrPct: number | null;
  annualizedValuationDragPct: number | null;
  survivesCompression: boolean;
}

export function evaluateValuationCompressionStress(input: ValuationCompressionStressInput): ValuationCompressionStressResult {
  if (![input.expectedCagrPct, input.horizonYears, input.terminalMultipleCompressionPct].every(Number.isFinite) || input.horizonYears <= 0 || input.terminalMultipleCompressionPct < 0 || input.terminalMultipleCompressionPct >= 100) {
    return { stressedCagrPct: null, annualizedValuationDragPct: null, survivesCompression: false };
  }
  const baseTerminalFactor = Math.pow(1 + input.expectedCagrPct / 100, input.horizonYears);
  const multipleFactor = 1 - input.terminalMultipleCompressionPct / 100;
  const stressedTerminalFactor = baseTerminalFactor * multipleFactor;
  const stressedCagrPct = (Math.pow(stressedTerminalFactor, 1 / input.horizonYears) - 1) * 100;
  const annualizedValuationDragPct = (Math.pow(multipleFactor, 1 / input.horizonYears) - 1) * 100;
  return { stressedCagrPct, annualizedValuationDragPct, survivesCompression: stressedCagrPct > 0 };
}

export interface ConvexityRuinGuardInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  netDebtToEbitda?: number;
  interestCoverage?: number;
  refinancingWithin24mPctDebt?: number;
  forcedEquityRiskScore: number;
  permanentLossRiskScore: number;
  binaryEventDependencyScore: number;
}

export type ConvexityRuinState = 'PASS' | 'WARN' | 'VETO' | 'EVIDENCE_PENDING';

export interface ConvexityRuinGuardResult {
  state: ConvexityRuinState;
  reasons: string[];
}

export function evaluateConvexityRuinGuard(input: ConvexityRuinGuardInput): ConvexityRuinGuardResult {
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds)) return { state: 'EVIDENCE_PENDING', reasons: ['Ruin guard requires traceable balance-sheet and downside evidence.'] };
  const reasons: string[] = [];
  let state: ConvexityRuinState = 'PASS';
  if (input.permanentLossRiskScore >= 80 || input.forcedEquityRiskScore >= 85 || (finite(input.interestCoverage) && input.interestCoverage < 1.5)) state = 'VETO';
  else if ((finite(input.netDebtToEbitda) && input.netDebtToEbitda > 3.5) || (finite(input.refinancingWithin24mPctDebt) && input.refinancingWithin24mPctDebt > 40) || input.binaryEventDependencyScore >= 70) state = 'WARN';
  if (state === 'VETO') reasons.push('Potential expected return is rejected because the structure exposes the investor to unacceptable permanent-loss or forced-financing risk.');
  if (state === 'WARN') reasons.push('Convexity exists, but balance-sheet, refinancing or binary-event fragility can dominate the upside case.');
  return { state, reasons };
}

export interface ActiveVsIndexHurdleInput {
  candidateExpectedCagrPct: number;
  benchmarkExpectedCagrPct: number;
  requiredAdvantagePct?: number;
}

export interface ActiveVsIndexHurdleResult {
  gate: 'PASS' | 'FAIL' | 'EVIDENCE_PENDING';
  advantagePct: number | null;
  requiredAdvantagePct: number;
}

export function evaluateActiveVsIndexHurdle(input: ActiveVsIndexHurdleInput): ActiveVsIndexHurdleResult {
  const requiredAdvantagePct = finite(input.requiredAdvantagePct) ? Math.max(0, input.requiredAdvantagePct) : 2;
  if (!finite(input.candidateExpectedCagrPct) || !finite(input.benchmarkExpectedCagrPct)) return { gate: 'EVIDENCE_PENDING', advantagePct: null, requiredAdvantagePct };
  const advantagePct = input.candidateExpectedCagrPct - input.benchmarkExpectedCagrPct;
  return { gate: advantagePct >= requiredAdvantagePct ? 'PASS' : 'FAIL', advantagePct, requiredAdvantagePct };
}

export interface ReplacementHurdleInput {
  incumbentTicker: string;
  challengerTicker: string;
  evidenceTraceable: boolean;
  evidenceIds: string[];
  incumbentExpectedCagrPct: number;
  challengerExpectedCagrPct: number;
  incumbentScore: number;
  challengerScore: number;
  benchmarkExpectedCagrPct: number;
  activeIndexHurdlePct?: number;
  minimumExpectedCagrAdvantagePct?: number;
  minimumScoreAdvantage?: number;
  rotationFrictionPct?: number;
  incumbentStructuralFalsifier?: boolean;
  challengerStructuralFalsifier?: boolean;
}

export type ReplacementVerdict = 'REPLACE_ALLOWED' | 'KEEP_INCUMBENT' | 'REJECT_CHALLENGER' | 'EVIDENCE_PENDING';

export interface ReplacementHurdleResult {
  verdict: ReplacementVerdict;
  grossExpectedCagrAdvantagePct: number | null;
  netExpectedCagrAdvantagePct: number | null;
  scoreAdvantage: number | null;
  activeVsIndex: ActiveVsIndexHurdleResult;
  reasons: string[];
}

export function evaluateReplacementHurdle(input: ReplacementHurdleInput): ReplacementHurdleResult {
  const reasons: string[] = [];
  const activeVsIndex = evaluateActiveVsIndexHurdle({
    candidateExpectedCagrPct: input.challengerExpectedCagrPct,
    benchmarkExpectedCagrPct: input.benchmarkExpectedCagrPct,
    requiredAdvantagePct: input.activeIndexHurdlePct,
  });
  const finiteCore = [input.incumbentExpectedCagrPct, input.challengerExpectedCagrPct, input.incumbentScore, input.challengerScore].every(Number.isFinite);
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !finiteCore) {
    return { verdict: 'EVIDENCE_PENDING', grossExpectedCagrAdvantagePct: null, netExpectedCagrAdvantagePct: null, scoreAdvantage: null, activeVsIndex, reasons: ['Replacement requires traceable comparable evidence for both incumbent and challenger.'] };
  }
  if (input.challengerStructuralFalsifier === true) {
    return { verdict: 'REJECT_CHALLENGER', grossExpectedCagrAdvantagePct: input.challengerExpectedCagrPct - input.incumbentExpectedCagrPct, netExpectedCagrAdvantagePct: null, scoreAdvantage: input.challengerScore - input.incumbentScore, activeVsIndex, reasons: ['Challenger has a confirmed structural falsifier.'] };
  }

  const grossExpectedCagrAdvantagePct = input.challengerExpectedCagrPct - input.incumbentExpectedCagrPct;
  const rotationFrictionPct = finite(input.rotationFrictionPct) ? Math.max(0, input.rotationFrictionPct) : 0;
  const netExpectedCagrAdvantagePct = grossExpectedCagrAdvantagePct - rotationFrictionPct;
  const scoreAdvantage = input.challengerScore - input.incumbentScore;
  const minimumExpectedCagrAdvantagePct = finite(input.minimumExpectedCagrAdvantagePct) ? Math.max(0, input.minimumExpectedCagrAdvantagePct) : 3;
  const minimumScoreAdvantage = finite(input.minimumScoreAdvantage) ? Math.max(0, input.minimumScoreAdvantage) : 5;

  if (input.incumbentStructuralFalsifier === true) {
    reasons.push('Incumbent has a confirmed structural falsifier; incumbent advantage is revoked.');
    return { verdict: activeVsIndex.gate === 'PASS' ? 'REPLACE_ALLOWED' : 'KEEP_INCUMBENT', grossExpectedCagrAdvantagePct, netExpectedCagrAdvantagePct, scoreAdvantage, activeVsIndex, reasons };
  }
  if (activeVsIndex.gate !== 'PASS') {
    reasons.push('Challenger does not clear the active-vs-index hurdle.');
    return { verdict: 'KEEP_INCUMBENT', grossExpectedCagrAdvantagePct, netExpectedCagrAdvantagePct, scoreAdvantage, activeVsIndex, reasons };
  }

  const clearsReturnHurdle = netExpectedCagrAdvantagePct >= minimumExpectedCagrAdvantagePct;
  const clearsScoreHurdle = scoreAdvantage >= minimumScoreAdvantage;
  if (clearsReturnHurdle || clearsScoreHurdle) {
    reasons.push('Challenger clears the anti-churn replacement hurdle after explicit rotation friction.');
    return { verdict: 'REPLACE_ALLOWED', grossExpectedCagrAdvantagePct, netExpectedCagrAdvantagePct, scoreAdvantage, activeVsIndex, reasons };
  }
  reasons.push('Incumbent wins the tie: the challenger advantage is too small to justify churn.');
  return { verdict: 'KEEP_INCUMBENT', grossExpectedCagrAdvantagePct, netExpectedCagrAdvantagePct, scoreAdvantage, activeVsIndex, reasons };
}

export interface PreMortemFailureMode {
  id: string;
  probabilityPct: number;
  severityScore: number;
  mitigated: boolean;
  evidenceId?: string;
}

export interface PreMortemInversionInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  failureModes: PreMortemFailureMode[];
}

export type PreMortemState = 'PASS' | 'RED_TEAM_REQUIRED' | 'VETO' | 'EVIDENCE_PENDING';

export interface PreMortemInversionResult {
  state: PreMortemState;
  highestUnmitigatedRiskScore: number | null;
  dominantFailureMode: string | null;
  reasons: string[];
}

export function evaluatePreMortemInversion(input: PreMortemInversionInput): PreMortemInversionResult {
  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !input.failureModes.length) {
    return { state: 'EVIDENCE_PENDING', highestUnmitigatedRiskScore: null, dominantFailureMode: null, reasons: ['Pre-mortem requires explicit, evidence-linked failure modes.'] };
  }
  const normalized = input.failureModes
    .filter((mode) => Number.isFinite(mode.probabilityPct) && Number.isFinite(mode.severityScore))
    .map((mode) => ({ ...mode, risk: clamp(mode.probabilityPct) / 100 * clamp(mode.severityScore) }));
  const unmitigated = normalized.filter((mode) => !mode.mitigated).sort((a, b) => b.risk - a.risk);
  const dominant = unmitigated[0];
  if (!dominant) return { state: 'PASS', highestUnmitigatedRiskScore: 0, dominantFailureMode: null, reasons: [] };
  let state: PreMortemState = 'PASS';
  if (dominant.probabilityPct >= 50 && dominant.severityScore >= 80) state = 'VETO';
  else if (dominant.risk >= 30) state = 'RED_TEAM_REQUIRED';
  return {
    state,
    highestUnmitigatedRiskScore: dominant.risk,
    dominantFailureMode: dominant.id,
    reasons: state === 'PASS' ? [] : [`Dominant unmitigated failure mode: ${dominant.id}.`],
  };
}

export const INVESTMENT_DISCIPLINE_COMPOUNDING_OMEGA_LAWS = [
  'BASE RATE BEFORE HERO STORY.',
  'SURVIVORSHIP EVIDENCE WITHOUT FAILURES IS PROCESS-INVALID.',
  'NARRATIVE MUST BRIDGE TAM -> CUSTOMERS -> VOLUME/PRICE -> REVENUE -> MARGIN -> OCF -> FCF -> ROIC -> PER SHARE.',
  'GROWTH WITHOUT INCREMENTAL ROIC ABOVE WACC IS NOT COMPOUNDING.',
  'ENTERPRISE GROWTH != PER-SHARE OWNER ECONOMICS.',
  'CURRENT MOAT != FUTURE MOAT; AI CAN MIGRATE THE SOURCE OF DURABILITY.',
  'BUYBACK HEADLINE != SHAREHOLDER ACCRETION; NET SHARE COUNT MATTERS.',
  'EXPECTED CAGR DRIVER DECOMPOSITION IS A DIAGNOSTIC BRIDGE, NOT A SUBSTITUTE FOR BEAR/BASE/BULL SCENARIO VALUATION.',
  'A GREAT BUSINESS MUST SURVIVE VALUATION COMPRESSION TO BE A GREAT STOCK FROM TODAY.',
  'AVOIDING RUIN DOMINATES MAXIMIZING A SMALL INCREMENTAL CAGR.',
  'ACTIVE STOCK SELECTION MUST CLEAR AN INDEX HURDLE.',
  'INCUMBENT WINS THE TIE; REPLACEMENT REQUIRES >=3PP NET EXPECTED CAGR ADVANTAGE OR >=5 SCORE POINTS, ABSENT A STRUCTURAL FALSIFIER.',
  'CATALYST != THESIS; PRODUCT/USAGE/BACKLOG != FCF.',
  'CYCLICALS REQUIRE MID-CYCLE ECONOMICS, NOT PEAK-EARNINGS ANNUALIZATION.',
  'PRE-MORTEM AND INVERSION ARE MANDATORY BEFORE A HIGH-CONVICTION REPLACEMENT.',
] as const;
