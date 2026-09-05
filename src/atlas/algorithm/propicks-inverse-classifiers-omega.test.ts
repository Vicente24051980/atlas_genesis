import {
  buildWalkForwardFolds, classifierProbability, PointInTimeCandidate,
  rankByEntryProbability, trainInverseClassifier,
} from './propicks-inverse-classifiers-omega';

const factors=(base:number)=>Object.fromEntries(['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10'].map((k,i)=>[k,Math.max(0,Math.min(100,base+i))])) as PointInTimeCandidate['factors'];

const rows:PointInTimeCandidate[]=[];
for(let i=0;i<120;i++) rows.push({ticker:`T${i}`,snapshotDate:i<60?'2026-01-01':'2026-02-01',previousState:'OUT',observedDecision:i%4===0?'ENTRY':'REJECT',factors:factors(i%4===0?80:35),evidenceCoveragePct:90});

test('entry learner reaches established state at n>=100',()=>{
  const m=trainInverseClassifier('ENTRY',rows);
  expect(m.state).toBe('ESTABLISHED'); expect(m.trainedOn).toBe(120);
});

test('higher entry-like factors rank first',()=>{
  const m=trainInverseClassifier('ENTRY',rows);
  const ranked=rankByEntryProbability(m,[{...rows[0],ticker:'HIGH',factors:factors(90)},{...rows[1],ticker:'LOW',factors:factors(10)}]);
  expect(ranked[0].ticker).toBe('HIGH');
  expect(classifierProbability(m,ranked[0])).toBeGreaterThan(classifierProbability(m,ranked[1]));
});

test('walk-forward never trains on test or future date',()=>{
  const folds=buildWalkForwardFolds(rows);
  expect(folds).toHaveLength(1);
  expect(folds[0].train.every(r=>r.snapshotDate<'2026-02-01')).toBe(true);
  expect(folds[0].test.every(r=>r.snapshotDate==='2026-02-01')).toBe(true);
});

test('personal capital cannot enter schema',()=>{
  expect(Object.keys(rows[0])).not.toContain('capital');
  expect(Object.keys(rows[0])).not.toContain('positionSize');
  expect(Object.keys(rows[0])).not.toContain('pnl');
});
