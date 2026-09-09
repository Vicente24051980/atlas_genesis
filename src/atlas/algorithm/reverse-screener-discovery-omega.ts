export const REVERSE_SCREENER_DISCOVERY_OMEGA_VERSION = '2026-09-09-v1.1.0' as const;

function clamp(value: number, min = 0, max = 100): number { return Math.max(min, Math.min(max, value)); }
export type ReverseScreenerRegime = 'STRUCTURAL_GROWTH'|'TECH_SUPERCYCLE'|'CYCLICAL'|'EVENT_DRIVEN'|'UNCLASSIFIED';

export interface ReverseScreenerInput {
  ticker:string; usListed:boolean; marketCapUsdBn:number; preRevenueBiotech?:boolean; spac?:boolean; microCapFinancial?:boolean;
  revenueGrowthPct:number; epsGrowthPct:number; ebitdaGrowthPct:number; fcfGrowthPct:number; forwardEpsRevisionPct:number;
  fcfPositive:boolean; netDebtToEbitda:number|null; netDebtToEbitdaSectorPercentile:number|null;
  operatingMarginSectorPercentile:number; roicPct:number; estimatedWaccPct:number; roicTwoYearsAgoPct:number; roicOneYearAgoPct:number;
  forwardPeSectorPercentile:number|null; evToEbitdaSectorPercentile:number|null; fcfYieldPct:number|null;
  priceAboveMa200:boolean; rsVsSector3mPp:number; rsVsSector6mPp:number;
  dseZRecent20?:number|null;
  customerConcentrationPct?:number|null; gaapNonGaapGapPct?:number|null; regulatoryRevenuePct?:number|null; materialLitigationPending?:boolean;
  commoditySensitive?:boolean; earningsVsFiveYearNormPct?:number|null; regime?:ReverseScreenerRegime;
  evidenceTraceable:boolean; evidenceIds:string[];
}

export interface ReverseScreenerResult {
 ticker:string; passed:boolean; score:number; regime:ReverseScreenerRegime; dseActive:boolean;
 gates:{universe:boolean;acceleration:boolean;quality:boolean;valuation:boolean;momentum:boolean;leverageVeto:boolean};
 warnings:string[]; capitalDecisionAuthority:'NONE';
}

function evidencePasses(i:ReverseScreenerInput){return i.evidenceTraceable&&i.evidenceIds.filter(x=>x.trim()).length>=2;}
function tierA(i:ReverseScreenerInput){return [i.revenueGrowthPct>10,i.epsGrowthPct>15,i.ebitdaGrowthPct>15].filter(Boolean).length;}
function tierB(i:ReverseScreenerInput){return [i.fcfGrowthPct>15,i.forwardEpsRevisionPct>0].filter(Boolean).length;}
function valuationHits(i:ReverseScreenerInput){return [
 i.forwardPeSectorPercentile!=null&&i.forwardPeSectorPercentile<50,
 i.evToEbitdaSectorPercentile!=null&&i.evToEbitdaSectorPercentile<50,
 i.fcfYieldPct!=null&&i.fcfYieldPct>4
].filter(Boolean).length;}

export function evaluateReverseScreenerDiscovery(i:ReverseScreenerInput):ReverseScreenerResult {
 const universe=i.usListed&&i.marketCapUsdBn>=2&&!i.preRevenueBiotech&&!i.spac&&!i.microCapFinancial;
 const a=tierA(i), b=tierB(i); const acceleration=a>=1&&b>=1;
 const roicImproving=i.roicTwoYearsAgoPct<i.roicOneYearAgoPct&&i.roicOneYearAgoPct<i.roicPct;
 const leverageVeto=i.netDebtToEbitda!=null&&i.netDebtToEbitda>4;
 const quality=i.fcfPositive&&!leverageVeto&&(i.netDebtToEbitdaSectorPercentile==null||i.netDebtToEbitdaSectorPercentile<40)&&i.operatingMarginSectorPercentile>40&&i.roicPct>i.estimatedWaccPct;
 const valuation=valuationHits(i)>=2;
 const momentum=i.priceAboveMa200&&i.rsVsSector3mPp>0&&i.rsVsSector6mPp>-5;
 const dseActive=(i.dseZRecent20??-Infinity)>=2;
 const warnings:string[]=[];
 if(!evidencePasses(i)) warnings.push('EVIDENCE_PENDING');
 if(!roicImproving) warnings.push('ROIC_TREND_NOT_IMPROVING_2Y');
 if((i.customerConcentrationPct??0)>30) warnings.push('CUSTOMER_CONCENTRATION_GT_30');
 if((i.gaapNonGaapGapPct??0)>25) warnings.push('GAAP_NON_GAAP_GAP_GT_25');
 if((i.regulatoryRevenuePct??0)>50) warnings.push('REGULATORY_REVENUE_GT_50');
 if(i.materialLitigationPending) warnings.push('MATERIAL_LITIGATION_MANUAL_REVIEW');
 if(dseActive) warnings.push('DSE_DECOUPLING_ACTIVE_P3_P5_REVIEW');
 if((i.commoditySensitive||i.regime==='CYCLICAL')&&(i.earningsVsFiveYearNormPct??0)>50) warnings.push('CYCLE_NORMALIZATION_REQUIRED');

 const accelerationScore=clamp(a*25+b*15+(a===3?10:0));
 const qualityTrendScore=clamp(50+(roicImproving?30:-20)+Math.max(-20,Math.min(20,(i.roicPct-i.roicTwoYearsAgoPct)*2)));
 const fcfScore=i.fcfPositive?clamp(55+Math.max(0,i.fcfYieldPct??0)*6):0;
 const valuationScore=clamp(valuationHits(i)*33.333);
 const momentumScore=clamp(50+i.rsVsSector3mPp*2+i.rsVsSector6mPp);
 const dseScore=dseActive?100:0;
 let score=.25*accelerationScore+.20*qualityTrendScore+.15*fcfScore+.15*valuationScore+.15*momentumScore+.10*dseScore;
 if((i.customerConcentrationPct??0)>30) score-=15;
 if((i.gaapNonGaapGapPct??0)>25) score-=10;
 if((i.regulatoryRevenuePct??0)>50) score-=20;
 if(warnings.includes('CYCLE_NORMALIZATION_REQUIRED')) score-=10;
 score=clamp(score);
 const passed=evidencePasses(i)&&universe&&acceleration&&quality&&valuation&&momentum&&!leverageVeto;
 return {ticker:i.ticker,passed,score,regime:i.regime??'UNCLASSIFIED',dseActive,gates:{universe,acceleration,quality,valuation,momentum,leverageVeto},warnings,capitalDecisionAuthority:'NONE'};
}

export function rankReverseScreenerDiscovery(inputs:ReverseScreenerInput[]){return inputs.map(evaluateReverseScreenerDiscovery).filter(x=>x.passed).sort((a,b)=>b.score-a.score);}

export const REVERSE_SCREENER_DISCOVERY_OMEGA_LAWS=[
 'DISCOVERY_SCORE != BUY','DISCOVERY_SCORE != PORTFOLIO_WEIGHT','SECTOR_RELATIVE_THRESHOLDS_PRECEDE_RAW_MULTIPLES',
 'ACCELERATION_REQUIRES_TIER_A_AND_TIER_B','VALUATION_REQUIRES_TWO_OF_THREE','MOMENTUM_IS_RELATIVE_TO_SECTOR',
 'DSE_IS_DYNAMIC_SENSOR_NOT_BUSINESS_EVIDENCE','CATALYST_IS_MANUAL_ATTENTION_NOT_SCORE','BINARY_BIOTECH_EXCLUDED_AT_UNIVERSE_GATE',
 'NET_DEBT_EBITDA_GT_4_IS_VETO','ROIC_LEVEL_REQUIRES_DIRECTIONAL_CONTEXT','CYCLICAL_PEAK_EARNINGS_REQUIRE_NORMALIZATION'
] as const;
