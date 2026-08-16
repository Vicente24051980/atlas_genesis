import { apiBaseUrl } from './mobileApi';

export type CapexChainPayload = {
  ticker: string;
  engine: string;
  mapped: boolean;
  edd?: number;
  role?: string;
  economicMode?: string;
  rivers?: string[];
  evidenceGate: string;
  state: string;
  capexPositionScore: number | null;
  capexConvergenceScore?: number | null;
  bottleneckPersistenceScore?: number | null;
  structuralOpportunityScore: number | null;
  capexFragilityScore: number | null;
  guardrail: string;
};

async function request<T>(path: string, timeoutMs = 12000): Promise<T> {
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
      throw new Error(typeof row.detail === 'string' ? row.detail : `Global CAPEX Chain HTTP ${response.status}`);
    }
    return payload as T;
  } finally {
    clearTimeout(timer);
  }
}

export const CapexChainApi = {
  profile: (ticker: string) => request<CapexChainPayload>(`/v1/mobile/capex-chain/${encodeURIComponent(ticker.trim().toUpperCase())}`),
};
