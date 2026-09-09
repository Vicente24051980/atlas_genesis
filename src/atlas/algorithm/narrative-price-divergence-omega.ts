export const NARRATIVE_PRICE_DIVERGENCE_OMEGA_VERSION = '2026-09-09-v1.0.0' as const;

const clamp=(x:number,min=0,max=100)=>Math.max(min,Math.min(max,x));
export type NarrativePriceState='EVIDENCE_PENDING'|'NO_DIVERGENCE'|'RESILIENCE_UNCONFIRMED'|'RESILIENCE_CONFIRMED'|'FRAGILE_RESILIENCE'|'BREAKDOWN_CONFIRMING';

export interface NarrativePriceDivergenceInput {
  evidenceTraceable:boolean;
  macroStressScore:number;              // 0-100, upstream composite; not narrative sentiment
  indexDrawdownFromHighPct:number;       // positive magnitude
  indexAtNew20dLow:boolean;
  breadthDeteriorationScore:number;      // 0-100
  sectorRelativeStrengthConfirmationScore:number; // 0-100
  positiveDseSharePct:number;            // % of monitored candidates/sectors with DSE_Z >= +2
  negativeDseSharePct:number;            // % with DSE_Z <= -2
  creditSpreadStressScore:number;        // 0-100
  longEndYieldStressScore:number;        // 0-100
  oilShockScore:number;                  // 0-100
}

export interface NarrativePriceDivergenceResult {
  state:NarrativePriceState;
  macroStressScore:number;
  priceResilience:boolean;
  internalsConfirm:boolean;
  breakdownConfirm:boolean;
  attentionFlag:boolean;
  reasons:string[];
  capitalDecisionAuthority:'NONE';
}

export function evaluateNarrativePriceDivergence(i:NarrativePriceDivergenceInput):NarrativePriceDivergenceResult {
  const vals=[i.macroStressScore,i.breadthDeteriorationScore,i.sectorRelativeStrengthConfirmationScore,i.positiveDseSharePct,i.negativeDseSharePct,i.creditSpreadStressScore,i.longEndYieldStressScore,i.oilShockScore];
  if(vals.some(v=>!Number.isFinite(v)||v<0||v>100)||!Number.isFinite(i.indexDrawdownFromHighPct)||i.indexDrawdownFromHighPct<0) throw new Error('narrative_price_divergence_inputs_invalid');
  if(!i.evidenceTraceable) return {state:'EVIDENCE_PENDING',macroStressScore:clamp(i.macroStressScore),priceResilience:false,internalsConfirm:false,breakdownConfirm:false,attentionFlag:true,reasons:['Traceable market evidence required.'],capitalDecisionAuthority:'NONE'};

  const macroStress=i.macroStressScore>=60;
  const priceResilience=macroStress&&i.indexDrawdownFromHighPct<=3&&!i.indexAtNew20dLow;
  const breadthHealthy=i.breadthDeteriorationScore<45;
  const creditContained=i.creditSpreadStressScore<50;
  const yieldsContained=i.longEndYieldStressScore<60;
  const rsHealthy=i.sectorRelativeStrengthConfirmationScore>=55;
  const dsePositive=i.positiveDseSharePct>=30&&i.negativeDseSharePct<25;
  const internalsConfirm=breadthHealthy&&creditContained&&yieldsContained&&rsHealthy&&dsePositive;
  const fragileInternals=i.breadthDeteriorationScore>=55||i.creditSpreadStressScore>=55||i.longEndYieldStressScore>=70||i.negativeDseSharePct>=30;
  const breakdownConfirm=(i.indexAtNew20dLow||i.indexDrawdownFromHighPct>=5)&&i.breadthDeteriorationScore>=60&&(i.creditSpreadStressScore>=55||i.longEndYieldStressScore>=70||i.negativeDseSharePct>=35);

  let state:NarrativePriceState='NO_DIVERGENCE';
  if(breakdownConfirm) state='BREAKDOWN_CONFIRMING';
  else if(priceResilience&&internalsConfirm) state='RESILIENCE_CONFIRMED';
  else if(priceResilience&&fragileInternals) state='FRAGILE_RESILIENCE';
  else if(priceResilience) state='RESILIENCE_UNCONFIRMED';

  const reasons:string[]=[];
  if(priceResilience) reasons.push('Macro stress is elevated while index drawdown remains contained and no fresh 20-day low is present.');
  if(internalsConfirm) reasons.push('Breadth, sector RS, DSE, credit and long-end yields confirm price resilience.');
  if(state==='FRAGILE_RESILIENCE') reasons.push('Index-level resilience is not confirmed by internals and may reflect narrow leadership or temporary hedging/liquidity effects.');
  if(breakdownConfirm) reasons.push('Price deterioration is confirmed by breadth plus credit/yield/DSE stress.');
  if(i.oilShockScore>=70) reasons.push('Oil shock is materially elevated; treat as macro stress input, not standalone sell signal.');

  return {state,macroStressScore:clamp(i.macroStressScore),priceResilience,internalsConfirm,breakdownConfirm,attentionFlag:state!=='NO_DIVERGENCE',reasons,capitalDecisionAuthority:'NONE'};
}

export const NARRATIVE_PRICE_DIVERGENCE_OMEGA_LAWS=[
  'BAD_NEWS_LEVEL != NEGATIVE_SURPRISE',
  'INDEX_RESILIENCE != BROAD_MARKET_STRENGTH',
  'RESILIENCE_REQUIRES_INTERNAL_CONFIRMATION',
  'MACRO_STRESS_ALONE_NEVER_SELLS',
  'DSE_IS_CONFIRMATION_NOT_CAUSAL_BUSINESS_EVIDENCE',
  'ONE_SESSION_NEVER_DEFINES_REGIME',
  'NO_DIRECT_CAPITAL_AUTHORITY'
] as const;
