export type ForwardDeteriorationSeverity = 'NONE' | 'YELLOW' | 'ORANGE' | 'RED';
export type AtlasAction =
  | 'MAINTAIN'
  | 'REAUDIT'
  | 'REDUCE_REVIEW'
  | 'OPEN_CHALLENGER_DUEL'
  | 'REPLACEMENT_REVIEW'
  | 'EXCLUSION_REVIEW';

export type IndexTier = 'SP100' | 'SP500' | 'SP400' | 'SP600' | 'OTHER';

export interface FundamentalKpiChange {
  /** Sector-appropriate KPI: revenue, ARR, billings, RPO, net-new ARR, comps, backlog, ASP, volume, margin, FCF, etc. */
  name: string;
  /** True only when the KPI deterioration is economically material for this business/sector. */
  materiallyWorse: boolean;
  /** Optional current/previous values for traceability; evaluator does not invent thresholds. */
  currentValue?: number;
  previousValue?: number;
  unit?: string;
}

export interface ForwardDeteriorationInput {
  ticker: string;
  currentGrowthPct?: number;
  guidedGrowthPct?: number;
  /**
   * True only when current and guided growth are genuinely comparable after normalizing
   * period length, base effects, acquisitions/divestitures, FX and mix where material.
   * This prevents false positives such as quarterly growth vs full-year guidance.
   */
  comparableGrowthBasis: boolean;
  /** Optional already-normalized delta. If supplied, takes precedence over raw subtraction. */
  normalizedGrowthDeltaPp?: number;
  explicitGuidanceCut?: boolean;
  kpis?: FundamentalKpiChange[];
  balanceSheetProblem?: boolean;
  materialDilution?: boolean;
  customerOrContractLoss?: boolean;
  adverseThesisChange?: boolean;
  evidenceTraceable: boolean;
  primarySourceConfirmed: boolean;
}

export interface ForwardDeteriorationResult {
  ticker: string;
  severity: ForwardDeteriorationSeverity;
  growthDeltaPp: number | null;
  materiallyWorseKpiCount: number;
  reasons: string[];
  action: AtlasAction;
  notify: boolean;
  evidenceState: 'CONFIRMED' | 'PROVISIONAL';
}

function severityRank(value: ForwardDeteriorationSeverity): number {
  return { NONE: 0, YELLOW: 1, ORANGE: 2, RED: 3 }[value];
}

function maxSeverity(a: ForwardDeteriorationSeverity, b: ForwardDeteriorationSeverity): ForwardDeteriorationSeverity {
  return severityRank(a) >= severityRank(b) ? a : b;
}

function actionForSeverity(severity: ForwardDeteriorationSeverity): AtlasAction {
  if (severity === 'RED') return 'REPLACEMENT_REVIEW';
  if (severity === 'ORANGE') return 'REAUDIT';
  if (severity === 'YELLOW') return 'MAINTAIN';
  return 'MAINTAIN';
}

export function evaluateForwardDeterioration(input: ForwardDeteriorationInput): ForwardDeteriorationResult {
  const reasons: string[] = [];
  const kpis = input.kpis ?? [];
  const materiallyWorseKpiCount = kpis.filter((kpi) => kpi.materiallyWorse).length;

  let growthDeltaPp: number | null = null;
  if (input.comparableGrowthBasis) {
    if (typeof input.normalizedGrowthDeltaPp === 'number') {
      growthDeltaPp = input.normalizedGrowthDeltaPp;
    } else if (typeof input.currentGrowthPct === 'number' && typeof input.guidedGrowthPct === 'number') {
      growthDeltaPp = input.currentGrowthPct - input.guidedGrowthPct;
    }
  }

  let severity: ForwardDeteriorationSeverity = 'NONE';

  if (growthDeltaPp !== null) {
    if (growthDeltaPp >= 8) {
      severity = 'RED';
      reasons.push(`Comparable guided growth deteriorates by ${growthDeltaPp.toFixed(1)} pp (>=8 pp).`);
    } else if (growthDeltaPp >= 5) {
      severity = maxSeverity(severity, 'ORANGE');
      reasons.push(`Comparable guided growth deteriorates by ${growthDeltaPp.toFixed(1)} pp (>=5 pp).`);
    } else if (growthDeltaPp >= 3) {
      severity = maxSeverity(severity, 'YELLOW');
      reasons.push(`Comparable guided growth deteriorates by ${growthDeltaPp.toFixed(1)} pp (>=3 pp).`);
    }
  } else if (
    typeof input.currentGrowthPct === 'number' &&
    typeof input.guidedGrowthPct === 'number' &&
    !input.comparableGrowthBasis
  ) {
    reasons.push('Raw growth comparison suppressed: periods/bases are not normalized and comparable.');
  }

  if (materiallyWorseKpiCount >= 2) {
    severity = 'RED';
    reasons.push(`${materiallyWorseKpiCount} fundamental KPIs deteriorated materially at the same time.`);
  } else if (materiallyWorseKpiCount === 1) {
    severity = maxSeverity(severity, 'ORANGE');
    reasons.push('A principal sector-appropriate KPI deteriorated materially.');
  }

  if (input.explicitGuidanceCut) {
    severity = 'RED';
    reasons.push('Management explicitly cut guidance.');
  }

  const structuralRedFlags: Array<[boolean | undefined, string]> = [
    [input.balanceSheetProblem, 'Material balance-sheet deterioration/problem.'],
    [input.materialDilution, 'Material dilution detected.'],
    [input.customerOrContractLoss, 'Material customer/contract loss detected.'],
    [input.adverseThesisChange, 'Material adverse thesis change detected.'],
  ];

  for (const [active, reason] of structuralRedFlags) {
    if (active) {
      severity = maxSeverity(severity, 'ORANGE');
      reasons.push(reason);
    }
  }

  const evidenceState = input.evidenceTraceable && input.primarySourceConfirmed ? 'CONFIRMED' : 'PROVISIONAL';

  return {
    ticker: input.ticker,
    severity,
    growthDeltaPp,
    materiallyWorseKpiCount,
    reasons,
    action: actionForSeverity(severity),
    notify: severity !== 'NONE' && evidenceState === 'CONFIRMED',
    evidenceState,
  };
}

export interface IndexMigrationInput {
  ticker: string;
  from: IndexTier;
  to: IndexTier;
  effectiveDate?: string;
  evidenceTraceable: boolean;
}

export interface IndexMigrationResult {
  ticker: string;
  direction: 'PROMOTION' | 'DEMOTION' | 'LATERAL_OR_OTHER';
  /** Bounded secondary signal only. Never overrides hard gates or fundamental deterioration. */
  indexSignalPoints: -2 | -1 | 0 | 1 | 2;
  /** T0/First Law: index inclusion never grants Business Quality points. */
  businessQualityPoints: 0;
  discoveryPriority: 'NORMAL' | 'ELEVATED' | 'HIGH';
  requiresFundamentalAudit: boolean;
  canTriggerBuyAlone: false;
  canTriggerSellAlone: false;
}

const tierRank: Record<IndexTier, number> = {
  OTHER: 0,
  SP600: 1,
  SP400: 2,
  SP500: 3,
  SP100: 4,
};

export function evaluateIndexMigration(input: IndexMigrationInput): IndexMigrationResult {
  const delta = tierRank[input.to] - tierRank[input.from];
  const direction = delta > 0 ? 'PROMOTION' : delta < 0 ? 'DEMOTION' : 'LATERAL_OR_OTHER';

  let indexSignalPoints: -2 | -1 | 0 | 1 | 2 = 0;
  if (delta >= 1) indexSignalPoints = delta >= 2 || input.to === 'SP100' || input.to === 'SP500' ? 2 : 1;
  if (delta <= -1) indexSignalPoints = delta <= -2 || input.from === 'SP100' || input.from === 'SP500' ? -2 : -1;

  const discoveryPriority = direction === 'PROMOTION' ? (input.to === 'SP100' || input.to === 'SP500' ? 'HIGH' : 'ELEVATED') : 'NORMAL';

  return {
    ticker: input.ticker,
    direction,
    indexSignalPoints,
    businessQualityPoints: 0,
    discoveryPriority,
    requiresFundamentalAudit: direction !== 'LATERAL_OR_OTHER',
    canTriggerBuyAlone: false,
    canTriggerSellAlone: false,
  };
}

export interface IndexPromotionDiscoveryCandidate {
  ticker: string;
  source: 'INDEX_PROMOTION';
  discoveryPriority: 'ELEVATED' | 'HIGH';
  startingScore: 0;
  mandatoryT0AntiMegacapGate: true;
  mandatoryForwardDeteriorationAudit: true;
}

export function promoteIndexEventToDiscovery(input: IndexMigrationInput): IndexPromotionDiscoveryCandidate | null {
  const migration = evaluateIndexMigration(input);
  if (migration.direction !== 'PROMOTION') return null;

  return {
    ticker: input.ticker,
    source: 'INDEX_PROMOTION',
    discoveryPriority: migration.discoveryPriority === 'NORMAL' ? 'ELEVATED' : migration.discoveryPriority,
    startingScore: 0,
    mandatoryT0AntiMegacapGate: true,
    mandatoryForwardDeteriorationAudit: true,
  };
}
