import { structuralRiskUnitsCanonicalReady } from './structural-risk-unit-authority-omega';

export const STRUCTURAL_SIZING_AUTHORITY_VERSION = '2026-09-06-v0.2.0' as const;

export const STRUCTURAL_SIZING_AUTHORITY = {
  version: STRUCTURAL_SIZING_AUTHORITY_VERSION,
  status: 'RESEARCH_PENDING',
  canonicalReady: false,
  requiredMethod: 'COVARIANCE_AWARE',
  validatedSizingEngineVersion: null,
  validatedSizingPolicyHash: null,
  laws: [
    'Equal test weights are not structural position sizing.',
    'A caller-provided covariance label or volatility hash is not sufficient attestation.',
    'Canonical sizing requires a versioned deterministic sizing engine and versioned policy.',
    'Expected-return inputs and risk inputs must have explicit units before they may be combined in an optimizer objective.',
    'Canonical sizing cannot activate while Structural Risk Unit Authority is unresolved.',
    'Covariance must be PIT-tagged, symmetric, finite and positive-semidefinite within declared numerical tolerance.',
    'Sector, geography, style and aesthetic diversification have zero independent sizing authority.',
    'Concentration may be high when supported by return/risk utility; concentration constraints may exist only as calibrated ruin/liquidity/risk controls.',
    'Sizing validation requires walk-forward/OOS and parameter-sensitivity evidence before canonical activation.',
    'Until validation is complete, structural publication remains blocked.',
  ],
} as const;

export type StructuralSizingAttestation = {
  sizingEngineVersion: string;
  sizingPolicyHash: string;
  sizingEvidenceHash: string;
  validationState: 'RESEARCH_ONLY' | 'VALIDATED';
};

export function isCanonicalSizingAttestationValid(attestation?: StructuralSizingAttestation): boolean {
  if (!structuralRiskUnitsCanonicalReady()) return false;
  if (!STRUCTURAL_SIZING_AUTHORITY.canonicalReady) return false;
  if (!attestation) return false;
  if (attestation.validationState !== 'VALIDATED') return false;
  if (!attestation.sizingEvidenceHash.trim()) return false;
  return attestation.sizingEngineVersion === STRUCTURAL_SIZING_AUTHORITY.validatedSizingEngineVersion
    && attestation.sizingPolicyHash === STRUCTURAL_SIZING_AUTHORITY.validatedSizingPolicyHash;
}

// E4 implementation for SHADOW experiments. Does not self-promote authority.
import { measuredPortfolioRisk, validateMeasuredCovariance, type MeasuredCovariance } from './structural-risk-unit-authority-omega';
export function calculateShadowCovarianceSizing(model: MeasuredCovariance, expectedCagrPct: number[], riskAversion: number, step=0.01, maxIterations=200) {
  const fail=()=>({status:'EVIDENCE_PENDING' as const,weights:null,annualVolatilityPct:null,objective:null,iterations:0,globalOptimalityProven:false,authority:'SHADOW_ONLY' as const});
  if(!validateMeasuredCovariance(model)||model.entityIds.length>64||expectedCagrPct.length!==model.entityIds.length||!expectedCagrPct.every(x=>Number.isFinite(x)&&x>=-100)||!Number.isFinite(riskAversion)||riskAversion<0||!Number.isFinite(step)||step<=0||step>1||!Number.isInteger(maxIterations)||maxIterations<1||maxIterations>1000) return fail();
  const n=expectedCagrPct.length;
  const objective=(w:number[])=>{
    let variance=0;for(let i=0;i<n;i++)for(let j=0;j<n;j++)variance+=w[i]*model.annualDecimalReturnCovariance[i][j]*w[j];
    return w.reduce((v,x,i)=>v+x*expectedCagrPct[i]/100,0)-riskAversion*variance/2;
  };
  // Compare equal and concentrated starts, then improve by pairwise transfers.
  const starts=[Array(n).fill(1/n),...Array.from({length:n},(_,j)=>Array.from({length:n},(_,i)=>i===j?1:0))];
  let weights=starts[0],value=objective(weights),iterations=0;
  for(const start of starts) if(objective(start)>value) {weights=start;value=objective(start);}
  if(!Number.isFinite(value)) return fail();
  for(;iterations<maxIterations;iterations++) {
    let best:number[]|null=null,bestValue=value;
    for(let i=0;i<n;i++) for(let j=0;j<n;j++) if(i!==j&&weights[i]>1e-12) {
      const trial=[...weights],transfer=Math.min(step,trial[i]);trial[i]-=transfer;trial[j]+=transfer;
      const score=objective(trial);
      if(score>bestValue+1e-12) {best=trial;bestValue=score;}
    }
    if(!best) break;weights=best;value=bestValue;
  }
  return {status:'CALCULATED' as const,weights:Object.fromEntries(model.entityIds.map((id,i)=>[id,weights[i]])),
    annualVolatilityPct:measuredPortfolioRisk(model,weights).annualVolatilityPct,objective:value,iterations,globalOptimalityProven:false,authority:'SHADOW_ONLY' as const};
}
