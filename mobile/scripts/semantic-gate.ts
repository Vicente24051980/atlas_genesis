import assert from 'node:assert/strict';

import { classifyEdgarFiling, normalizeFinnhubQuote } from '../core/terminal/semantic';

function approximately(actual: number | null, expected: number, epsilon = 0.000001) {
  assert.notEqual(actual, null);
  assert.ok(Math.abs((actual as number) - expected) <= epsilon, `expected ${expected}, got ${actual}`);
}

const quoteFromProviderPct = normalizeFinnhubQuote(
  { c: 420, pc: 400, dp: 5, v: 1_250_000 },
  '2026-08-09T00:00:00.000Z',
);
assert.equal(quoteFromProviderPct.provider, 'FINNHUB');
assert.equal(quoteFromProviderPct.price, 420);
assert.equal(quoteFromProviderPct.changePct, 5);
assert.equal(quoteFromProviderPct.volume, 1_250_000);

const quoteComputedPct = normalizeFinnhubQuote(
  { c: 210, pc: 200 },
  '2026-08-09T00:00:00.000Z',
);
approximately(quoteComputedPct.changePct, 5);

const quoteMissing = normalizeFinnhubQuote({}, '2026-08-09T00:00:00.000Z');
assert.equal(quoteMissing.price, null);
assert.equal(quoteMissing.changePct, null);

const earnings8k = classifyEdgarFiling({
  form: '8-K',
  accessionNumber: '0000000000-26-000001',
  filingDate: '2026-08-08',
  items: ['2.02', '9.01'],
});
assert.equal(earnings8k.eventClass, 'EARNINGS_RESULTS');
assert.equal(earnings8k.priority, 'HIGH');
assert.equal(earnings8k.validationState, 'PENDING_PRIMARY_VALIDATION');
assert.equal(earnings8k.requiresHumanReview, true);

const bylaws8k = classifyEdgarFiling({
  form: '8-K',
  accessionNumber: '0000000000-26-000002',
  filingDate: '2026-08-08',
  items: ['5.03'],
});
assert.equal(bylaws8k.eventClass, 'GOVERNANCE_CHANGE');
assert.equal(bylaws8k.priority, 'LOW');

const mixed8k = classifyEdgarFiling({
  form: '8-K',
  accessionNumber: '0000000000-26-000003',
  filingDate: '2026-08-08',
  items: ['5.03', '2.02'],
});
assert.equal(mixed8k.eventClass, 'EARNINGS_RESULTS');
assert.equal(mixed8k.priority, 'HIGH');
assert.deepEqual(mixed8k.matchedItems.sort(), ['2.02', '5.03']);

const distress8k = classifyEdgarFiling({
  form: '8-K',
  accessionNumber: '0000000000-26-000004',
  filingDate: '2026-08-08',
  items: ['1.03'],
});
assert.equal(distress8k.eventClass, 'LEGAL_OR_DISTRESS');
assert.equal(distress8k.priority, 'CRITICAL');

const unknownFiling = classifyEdgarFiling({
  form: '10-K',
  accessionNumber: '0000000000-26-000005',
  filingDate: '2026-08-08',
  items: [],
});
assert.equal(unknownFiling.validationState, 'PENDING_PRIMARY_VALIDATION');
assert.equal(unknownFiling.requiresHumanReview, true);

console.log('ATLAS Ω semantic gate PASS: market normalization + EDGAR classification fixtures validated.');
