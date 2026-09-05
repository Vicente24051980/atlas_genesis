// ATLAS Ω — ProPicks Inverse Classifiers Ω v1.0
// Point-in-time, size-blind research classifier. No claim of access to proprietary ProPicks internals.

export const PROPICKS_INVERSE_CLASSIFIERS_VERSION = '1.0' as const;

export const INVERSE_FACTOR_KEYS = ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10'] as const;
export type InverseFactorKey = typeof INVERSE_FACTOR_KEYS[number];
export type MembershipState = 'OUT' | 'IN';
export type ObservedDecision = 'ENTRY' | 'HOLD' | 'EXIT' | 'REJECT';

export interface PointInTimeCandidate {
  ticker: string;
  snapshotDate: string;
  previousState: MembershipState;
  observedDecision?: ObservedDecision;
  factors: Record<InverseFactorKey, number>; // 0..100, all known strictly as-of snapshot
  sector?: string;
  marketCapBucket?: string;
  regime?: string;
  evidenceCoveragePct: number;
}

export interface LearnedClassifier {
  kind: 'ENTRY' | 'EXIT';
  intercept: number;
  weights: Record<InverseFactorKey, number>;
  trainedOn: number;
  positives: number;
  negatives: number;
  state: 'INSUFFICIENT' | 'PROVISIONAL' | 'ESTABLISHED';
}

const clamp100 = (x:number) => Math.max(0, Math.min(100, x));
const sigmoid = (z:number) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
const zeroWeights = ():Record<InverseFactorKey,number> => Object.fromEntries(INVERSE_FACTOR_KEYS.map(k=>[k,0])) as Record<InverseFactorKey,number>;

export function validatePointInTime(rows: PointInTimeCandidate[]): void {
  for (const r of rows) {
    if (!r.ticker || !/^\d{4}-\d{2}-\d{2}/.test(r.snapshotDate)) throw new Error('Invalid point-in-time row');
    if (r.evidenceCoveragePct < 0 || r.evidenceCoveragePct > 100) throw new Error('Invalid coverage');
    for (const k of INVERSE_FACTOR_KEYS) if (!Number.isFinite(r.factors[k])) throw new Error(`Missing ${k}`);
  }
}

function labelFor(kind:'ENTRY'|'EXIT', row:PointInTimeCandidate):number|null {
  if (!row.observedDecision) return null;
  if (kind === 'ENTRY') {
    if (row.previousState !== 'OUT') return null;
    return row.observedDecision === 'ENTRY' ? 1 : row.observedDecision === 'REJECT' ? 0 : null;
  }
  if (row.previousState !== 'IN') return null;
  return row.observedDecision === 'EXIT' ? 1 : row.observedDecision === 'HOLD' ? 0 : null;
}

/** Deterministic logistic learner for hypothesis generation, not a reconstruction claim. */
export function trainInverseClassifier(kind:'ENTRY'|'EXIT', rows:PointInTimeCandidate[], epochs=500, learningRate=0.05):LearnedClassifier {
  validatePointInTime(rows);
  const train = rows.map(r=>({r,y:labelFor(kind,r)})).filter(x=>x.y!==null) as {r:PointInTimeCandidate,y:number}[];
  const positives=train.filter(x=>x.y===1).length, negatives=train.length-positives;
  const state = train.length < 30 ? 'INSUFFICIENT' : train.length < 100 ? 'PROVISIONAL' : 'ESTABLISHED';
  const weights=zeroWeights(); let intercept=0;
  if (!train.length || !positives || !negatives) return {kind,intercept,weights,trainedOn:train.length,positives,negatives,state};
  for(let epoch=0;epoch<epochs;epoch++){
    let gi=0; const gw=zeroWeights();
    for(const {r,y} of train){
      let z=intercept;
      for(const k of INVERSE_FACTOR_KEYS) z += weights[k]*((clamp100(r.factors[k])-50)/50);
      const e=sigmoid(z)-y; gi+=e;
      for(const k of INVERSE_FACTOR_KEYS) gw[k]+=e*((clamp100(r.factors[k])-50)/50);
    }
    intercept -= learningRate*gi/train.length;
    for(const k of INVERSE_FACTOR_KEYS) weights[k]-=learningRate*gw[k]/train.length;
  }
  return {kind,intercept,weights,trainedOn:train.length,positives,negatives,state};
}

export function classifierProbability(model:LearnedClassifier,row:PointInTimeCandidate):number {
  let z=model.intercept;
  for(const k of INVERSE_FACTOR_KEYS) z += model.weights[k]*((clamp100(row.factors[k])-50)/50);
  return Math.round(sigmoid(z)*10000)/10000;
}

export function rankByEntryProbability(model:LearnedClassifier, rows:PointInTimeCandidate[]):PointInTimeCandidate[] {
  if(model.kind!=='ENTRY') throw new Error('ENTRY model required');
  return [...rows].filter(r=>r.previousState==='OUT').sort((a,b)=>classifierProbability(model,b)-classifierProbability(model,a));
}

export function rankByExitProbability(model:LearnedClassifier, rows:PointInTimeCandidate[]):PointInTimeCandidate[] {
  if(model.kind!=='EXIT') throw new Error('EXIT model required');
  return [...rows].filter(r=>r.previousState==='IN').sort((a,b)=>classifierProbability(model,b)-classifierProbability(model,a));
}

export interface WalkForwardFold { trainThrough:string; testDate:string; train:PointInTimeCandidate[]; test:PointInTimeCandidate[] }
export function buildWalkForwardFolds(rows:PointInTimeCandidate[]):WalkForwardFold[] {
  const dates=[...new Set(rows.map(r=>r.snapshotDate))].sort();
  return dates.slice(1).map((testDate,i)=>({trainThrough:dates[i],testDate,train:rows.filter(r=>r.snapshotDate<=dates[i]),test:rows.filter(r=>r.snapshotDate===testDate)}));
}

/** Controls required before interpreting classifier lift as evidence. */
export const PROPICKS_INVERSE_REQUIRED_CONTROLS = [
  'eligible_non_selected',
  'incumbent_hold',
  'sector_marketcap_stratified_random',
  'single_factor_top_ranked',
  'point_in_time_walk_forward',
  'no_future_features',
  'no_personal_position_or_capital_inputs',
] as const;
