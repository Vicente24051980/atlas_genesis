export type OmegaState = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'DATA_FAIL';

export interface EvidencePoint { sourceTier: 1|2|3; asOf: string; value?: number; verified: boolean; }
export interface EngineResult { state: OmegaState; score: number; reasons: string[]; automaticTrade: false; }
const clamp=(x:number)=>Math.max(0,Math.min(100,x));

export interface CircularityInput {
  independentRevenueShare?: number;
  strategicLinkedRevenueShare?: number;
  vendorFinancedShare?: number;
  cloudCreditShare?: number;
  relatedPartyShare?: number;
  evidence: EvidencePoint[];
}
export function aiEcosystemCircularityOmega(x:CircularityInput):EngineResult {
  if(!x.evidence.some(e=>e.verified&&e.sourceTier<=2)) return {state:'DATA_FAIL',score:0,reasons:['No verified Tier 1/2 evidence'],automaticTrade:false};
  const independent=x.independentRevenueShare ?? 0;
  const linked=(x.strategicLinkedRevenueShare??0)+(x.vendorFinancedShare??0)+(x.cloudCreditShare??0)+(x.relatedPartyShare??0);
  const score=clamp(independent*100-linked*50);
  const state:OmegaState=score>=75?'GREEN':score>=55?'YELLOW':score>=35?'ORANGE':'RED';
  return {state,score,reasons:[`Independent demand ${(independent*100).toFixed(1)}%`,`Linked/financed exposure ${(linked*100).toFixed(1)}%`,'Financed demand is not fake demand; investigate economics before classification.'],automaticTrade:false};
}

export interface CloudPaybackInput { revenueGrowth?:number; aiContribution?:number; capexGrowth?:number; fcfGrowth?:number; incrementalRoic?:number; verifiedQuarterlyRevenue:boolean; }
export function cloudAiPaybackObservableOmega(x:CloudPaybackInput):EngineResult {
  if(!x.verifiedQuarterlyRevenue) return {state:'DATA_FAIL',score:0,reasons:['Quarterly cloud revenue not independently disclosed/verified'],automaticTrade:false};
  const score=clamp(50+(x.revenueGrowth??0)*0.5+(x.aiContribution??0)*0.25+(x.fcfGrowth??0)*0.25+(x.incrementalRoic??0)*0.5-(x.capexGrowth??0)*0.25);
  return {state:score>=75?'GREEN':score>=55?'YELLOW':score>=35?'ORANGE':'RED',score,reasons:['Revenue, AI contribution, CAPEX, FCF and incremental ROIC evaluated separately.'],automaticTrade:false};
}

export interface BreadthInput { rspVsSpy?:number; pctAbove50dma?:number; pctAbove200dma?:number; advanceDecline?:number; sectorBreadth?:number; }
export function marketBreadthRegimeOmega(x:BreadthInput):EngineResult {
  const vals=[x.rspVsSpy,x.pctAbove50dma,x.pctAbove200dma,x.advanceDecline,x.sectorBreadth].filter((v):v is number=>v!==undefined);
  if(vals.length<3) return {state:'DATA_FAIL',score:0,reasons:['Insufficient breadth observables'],automaticTrade:false};
  const score=clamp(vals.reduce((a,b)=>a+b,0)/vals.length);
  return {state:score>=70?'GREEN':score>=50?'YELLOW':score>=30?'ORANGE':'RED',score,reasons:['Context/portfolio-regime signal only; weight in company score = 0.'],automaticTrade:false};
}

export interface CyberInput { agentExposure:number; identityExposure:number; dataExposure:number; platformCoverage:number; monetizationProof:number; valuationAsymmetry:number; }
export function cybersecurityAiAttackSurfaceOmega(x:CyberInput):EngineResult {
  const surface=(x.agentExposure+x.identityExposure+x.dataExposure)/3;
  const score=clamp(surface*.25+x.platformCoverage*.25+x.monetizationProof*.30+x.valuationAsymmetry*.20);
  return {state:score>=75?'GREEN':score>=55?'YELLOW':score>=35?'ORANGE':'RED',score,reasons:['AI attack-surface expansion is opportunity evidence, never an automatic BUY.','Platform coverage, monetization and valuation remain independent gates.'],automaticTrade:false};
}

export interface DuelCandidate { ticker:string; rawScore:number; bearEr:number; baseEr:number; bullEr:number; confidence:number; falsifierOpen:boolean; replacementHurdlePassed:boolean; }
export interface DuelResult { winner:string; ranking:string[]; actionableReplacement:boolean; rationale:string[]; }
export function resolveDuelOmega(c:DuelCandidate[]):DuelResult {
  if(c.length<2) throw new Error('duel requires >=2 candidates');
  const ranked=[...c].sort((a,b)=>((b.rawScore*.35+b.baseEr*.35+b.confidence*.30)-(a.rawScore*.35+a.baseEr*.35+a.confidence*.30)));
  const winner=ranked[0];
  return {winner:winner.ticker,ranking:ranked.map(x=>x.ticker),actionableReplacement:!winner.falsifierOpen&&winner.replacementHurdlePassed,rationale:['All candidates start from zero; size/brand bonus = 0.','Raw score, Bear/Base/Bull ER, confidence, falsifiers and replacement hurdle remain explicit.','No headline can directly produce a portfolio change.']};
}
