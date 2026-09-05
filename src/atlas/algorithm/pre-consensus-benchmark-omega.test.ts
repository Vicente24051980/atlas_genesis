import { describe, expect, it } from 'vitest';
import { evaluatePreConsensusBenchmark, type BenchmarkObservation } from './pre-consensus-benchmark-omega';

const rows: BenchmarkObservation[] = Array.from({length:24},(_,i)=>[
 {strategy:'ATLAS_BASE',period:`m${i}`,returnPct:1+(i%3)*0.1,benchmarkReturnPct:0.7,turnoverPct:8,forwardHit:i%4!==0,rankIc:0.03,regime:i<12?'A':'B'},
 {strategy:'ATLAS_PRE_CONSENSUS',period:`m${i}`,returnPct:1.3+(i%3)*0.1,benchmarkReturnPct:0.7,turnoverPct:9,forwardHit:i%5!==0,recognitionLeadDays:120+i,rankIc:0.05,regime:i<12?'A':'B'},
 {strategy:'QUALITY',period:`m${i}`,returnPct:0.9,benchmarkReturnPct:0.7,turnoverPct:6,forwardHit:true,regime:i<12?'A':'B'},
 {strategy:'VALUE',period:`m${i}`,returnPct:0.8,benchmarkReturnPct:0.7,turnoverPct:7,forwardHit:true,regime:i<12?'A':'B'},
 {strategy:'MOMENTUM',period:`m${i}`,returnPct:1.0,benchmarkReturnPct:0.7,turnoverPct:18,forwardHit:true,regime:i<12?'A':'B'},
 {strategy:'RANDOM_SECTOR_NEUTRAL',period:`m${i}`,returnPct:0.7,benchmarkReturnPct:0.7,turnoverPct:12,forwardHit:i%2===0,regime:i<12?'A':'B'}
] as BenchmarkObservation[]).flat();

const hygiene={pointInTimeData:true,survivorshipAuditPassed:true,lookAheadAuditPassed:true,identicalUniverse:true,identicalCosts:true};

describe('Pre-Consensus Benchmark Ω',()=>{
 it('fails closed on bad research hygiene',()=>{ expect(evaluatePreConsensusBenchmark(rows,{...hygiene,pointInTimeData:false}).state).toBe('REJECT'); });
 it('marks synthetic data as mechanics only',()=>{ const r=evaluatePreConsensusBenchmark(rows,{...hygiene,syntheticFixture:true}); expect(r.state).toBe('MECHANICS_ONLY'); expect(r.directAtlasScoreDelta).toBe(0); });
 it('compares ATLAS against explicit trivial baselines and can identify improvement',()=>{ const r=evaluatePreConsensusBenchmark(rows,hygiene); expect(r.state).toBe('EMPIRICAL_VALID'); expect(r.metrics).toHaveLength(6); expect(r.preConsensusBeatsBase).toBe(true); expect(r.winner).toBe('ATLAS_PRE_CONSENSUS'); });
 it('requires both ATLAS variants',()=>{ expect(evaluatePreConsensusBenchmark(rows.filter(x=>x.strategy!=='ATLAS_BASE'),hygiene).state).toBe('REJECT'); });
});
