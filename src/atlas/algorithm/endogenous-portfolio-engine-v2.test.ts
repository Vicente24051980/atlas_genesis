import { describe, expect, it } from 'vitest';
import {
  CANONICAL_SCENARIOS,
  MAX_PORTFOLIO_POSITIONS_V2,
  MIN_PORTFOLIO_POSITIONS_V2,
  evaluatePortfolioSetV2,
  evaluateReplacementV2,
  expectedReturnPct,
  runEndogenousPortfolioEngineV2,
  type PortfolioCandidateV2,
} from './endogenous-portfolio-engine-v2';

function c(i:number, er=12, driver=`d${i}`, funding:string[]=[]): PortfolioCandidateV2 {
  const scenarios = Object.fromEntries(CANONICAL_SCENARIOS.map(s => [s, -0.5])) as PortfolioCandidateV2['scenarios'];
  return {
    ticker:`T${i}`, canonicalEntityId:`ENTITY-${i}`, hardGatesPassed:true, falsifierVetoPassed:true,
    expectedReturn:{ fundamentalGrowthPct:er-4, cashYieldPct:2, capitalReturnsPct:1, multipleNormalizationPct:1 },
    permanentLossRisk:2, tailRisk:1, volatilityRisk:2, fragility:1, convexity:1, confidence:0.9, individualScore:90,
    causalDrivers:{[driver]:1}, fundingSources:funding, scenarios,
  };
}

describe('Endogenous Portfolio Engine v2.2 — Point Zero / fully endogenous N',()=>{
  it('has no binding ex-ante cardinality floor or ceiling',()=>{
    expect(MIN_PORTFOLIO_POSITIONS_V2).toBe(0);
    expect(MAX_PORTFOLIO_POSITIONS_V2).toBe(Number.POSITIVE_INFINITY);
  });

  it('rejects caller-supplied fixed cardinality bounds',()=>{
    const xs=Array.from({length:5},(_,i)=>c(i+1));
    expect(runEndogenousPortfolioEngineV2(xs,{minPositions:5}).status).toBe('EVIDENCE_PENDING');
    expect(runEndogenousPortfolioEngineV2(xs,{maxPositions:5}).status).toBe('EVIDENCE_PENDING');
  });

  it('keeps expected return decomposed and independent from confidence',()=>{
    const a=c(1,12); const b={...a, ticker:'B', canonicalEntityId:'ENTITY-B', confidence:0.4};
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

  it('measures causal redundancy but gives it zero standalone utility authority',()=>{
    const a=c(1,12,'ai-capex'); const b=c(2,12,'ai-capex'); const d=c(3,12,'health');
    const red=evaluatePortfolioSetV2([a,b]);
    const div=evaluatePortfolioSetV2([a,d]);
    expect(red.causalRedundancy).toBeGreaterThan(div.causalRedundancy);
    expect(red.causalDiversification).toBeLessThan(div.causalDiversification);
    expect(red.utility).toBeCloseTo(div.utility,12);
  });

  it('fails closed if a caller tries to reward diversification or penalize causal redundancy independently',()=>{
    const xs=Array.from({length:5},(_,i)=>c(i+1));
    expect(runEndogenousPortfolioEngineV2(xs,{alphaDiversification:1}).status).toBe('EVIDENCE_PENDING');
    expect(runEndogenousPortfolioEngineV2(xs,{rhoCausalRedundancy:1}).status).toBe('EVIDENCE_PENDING');
  });

  it('detects shared funding-source correlation as risk',()=>{
    const a=c(1,12,'gpu',['neocloud-x']); const b=c(2,12,'servers',['neocloud-x']); const d=c(3,12,'health',['insurer-y']);
    expect(evaluatePortfolioSetV2([a,b]).financingCorrelation).toBeGreaterThan(evaluatePortfolioSetV2([a,d]).financingCorrelation);
  });

  it('rewards scenario offset capacity only through robustness risk reduction',()=>{
    const a=c(1), b=c(2), h=c(3);
    for(const s of CANONICAL_SCENARIOS){a.scenarios[s]=-3;b.scenarios[s]=-3;h.scenarios[s]=3;}
    expect(evaluatePortfolioSetV2([a,h]).robustness).toBeGreaterThan(evaluatePortfolioSetV2([a,b]).robustness);
  });

  it('uses return/low-vol versioned default risk weights',()=>{
    const a=c(1); a.permanentLossRisk=10; a.tailRisk=0; a.volatilityRisk=0;
    const b=c(2); b.permanentLossRisk=0; b.tailRisk=0; b.volatilityRisk=10;
    expect(evaluatePortfolioSetV2([a]).weightedRisk).toBeCloseTo(4,8);
    expect(evaluatePortfolioSetV2([b]).weightedRisk).toBeCloseTo(4,8);
  });

  it('fails closed when a scenario is missing',()=>{
    const xs=Array.from({length:5},(_,i)=>c(i+1));
    delete (xs[0].scenarios as any).US_RECESSION;
    expect(runEndogenousPortfolioEngineV2(xs).status).toBe('EVIDENCE_PENDING');
  });

  it('rejects hard-gate and falsifier-veto failures',()=>{
    const xs=Array.from({length:5},(_,i)=>c(i+1));
    const bad={...c(99,100),hardGatesPassed:false};
    const veto={...c(100,100),falsifierVetoPassed:false};
    const r=runEndogenousPortfolioEngineV2([...xs,bad,veto]);
    expect(r.selectedTickers).not.toContain('T99');
    expect(r.selectedTickers).not.toContain('T100');
    expect(r.classifications.T99).toBe('REJECTED');
    expect(r.classifications.T100).toBe('REJECTED');
  });

  it('builds the frontier from Point Zero and stops at the first non-improving N+1',()=>{
    const xs=Array.from({length:35},(_,i)=>c(i+1,16-i*0.4));
    const r=runEndogenousPortfolioEngineV2(xs);
    expect(r.frontier[0].n).toBe(1);
    expect(r.optimalN).toBeGreaterThanOrEqual(0);
    expect(r.optimalN).toBeLessThanOrEqual(xs.length);
    expect(r.frontier.at(-1)!.n).toBeGreaterThanOrEqual(r.optimalN ?? 0);
    expect(r.emitsTargetWeights).toBe(false);
    expect(r.emitsEntryTiming).toBe(false);
  });

  it('deduplicates canonical economic entities before portfolio competition',()=>{
    const a=c(1,15);
    const duplicate={...a,ticker:'ALT_SHARE_CLASS'};
    const r=runEndogenousPortfolioEngineV2([a,duplicate,c(2,10)]);
    expect(r.status).toBe('SELECTED');
    expect(r.selectedTickers.filter(t=>t==='T1'||t==='ALT_SHARE_CLASS')).toHaveLength(1);
  });

  it('fails closed when duplicate entity rows disagree on normalized evidence',()=>{
    const a=c(1,15);
    const duplicate={...a,ticker:'ALT_SHARE_CLASS',permanentLossRisk:99};
    expect(runEndogenousPortfolioEngineV2([a,duplicate]).status).toBe('EVIDENCE_PENDING');
  });

  it('does not claim combinatorial global optimality',()=>{
    const xs=Array.from({length:5},(_,i)=>c(i+1));
    const r=runEndogenousPortfolioEngineV2(xs);
    expect(r.searchMode).toBe('DETERMINISTIC_LOCAL_SEARCH');
    expect(r.globalOptimalityProven).toBe(false);
  });

  it('allows a lower-score challenger to win at execution when it materially improves return/risk utility',()=>{
    const p=Array.from({length:5},(_,i)=>c(i+1,12,'financials',['shared']));
    p[4].permanentLossRisk=8;
    p[4].volatilityRisk=10;
    p[4].fragility=5;
    const challenger=c(99,11.8,'financials',['shared']);
    challenger.individualScore=85;
    challenger.permanentLossRisk=0.5;
    challenger.volatilityRisk=0.5;
    challenger.fragility=0.5;
    const d=evaluateReplacementV2(p,'T5',challenger,'RED');
    expect(d.allowed).toBe(true);
    expect(d.deltaPortfolioUtility).toBeGreaterThan(0);
  });

  it('keeps execution hysteresis separate: GREEN is harder to replace than RED',()=>{
    const p=Array.from({length:5},(_,i)=>c(i+1,12,`d${i}`));
    const challenger=c(99,12.2,'new-driver');
    const green=evaluateReplacementV2(p,'T5',challenger,'GREEN');
    const red=evaluateReplacementV2(p,'T5',challenger,'RED');
    expect(green.threshold).toBeGreaterThan(red.threshold);
  });

  it('forbids missing-driver coverage as a portfolio-membership exception',()=>{
    const xs=Array.from({length:5},(_,i)=>c(i+1,12,`d${i}`));
    const hedge=c(21,0,'health');
    for(const s of CANONICAL_SCENARIOS) hedge.scenarios[s]=4;
    const r=runEndogenousPortfolioEngineV2([...xs,hedge],{requiredStructuralDrivers:['health']});
    expect(r.status).toBe('EVIDENCE_PENDING');
  });
});