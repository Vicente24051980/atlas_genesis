export const E6_ASSURANCE_HARNESS_POLICY_OMEGA_VERSION = '2026-09-07-v1.0.0' as const;

export const E6_ASSURANCE_HARNESS_POLICY_OMEGA = {
  kind: 'E6_ASSURANCE_CONFIGURATION_NOT_NEW_ENGINE',
  owner: 'E6_ASSURANCE_OMEGA',
  decisionAuthority: false,
  executionAuthority: false,
  canonWriteAuthority: false,
  datasets: {
    D1: 'KNOWN_GOOD',
    D2: 'KNOWN_BAD',
    D3: 'AMBIGUOUS',
    D4: 'ADVERSARIAL',
    D5: 'HISTORICAL_FROZEN_PIT',
    D6: 'UNSEEN_OUT_OF_SAMPLE',
  },
  namespaces: {
    syntheticPrefix: 'SIM-',
    realPrefix: 'AI-',
    syntheticCountsTowardRealQualityGate: false,
    mixedSyntheticRealAggregateAllowed: false,
  },
  noSelfDesignRule: {
    evaluatedComponentMayDesignAllPrimaryTests: false,
    D2D4D5MustBeIndependent: true,
    selfProposedCasesExcludedFromPrimaryMetric: true,
    maxSelfProposedShareForValidMetric: 0.5,
  },
  caseImmutability: {
    retrospectiveEditingAllowed: false,
    badCaseHandling: 'RETIRE_WITH_REASON_KEEP_ORIGINAL_VISIBLE',
    resultRewriteAllowed: false,
  },
  requiredCaseFields: [
    'CASE_ID',
    'PIT_CUTOFF',
    'GROUND_TRUTH',
    'GROUND_TRUTH_JUSTIFICATION',
    'GROUND_TRUTH_OWNER',
    'SYSTEM_VERSION',
    'HARNESS_VERSION',
    'RUN_DATE',
    'DATASET_HASH',
  ],
  metrics: [
    'D1_TRUE_POSITIVE_RATE',
    'D2_TRUE_NEGATIVE_RATE',
    'D3_CORRECT_ABSTENTION_RATE',
    'D4_ADVERSARIAL_RESISTANCE',
    'D5_PIT_FROZEN_ACCURACY',
    'ABSTENTION_RATE',
  ],
  promotionRule: 'NO_SIGNAL_OR_COMPONENT_PROMOTION_FROM_SYNTHETIC_ONLY_EVIDENCE',
} as const;

// E6 bounded exact reference for measuring heuristic search error, not promotion.
import {runEndogenousPortfolioEngineV2,evaluatePortfolioSetV2,type PortfolioCandidateV2,type PortfolioEnginePolicyV2} from './endogenous-portfolio-engine-v2';
export function auditSmallUniverseSearchGap(candidates:PortfolioCandidateV2[],policy:PortfolioEnginePolicyV2={}) {
  const pending={status:'EVIDENCE_PENDING' as const,authority:'E6_EVALUATION_ONLY' as const};
  if(candidates.length>12 || candidates.some(c=>!c.hardGatesPassed||!c.falsifierVetoPassed) || new Set(candidates.map(c=>(c.canonicalEntityId||c.ticker).trim().toUpperCase())).size!==candidates.length) return pending;
  const heuristic=runEndogenousPortfolioEngineV2(candidates,policy);
  if(heuristic.status!=='SELECTED') return pending;
  let bestUtility=0,bestTickers:string[]=[];
  for(let mask=1;mask<2**candidates.length;mask++) {
    const set=candidates.filter((_,i)=>(mask & (1<<i))!==0);
    const utility=evaluatePortfolioSetV2(set,policy).utility;
    if(!Number.isFinite(utility)) return pending;
    if(utility>bestUtility){bestUtility=utility;bestTickers=set.map(c=>c.ticker);}
  }
  const selected=candidates.filter(c=>heuristic.selectedTickers.includes(c.ticker));
  const heuristicUtility=selected.length?evaluatePortfolioSetV2(selected,policy).utility:0;
  return {status:'CALCULATED' as const,authority:'E6_EVALUATION_ONLY' as const,scope:'SUPPLIED_SMALL_UNIVERSE_AND_OBJECTIVE_ONLY',
    heuristicN:heuristic.selectedN,referenceN:bestTickers.length,referenceTickers:bestTickers,
    utilityGap:bestUtility-heuristicUtility,combinationsEvaluated:2**candidates.length,
    productionGlobalOptimalityProven:false};
}
