export type EvidenceLevel = 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

export interface ActorShare {
  actor: string;
  share: number; // fraction 0..1
}

export interface LayerSnapshot {
  id: string;
  label: string;
  date: string;
  shares: ActorShare[];
  residualShare?: number;
  lock: number; // 0..1
  verticalIntegration: number; // 0..1
  evidenceLevel: EvidenceLevel;
  source: string;
  notes?: string;
}

export interface ConcentrationMetrics {
  cr1: number;
  cr3: number;
  cr5: number;
  cr10: number;
  hhi: number;
  effectiveActors: number;
  observedShare: number;
}

export interface LayerPowerResult extends ConcentrationMetrics {
  layerPower: number;
  valid: boolean;
}

export interface GIPCIResult {
  point: number | null;
  low: number | null;
  high: number | null;
  validLayerCount: number;
  e3PlusWeightShare: number;
  missingness: number;
  valid: boolean;
}

export interface ActorLayerPresence {
  actor: string;
  layerId: string;
  share: number;
  chokepoint: number;
  evidenceLevel: EvidenceLevel;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const evidenceMultiplier: Record<EvidenceLevel, number> = {
  E0: 0,
  E1: 0.25,
  E2: 0.5,
  E3: 0.75,
  E4: 0.9,
  E5: 1,
};

export function concentrationMetrics(shares: ActorShare[]): ConcentrationMetrics {
  const clean = shares
    .filter((x) => Number.isFinite(x.share) && x.share > 0)
    .map((x) => ({ ...x, share: clamp01(x.share) }))
    .sort((a, b) => b.share - a.share);
  const sumTop = (n: number) => clean.slice(0, n).reduce((acc, x) => acc + x.share, 0);
  const sumSq = clean.reduce((acc, x) => acc + x.share * x.share, 0);
  const observedShare = clean.reduce((acc, x) => acc + x.share, 0);
  return {
    cr1: sumTop(1),
    cr3: sumTop(3),
    cr5: sumTop(5),
    cr10: sumTop(10),
    hhi: sumSq * 10000,
    effectiveActors: sumSq > 0 ? 1 / sumSq : 0,
    observedShare,
  };
}

export function layerPower(snapshot: LayerSnapshot): LayerPowerResult {
  const m = concentrationMetrics(snapshot.shares);
  const nHhi = Math.min(1, m.hhi / 10000);
  const power = 100 * (
    0.40 * nHhi +
    0.30 * m.cr5 +
    0.20 * clamp01(snapshot.lock) +
    0.10 * clamp01(snapshot.verticalIntegration)
  );
  return { ...m, layerPower: power, valid: m.observedShare >= 0.7 };
}

export function gipci(snapshots: LayerSnapshot[]): GIPCIResult {
  const valid = snapshots.filter((s) => layerPower(s).valid);
  const powers = valid.map(layerPower);
  const e3plus = valid.filter((s) => ['E3', 'E4', 'E5'].includes(s.evidenceLevel)).length;
  const point = powers.length ? powers.reduce((a, b) => a + b.layerPower, 0) / powers.length : null;
  const missingness = snapshots.length ? 1 - valid.length / snapshots.length : 1;
  const e3PlusWeightShare = valid.length ? e3plus / valid.length : 0;
  const isValid = valid.length >= 6 && e3PlusWeightShare >= 0.7;
  // Conservative uncertainty band: widen with invalid layers and sub-E3 evidence.
  const uncertainty = point === null ? null : Math.min(20, 5 + 12 * missingness + 8 * (1 - e3PlusWeightShare));
  return {
    point: isValid && point !== null ? point : point,
    low: point !== null && uncertainty !== null ? Math.max(0, point - uncertainty) : null,
    high: point !== null && uncertainty !== null ? Math.min(100, point + uncertainty) : null,
    validLayerCount: valid.length,
    e3PlusWeightShare,
    missingness,
    valid: isValid,
  };
}

export function verticalRecurrenceScore(
  actor: string,
  presences: ActorLayerPresence[],
  layerHhi: Record<string, number>,
): number | null {
  const rows = presences.filter((p) => p.actor === actor);
  const e3PlusLayers = new Set(rows.filter((p) => ['E3', 'E4', 'E5'].includes(p.evidenceLevel)).map((p) => p.layerId));
  if (e3PlusLayers.size < 3) return null;
  const score = rows.reduce((acc, p) => {
    const concentration = Math.min(1, (layerHhi[p.layerId] ?? 0) / 5000);
    return acc + clamp01(p.share) * concentration * clamp01(p.chokepoint) * evidenceMultiplier[p.evidenceLevel];
  }, 0);
  const distinctLayers = new Set(rows.map((p) => p.layerId)).size;
  return distinctLayers ? 100 * score / distinctLayers : null;
}

export function systemCapture(
  actors: string[],
  snapshots: LayerSnapshot[],
): number | null {
  if (!snapshots.length) return null;
  const values = snapshots.map((s) => {
    const map = new Map(s.shares.map((x) => [x.actor, x.share]));
    return actors.reduce((acc, actor) => acc + (map.get(actor) ?? 0), 0);
  });
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function concentrationDrift(current: LayerSnapshot, previous: LayerSnapshot) {
  const a = concentrationMetrics(current.shares);
  const b = concentrationMetrics(previous.shares);
  return {
    deltaCr3: a.cr3 - b.cr3,
    deltaCr5: a.cr5 - b.cr5,
    deltaHhi: a.hhi - b.hhi,
    direction: a.hhi > b.hhi + 100 ? 'CONCENTRATING' : a.hhi < b.hhi - 100 ? 'DECONCENTRATING' : 'STABLE',
  } as const;
}

export const INFORMATION_POWER_OMEGA = {
  id: 'INFORMATION_POWER_OMEGA_V1',
  version: '1.0',
  laws: [
    'CONCENTRATION != COORDINATION',
    'STRUCTURAL CONTROL != BEHAVIOURAL CAUSALITY',
    'MISSING DATA != ZERO',
    'GLOBAL AND CHINA STACKS MUST REMAIN SEPARATE UNTIL COMPARABILITY IS PROVEN',
    'TIME SERIES APPEND; NEVER SILENTLY OVERWRITE HISTORY',
  ],
} as const;
