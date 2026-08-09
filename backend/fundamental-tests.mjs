import assert from 'node:assert/strict';
import { runFundamentalAudit } from './fundamental-engine.mjs';

const strong = runFundamentalAudit({
  metric: {
    roeTTM: 32, roaTTM: 14, operatingMarginTTM: 31, netProfitMarginTTM: 24, grossMarginTTM: 68,
    revenueGrowth3Y: 18, revenueGrowthTTMYoy: 20, epsGrowth3Y: 22, epsGrowthTTMYoy: 25,
    currentRatioAnnual: 1.8, quickRatioAnnual: 1.4, totalDebtToEquityAnnual: 55,
    freeCashFlowPerShareTTM: 8.2, freeCashFlowYieldTTM: 4.5, peTTM: 28, pbAnnual: 8, evEbitdaTTM: 20,
    beta: 1.05, marketCapitalization: 300000,
  },
  marketSignals: { momentumScore: 82, waveScore: 78, downsideScore: 8 },
  evidence: [],
});
assert.equal(strong.status, 'PRELIMINARY');
assert.ok(strong.businessQuality.score > 65, `expected strong BQ, got ${strong.businessQuality.score}`);
assert.ok(strong.growth.score > 70, `expected strong growth, got ${strong.growth.score}`);
assert.ok(strong.opportunity.score > 55, `expected opportunity support, got ${strong.opportunity.score}`);
assert.equal(strong.conviction.score, null, 'Conviction must remain locked without evidence-backed status');
assert.equal(strong.hardRequirements.profitableBusiness.state, 'PASS');
assert.equal(strong.hardRequirements.positiveFreeCashFlow.state, 'PASS');

const weak = runFundamentalAudit({
  metric: {
    roeTTM: -8, roaTTM: -4, operatingMarginTTM: -6, netProfitMarginTTM: -8,
    revenueGrowth3Y: -5, revenueGrowthTTMYoy: -12, epsGrowth3Y: -20, epsGrowthTTMYoy: -30,
    currentRatioAnnual: 0.6, totalDebtToEquityAnnual: 320, freeCashFlowPerShareTTM: -1.2,
    peTTM: 80, pbAnnual: 20, evEbitdaTTM: 55, beta: 2.1, marketCapitalization: 12000,
  },
  marketSignals: { momentumScore: 18, waveScore: 22, downsideScore: 82 },
  evidence: [],
});
assert.equal(weak.status, 'HARD_FAIL');
assert.equal(weak.businessQuality.score, null);
assert.equal(weak.hardRequirements.profitableBusiness.state, 'FAIL');
assert.equal(weak.hardRequirements.positiveFreeCashFlow.state, 'FAIL');
assert.ok((weak.risk.score ?? 0) > 60);

const sparse = runFundamentalAudit({ metric: {}, marketSignals: null, evidence: [] });
assert.equal(sparse.status, 'INSUFFICIENT_DATA');
assert.equal(sparse.businessQuality.score, null);
assert.equal(sparse.conviction.state, 'LOCKED_PENDING_EVIDENCE');

console.log('ATLAS fundamental fixtures: PASS');
