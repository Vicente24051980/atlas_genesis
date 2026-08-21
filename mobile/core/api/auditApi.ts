import { apiBaseUrl, CompanyPayload } from './mobileApi';

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

export const AuditApi = {
  full: async (ticker: string): Promise<FullAuditPayload> => {
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) throw new Error('Escribe un ticker.');
    return request<FullAuditPayload>(`/v1/mobile/audit/${encodeURIComponent(symbol)}`);
  },
};
