import http from 'node:http';
import { runFundamentalAudit } from './fundamental-engine.mjs';

const EXTERNAL_PORT = Number(process.env.PORT || 8787);
const INTERNAL_PORT = EXTERNAL_PORT + 1;
const HOST = process.env.HOST || '0.0.0.0';
const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN || '';

process.env.PORT = String(INTERNAL_PORT);
process.env.HOST = '127.0.0.1';
await import('./server-v3.mjs');
process.env.PORT = String(EXTERNAL_PORT);
process.env.HOST = HOST;

const DECISION_VERSION = 'ATLAS-DECISION-GATE-1.0.0';

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  });
  res.end(JSON.stringify(body));
}

async function finnhub(path, params = {}) {
  if (!FINNHUB_TOKEN) {
    const error = new Error('FINNHUB_TOKEN is not configured');
    error.status = 503;
    throw error;
  }
  const url = new URL(`https://finnhub.io/api/v1/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  url.searchParams.set('token', FINNHUB_TOKEN);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Finnhub HTTP ${response.status}`);
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }
  return payload;
}

async function optionalFinnhub(path, params = {}) {
  try {
    return [await finnhub(path, params), 'OK'];
  } catch (error) {
    return [null, `UNAVAILABLE:${error?.status || 'ERROR'}`];
  }
}

async function internalJson(path) {
  const response = await fetch(`http://127.0.0.1:${INTERNAL_PORT}${path}`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || `ATLAS internal HTTP ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function normalizeSymbol(symbol) {
  const normalized = symbol.trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,20}$/.test(normalized)) {
    const error = new Error('valid symbol is required');
    error.status = 400;
    throw error;
  }
  return normalized;
}

async function companyBundle(symbol) {
  const normalized = normalizeSymbol(symbol);
  const to = new Date();
  const from = new Date(Date.now() - 30 * 86400000);
  const iso = value => value.toISOString().slice(0, 10);

  const [quoteResult, profileResult, metricResult, newsResult, recommendationResult] = await Promise.all([
    optionalFinnhub('quote', { symbol: normalized }),
    optionalFinnhub('stock/profile2', { symbol: normalized }),
    optionalFinnhub('stock/metric', { symbol: normalized, metric: 'all' }),
    optionalFinnhub('company-news', { symbol: normalized, from: iso(from), to: iso(to) }),
    optionalFinnhub('stock/recommendation', { symbol: normalized }),
  ]);

  const [quote, quoteStatus] = quoteResult;
  const [profile, profileStatus] = profileResult;
  const [metricPayload, metricsStatus] = metricResult;
  const [news, newsStatus] = newsResult;
  const [recommendations, recommendationsStatus] = recommendationResult;

  return {
    symbol: normalized,
    source: 'Finnhub',
    generatedAt: new Date().toISOString(),
    quote: quote && typeof quote === 'object' ? quote : {},
    profile: profile && typeof profile === 'object' ? profile : {},
    metrics: metricPayload && typeof metricPayload === 'object' && metricPayload.metric && typeof metricPayload.metric === 'object' ? metricPayload.metric : {},
    news: Array.isArray(news) ? news : [],
    recommendations: Array.isArray(recommendations) ? recommendations : [],
    sourceStatus: {
      quote: quoteStatus,
      profile: profileStatus,
      metrics: metricsStatus,
      news: newsStatus,
      recommendations: recommendationsStatus,
    },
    guardrail: 'Finnhub data is sensor input. Missing fields remain unavailable and are never fabricated.',
  };
}

function decisionFromAudit(symbol, audit, marketSignals = null) {
  const hardFails = Object.entries(audit?.hardRequirements || {})
    .filter(([, value]) => value?.state === 'FAIL')
    .map(([key]) => key);
  const quality = audit?.businessQuality?.score ?? null;
  const growth = audit?.growth?.score ?? null;
  const valuation = audit?.valuation?.score ?? null;
  const risk = audit?.risk?.score ?? null;
  const opportunity = audit?.opportunity?.score ?? null;
  const conviction = audit?.conviction?.score ?? null;
  const downside = marketSignals?.downsideScore ?? audit?.risk?.marketDownside ?? null;
  const reasons = [];

  let buy = true;
  if (hardFails.length) {
    buy = false;
    reasons.push(`Falla requisito duro: ${hardFails.join(', ')}`);
  }
  if (audit?.status !== 'AUDITABLE' || conviction == null) {
    buy = false;
    reasons.push('Conviction Ω no está desbloqueada con evidencia suficiente.');
  }
  if (quality == null || quality < 70) {
    buy = false;
    reasons.push(`Business Quality Ω ${quality == null ? 'sin datos' : quality.toFixed(1)} < 70.`);
  }
  if (growth == null || growth < 50) {
    buy = false;
    reasons.push(`Growth Ω ${growth == null ? 'sin datos' : growth.toFixed(1)} < 50.`);
  }
  if (valuation == null || valuation < 40) {
    buy = false;
    reasons.push(`Valuation Ω ${valuation == null ? 'sin datos' : valuation.toFixed(1)} < 40.`);
  }
  if (risk != null && risk > 45) {
    buy = false;
    reasons.push(`Risk Ω ${risk.toFixed(1)} > 45.`);
  }
  if (opportunity == null || opportunity < 70) {
    buy = false;
    reasons.push(`Opportunity Ω ${opportunity == null ? 'sin datos' : opportunity.toFixed(1)} < 70.`);
  }
  if (conviction != null && conviction < 70) {
    buy = false;
    reasons.push(`Conviction Ω ${conviction.toFixed(1)} < 70.`);
  }
  if (downside != null && downside >= 50) {
    buy = false;
    reasons.push(`Downside Ω ${downside.toFixed(1)} >= 50.`);
  }

  if (buy) reasons.push('Supera el Decision Gate Ω con los datos auditables disponibles.');

  return {
    symbol,
    decision: buy ? 'BUY' : 'NO_BUY',
    label: buy ? 'COMPRAR' : 'NO COMPRAR',
    buy,
    algorithmVersion: DECISION_VERSION,
    auditStatus: audit?.status || 'INSUFFICIENT_DATA',
    epistemicState: audit?.epistemicState || 'UNKNOWN',
    evidenceCoverage: audit?.completeness?.evidenceCoverage ?? 0,
    scores: { quality, growth, valuation, risk, opportunity, conviction, downside },
    reasons: reasons.slice(0, 6),
    thresholds: {
      qualityMin: 70,
      growthMin: 50,
      valuationMin: 40,
      riskMax: 45,
      opportunityMin: 70,
      convictionMin: 70,
      downsideMaxExclusive: 50,
      auditableRequired: true,
    },
    guardrail: 'Decision support only. ATLAS never executes broker orders. Missing or non-auditable evidence resolves conservatively to NO COMPRAR.',
    generatedAt: new Date().toISOString(),
  };
}

async function decisionBundle(symbol) {
  const company = await companyBundle(symbol);
  let edgar = { filings: [] };
  let marketSignals = null;
  try { edgar = await internalJson(`/v1/edgar/${encodeURIComponent(company.symbol)}`); } catch {}
  try { marketSignals = await internalJson(`/v1/signals/${encodeURIComponent(company.symbol)}`); } catch {}
  const audit = runFundamentalAudit({
    metric: company.metrics,
    marketSignals,
    marketCap: typeof company.profile?.marketCapitalization === 'number' ? company.profile.marketCapitalization : null,
    evidence: Array.isArray(edgar?.filings) ? edgar.filings : [],
  });
  return {
    ...decisionFromAudit(company.symbol, audit, marketSignals),
    audit,
  };
}

async function portfolioLive() {
  let broker;
  try {
    broker = await internalJson('/v1/portfolio');
  } catch (error) {
    return {
      configured: false,
      provider: 'TRADING212',
      readOnlyGuard: true,
      account: null,
      positions: [],
      observedAt: new Date().toISOString(),
      message: 'Trading 212 read-only credentials are not configured on the backend.',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const sourcePositions = Array.isArray(broker?.positions) ? broker.positions : [];
  const positions = [];
  for (let i = 0; i < sourcePositions.length; i += 5) {
    const batch = sourcePositions.slice(i, i + 5);
    const enriched = await Promise.all(batch.map(async position => {
      const ticker = String(position?.ticker || '').toUpperCase();
      const [quote] = ticker ? await optionalFinnhub('quote', { symbol: ticker }) : [null, 'UNAVAILABLE'];
      const livePrice = typeof quote?.c === 'number' ? quote.c : position?.currentPrice ?? null;
      const quantity = typeof position?.quantity === 'number' ? position.quantity : null;
      const averagePrice = typeof position?.averagePrice === 'number' ? position.averagePrice : null;
      const marketValue = livePrice != null && quantity != null ? livePrice * quantity : null;
      const costValue = averagePrice != null && quantity != null ? averagePrice * quantity : null;
      const pnl = marketValue != null && costValue != null ? marketValue - costValue : null;
      const pnlPct = pnl != null && costValue ? pnl / costValue * 100 : null;
      return {
        ...position,
        ticker,
        livePrice,
        dayChangePct: typeof quote?.dp === 'number' ? quote.dp : null,
        quoteTimestamp: typeof quote?.t === 'number' ? new Date(quote.t * 1000).toISOString() : null,
        marketValue,
        costValue,
        pnl,
        pnlPct,
      };
    }));
    positions.push(...enriched);
    if (i + 5 < sourcePositions.length) await new Promise(resolve => setTimeout(resolve, 250));
  }

  return {
    configured: true,
    provider: broker?.provider || 'TRADING212',
    environment: broker?.environment || 'live',
    readOnlyGuard: true,
    account: broker?.account ?? null,
    positions,
    observedAt: new Date().toISOString(),
    quoteProvider: 'Finnhub with Trading 212 currentPrice fallback',
  };
}

const gateway = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (parsed.pathname === '/') {
    return sendJson(res, 200, {
      ok: true,
      service: 'ATLAS Ω Backend',
      status: 'ONLINE',
      version: '0.4.0',
      api: {
        health: '/health',
        company: '/v1/company/NVDA',
        decision: '/v1/decision/NVDA',
        portfolioLive: '/v1/portfolio-live',
        search: '/v1/search?q=NVDA',
        terminal: '/v1/terminal/NVDA',
        audit: '/v1/audit/NVDA',
        discovery: '/v1/discovery',
        portfolio: '/v1/portfolio',
      },
      note: 'ATLAS backend is running. Market data is a sensor; evidence remains the source of truth.',
    });
  }

  if (req.method === 'GET' && parsed.pathname.startsWith('/v1/company/')) {
    try {
      const symbol = decodeURIComponent(parsed.pathname.slice('/v1/company/'.length));
      return sendJson(res, 200, await companyBundle(symbol));
    } catch (error) {
      return sendJson(res, error?.status || 502, {
        error: 'COMPANY_BUNDLE_UNAVAILABLE',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === 'GET' && parsed.pathname.startsWith('/v1/decision/')) {
    try {
      const symbol = decodeURIComponent(parsed.pathname.slice('/v1/decision/'.length));
      return sendJson(res, 200, await decisionBundle(symbol));
    } catch (error) {
      return sendJson(res, error?.status || 502, {
        error: 'DECISION_UNAVAILABLE',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === 'GET' && parsed.pathname === '/v1/portfolio-live') {
    try {
      return sendJson(res, 200, await portfolioLive());
    } catch (error) {
      return sendJson(res, 502, {
        error: 'PORTFOLIO_LIVE_UNAVAILABLE',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const proxy = http.request({
    hostname: '127.0.0.1',
    port: INTERNAL_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  }, upstream => {
    res.writeHead(upstream.statusCode || 502, upstream.headers);
    upstream.pipe(res);
  });

  proxy.on('error', error => {
    sendJson(res, 502, {
      error: 'ATLAS_BACKEND_UNAVAILABLE',
      message: error.message,
    });
  });

  req.pipe(proxy);
});

gateway.listen(EXTERNAL_PORT, HOST, () => {
  console.log(`ATLAS Ω gateway v0.4.0 listening on http://${HOST}:${EXTERNAL_PORT}`);
});
