import {describe,it,expect} from 'vitest';
import {calculateScenarioOwnerReturn,type ScenarioOwnerReturnInput} from './scenario-owner-return-omega';
import {evaluateAiExposureControl,aiSizingScope,AI_OVERRIDE_CONDITIONS,type AiControlRequest} from './e5-control-policy-omega';
import {evaluateNetRotationAdvantage,type NetRotationContext} from './net-rotation-advantage-omega';
import {validateMeasuredCovariance,measuredPortfolioRisk} from './structural-risk-unit-authority-omega';
import {calculateShadowCovarianceSizing,isCanonicalSizingAttestationValid} from './structural-sizing-authority-omega';
import {CANONICAL_SCENARIOS,expectedReturnPct,evaluateReplacementV2,runEndogenousPortfolioEngineV2,type PortfolioCandidateV2} from './endogenous-portfolio-engine-v2';
import {runStructuralPortfolioPublicationGate} from './structural-portfolio-publication-gate-omega';
import {resolveStructuralUniverseAuthority,ATLAS_CORE_UNIVERSE_VERSION} from './structural-universe-authority-omega';

const asOf='2026-09-07T10:00:00Z';
const evidence={source:'SIM-audit-fixture',version:'SIM-1',publicationDate:'2026-09-06T00:00:00Z',availableAt:'2026-09-06T01:00:00Z',expiresAt:'2026-09-08T00:00:00Z'};
function model(entityId='A',multiple=10):ScenarioOwnerReturnInput {
  return {entityId,asOf,currency:'USD',pricePerShare:100,horizonYears:3,evidence,
    scenarios:['BEAR','BASE','BULL'].map((name,i)=>({name:name as 'BASE',probability:[0.25,0.5,0.25][i],rationale:'SIM known payoff',terminalOwnerEarningsMultiple:multiple,
      years:Array.from({length:3},()=>({revenue:1000,netMargin:0.1,ownerEarningsConversion:1,dilutedShares:10,cashDividendPerShare:0}))}))};
}
function ai(weight=0.4):AiControlRequest {
  const r:AiControlRequest={asOf,decisionId:'SIM-D1',action:'INCREASE',cashWeight:1-weight,
    positions:[{entityId:'B',weight,classification:'AI_CORE',evidence,directAiDependency:{basis:'REVENUE',fraction:0.8}}],
    conditions:Object.fromEntries(AI_OVERRIDE_CONDITIONS.map(k=>[k,{passed:true,evidence}])),
    humanApproval:{approved:true,decisionId:'SIM-D1',sizingScope:'',evidence}};
  r.humanApproval!.sizingScope=aiSizingScope(r);return r;
}
function rotation():NetRotationContext {
  return {asOf,decisionId:'SIM-D1',incumbent:model('A',10),challenger:model('B',12),capital:1000,currency:'USD',
    costs:{transaction:1,spread:2,taxes:3,financing:4,implementation:5},uncertaintyReserveAtHorizon:10,lostOptionalityAtHorizon:5,evidence,
    broker:{status:'RECONCILED',snapshotId:'SIM-S1',currency:'USD',cash:20,incumbentMarketValue:1000,evidence},aiControl:ai()};
}
function candidate(entityId:string,m=model(entityId,12)):PortfolioCandidateV2 {
  return {ticker:entityId,canonicalEntityId:entityId,hardGatesPassed:true,falsifierVetoPassed:true,
    expectedReturn:{fundamentalGrowthPct:99,cashYieldPct:99,capitalReturnsPct:99,multipleNormalizationPct:99},scenarioReturn:m,
    permanentLossRisk:0,tailRisk:0,volatilityRisk:0,fragility:0,convexity:0,confidence:1,individualScore:90,causalDrivers:{},fundingSources:[],
    scenarios:Object.fromEntries(CANONICAL_SCENARIOS.map(s=>[s,0])) as PortfolioCandidateV2['scenarios']};
}
const covariance={entityIds:['A','B'],asOf,evidence,annualDecimalReturnCovariance:[[0.04,0],[0,0.04]]};

describe('E2 per-share scenario returns',()=>{
  it('calculates a known unchanged terminal value as zero return',()=>{
    expect(calculateScenarioOwnerReturn(model()).expectedCagrPct).toBeCloseTo(0,12);
  });
  it('counts dividends once and dilution through per-share earnings only',()=>{
    const m=model();m.scenarios.forEach(s=>s.years.forEach(y=>{y.cashDividendPerShare=1;y.dilutedShares=20;}));
    const r=calculateScenarioOwnerReturn(m);
    expect(r.expectedTerminalWealthPerShare).toBe(53);
    expect(r.expectedCagrPct).toBeCloseTo(100*(Math.pow(0.53,1/3)-1),10);
  });
  it('distinguishes expectation of CAGR from CAGR of expected wealth',()=>{
    const m=model();m.scenarios[0].terminalOwnerEarningsMultiple=0;m.scenarios[2].terminalOwnerEarningsMultiple=20;
    const r=calculateScenarioOwnerReturn(m);
    expect(r.scenarios[0].cagrPct).toBe(-100);
    expect(r.expectedCagrPct).toBeLessThan(r.cagrOfExpectedWealthPct!);
    expect(r.cagrOfExpectedWealthPct).toBeCloseTo(0,10);
  });
  it.each(['probability','future','stale','dividend','shares','horizon','missing','NaN'])('blocks malformed %s',bad=>{
    const m=structuredClone(model());
    if(bad==='probability') m.scenarios[0].probability=0.9;
    if(bad==='future') m.evidence.availableAt='2026-09-09T00:00:00Z';
    if(bad==='stale') m.evidence.expiresAt='2026-09-06T12:00:00Z';
    if(bad==='dividend') m.scenarios[0].years[0].cashDividendPerShare=11;
    if(bad==='shares') m.scenarios[0].years[0].dilutedShares=0;
    if(bad==='horizon') m.horizonYears=2;
    if(bad==='missing') m.scenarios.pop();
    if(bad==='NaN') m.pricePerShare=NaN;
    expect(calculateScenarioOwnerReturn(m).status).toBe('EVIDENCE_PENDING');
  });
  it('uses scenario return instead of double-counting the legacy bridge',()=>{
    const c=candidate('A');expect(expectedReturnPct(c)).toBeCloseTo(100*(Math.pow(1.2,1/3)-1),10);
    expect(runEndogenousPortfolioEngineV2([c]).status).toBe('SELECTED');
    c.scenarioReturn!.entityId='WRONG';expect(runEndogenousPortfolioEngineV2([c]).status).toBe('EVIDENCE_PENDING');
  });
  it('reports terminal multiple sensitivity',()=>{
    const r=calculateScenarioOwnerReturn(model());
    expect(r.terminalMultipleSensitivity[0].expectedCagrPct).toBeLessThan(r.expectedCagrPct!);
    expect(r.terminalMultipleSensitivity[2].expectedCagrPct).toBeGreaterThan(r.expectedCagrPct!);
  });
});
describe('E5 AI exposure control',()=>{
  it('allows exactly 30% without override and approves >30% only jointly',()=>{
    const low=ai(0.3);delete low.humanApproval;delete low.conditions;
    expect(evaluateAiExposureControl(low).status).toBe('WITHIN_CEILING');
    expect(evaluateAiExposureControl(ai()).override).toBe('ACTIVE');
  });
  it.each([...AI_OVERRIDE_CONDITIONS])('blocks one missing condition %s',condition=>{
    const r=ai();delete r.conditions![condition];expect(evaluateAiExposureControl(r).allowsIncrease).toBe(false);
  });
  it('blocks textual false, stale evidence and approval for another decision',()=>{
    const r=ai();r.humanApproval!.approved='false' as unknown as boolean;expect(evaluateAiExposureControl(r).allowsIncrease).toBe(false);
    r.humanApproval!.approved=true;r.humanApproval!.decisionId='OTHER';expect(evaluateAiExposureControl(r).allowsIncrease).toBe(false);
    r.humanApproval!.decisionId='SIM-D1';r.asOf='2026-09-10T00:00:00Z';expect(evaluateAiExposureControl(r).allowsIncrease).toBe(false);
  });
  it('unknown classification does not silently count as zero AI',()=>{
    const r=ai();r.positions[0].classification='AI_CLASSIFICATION_UNKNOWN';
    expect(evaluateAiExposureControl(r).unknownWeight).toBe(0.4);expect(evaluateAiExposureControl(r).allowsIncrease).toBe(false);
  });
  it('passive drift triggers review without an automatic sale or buying permission',()=>{
    const r=ai();r.action='PASSIVE_DRIFT';delete r.conditions;delete r.humanApproval;
    const out=evaluateAiExposureControl(r);expect(out.status).toBe('AI_OVER_30_REVIEW');expect(out.autoSell).toBe(false);expect(out.allowsIncrease).toBe(false);
  });
  it('rejects duplicate entities and weights inconsistent with cash',()=>{
    const r=ai();r.positions.push({...r.positions[0]});expect(evaluateAiExposureControl(r).status).toBe('EVIDENCE_PENDING');
    r.positions.pop();r.cashWeight=0;expect(evaluateAiExposureControl(r).status).toBe('EVIDENCE_PENDING');
  });
});
describe('E3 net rotation',()=>{
  it('subtracts costs at time zero and explicit terminal buffers',()=>{
    const r=evaluateNetRotationAdvantage(rotation());expect(r.netAdvantageAtHorizon).toBeCloseTo(167,10);expect(r.allowed).toBe(true);expect(r.executionAuthorized).toBe(false);
  });
  it.each(['costs','taxMissing','broker','currency','horizon','ai','asOf'])('blocks unsafe %s',bad=>{
    const r=structuredClone(rotation());
    if(bad==='costs')r.costs.taxes=300;
    if(bad==='taxMissing')delete (r.costs as Partial<typeof r.costs>).taxes;
    if(bad==='broker')r.broker.status='UNKNOWN' as 'RECONCILED';
    if(bad==='currency')r.challenger.currency='EUR';
    if(bad==='horizon')r.challenger.horizonYears=6;
    if(bad==='ai')delete r.aiControl.humanApproval;
    if(bad==='asOf')r.challenger.asOf='2026-09-06T10:00:00Z';
    expect(evaluateNetRotationAdvantage(r).allowed).toBe(false);
  });
  it('requires strictly positive advantage, not zero',()=>{
    const r=rotation();r.challenger=model('B');r.costs={transaction:0,spread:0,taxes:0,financing:0,implementation:0};r.uncertaintyReserveAtHorizon=0;r.lostOptionalityAtHorizon=0;
    expect(evaluateNetRotationAdvantage(r).allowed).toBe(false);
  });
  it('connects net rotation to the existing replacement helper',()=>{
    const r=rotation(),p=[candidate('A',r.incumbent)],c=candidate('B',r.challenger);
    expect(evaluateReplacementV2(p,'A',c,'GREEN',{},r).allowed).toBe(true);
    expect(evaluateReplacementV2(p,'A',c,'GREEN').allowed).toBe(false);
    r.costs.taxes=300;expect(evaluateReplacementV2(p,'A',c,'GREEN',{},r).allowed).toBe(false);
  });
});
describe('Measured risk and shadow sizing',()=>{
  it('computes w-transpose covariance w with correct annual units',()=>{
    expect(measuredPortfolioRisk(covariance,[0.5,0.5]).annualVariance).toBeCloseTo(0.02,12);
    expect(measuredPortfolioRisk(covariance,[0.5,0.5]).annualVolatilityPct).toBeCloseTo(14.1421356237,8);
  });
  it.each([[[1,2],[2,1]],[[1,0],[1,1]],[[NaN,0],[0,1]]])('rejects indefinite, asymmetric or nonfinite covariance %j',matrix=>{
    expect(validateMeasuredCovariance({...covariance,annualDecimalReturnCovariance:matrix})).toBe(false);
  });
  it('accepts singular PSD but rejects duplicate identity and stale evidence',()=>{
    expect(validateMeasuredCovariance({...covariance,annualDecimalReturnCovariance:[[1,1],[1,1]]})).toBe(true);
    expect(validateMeasuredCovariance({...covariance,entityIds:['A','A']})).toBe(false);
    expect(validateMeasuredCovariance({...covariance,asOf:'2026-09-09T00:00:00Z'})).toBe(false);
  });
  it('sizing reduces measured risk for equal returns but does not promote itself',()=>{
    const r=calculateShadowCovarianceSizing(covariance,[10,10],5);
    expect(r.weights).toEqual({A:0.5,B:0.5});expect(r.authority).toBe('SHADOW_ONLY');
    expect(r.globalOptimalityProven).toBe(false);expect(isCanonicalSizingAttestationValid()).toBe(false);
  });
  it('permits concentration when risk aversion is zero',()=>{
    expect(calculateShadowCovarianceSizing(covariance,[10,20],0).weights).toEqual({A:0,B:1});
  });
  it('canonical publication refuses the old additive bridge even for a full universe',()=>{
    const u=resolveStructuralUniverseAuthority(ATLAS_CORE_UNIVERSE_VERSION);
    const candidates=u.allowedTickers.map(t=>{const c=candidate(t);delete c.scenarioReturn;return c;});
    const r=runStructuralPortfolioPublicationGate({universeVersion:ATLAS_CORE_UNIVERSE_VERSION,asOf,snapshotHash:'SIM',policyHash:'SIM',candidates,reproducibilityRuns:2});
    expect(r.publicationState).toBe('BLOCKED_SCENARIO_RETURN_EVIDENCE');
  });
});

import {auditSmallUniverseSearchGap} from './e6-assurance-harness-policy-omega';
describe('Integration and assurance regression cases',()=>{
  it('invalidates approval when proposed sizing changes under the same decision ID',()=>{
    const r=ai();r.positions[0].weight=0.5;r.cashWeight=0.5;
    expect(evaluateAiExposureControl(r).allowsIncrease).toBe(false);
  });
  it('requires demonstrated dominant dependency for AI_CORE',()=>{
    const r=ai();r.positions[0].directAiDependency!.fraction=0.5;
    expect(evaluateAiExposureControl(r).status).toBe('EVIDENCE_PENDING');
  });
  it('runs AI and covariance gates before rejecting unvalidated sizing authority',()=>{
    const u=resolveStructuralUniverseAuthority(ATLAS_CORE_UNIVERSE_VERSION);
    const candidates=u.allowedTickers.map(t=>candidate(t));
    const selection=runEndogenousPortfolioEngineV2(candidates);
    const ids=selection.selectedTickers;expect(ids).toHaveLength(1);
    const sizing={method:'COVARIANCE_AWARE' as const,portfolioVolatilityModelHash:'SIM',weights:{[ids[0]]:1},
      measuredCovariance:{...covariance,entityIds:ids,annualDecimalReturnCovariance:[[0.04]]}};
    const req={universeVersion:ATLAS_CORE_UNIVERSE_VERSION,asOf,snapshotHash:'SIM',policyHash:'SIM',candidates,reproducibilityRuns:2,sizing};
    expect(runStructuralPortfolioPublicationGate(req).publicationState).toBe('BLOCKED_AI_CONTROL');
    const control:AiControlRequest={asOf,decisionId:'SIM',action:'INCREASE',cashWeight:0,positions:[{entityId:ids[0],weight:1,classification:'NON_AI',evidence}]};
    expect(runStructuralPortfolioPublicationGate({...req,aiControl:control}).publicationState).toBe('BLOCKED_SIZING_POLICY_UNVALIDATED');
    sizing.measuredCovariance.annualDecimalReturnCovariance=[[-1]];
    expect(runStructuralPortfolioPublicationGate({...req,aiControl:control}).publicationState).toBe('BLOCKED_INVALID_SIZING');
  });
  it('E6 detects the known multi-add gap without changing production selection',()=>{
    const xs=['A','B','C'].map((id,i)=>{
      const c=candidate(id);delete c.scenarioReturn;
      c.expectedReturn={fundamentalGrowthPct:i===0?12:9,cashYieldPct:0,capitalReturnsPct:0,multipleNormalizationPct:0};
      for(const s of CANONICAL_SCENARIOS)c.scenarios[s]=-0.5;
      return c;
    });
    xs[0].scenarios.US_RECESSION=-3;xs[1].scenarios.AI_CAPEX_MINUS_30=3;xs[2].scenarios.AI_CAPEX_MINUS_30=-3;xs[2].scenarios.US_RECESSION=3;
    const r=auditSmallUniverseSearchGap(xs);
    expect(r.status).toBe('CALCULATED');
    if(r.status==='CALCULATED'){expect(r.utilityGap).toBeGreaterThan(0);expect(r.referenceN).toBe(3);expect(r.heuristicN).toBe(1);expect(r.productionGlobalOptimalityProven).toBe(false);}
    expect(auditSmallUniverseSearchGap(Array.from({length:13},(_,i)=>candidate(String(i)))).status).toBe('EVIDENCE_PENDING');
  });
});
