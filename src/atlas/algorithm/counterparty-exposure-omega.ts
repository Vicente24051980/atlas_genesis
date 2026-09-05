export const RHO_COUNTERPARTY_EXPOSURE_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export type RhoExposureKind =
  | 'RECOGNIZED'
  | 'DRAWN'
  | 'MAXIMUM_FACILITY'
  | 'CONTINGENT'
  | 'NO_CUANTIFICADA';

export interface RhoExposureRecord {
  position: string;
  counterparty: string | 'COUNTERPARTY_UNDISCLOSED';
  economicBeneficiary?: string | null;
  exposureType: string;
  kind: RhoExposureKind;
  amount?: number | null;
  currency?: string | null;
  asOf: string;
  sourceId: string;
  ordinarySales: boolean;
  material: boolean;
}

export interface RhoCounterpartyAggregate {
  counterparty: string;
  positions: string[];
  records: number;
  quantifiedByKind: Partial<Record<Exclude<RhoExposureKind, 'NO_CUANTIFICADA'>, Record<string, number>>>;
  unquantifiedRecords: number;
}

export interface RhoResult {
  state: 'MEASURABLE' | 'EVIDENCE_PENDING';
  aggregates: RhoCounterpartyAggregate[];
  rejectedOrdinarySales: number;
  directAtlasScoreDelta: 0;
  canBuySell: false;
  canSetWeight: false;
  canAdmitExclude: false;
  reasons: string[];
}

function finitePositive(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value) && value >= 0;
}

export function evaluateRhoCounterpartyExposure(records: readonly RhoExposureRecord[]): RhoResult {
  const usable = records.filter((r) => r.material && !r.ordinarySales && r.position.trim() && r.counterparty.trim() && r.sourceId.trim());
  const invalidQuantified = usable.some((r) => r.kind !== 'NO_CUANTIFICADA' && (!finitePositive(r.amount) || !r.currency?.trim()));
  const invalidUnquantified = usable.some((r) => r.kind === 'NO_CUANTIFICADA' && r.amount != null);
  if (invalidQuantified || invalidUnquantified) {
    return {
      state: 'EVIDENCE_PENDING', aggregates: [], rejectedOrdinarySales: records.filter((r) => r.ordinarySales).length,
      directAtlasScoreDelta: 0, canBuySell: false, canSetWeight: false, canAdmitExclude: false,
      reasons: ['Quantified exposures require non-negative amount and currency; NO_CUANTIFICADA must not carry a fabricated amount.'],
    };
  }

  const map = new Map<string, RhoCounterpartyAggregate>();
  for (const r of usable) {
    const current = map.get(r.counterparty) ?? {
      counterparty: r.counterparty, positions: [], records: 0, quantifiedByKind: {}, unquantifiedRecords: 0,
    };
    if (!current.positions.includes(r.position)) current.positions.push(r.position);
    current.records += 1;
    if (r.kind === 'NO_CUANTIFICADA') {
      current.unquantifiedRecords += 1;
    } else {
      const byCurrency = current.quantifiedByKind[r.kind] ?? {};
      byCurrency[r.currency as string] = (byCurrency[r.currency as string] ?? 0) + (r.amount as number);
      current.quantifiedByKind[r.kind] = byCurrency;
    }
    map.set(r.counterparty, current);
  }

  const aggregates = [...map.values()].sort((a, b) => b.positions.length - a.positions.length || a.counterparty.localeCompare(b.counterparty));
  return {
    state: usable.length ? 'MEASURABLE' : 'EVIDENCE_PENDING',
    aggregates,
    rejectedOrdinarySales: records.filter((r) => r.ordinarySales).length,
    directAtlasScoreDelta: 0,
    canBuySell: false,
    canSetWeight: false,
    canAdmitExclude: false,
    reasons: [
      'Ρ aggregates only declared non-ordinary-sales third-party exposure; it never estimates undisclosed exposure.',
      'Recognized, drawn, maximum-facility and contingent amounts remain separate because they are economically non-additive.',
      'NO_CUANTIFICADA contributes to position/record counts only and never to notional totals.',
    ],
  };
}
