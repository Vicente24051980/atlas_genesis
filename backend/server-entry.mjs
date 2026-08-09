import http from 'node:http';

const EXTERNAL_PORT = Number(process.env.PORT || 8787);
const INTERNAL_PORT = EXTERNAL_PORT + 1;
const HOST = process.env.HOST || '0.0.0.0';
const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN || '';

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

async function companyBundle(symbol) {
  const normalized = symbol.trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,20}$/.test(normalized)) {
    const error = new Error('valid symbol is required');
    error.status = 400;
    throw error;
  }

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

const gateway = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (parsed.pathname === '/') {
    return sendJson(res, 200, {
      ok: true,
      service: 'ATLAS Ω Backend',
      status: 'ONLINE',
      version: '0.3.1',
      api: {
        health: '/health',
        company: '/v1/company/NVDA',
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
  console.log(`ATLAS Ω gateway v0.3.1 listening on http://${HOST}:${EXTERNAL_PORT}`);
});
