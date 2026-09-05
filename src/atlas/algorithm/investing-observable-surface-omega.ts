export const INVESTING_OBSERVABLE_SURFACE_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export type ObservableSurfaceSource =
  | 'INVESTING_APP_SCREENSHOT'
  | 'INVESTING_WEB_SCREENSHOT'
  | 'PROPICKS_SCREENSHOT'
  | 'MANUAL_TRANSCRIPTION';

export type EvidenceScope =
  | 'GENERAL_INVESTING_SURFACE'
  | 'PROPICKS_SPECIFIC'
  | 'UNKNOWN';

export type ObservableSignalType =
  | 'PROPICKS_ENTRY'
  | 'PROPICKS_EXIT'
  | 'PROPICKS_RETAINED'
  | 'REALIZED_RETURN'
  | 'BENCHMARK_RETURN'
  | 'FAIR_VALUE'
  | 'FAIR_VALUE_GAP'
  | 'RISK_LABEL'
  | 'REVENUE_ESTIMATE'
  | 'EPS_ESTIMATE'
  | 'ANALYST_RATING'
  | 'ANALYST_TARGET'
  | 'ANALYST_COVERAGE_INITIATION'
  | 'SCREEN_SCORE'
  | 'MOMENTUM_RETURN'
  | 'FIFTY_TWO_WEEK_HIGH'
  | 'FIFTY_TWO_WEEK_LOW'
  | 'PREMARKET_MOVE';

export interface ObservableSurfaceRecord {
  ticker: string;
  observedAt: string;
  source: ObservableSurfaceSource;
  scope: EvidenceScope;
  signalType: ObservableSignalType;
  value?: number | string | null;
  currency?: string | null;
  horizon?: string | null;
  benchmark?: string | null;
  entryDate?: string | null;
  entryPrice?: number | null;
  exitDate?: string | null;
  exitPrice?: number | null;
  evidenceId: string;
}

export interface LongitudinalProPicksTrade {
  ticker: string;
  entryDate?: string;
  entryPrice?: number;
  exitDate?: string;
  exitPrice?: number;
  reportedReturnPct?: number;
  benchmarkReturnPct?: number;
  evidenceIds: string[];
}

export interface ObservableSurfaceSummary {
  ticker: string;
  propicksSpecificEvidence: number;
  generalSurfaceEvidence: number;
  unknownScopeEvidence: number;
  latestObservedAt: string;
  availableSignals: ObservableSignalType[];
  inferredFactorLinks: string[];
  eligibleForPropicksReverseEngineering: boolean;
  constraints: string[];
}

const FACTOR_LINKS: Partial<Record<ObservableSignalType, string[]>> = {
  FAIR_VALUE: ['F5_VALUATION'],
  FAIR_VALUE_GAP: ['F5_VALUATION'],
  REVENUE_ESTIMATE: ['F6_EXPECTATIONS_TRAJECTORY'],
  EPS_ESTIMATE: ['F6_EXPECTATIONS_TRAJECTORY'],
  ANALYST_TARGET: ['F6_EXPECTATIONS_TRAJECTORY_DIAGNOSTIC_ONLY'],
  ANALYST_COVERAGE_INITIATION: ['F6_EXPECTATIONS_TRAJECTORY_BOUNDED_SECONDARY'],
  ANALYST_RATING: ['F6_EXPECTATIONS_TRAJECTORY_BOUNDED_SECONDARY'],
  MOMENTUM_RETURN: ['F7_RELATIVE_MOMENTUM'],
  FIFTY_TWO_WEEK_HIGH: ['F8_TECHNICAL_LIQUIDITY'],
  FIFTY_TWO_WEEK_LOW: ['F8_TECHNICAL_LIQUIDITY'],
  PREMARKET_MOVE: ['F8_TECHNICAL_LIQUIDITY'],
  RISK_LABEL: ['F9_MARKET_RISK_DIAGNOSTIC'],
};

export function validateObservableRecord(record: ObservableSurfaceRecord): string[] {
  const errors: string[] = [];
  if (!record.ticker.trim()) errors.push('TICKER_REQUIRED');
  if (!record.observedAt.trim()) errors.push('OBSERVED_AT_REQUIRED');
  if (!record.evidenceId.trim()) errors.push('EVIDENCE_ID_REQUIRED');
  if (record.scope !== 'PROPICKS_SPECIFIC' && ['PROPICKS_ENTRY', 'PROPICKS_EXIT', 'PROPICKS_RETAINED'].includes(record.signalType)) {
    errors.push('PROPICKS_SIGNAL_REQUIRES_PROPICKS_SPECIFIC_SCOPE');
  }
  if (record.signalType === 'REALIZED_RETURN' && typeof record.value !== 'number') {
    errors.push('REALIZED_RETURN_REQUIRES_NUMERIC_VALUE');
  }
  return errors;
}

export function summarizeObservableSurface(records: ObservableSurfaceRecord[]): ObservableSurfaceSummary[] {
  const groups = new Map<string, ObservableSurfaceRecord[]>();
  for (const record of records) {
    const errors = validateObservableRecord(record);
    if (errors.length) continue;
    const ticker = record.ticker.toUpperCase();
    const current = groups.get(ticker) ?? [];
    current.push({ ...record, ticker });
    groups.set(ticker, current);
  }

  return [...groups.entries()].map(([ticker, rows]) => {
    const signals = [...new Set(rows.map((r) => r.signalType))];
    const factorLinks = [...new Set(signals.flatMap((s) => FACTOR_LINKS[s] ?? []))];
    const propicksSpecificEvidence = rows.filter((r) => r.scope === 'PROPICKS_SPECIFIC').length;
    const generalSurfaceEvidence = rows.filter((r) => r.scope === 'GENERAL_INVESTING_SURFACE').length;
    const unknownScopeEvidence = rows.filter((r) => r.scope === 'UNKNOWN').length;
    const latestObservedAt = rows.map((r) => r.observedAt).sort().at(-1) ?? '';

    const hasSelectionEvent = signals.some((s) => ['PROPICKS_ENTRY', 'PROPICKS_EXIT', 'PROPICKS_RETAINED'].includes(s));
    const eligibleForPropicksReverseEngineering = propicksSpecificEvidence > 0 && hasSelectionEvent;

    return {
      ticker,
      propicksSpecificEvidence,
      generalSurfaceEvidence,
      unknownScopeEvidence,
      latestObservedAt,
      availableSignals: signals.sort(),
      inferredFactorLinks: factorLinks.sort(),
      eligibleForPropicksReverseEngineering,
      constraints: [
        'GENERAL_INVESTING_SURFACE_DOES_NOT_PROVE_PROPICKS_FEATURE_USAGE',
        'OBSERVABLE_OUTPUT_DOES_NOT_REVEAL_PROPRIETARY_MODEL_WEIGHTS',
        'NO_SCORE_WEIGHT_CHANGE_WITHOUT_WALK_FORWARD_EVIDENCE',
        'NO_ALPHA_CLAIM_FROM_PROMOTIONAL_OR_PARTIAL_TRADE_HISTORY',
      ],
    };
  });
}

export function reconstructLongitudinalTrades(records: ObservableSurfaceRecord[]): LongitudinalProPicksTrade[] {
  const valid = records.filter((r) => validateObservableRecord(r).length === 0 && r.scope === 'PROPICKS_SPECIFIC');
  const byTicker = new Map<string, ObservableSurfaceRecord[]>();
  for (const row of valid) {
    const ticker = row.ticker.toUpperCase();
    const current = byTicker.get(ticker) ?? [];
    current.push(row);
    byTicker.set(ticker, current);
  }

  const trades: LongitudinalProPicksTrade[] = [];
  for (const [ticker, rows] of byTicker.entries()) {
    const entry = rows.find((r) => r.signalType === 'PROPICKS_ENTRY' || r.entryDate || r.entryPrice != null);
    const exit = rows.find((r) => r.signalType === 'PROPICKS_EXIT' || r.exitDate || r.exitPrice != null);
    const realized = rows.find((r) => r.signalType === 'REALIZED_RETURN' && typeof r.value === 'number');
    const benchmark = rows.find((r) => r.signalType === 'BENCHMARK_RETURN' && typeof r.value === 'number');

    if (!entry && !exit && !realized) continue;

    trades.push({
      ticker,
      entryDate: entry?.entryDate ?? undefined,
      entryPrice: entry?.entryPrice ?? undefined,
      exitDate: exit?.exitDate ?? undefined,
      exitPrice: exit?.exitPrice ?? undefined,
      reportedReturnPct: typeof realized?.value === 'number' ? realized.value : undefined,
      benchmarkReturnPct: typeof benchmark?.value === 'number' ? benchmark.value : undefined,
      evidenceIds: [...new Set(rows.map((r) => r.evidenceId))],
    });
  }
  return trades;
}

export function realizedReturnPct(entryPrice: number, exitPrice: number): number | null {
  if (!(entryPrice > 0) || !Number.isFinite(exitPrice)) return null;
  return Math.round((((exitPrice / entryPrice) - 1) * 100) * 100) / 100;
}
