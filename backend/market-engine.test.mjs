import assert from 'node:assert/strict';
import { discoveryScore, marketSignals, MARKET_ENGINE_VERSION } from './market-engine.mjs';

function makeTrend({ start = 100, daily = 0.5, days = 260, volume = 1_000_000 } = {}) {
  return Array.from({ length: days }, (_, i) => ({
    t: new Date(Date.UTC(2025, 0, 1 + i)).toISOString(),
    o: start + daily * i,
    h: start + daily * i + 1,
    l: start + daily * i - 1,
    c: start + daily * i,
    v: volume,
  }));
}

const bullish = marketSignals(makeTrend({ daily: 0.6 }));
assert.equal(bullish.status, 'OK');
assert.equal(bullish.algorithmVersion, MARKET_ENGINE_VERSION);
assert.equal(bullish.streak.direction, 'UP');
assert.ok(bullish.streak.length >= 20);
assert.ok((bullish.momentumScore ?? 0) >= 70, `bullish momentum too low: ${bullish.momentumScore}`);
assert.ok((bullish.waveScore ?? 0) >= 65, `bullish wave too low: ${bullish.waveScore}`);
assert.equal(bullish.downsideSeverity, 'NORMAL');
assert.ok((bullish.downsideScore ?? 100) < 25, `bullish downside too high: ${bullish.downsideScore}`);
assert.ok((discoveryScore(bullish) ?? 0) >= 65);

const bearishRows = makeTrend({ start: 220, daily: -0.8, volume: 1_000_000 });
for (let i = bearishRows.length - 5; i < bearishRows.length; i += 1) bearishRows[i].v = 2_000_000;
const bearish = marketSignals(bearishRows);
assert.equal(bearish.status, 'OK');
assert.equal(bearish.streak.direction, 'DOWN');
assert.ok((bearish.momentumScore ?? 100) <= 30, `bearish momentum too high: ${bearish.momentumScore}`);
assert.ok((bearish.downsideScore ?? 0) >= 50, `bearish downside too low: ${bearish.downsideScore}`);
assert.ok(['ELEVATED', 'CRITICAL'].includes(bearish.downsideSeverity));
assert.ok((discoveryScore(bearish) ?? 100) < 50);

const short = marketSignals(makeTrend({ days: 10 }));
assert.equal(short.status, 'INSUFFICIENT_DATA');
assert.equal(short.momentumScore, null);
assert.equal(short.waveScore, null);
assert.equal(short.downsideScore, null);

console.log('ATLAS Ω market engine gate PASS: bullish, bearish and insufficient-data fixtures validated.');
