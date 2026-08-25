import { CapexChainApi } from './capexChainApi';
import { apiBaseUrl, CompanyPayload, MobileApi } from './mobileApi';

export type AuditEngineState =
  | 'PASS'
  | 'STRONG'
  | 'MIXED'
  | 'WATCH'
  | 'FAIL'
  | 'NO_SIGNAL'
  | 'NOT_APPLICABLE'
  | 'INSUFFICIENT_DATA'
  | 'QUARANTINE'
  | 'PARTIAL';

export type AuditRecommendation = 'BUY' | 'HOLD' | 'WATCH' | 'REJECT' | 'NO_OPPORTUNITY' | 'PENDING';

export type AuditEngineResult = {
  engineId: string;
  label: string;
  state: AuditEngineState;
  score: number | null;
  detail: string;
  evidence: string[];
  provenance: string[];
};

export type AuditDecision = {
  recommendation: AuditRecommendation;
  action: string;
  executionState: string;
  confidence: string;
  reason: string;
};

export type FullAuditPayload = {
  ticker: string;
  asOf: string;
  protocol: string;
  engineOrderRule: string;
  company: CompanyPayload;
  engines: AuditEngineResult[];
  contradictions: string[];
  decision: AuditDecision;
  guardrails: string[];
};

const ENGINE_LABELS: Array<[string, string, AuditEngineState]> = [
  ['GREEN_CONTINUITY_OMEGA', 'GREEN Continuity Ω', 'QUARANTINE'],
  ['GREEN_PULSE_OMEGA', 'GREEN Pulse / Breadth / Relative Green Ω', 'INSUFFICIENT_DATA'],
  ['ECONOMIC_PROOF_OMEGA', 'Economic Proof Ω', 'PARTIAL'],
  ['VALUATION_IMPLIED_RETURN_OMEGA', 'Valuation / Implied Return Ω', 'PARTIAL'],
  ['GLOBAL_CAPEX_CHAIN_OMEGA', 'Global CAPEX Chain Ω', 'INSUFFICIENT_DATA'],
  ['CAPEX_PRODUCTIVITY_OMEGA', 'CAPEX Productivity Ω', 'INSUFFICIENT_DATA'],
  ['MOAT_PERSISTENCE_OMEGA', 'Moat / Persistence Ω', 'INSUFFICIENT_DATA'],
  ['INSTITUTIONAL_ROTATION_OMEGA', 'Institutional Capital Rotation Ω', 'NO_SIGNAL'],
  ['MACRO_REGIME_OMEGA', 'Macro / Regime Ω', 'INSUFFICIENT_DATA'],
  ['DEFENSIVE_OMEGA', 'Defensive Ω', 'INSUFFICIENT_DATA'],
  ['AI_CAPEX_PAYBACK_OMEGA', 'AI CAPEX Payback Ω', 'INSUFFICIENT_DATA'],
  ['CREDIT_TRANSMISSION_OMEGA', 'Credit Transmission / AI Financial Fragility Ω', 'INSUFFICIENT_DATA'],
  ['SUCCESSOR_DETECTION_OMEGA', 'Successor Detection Ω', 'NO_SIGNAL'],
  ['CLINICAL_EVIDENCE_SHOCK_OMEGA', 'Clinical Evidence Shock Ω', 'INSUFFICIENT_DATA'],
  ['AI_TOLLBOOTH_OMEGA', 'AI Tollbooth Ω', 'INSUFFICIENT_DATA'],
  ['DEVELOPER_ACTIVITY_LEADING_INDICATOR_OMEGA', 'Developer Activity Leading Indicator Ω', 'INSUFFICIENT_DATA'],
  ['HUMAN_CAPITAL_ALIGNMENT_OMEGA', 'Human Capital Alignment Ω', 'INSUFFICIENT_DATA'],
  ['CUSTOMER_ACCEPTANCE_GATE_OMEGA', 'Customer Acceptance Gate Ω', 'NO_SIGNAL'],
  ['FALSIFIERS_OMEGA', 'Falsifiers Ω', 'INSUFFICIENT_DATA'],
  ['EVIDENCE_DIRECTOR_OMEGA', 'Evidence Director Ω', 'PARTIAL'],
];

async function request<T>(path: string, timeoutMs = 45000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const row = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
      const detail = typeof row.detail === 'string' ? row.detail : `ATLAS API HTTP ${response.status}`;
      throw new Error(detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('La auditoría ATLAS no respondió a tiempo.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function fallbackLedger(company: CompanyPayload, capexMapped: boolean): AuditEngineResult[] {
  return ENGINE_LABELS.map(([engineId, label, baseState]) => {
    let state = baseState;
    let detail = 'Motor visible, pero el endpoint unificado de auditoría aún no está disponible. ATLAS no fabrica el resultado.';
    const evidence: string[] = [];
    const provenance: string[] = [];

    if (engineId === 'GREEN_CONTINUITY_OMEGA') {
      detail = 'GREEN requiere quorum >=3 proveedores sobre 1W/1M/3M/1Y/TOTAL en el mismo cierre regular. Sin quorum, queda QUARANTINE; no se inventa 0/5 ni 5/5.';
    } else if (engineId === 'ECONOMIC_PROOF_OMEGA') {
      const hasRevenue = company.summary.revenue !== null && company.summary.revenue !== undefined;
      const hasFcf = company.summary.freeCashFlow !== null && company.summary.freeCashFlow !== undefined;
      state = hasRevenue || hasFcf ? 'PARTIAL' : 'INSUFFICIENT_DATA';
      if (hasRevenue) evidence.push('revenue provider field');
      if (hasFcf) evidence.push('free-cash-flow provider field');
      provenance.push(company.provider);
      detail = 'Snapshot cuantitativo disponible; faltan demanda -> captura -> conversión -> FCF/ROIC y evidencia primaria para PASS.';
    } else if (engineId === 'VALUATION_IMPLIED_RETURN_OMEGA') {
      const hasValuation = company.summary.price !== null && company.summary.price !== undefined;
      state = hasValuation ? 'PARTIAL' : 'INSUFFICIENT_DATA';
      provenance.push(company.provider);
      detail = 'Precio/ratios observados no equivalen a Expected Return Ω; faltan expectativas implícitas normalizadas.';
    } else if (engineId === 'GLOBAL_CAPEX_CHAIN_OMEGA') {
      state = capexMapped ? 'PARTIAL' : 'INSUFFICIENT_DATA';
      detail = capexMapped ? 'Taxonomía estructural CAPEX disponible; E2+ y scores económicos siguen pendientes.' : 'Sin mapeo estructural certificado; investigación requerida.';
    } else if (engineId === 'FALSIFIERS_OMEGA') {
      detail = 'No detectar un falsificador no demuestra que haya cero. Falta el barrido adversarial independiente.';
    } else if (engineId === 'EVIDENCE_DIRECTOR_OMEGA') {
      provenance.push(company.provider);
      detail = 'Provider packet cargado, pero falta completar la evidencia primaria/trazable antes de una recomendación final.';
    }

    return { engineId, label, state, score: null, detail, evidence, provenance };
  });
}

async function safeFallback(symbol: string): Promise<FullAuditPayload> {
  const [company, capex] = await Promise.all([
    MobileApi.company(symbol),
    CapexChainApi.profile(symbol).catch(() => null),
  ]);
  return {
    ticker: symbol,
    asOf: new Date().toISOString(),
    protocol: 'ATLAS_OMEGA_MOBILE_FULL_AUDIT_V2_FALLBACK',
    engineOrderRule: 'GREEN_FIRST_THEN_FULL_TRANSVERSAL_SWEEP',
    company,
    engines: fallbackLedger(company, capex?.mapped === true),
    contradictions: capex?.mapped ? ['CAPEX structural mapping exists while the full economic-evidence chain is incomplete.'] : [],
    decision: {
      recommendation: 'PENDING',
      action: 'NO BUY · DATA GATE',
      executionState: 'BLOCKED',
      confidence: 'LOW',
      reason: 'El endpoint unificado aún no respondió; se muestran datos reales disponibles y gates explícitos, nunca una recomendación inventada.',
    },
    guardrails: [
      'Fallback fail-closed: no fabricated engine result or BUY decision.',
      'GREEN remains first and is never an automatic rejection gate.',
      'Only Investment Committee Ω may issue a final recommendation.',
    ],
  };
}

export const AuditApi = {
  full: async (ticker: string): Promise<FullAuditPayload> => {
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) throw new Error('Escribe un ticker.');
    try {
      return await request<FullAuditPayload>(`/v1/mobile/audit/${encodeURIComponent(symbol)}`);
    } catch {
      return safeFallback(symbol);
    }
  },
};
