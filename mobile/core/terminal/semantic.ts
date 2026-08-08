import type { EvidenceValidationState, MarketQuote } from './contracts';

export type FinnhubQuotePayload = {
  c?: number | null;
  d?: number | null;
  dp?: number | null;
  h?: number | null;
  l?: number | null;
  o?: number | null;
  pc?: number | null;
  t?: number | null;
  v?: number | null;
};

const finiteOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function normalizeFinnhubQuote(
  payload: FinnhubQuotePayload,
  observedAt = new Date().toISOString(),
): MarketQuote {
  const price = finiteOrNull(payload.c);
  const previousClose = finiteOrNull(payload.pc);
  const providerPct = finiteOrNull(payload.dp);
  const computedPct = price !== null && previousClose !== null && previousClose !== 0
    ? ((price - previousClose) / previousClose) * 100
    : null;

  return {
    provider: 'FINNHUB',
    session: 'UNKNOWN',
    price,
    changePct: providerPct ?? computedPct,
    volume: finiteOrNull(payload.v),
    observedAt,
    raw: payload,
  };
}

export type EdgarFilingMetadata = {
  form: string;
  accessionNumber: string;
  filingDate: string;
  items: string[];
};

export type FilingEventClass =
  | 'EARNINGS_RESULTS'
  | 'GUIDANCE_OR_MATERIAL_DISCLOSURE'
  | 'GOVERNANCE_CHANGE'
  | 'CAPITAL_STRUCTURE'
  | 'LEADERSHIP_CHANGE'
  | 'LEGAL_OR_DISTRESS'
  | 'OTHER_PRIMARY_DISCLOSURE';

export type FilingReviewPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FilingClassification = {
  eventClass: FilingEventClass;
  priority: FilingReviewPriority;
  validationState: EvidenceValidationState;
  requiresHumanReview: true;
  matchedItems: string[];
  reason: string;
};

const ITEM_RULES: Array<{
  prefix: string;
  eventClass: FilingEventClass;
  priority: FilingReviewPriority;
  reason: string;
}> = [
  { prefix: '1.03', eventClass: 'LEGAL_OR_DISTRESS', priority: 'CRITICAL', reason: 'Bankruptcy or receivership disclosure.' },
  { prefix: '2.02', eventClass: 'EARNINGS_RESULTS', priority: 'HIGH', reason: 'Results of operations and financial condition.' },
  { prefix: '2.05', eventClass: 'GUIDANCE_OR_MATERIAL_DISCLOSURE', priority: 'HIGH', reason: 'Exit or disposal activities may alter operating expectations.' },
  { prefix: '2.06', eventClass: 'GUIDANCE_OR_MATERIAL_DISCLOSURE', priority: 'HIGH', reason: 'Material impairment disclosure.' },
  { prefix: '3.01', eventClass: 'CAPITAL_STRUCTURE', priority: 'HIGH', reason: 'Listing or continued-listing notice.' },
  { prefix: '3.02', eventClass: 'CAPITAL_STRUCTURE', priority: 'MEDIUM', reason: 'Unregistered sale of equity securities.' },
  { prefix: '5.02', eventClass: 'LEADERSHIP_CHANGE', priority: 'HIGH', reason: 'Director or principal officer change.' },
  { prefix: '5.03', eventClass: 'GOVERNANCE_CHANGE', priority: 'LOW', reason: 'Articles/bylaws or fiscal-year change; primary source but not automatically thesis material.' },
  { prefix: '7.01', eventClass: 'GUIDANCE_OR_MATERIAL_DISCLOSURE', priority: 'MEDIUM', reason: 'Regulation FD disclosure requires content review.' },
  { prefix: '8.01', eventClass: 'OTHER_PRIMARY_DISCLOSURE', priority: 'MEDIUM', reason: 'Other material event requires content review.' },
];

const PRIORITY_WEIGHT: Record<FilingReviewPriority, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

export function classifyEdgarFiling(metadata: EdgarFilingMetadata): FilingClassification {
  const normalizedItems = metadata.items.map((item) => item.trim());
  const matches = ITEM_RULES.filter((rule) => normalizedItems.some((item) => item.startsWith(rule.prefix)));

  if (!matches.length) {
    return {
      eventClass: 'OTHER_PRIMARY_DISCLOSURE',
      priority: 'LOW',
      validationState: 'PENDING_PRIMARY_VALIDATION',
      requiresHumanReview: true,
      matchedItems: [],
      reason: `${metadata.form} discovered from EDGAR; no material-item rule matched. Content review required before Evidence can become VERIFIED_FACT.`,
    };
  }

  const strongest = [...matches].sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority])[0];
  return {
    eventClass: strongest.eventClass,
    priority: strongest.priority,
    validationState: 'PENDING_PRIMARY_VALIDATION',
    requiresHumanReview: true,
    matchedItems: matches.map((match) => match.prefix),
    reason: matches.map((match) => match.reason).join(' '),
  };
}
