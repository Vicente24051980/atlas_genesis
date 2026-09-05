import { describe, expect, it } from 'vitest';
import {
  CANONICAL_SCENARIOS,
  evaluatePortfolioSetV2,
  evaluateReplacementV2,
  expectedReturnPct,
  runEndogenousPortfolioEngineV2,
  type PortfolioCandidateV2,
} from './endogenous-portfolio-engine-v2';

function c(i:number, er=12, driver=`d${i}`, funding:string[]=[]): PortfolioCandidateV2 {
  const scenarios = Object.fromEntries(CANONICAL_SCENARIOS.map(s => [s, -0.5])) as PortfolioCandidateV2['scenarios'];
  return {
    ticker:`T${i}`, hardGatesPassed:true, falsifierVetoPassed:true,
    expectedReturn:{ fundamentalGrowthPct:er-4, cashYieldPct:2, capitalReturnsPct:1, multipleNormalizationPct:1 },
    permanentLossRisk:2, tailRisk:1, volatilityRisk:2, fragility:1, convexity:1, confidence:0.9, individualScore:90,
    causalDrivers:{[driver]:1}, fundingSources:funding, scenarios,
  };
}

describe('Endogenous Portfolio Engine v2',()=>{
  it('keeps expected return decomposed and independent from confidence',()=>{
    const a=c(1,12); const b={...a, ticker:'B', confidence:0.4};
    expect(expectedReturnPct(a)).toBe(12);
    expect(expectedReturnPct(b)).toBe(12);
  });

  it('uses neutral equal test weights only',()=>{
    const xs=Array.from({length:20},(_,i)=>c(i+1));
    xs[0].currentPositionWeight=0.95;
    const m=evaluatePortfolioSetV2(xs);
    expect(m.equalTestWeight).toBeCloseTo(1/20,12);
  });

  it('is capital-blind to personal state',()=>{
    const base=Array.from({length:24},(_,i)=>c(i+1,15-i*0.1));
    const rich=base.map((x,i)=>({...x,currentInvestedEur:i?1:100000,currentPositionWeight:i?0.001:0.7,personalPnLPct:i?-50:300,personalAverageCost:i?9999:1,isCurrentlyHeld:i%2===0}));
    const zero=base.map(x=>({...x,currentInvestedEur:0,currentPositionWeight:0,personalPnLPct:0,personalAverageCost:0,isCurrentlyHeld:false}));
    expect(runEndogenousPortfolioEngineV2(rich).selectedTickers).toEqual(runEndogenousPortfolioEngineV2(zero).selectedTickers);
  });

  it('penalizes causal redundancy even with different ticker identities',()=>{
    const a=c(1,12,'ai-capex'); const b=c(2,12,'ai-capex'); const d=c(3,12,'health');
    const red=evaluatePortfolioSetV2([a,b]);
    const div=evaluatePortfolioSetV2([a,d]);
    expect(red.causalRedundancy).toBeGreaterThan(div.causalRedundancy);
    expect(red.causalDiversification).toBeLessThan(div.causalDiversification);
  });

  it('detects shared funding-source correlation',()=>{
    const a=c(1,12,'gpu',['neocloud-x']); const b=c(2,12,'servers',['neocloud-x']); const d=c(3,12,'health',['insurer-y']);
    expect(evaluatePortfolioSetV2([a,b]).financingCorrelation).toBeGreaterThan(evaluatePortfolioSetV2([a,d]).financingCorrelation);
  });

  it('rewards scenario offset capacity and robustness',()=>{
    const a=c(1), b=c(2), h=c(3);
    for(const s of CANONICAL_SCENARIOS){a.scenarios[s]=-3;b.scenarios[s]=-3;h.scenarios[s]=3;}
    expect(evaluatePortfolioSetV2([a,h]).robustness).toBeGreaterThan(evaluatePortfolioSetV2([a,b]).robustness);
  });

  it('uses permanent-loss-dominant default risk weights',()=>{
    const a=c(1); a.permanentLossRisk=10; a.tailRisk=0; a.volatilityRisk=0;
    const b=c(2); b.permanentLossRisk=0; b.tailRisk=0; b.volatilityRisk=10;
    expect(evaluatePortfolioSetV2([a]).weightedRisk).toBeCloseTo(6.5,8);
    expect(evaluatePortfolioSetV2([b]).weightedRisk).toBeCloseTo(1.5,8);
  });

  it('fails closed when a scenario is missing',()=>{
    const xs=Array.from({length:20},(_,i)=>c(i+1));
    delete (xs[0].scenarios as any).US_RECESSION;
    expect(runEndogenousPortfolioEngineV2(xs).status).toBe('EVIDENCE_PENDING');
  });

  it('rejects hard-gate and falsifier-veto failures',()=>{
    const xs=Array.from({length:20},(_,i)=>c(i+1));
    const bad={...c(99,100),hardGatesPassed:false};
    const veto={...c(100,100),falsifierVetoPassed:false};
    const r=runEndogenousPortfolioEngineV2([...xs,bad,veto]);
    expect(r.selectedTickers).not.toContain('T99');
    expect(r.selectedTickers).not.toContain('T100');
    expect(r.classifications.T99).toBe('REJECTED');
    expect(r.classifications.T100).toBe('REJECTED');
  });

  it('builds a full N=20..35 frontier and keeps N endogenous',()=>{
    const xs=Array.from({length:35},(_,i)=>c(i+1,16-i*0.4));
    const r=runEndogenousPortfolioEngineV2(xs,{marginalUtilityThreshold:0.05});
    expect(r.frontier[0].n).toBe(20);
    expect(r.frontier.at(-1)?.n).toBe(35);
    expect(r.optimalN).toBeGreaterThanOrEqual(20);
    expect(r.optimalN).toBeLessThanOrEqual(35);
    expect(r.emitsTargetWeights).toBe(false);
    expect(r.emitsEntryTiming).toBe(false);
  });

  it('does not claim combinatorial global optimality',()=>{
    const xs=Array.from({length:20},(_,i)=>c(i+1));
    const r=runEndogenousPortfolioEngineV2(xs);
    expect(r.searchMode).toBe('DETERMINISTIC_LOCAL_SEARCH');
    expect(r.globalOptimalityProven).toBe(false);
  });

  it('allows a lower-score challenger to win when whole-portfolio utility improves materially',()=>{
    const p=Array.from({length:20},(_,i)=>c(i+1,12,'ai-capex',['shared']));
    const challenger=c(99,11,'health',['independent']); challenger.individualScore=85;
    const d=evaluateReplacementV2(p,'T20',challenger,'RED',{replacementThreshold:{RED:-10}});
    expect(d.allowed).toBe(true);
    expect(d.deltaPortfolioUtility).toBeGreaterThan(-10);
  });

  it('hysteresis makes GREEN harder to replace than RED',()=>{
    const p=Array.from({length:20},(_,i)=>c(i+1,12,`d${i}`));
    const challenger=c(99,12.2,'new-driver');
    const green=evaluateReplacementV2(p,'T20',challenger,'GREEN');
    const red=evaluateReplacementV2(p,'T20',challenger,'RED');
    expect(green.threshold).toBeGreaterThan(red.threshold);
  });

  it('can preserve a material missing-driver exception beyond the knee',()=>{
    const xs=Array.from({length:20},(_,i)=>c(i+1,12,`d${i}`));
    const hedge=c(21,0,'health');
    hedge.causalDrivers={health:1};
    for(const s of CANONICAL_SCENARIOS) hedge.scenarios[s]=4;
    const r=runEndogenousPortfolioEngineV2([...xs,hedge],{
      marginalUtilityThreshold:100,
      requiredStructuralDrivers:['health'],
      missingDriverRobustnessThreshold:0,
      betaRobustness:0,
    });
    expect(r.frontier[0].driverCoverage).toBeUndefined();
    expect(r.frontier[0].metrics.driverCoverage).not.toContain('health');
    expect(r.frontier[1].metrics.driverCoverage).toContain('health');
    expect(r.optimalN).toBe(21);
  });
});
