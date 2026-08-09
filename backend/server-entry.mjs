import http from 'node:http';

const EXTERNAL_PORT = Number(process.env.PORT || 8787);
const INTERNAL_PORT = EXTERNAL_PORT + 1;
const HOST = process.env.HOST || '0.0.0.0';

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

const gateway = http.createServer((req, res) => {
  if ((req.url || '/') === '/' || (req.url || '').startsWith('/?')) {
    return sendJson(res, 200, {
      ok: true,
      service: 'ATLAS Ω Backend',
      status: 'ONLINE',
      version: '0.3.1',
      api: {
        health: '/health',
        search: '/v1/search?q=NVDA',
        terminal: '/v1/terminal/NVDA',
        audit: '/v1/audit/NVDA',
        discovery: '/v1/discovery',
        portfolio: '/v1/portfolio'
      },
      note: 'ATLAS backend is running. Market data is a sensor; evidence remains the source of truth.'
    });
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
