export type MobileHealth = {
  ok: boolean;
  service: string;
  version?: string;
  financialdatanet_configured: boolean;
  finnhub_configured: boolean;
  preferred_provider: string;
  generatedAt?: string;
};

export type CompanySummary = {
  ticker: string;
  name: string;
  currency?: unknown;
  industry?: unknown;
  sector?: unknown;
  price?: unknown;
  marketCap?: unknown;
  pe?: unknown;
  revenue?: unknown;
  freeCashFlow?: unknown;
};

export type CompanyPayload = {
  symbol: string;
  provider: string;
  providerMode?: string;
  generatedAt?: string;
  summary: CompanySummary;
  sections: Record<string, Record<string, unknown>[]>;
  sourceStatus?: Record<string, string>;
  guardrails?: string[];
  fallbackReason?: string;
};

export type PortfolioPayload = {
  snapshotId: string;
  count: number;
  items: { ticker: string }[];
  guardrail: string;
};

const requestedBase = process.env.EXPO_PUBLIC_ATLAS_API_BASE_URL?.trim().replace(/\/$/, '');
const DEFAULT_API = 'https://atlas-genesis.onrender.com';

export function apiBaseUrl(): string {
  if (!requestedBase) return DEFAULT_API;
  if (/localhost|127\.0\.0\.1|10\.0\.2\.2/i.test(requestedBase)) return DEFAULT_API;
  return requestedBase;
}

export class AtlasHttpError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, message: string) {
    super(message);
    this.name = 'AtlasHttpError';
    this.status = status;
    this.path = path;
  }
}

async function request<T>(path: string, timeoutMs = 25000): Promise<T> {
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
      const rawDetail = row.detail;
      const detail = typeof rawDetail === 'string'
        ? rawDetail
        : rawDetail && typeof rawDetail === 'object'
          ? JSON.stringify(rawDetail)
          : `ATLAS API HTTP ${response.status}`;
      throw new AtlasHttpError(response.status, path, detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('ATLAS API no respondió a tiempo.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function legacyCompanyToMobile(raw: Record<string, unknown>, symbol: string): CompanyPayload {
  const quote = raw.quote && typeof raw.quote === 'object' ? raw.quote as Record<string, unknown> : {};
  const profile = raw.profile && typeof raw.profile === 'object' ? raw.profile as Record<string, unknown> : {};
  const metrics = raw.metrics && typeof raw.metrics === 'object' ? raw.metrics as Record<string, unknown> : {};
  return {
    symbol,
    provider: typeof raw.source === 'string' ? raw.source : 'Finnhub',
    providerMode: 'legacy-fallback',
    generatedAt: typeof raw.generatedAt === 'string' ? raw.generatedAt : undefined,
    summary: {
      ticker: symbol,
      name: typeof profile.name === 'string' ? profile.name : symbol,
      currency: profile.currency,
      industry: profile.finnhubIndustry,
      sector: profile.finnhubIndustry,
      price: num(quote.c),
      marketCap: num(profile.marketCapitalization) ?? num(metrics.marketCapitalization),
      pe: num(metrics.peBasicExclExtraTTM) ?? num(metrics.peTTM),
      revenue: num(metrics.revenuePerShareTTM),
      freeCashFlow: num(metrics.freeCashFlowPerShareTTM),
    },
    sections: {
      quote: Object.keys(quote).length ? [quote] : [],
      company: Object.keys(profile).length ? [profile] : [],
      keyMetrics: Object.keys(metrics).length ? [metrics] : [],
    },
    sourceStatus: raw.sourceStatus && typeof raw.sourceStatus === 'object' ? raw.sourceStatus as Record<string, string> : undefined,
    guardrails: ['Legacy backend fallback active. Missing values are not fabricated.'],
  };
}

export const MobileApi = {
  health: async (): Promise<MobileHealth> => {
    try {
      return await request<MobileHealth>('/v1/mobile/health', 12000);
    } catch (error) {
      const legacy = await request<Record<string, unknown>>('/health', 12000);
      const deploymentDrift = error instanceof AtlasHttpError && error.status === 404;
      return {
        ok: deploymentDrift ? false : legacy.ok === true,
        service: deploymentDrift ? 'atlas-omega-api · DEPLOYMENT_DRIFT' : (typeof legacy.service === 'string' ? legacy.service : 'atlas-omega-api'),
        version: typeof legacy.version === 'string' ? legacy.version : undefined,
        financialdatanet_configured: false,
        finnhub_configured: legacy.finnhub_configured === true,
        preferred_provider: deploymentDrift ? 'DEPLOYMENT_DRIFT' : (legacy.finnhub_configured === true ? 'Finnhub' : 'none'),
      };
    }
  },

  company: async (ticker: string): Promise<CompanyPayload> => {
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) throw new Error('Escribe un ticker.');
    try {
      return await request<CompanyPayload>(`/v1/mobile/company/${encodeURIComponent(symbol)}`);
    } catch (primaryError) {
      try {
        const legacy = await request<Record<string, unknown>>(`/v1/company/${encodeURIComponent(symbol)}`);
        const company = legacyCompanyToMobile(legacy, symbol);
        company.fallbackReason = primaryError instanceof AtlasHttpError && primaryError.status === 404
          ? 'Backend mobile desfasado: usando compatibilidad legacy de solo lectura.'
          : 'Mobile company endpoint unavailable: using legacy read fallback.';
        return company;
      } catch {
        throw primaryError;
      }
    }
  },

  portfolio: async (): Promise<PortfolioPayload> => {
    try {
      return await request<PortfolioPayload>('/v1/mobile/portfolio', 12000);
    } catch (error) {
      return {
        snapshotId: error instanceof AtlasHttpError && error.status === 404 ? 'DEPLOYMENT-DRIFT' : 'PORTFOLIO-DATA-GATE',
        count: 0,
        items: [],
        guardrail: 'Portfolio backend unavailable. ATLAS does not substitute a stale hard-coded holdings list for the live/canonical portfolio.',
      };
    }
  },
};
