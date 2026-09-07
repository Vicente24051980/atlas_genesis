export const STRUCTURAL_RISK_UNIT_AUTHORITY_VERSION = '2026-09-07-v0.2.0' as const;

/**
 * Fail-closed authority for the units used by the structural portfolio utility.
 *
 * Current implementation evidence:
 * - Expected Return is expressed in percentage points.
 * - permanentLossRisk / tailRisk / volatilityRisk / fragility / convexity are
 *   plain numbers and their common economic unit/normalization is not encoded
 *   in PortfolioCandidateV2.
 * - fundingSources currently produce only a raw categorical Jaccard-overlap
 *   diagnostic. That overlap has no calibrated mapping to loss probability,
 *   volatility, drawdown, common-default exposure or another economic risk unit.
 *
 * Therefore the absolute trade-off between ER and risk is not yet invariant to
 * upstream scoring scale. Canonical optimization must stay blocked until this
 * contract is explicit and calibrated.
 */
export const STRUCTURAL_RISK_UNIT_AUTHORITY = {
  version: STRUCTURAL_RISK_UNIT_AUTHORITY_VERSION,
  status: 'RESEARCH_PENDING',
  canonicalReady: false,
  expectedReturnUnit: 'PERCENTAGE_POINTS_PER_YEAR_FORWARD_COMPOUNDING_BRIDGE',
  permanentLossRiskUnit: null,
  tailRiskUnit: null,
  volatilityRiskUnit: null,
  fragilityUnit: null,
  convexityUnit: null,
  financingCorrelationUnit: null,
  requirementsToActivate: [
    'Declare an explicit economic/statistical unit or normalized transform for every risk term.',
    'Replace raw funding-source label overlap with a measured common-financing exposure transform before it can affect membership.',
    'Freeze deterministic transforms from raw evidence into those units.',
    'Prove that equivalent source scales map to identical normalized portfolio inputs.',
    'Calibrate ER-versus-risk trade-offs without using the current portfolio as the target.',
    'Run sensitivity analysis so small unit/parameter changes do not arbitrarily rewrite membership/N.',
    'Validate on out-of-sample or prospective decisions before granting publication authority.',
  ],
} as const;

export function structuralRiskUnitsCanonicalReady(): boolean {
  return STRUCTURAL_RISK_UNIT_AUTHORITY.canonicalReady;
}
// E2 measured portfolio risk in an explicit unit; legacy score units stay blocked.
import { evidenceUsable, type EvidenceStamp } from './scenario-owner-return-omega';
export type MeasuredCovariance = {
  entityIds: string[]; annualDecimalReturnCovariance: number[][];
  evidence: EvidenceStamp; asOf: string;
};
export function validateMeasuredCovariance(model: MeasuredCovariance): boolean {
  if (!model || !Array.isArray(model.entityIds) || !model.entityIds.length || !evidenceUsable(model.evidence,model.asOf)) return false;
  const ids=model.entityIds.map(x=>typeof x==='string'?x.trim().toUpperCase():'');
  if (ids.some(x=>!x)||new Set(ids).size!==ids.length) return false;
  const a=model.annualDecimalReturnCovariance,n=ids.length;
  if (!Array.isArray(a)||a.length!==n||a.some(row=>!Array.isArray(row)||row.length!==n||!row.every(Number.isFinite))) return false;
  const tol=1e-10;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) if(Math.abs(a[i][j]-a[j][i])>tol) return false;
  // LDL^T permits singular positive-semidefinite matrices without inversion.
  const l=Array.from({length:n},()=>Array(n).fill(0)),d=Array(n).fill(0);
  for(let i=0;i<n;i++) {
    let pivot=a[i][i]; for(let k=0;k<i;k++) pivot-=l[i][k]*l[i][k]*d[k];
    if (!Number.isFinite(pivot)||pivot < -tol) return false;
    d[i]=Math.max(0,pivot);l[i][i]=1;
    for(let j=i+1;j<n;j++) {
      let residual=a[j][i];for(let k=0;k<i;k++) residual-=l[j][k]*l[i][k]*d[k];
      if(d[i]<=tol) {if(Math.abs(residual)>tol) return false;l[j][i]=0;}
      else l[j][i]=residual/d[i];
    }
  }
  return true;
}
export function measuredPortfolioRisk(model: MeasuredCovariance, weights: number[]) {
  if (!validateMeasuredCovariance(model)||weights.length!==model.entityIds.length||!weights.every(x=>Number.isFinite(x)&&x>=0&&x<=1)||Math.abs(weights.reduce((a,b)=>a+b,0)-1)>1e-8) throw new Error('INVALID_MEASURED_RISK_INPUT');
  let variance=0;
  for(let i=0;i<weights.length;i++) for(let j=0;j<weights.length;j++) variance+=weights[i]*model.annualDecimalReturnCovariance[i][j]*weights[j];
  if(!Number.isFinite(variance)||variance< -1e-10) throw new Error('INVALID_MEASURED_RISK_RESULT');
  return {annualVariance:Math.max(0,variance),annualVolatilityPct:100*Math.sqrt(Math.max(0,variance)),unit:'ANNUAL_DECIMAL_RETURN_VARIANCE' as const};
}
