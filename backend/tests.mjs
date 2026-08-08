import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 18787;
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: new URL('.', import.meta.url),
  env: { ...process.env, PORT: String(port), FINNHUB_TOKEN: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('ATLAS backend did not start');
}

try {
  await waitForServer();
  const health = await fetch(`http://127.0.0.1:${port}/health`).then((r) => r.json());
  assert.equal(health.ok, true);
  assert.equal(health.invariants.marketDataIsSensor, true);
  assert.equal(health.invariants.aiIsNeverEvidence, true);
  assert.equal(health.invariants.priceCannotMutateThesisDirectly, true);
  assert.equal(health.providers.finnhub, 'UNCONFIGURED');

  const quoteResponse = await fetch(`http://127.0.0.1:${port}/v1/quote/MSFT`);
  assert.equal(quoteResponse.status, 503);
  const quoteBody = await quoteResponse.json();
  assert.equal(quoteBody.error, 'PROVIDER_UNCONFIGURED');

  const missing = await fetch(`http://127.0.0.1:${port}/v1/search`);
  assert.equal(missing.status, 400);

  console.log('ATLAS backend safety gate: PASS');
} finally {
  child.kill('SIGTERM');
}
