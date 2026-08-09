const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const avg = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const stdev = (values) => { if (values.length < 2) return 0; const m = avg(values); return Math.sqrt(avg(values.map((v) => (v - m) ** 2))); };
const pct = (a, b) => finite(a) && finite(b) && b !== 0 ? ((a - b) / b) * 100 : null;
export const MARKET_ENGINE_VERSION = 'ATLAS-MARKET-LAB-1.1.0';

export function streakStats(rows) {
  if (rows.length < 2) return { direction: 'FLAT', length: 0, upDays20: 0, downDays20: 0 };
  let direction = 'FLAT', length = 0;
  for (let i = rows.length - 1; i > 0; i -= 1) { const delta = rows[i].c - rows[i - 1].c; const d = delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'FLAT'; if (direction === 'FLAT') direction = d; if (d !== direction || d === 'FLAT') break; length += 1; }
  const recent = rows.slice(-21); let upDays20 = 0, downDays20 = 0;
  for (let i = 1; i < recent.length; i += 1) { if (recent[i].c > recent[i - 1].c) upDays20 += 1; if (recent[i].c < recent[i - 1].c) downDays20 += 1; }
  return { direction, length, upDays20, downDays20 };
}

export function marketSignals(rows) {
  if (rows.length < 22) return { status: 'INSUFFICIENT_DATA', algorithmVersion: MARKET_ENGINE_VERSION, momentumScore: null, waveScore: null, flowScore: null, flowState: 'UNKNOWN', downsideScore: null, downsideSeverity: 'UNKNOWN', streak: streakStats(rows), metrics: {}, reasons: ['At least 22 daily observations are required.'], guardrail: 'Market-layer signal only. It cannot mutate Evidence, Thesis or canonical Conviction.' };
  const closes = rows.map((r) => r.c), volumes = rows.map((r) => finite(r.v) ? r.v : 0), last = closes.at(-1);
  const ret5 = pct(last, closes.at(-6)), ret20 = pct(last, closes.at(-21)), ret60 = rows.length >= 61 ? pct(last, closes.at(-61)) : ret20, ret252 = rows.length >= 253 ? pct(last, closes.at(-253)) : ret60;
  const ma20 = avg(closes.slice(-20)), ma50 = avg(closes.slice(-50));
  const dailyReturns = closes.slice(1).map((v, i) => pct(v, closes[i]) || 0), vol20 = stdev(dailyReturns.slice(-20));
  const recentVolume = avg(volumes.slice(-5)), baseVolume = avg(volumes.slice(-20)), volumeRatio = baseVolume && baseVolume > 0 ? recentVolume / baseVolume : 1;
  const streak = streakStats(rows);
  const trend = clamp(50 + (ret20 || 0) * 2 + (ret60 || 0) * 0.8 + (last > ma20 ? 8 : -8) + (last > ma50 ? 8 : -8));
  const momentumScore = Math.round(trend * 10) / 10;
  const signedVolumeImpulse = clamp(50 + (volumeRatio - 1) * 30 + (ret5 || 0) * 3 + (ret20 || 0) * 0.7 + (streak.direction === 'UP' ? Math.min(streak.length * 2, 10) : streak.direction === 'DOWN' ? -Math.min(streak.length * 2, 10) : 0));
  const flowScore = Math.round(signedVolumeImpulse * 10) / 10;
  const flowState = flowScore >= 70 ? 'ACCUMULATION_PROXY' : flowScore <= 30 ? 'DISTRIBUTION_PROXY' : 'NEUTRAL';
  const waveScore = Math.round(clamp(momentumScore * 0.48 + clamp(50 + (ret5 || 0) * 4) * 0.18 + flowScore * 0.18 + clamp(50 + (ret252 || 0) * 0.4) * 0.16) * 10) / 10;
  const downsideRaw = (last < ma20 ? 18 : 0) + (last < ma50 ? 18 : 0) + ((ret5 || 0) < -3 ? 16 : 0) + ((ret20 || 0) < -8 ? 16 : 0) + (vol20 > 3 ? 12 : vol20 > 2 ? 6 : 0) + (volumeRatio > 1.35 && (ret5 || 0) < 0 ? 12 : 0) + (flowScore < 30 ? 8 : 0) + (streak.direction === 'DOWN' ? Math.min(streak.length * 4, 16) : 0);
  const downsideScore = Math.round(clamp(downsideRaw) * 10) / 10;
  const downsideSeverity = downsideScore >= 75 ? 'CRITICAL' : downsideScore >= 50 ? 'ELEVATED' : downsideScore >= 25 ? 'WATCH' : 'NORMAL';
  return { status: 'OK', algorithmVersion: MARKET_ENGINE_VERSION, momentumScore, waveScore, flowScore, flowState, downsideScore, downsideSeverity, streak, metrics: { ret5, ret20, ret60, ret252, ma20, ma50, vol20, volumeRatio }, reasons: [`20D return ${ret20?.toFixed(2) ?? 'n/a'}%`, `60D return ${ret60?.toFixed(2) ?? 'n/a'}%`, `price ${last > ma20 ? 'above' : 'below'} MA20`, `price ${last > ma50 ? 'above' : 'below'} MA50`, `5D/20D volume ratio ${volumeRatio.toFixed(2)}x`, `Flow Ω Lite ${flowScore.toFixed(1)} · ${flowState}`, `${streak.direction} streak ${streak.length} sessions`], guardrail: 'Flow Ω Lite is an OHLCV proxy, not proof of institutional/dark-pool flow. Market-layer signals cannot mutate Evidence, Thesis or canonical Conviction.' };
}

export function discoveryScore(signals) {
  if (!signals || signals.status !== 'OK') return null;
  return Math.round(clamp((signals.momentumScore || 0) * 0.35 + (signals.waveScore || 0) * 0.30 + (signals.flowScore || 50) * 0.20 + (100 - (signals.downsideScore || 0)) * 0.15) * 10) / 10;
}
