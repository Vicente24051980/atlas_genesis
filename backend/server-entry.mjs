import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';

const EXTERNAL_PORT = Number(process.env.PORT || 8787);
const INTERNAL_PORT = EXTERNAL_PORT + 1;
const HOST = process.env.HOST || '0.0.0.0';
const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN || '';

const T212_ENV = process.env.TRADING212_ENV === 'live' ? 'live' : 'demo';
const T212_KEY = process.env.TRADING212_API_KEY || '';
const T212_SECRET = process.env.TRADING212_API_SECRET || '';
const BROKER_CONTROL_TOKEN = process.env.ATLAS_BROKER_CONTROL_TOKEN || '';
const PORTFOLIO_READ_TOKEN = process.env.ATLAS_PORTFOLIO_READ_TOKEN || '';
const LIVE_TRADING_ENABLED = String(process.env.TRADING212_LIVE_TRADING_ENABLED || 'false').toLowerCase() === 'true';
const T212_BASE_URL = `https://${T212_ENV}.trading212.com/api/v0`;
const DECISION_VERSION = 'ATLAS-DECISION-SENSOR-v1.0.0';

process.env.PORT = String(INTERNAL_PORT);
process.env.HOST = '127.0.0.1';
await import('./server-v3.mjs');
process.env.PORT = String(EXTERNAL_PORT);
process.env.HOST = HOST;

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization, x-atlas-broker-token, x-atlas-portfolio-token',
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(body));
}

function normalizeSymbol(symbol) {
  const normalized = String(symbol || '').trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,20}$/.test(normalized)) {
    const error = new Error('valid symbol is required');
    error.status = 400;
    throw error;
  }
  return normalized;
}

function finiteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').replace(/%/g, '').trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function safeTokenMatch(provided, expected) {
  if (!provided || !expected) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

function brokerConfigured() {
  return Boolean(T212_KEY && T212_SECRET && BROKER_CONTROL_TOKEN);
}

function portfolioConfigured() {
  return Boolean(T212_KEY && T212_SECRET && PORTFOLIO_READ_TOKEN);
}

function requireBrokerControl(req) {
  if (!brokerConfigured()) {
    const error = new Error('Trading 212 broker is not fully configured');
    error.status = 503;
    throw error;
  }
  if (!safeTokenMatch(req.headers['x-atlas-broker-token'], BROKER_CONTROL_TOKEN)) {
    const error = new Error('Invalid ATLAS broker control token');
    error.status = 401;
    throw error;
  }
}

function requirePortfolioRead(req) {
  if (!portfolioConfigured()) {
    const error = new Error('Trading 212 read-only portfolio is not configured');
    error.status = 503;
    throw error;
  }
  if (!safeTokenMatch(req.headers['x-atlas-portfolio-token'], PORTFOLIO_READ_TOKEN)) {
    const error = new Error('Invalid ATLAS portfolio read token');
    error.status = 401;
    throw error;
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const text = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error('Invalid JSON body');
    error.status = 400;
    throw error;
  }
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
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  } catch (cause) {
    const error = new Error(`Finnhub connection failed: ${cause instanceof Error ? cause.name : 'ERROR'}`);
    error.status = 502;
    throw error;
  }
  const payload = await response.json().catch(() => ({}));
  if (response.status === 429) {
    const error = new Error('Finnhub rate limit reached');
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`Finnhub HTTP ${response.status}`);
    error.status = 502;
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

async function t212Request(method, path, { body, params } = {}) {
  if (!T212_KEY || !T212_SECRET) {
    const error = new Error('Trading 212 credentials are not configured');
    error.status = 503;
    throw error;
  }
  const url = new URL(`${T212_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== null && value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  const auth = Buffer.from(`${T212_KEY}:${T212_SECRET}`).toString('base64');
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        authorization: `Basic ${auth}`,
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
  } catch (cause) {
    const error = new Error(`Trading 212 connection failed: ${cause instanceof Error ? cause.name : 'ERROR'}`);
    error.status = 502;
    throw error;
  }
  const text = await response.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text.slice(0, 500); }
  }
  if (response.status === 429) {
    const error = new Error('Trading 212 rate limit reached');
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`Trading 212 HTTP ${response.status}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
    error.status = response.status;
    throw error;
  }
  return payload ?? { ok: true };
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

async function quoteBundle(symbol) {
  const normalized = normalizeSymbol(symbol);
  const raw = await finnhub('quote', { symbol: normalized });
  const timestamp = finiteNumber(raw?.t);
  return {
    provider: 'Finnhub',
    ticker: normalized,
    price: finiteNumber(raw?.c),
    change: finiteNumber(raw?.d),
    changePct: finiteNumber(raw?.dp),
    open: finiteNumber(raw?.o),
    high: finiteNumber(raw?.h),
    low: finiteNumber(raw?.l),
    previousClose: finiteNumber(raw?.pc),
    timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : null,
    session: 'provider_latest',
    raw: raw && typeof raw === 'object' ? raw : {},
  };
}

async function companyBundle(symbol) {
  const normalized = normalizeSymbol(symbol);
  const to = new Date();
  const from = new Date(Date.now() - 45 * 86400000);
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
  const metrics = metricPayload && typeof metricPayload === 'object' && metricPayload.metric && typeof metricPayload.metric === 'object'
    ? metricPayload.metric
    : {};
  const quotePayload = quote && typeof quote === 'object' ? quote : {};
  const profilePayload = profile && typeof profile === 'object' ? profile : {};
  if (!Object.keys(quotePayload).length && !Object.keys(profilePayload).length && !Object.keys(metrics).length) {
    const error = new Error(`No data returned for ${normalized}`);
    error.status = 404;
    throw error;
  }
  return {
    symbol: normalized,
    source: 'Finnhub',
    generatedAt: new Date().toISOString(),
    quote: quotePayload,
    profile: profilePayload,
    metrics,
    news: Array.isArray(news) ? news.slice(0, 20) : [],
    recommendations: Array.isArray(recommendations) ? recommendations.slice(0, 12) : [],
    sourceStatus: {
      quote: quoteStatus,
      profile: profileStatus,
      metrics: metricsStatus,
      news: newsStatus,
      recommendations: recommendationsStatus,
    },
    guardrail: 'ATLAS displays only values returned by the configured provider. Missing values remain unavailable; no synthetic fundamentals are invented.',
  };
}

function normalizedKey(value) {
  return String(value || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function metricNumber(metrics, aliases) {
  const normalized = new Map(Object.entries(metrics || {}).map(([key, value]) => [normalizedKey(key), [key, value]]));
  for (const alias of aliases) {
    const item = normalized.get(normalizedKey(alias));
    if (item) {
      const number = finiteNumber(item[1]);
      if (number !== null) return [number, item[0]];
    }
  }
  for (const alias of aliases) {
    const needle = normalizedKey(alias);
    if (needle.length < 5) continue;
    for (const [keyNorm, [original, value]] of normalized.entries()) {
      if (!keyNorm.includes(needle)) continue;
      const number = finiteNumber(value);
      if (number !== null) return [number, original];
    }
  }
  return [null, null];
}

function linear(value, low, high) {
  if (high <= low) return 0;
  return Math.max(0, Math.min(100, (value - low) / (high - low) * 100));
}

function inverseBand(value, best, neutral, worst) {
  if (value <= best) return 100;
  if (value >= worst) return 10;
  if (value <= neutral) return 100 - (value - best) / Math.max(neutral - best, 1e-9) * 35;
  return 65 - (value - neutral) / Math.max(worst - neutral, 1e-9) * 55;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function decisionFromMetrics(symbol, metrics, quoteData = {}) {
  const used = {};
  const get = (name, aliases) => {
    const [value, key] = metricNumber(metrics, aliases);
    if (value !== null) used[name] = { value, sourceKey: key };
    return value;
  };

  const roi = get('roi', ['roiTTM', 'roiAnnual', 'returnOnInvestmentTTM', 'roicTTM', 'roicAnnual']);
  const roe = get('roe', ['roeTTM', 'roeAnnual', 'returnOnEquityTTM']);
  const margin = get('netMargin', ['netProfitMarginTTM', 'netMarginTTM', 'netProfitMarginAnnual']);
  const assetTurnover = get('assetTurnover', ['assetTurnoverTTM', 'assetTurnoverAnnual']);
  const revenueGrowth = get('revenueGrowth', ['revenueGrowthTTMYoy', 'revenueGrowthTTM', 'revenueGrowth5Y', 'revenueGrowth3Y']);
  const epsGrowth = get('epsGrowth', ['epsGrowthTTMYoy', 'epsGrowthTTM', 'epsGrowth5Y', 'epsGrowth3Y']);
  const fcfGrowth = get('fcfGrowth', ['freeCashFlowGrowth5Y', 'freeCashFlowGrowthTTMYoy', 'cashFlowPerShareGrowth5Y']);
  const pe = get('pe', ['peTTM', 'peAnnual', 'priceEarningsTTM']);
  const pb = get('pb', ['pbAnnual', 'pbQuarterly', 'priceBookValueTTM']);
  const ps = get('ps', ['psTTM', 'psAnnual', 'priceSalesTTM']);
  const beta = get('beta', ['beta']);
  const debtEquity = get('debtEquity', ['totalDebtToTotalEquityQuarterly', 'totalDebtToEquityQuarterly', 'totalDebtToTotalEquityAnnual']);
  const currentRatio = get('currentRatio', ['currentRatioQuarterly', 'currentRatioAnnual']);

  const qualityParts = [];
  if (roi !== null) qualityParts.push(linear(roi, 0, 25));
  if (roe !== null) qualityParts.push(linear(roe, 0, 30));
  if (margin !== null) qualityParts.push(linear(margin, 0, 25));
  if (assetTurnover !== null) qualityParts.push(linear(assetTurnover, 0.1, 1.5));

  const growthParts = [];
  for (const value of [revenueGrowth, epsGrowth, fcfGrowth]) if (value !== null) growthParts.push(linear(value, -5, 20));

  const valuationParts = [];
  if (pe !== null && pe > 0) valuationParts.push(inverseBand(pe, 15, 28, 55));
  if (pb !== null && pb > 0) valuationParts.push(inverseBand(pb, 2, 6, 15));
  if (ps !== null && ps > 0) valuationParts.push(inverseBand(ps, 2, 6, 15));

  const riskParts = [];
  if (beta !== null) riskParts.push(Math.max(0, Math.min(100, 20 + Math.max(beta - 0.8, 0) * 50)));
  if (debtEquity !== null) riskParts.push(Math.max(0, Math.min(100, debtEquity / 250 * 100)));
  if (currentRatio !== null) riskParts.push(Math.max(0, Math.min(100, 70 - currentRatio * 25)));

  const quality = average(qualityParts);
  const growth = average(growthParts);
  const valuation = average(valuationParts);
  const risk = average(riskParts);
  const coverage = Math.min(1, Object.keys(used).length / 13);

  let availableWeight = 0;
  let weighted = 0;
  if (quality !== null) { weighted += quality * 0.35; availableWeight += 0.35; }
  if (growth !== null) { weighted += growth * 0.25; availableWeight += 0.25; }
  if (valuation !== null) { weighted += valuation * 0.25; availableWeight += 0.25; }
  if (risk !== null) { weighted += (100 - risk) * 0.15; availableWeight += 0.15; }
  const decisionScore = availableWeight ? weighted / availableWeight : null;

  const price = finiteNumber(quoteData?.c);
  const reasons = [];
  let buy = true;
  if (coverage < 0.45) { buy = false; reasons.push(`Cobertura de datos ${(coverage * 100).toFixed(0)}% < 45%.`); }
  if (!(price !== null && price > 0)) { buy = false; reasons.push('Cotización válida no disponible.'); }
  if (quality === null || quality < 60) { buy = false; reasons.push(quality === null ? 'Quality Ω sin datos suficientes.' : `Quality Ω ${quality.toFixed(0)} < 60.`); }
  if (growth === null || growth < 40) { buy = false; reasons.push(growth === null ? 'Growth Ω sin datos suficientes.' : `Growth Ω ${growth.toFixed(0)} < 40.`); }
  if (valuation === null || valuation < 30) { buy = false; reasons.push(valuation === null ? 'Valuation Ω sin datos suficientes.' : `Valuation Ω ${valuation.toFixed(0)} < 30.`); }
  if (risk !== null && risk > 65) { buy = false; reasons.push(`Risk Ω ${risk.toFixed(0)} > 65.`); }
  if (decisionScore === null || decisionScore < 62) { buy = false; reasons.push(decisionScore === null ? 'Decision Score Ω no calculable.' : `Decision Score Ω ${decisionScore.toFixed(0)} < 62.`); }
  if (buy) reasons.push('Supera el Decision Gate Ω sensor con los datos disponibles.');

  const round = value => value === null ? null : Math.round(value * 10) / 10;
  return {
    symbol,
    decision: buy ? 'BUY' : 'NO_BUY',
    label: buy ? 'COMPRAR' : 'NO COMPRAR',
    buy,
    algorithmVersion: DECISION_VERSION,
    scope: 'MARKET_AND_FUNDAMENTAL_SENSOR',
    evidenceCoverage: Math.round(coverage * 1000) / 10,
    scores: {
      quality: round(quality),
      growth: round(growth),
      valuation: round(valuation),
      risk: round(risk),
      decisionScore: round(decisionScore),
    },
    reasons: reasons.slice(0, 6),
    inputsUsed: used,
    generatedAt: new Date().toISOString(),
    guardrail: 'Decision support only. Missing evidence fails closed to NO COMPRAR. This endpoint never places broker orders and does not convert analyst consensus into canonical evidence.',
  };
}

async function decisionBundle(symbol) {
  const company = await companyBundle(symbol);
  return decisionFromMetrics(company.symbol, company.metrics, company.quote);
}

function t212Ticker(raw) {
  return String(raw?.instrument?.ticker || raw?.ticker || '').toUpperCase();
}

async function portfolioLive(req) {
  requirePortfolioRead(req);
  const [account, positions] = await Promise.all([
    t212Request('GET', '/equity/account/summary'),
    t212Request('GET', '/equity/positions'),
  ]);
  const rows = Array.isArray(positions) ? positions : [];
  const normalized = rows.filter(row => row && typeof row === 'object').map(raw => {
    const quantity = finiteNumber(raw?.quantity);
    const averagePrice = finiteNumber(raw?.averagePricePaid ?? raw?.averagePrice);
    const currentPrice = finiteNumber(raw?.currentPrice);
    const marketValue = currentPrice !== null && quantity !== null ? currentPrice * quantity : null;
    const costValue = averagePrice !== null && quantity !== null ? averagePrice * quantity : null;
    const fallbackPnl = finiteNumber(raw?.ppl);
    const pnl = marketValue !== null && costValue !== null ? marketValue - costValue : fallbackPnl;
    const pnlPct = pnl !== null && costValue !== null && costValue !== 0 ? pnl / Math.abs(costValue) * 100 : null;
    return {
      ticker: t212Ticker(raw).replace(/_[A-Z]+_EQ$/i, ''),
      quantity,
      averagePrice,
      currentPrice,
      marketValue,
      costValue,
      pnl,
      pnlPct,
      currency: raw?.instrument?.currencyCode || raw?.currency || raw?.currencyCode || null,
      source: 'Trading212',
    };
  });
  return {
    configured: true,
    provider: 'Trading212',
    environment: T212_ENV,
    readOnlyGuard: true,
    account,
    positions: normalized,
    observedAt: new Date().toISOString(),
    quoteProvider: 'Trading212 currentPrice',
  };
}

async function instrumentsSearch(query) {
  const needle = String(query || '').trim().toUpperCase();
  if (!needle) return { query: '', count: 0, items: [] };
  const payload = await t212Request('GET', '/equity/metadata/instruments');
  const rows = Array.isArray(payload) ? payload : [];
  const items = [];
  for (const item of rows) {
    const haystack = [item?.ticker, item?.name, item?.shortName, item?.isin, item?.currencyCode].map(value => String(value || '').toUpperCase()).join(' ');
    if (haystack.includes(needle)) items.push(item);
    if (items.length >= 25) break;
  }
  return { query: String(query || '').trim(), count: items.length, items };
}

function statusForError(error) {
  const status = Number(error?.status);
  return Number.isFinite(status) && status >= 400 && status <= 599 ? status : 502;
}

const gateway = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  try {
    if (parsed.pathname === '/') {
      return sendJson(res, 200, {
        ok: true,
        service: 'ATLAS Ω Backend',
        status: 'ONLINE',
        version: '0.4.0',
        finnhub_configured: Boolean(FINNHUB_TOKEN),
        broker: { provider: 'Trading212', environment: T212_ENV, configured: brokerConfigured() },
        portfolioReadConfigured: portfolioConfigured(),
        routes: ['/health', '/v1/company/{symbol}', '/v1/decision/{symbol}', '/v1/quote/{symbol}', '/v1/portfolio-live', '/v1/broker/*'],
        note: 'ATLAS backend is running. Market data is a sensor; missing data is never fabricated.',
      });
    }

    if (req.method === 'GET' && parsed.pathname === '/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'atlas-omega-api',
        version: '0.4.0',
        finnhub_configured: Boolean(FINNHUB_TOKEN),
        broker_configured: brokerConfigured(),
        broker_environment: T212_ENV,
        broker_live_enabled: LIVE_TRADING_ENABLED,
        portfolio_read_configured: portfolioConfigured(),
        providers: {
          finnhub: FINNHUB_TOKEN ? 'CONFIGURED' : 'UNCONFIGURED',
          trading212: T212_KEY && T212_SECRET ? 'CONFIGURED' : 'UNCONFIGURED',
        },
        time: new Date().toISOString(),
      });
    }

    if (req.method === 'GET' && parsed.pathname.startsWith('/v1/company/')) {
      const symbol = decodeURIComponent(parsed.pathname.slice('/v1/company/'.length));
      return sendJson(res, 200, await companyBundle(symbol));
    }

    if (req.method === 'GET' && parsed.pathname.startsWith('/v1/decision/')) {
      const symbol = decodeURIComponent(parsed.pathname.slice('/v1/decision/'.length));
      return sendJson(res, 200, await decisionBundle(symbol));
    }

    if (req.method === 'GET' && parsed.pathname.startsWith('/v1/quote/')) {
      const symbol = decodeURIComponent(parsed.pathname.slice('/v1/quote/'.length));
      return sendJson(res, 200, await quoteBundle(symbol));
    }

    if (req.method === 'GET' && parsed.pathname === '/v1/portfolio-live') {
      return sendJson(res, 200, await portfolioLive(req));
    }

    // Never expose the legacy unscoped internal portfolio route through the public gateway.
    if (parsed.pathname === '/v1/portfolio') {
      return sendJson(res, 404, { error: 'NOT_FOUND' });
    }

    if (req.method === 'GET' && parsed.pathname === '/v1/broker/status') {
      return sendJson(res, 200, {
        provider: 'Trading212',
        environment: T212_ENV,
        configured: brokerConfigured(),
        liveTradingEnabled: LIVE_TRADING_ENABLED,
        mode: T212_ENV === 'live' ? 'LIVE' : 'PAPER',
        guardrail: 'Live orders require server-side enablement plus an explicit EXECUTE_LIVE confirmation on every order.',
      });
    }

    if (req.method === 'GET' && parsed.pathname === '/v1/broker/account') {
      requireBrokerControl(req);
      return sendJson(res, 200, { provider: 'Trading212', environment: T212_ENV, data: await t212Request('GET', '/equity/account/summary') });
    }

    if (req.method === 'GET' && parsed.pathname === '/v1/broker/positions') {
      requireBrokerControl(req);
      return sendJson(res, 200, { provider: 'Trading212', environment: T212_ENV, data: await t212Request('GET', '/equity/positions') });
    }

    if (req.method === 'GET' && parsed.pathname === '/v1/broker/orders') {
      requireBrokerControl(req);
      return sendJson(res, 200, { provider: 'Trading212', environment: T212_ENV, data: await t212Request('GET', '/equity/orders') });
    }

    if (req.method === 'GET' && parsed.pathname === '/v1/broker/instruments/search') {
      requireBrokerControl(req);
      return sendJson(res, 200, await instrumentsSearch(parsed.searchParams.get('q') || ''));
    }

    if (req.method === 'POST' && parsed.pathname === '/v1/broker/orders/market') {
      requireBrokerControl(req);
      const body = await readBody(req);
      const ticker = String(body?.ticker || '').trim();
      const quantity = finiteNumber(body?.quantity);
      const expected = T212_ENV === 'live' ? 'EXECUTE_LIVE' : 'EXECUTE_DEMO';
      if (!ticker || quantity === null || quantity === 0) {
        const error = new Error('ticker and non-zero quantity are required');
        error.status = 400;
        throw error;
      }
      if (body?.confirmation !== expected) {
        const error = new Error(`confirmation must be ${expected} for this environment`);
        error.status = 400;
        throw error;
      }
      if (T212_ENV === 'live' && !LIVE_TRADING_ENABLED) {
        const error = new Error('Live trading is locked. Set TRADING212_LIVE_TRADING_ENABLED=true server-side only after paper validation.');
        error.status = 403;
        throw error;
      }
      const order = await t212Request('POST', '/equity/orders/market', {
        body: { ticker, quantity, extendedHours: Boolean(body?.extended_hours) },
      });
      return sendJson(res, 200, {
        provider: 'Trading212',
        environment: T212_ENV,
        mode: T212_ENV === 'live' ? 'LIVE' : 'PAPER',
        order,
        audit: { requestedTicker: ticker, requestedQuantity: quantity, extendedHours: Boolean(body?.extended_hours) },
      });
    }

    if (req.method === 'DELETE' && /^\/v1\/broker\/orders\/\d+$/.test(parsed.pathname)) {
      requireBrokerControl(req);
      const orderId = parsed.pathname.split('/').pop();
      const result = await t212Request('DELETE', `/equity/orders/${orderId}`);
      return sendJson(res, 200, { provider: 'Trading212', environment: T212_ENV, orderId: Number(orderId), result });
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
      sendJson(res, 502, { error: 'ATLAS_BACKEND_UNAVAILABLE', message: error.message });
    });

    req.pipe(proxy);
  } catch (error) {
    return sendJson(res, statusForError(error), {
      error: 'ATLAS_API_ERROR',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

gateway.listen(EXTERNAL_PORT, HOST, () => {
  console.log(`ATLAS Ω gateway v0.4.0 listening on http://${HOST}:${EXTERNAL_PORT}`);
});
