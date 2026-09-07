/** E3 transition assessment. Passing is not a broker execution capability. */
import { calculateScenarioOwnerReturn, evidenceUsable, type EvidenceStamp, type ScenarioOwnerReturnInput } from './scenario-owner-return-omega';
import { evaluateAiExposureControl, type AiControlRequest } from './e5-control-policy-omega';
export type NetRotationContext = {
  asOf: string; decisionId: string; incumbent: ScenarioOwnerReturnInput; challenger: ScenarioOwnerReturnInput;
  capital: number; currency: string;
  // Time-zero cash costs, each explicit; zero must be an evidenced estimate.
  costs: { transaction: number; spread: number; taxes: number; financing: number; implementation: number };
  // Terminal-wealth buffers, not scores or annual percentages.
  uncertaintyReserveAtHorizon: number; lostOptionalityAtHorizon: number;
  evidence: EvidenceStamp;
  broker: { status: 'RECONCILED'; snapshotId: string; currency: string; cash: number; incumbentMarketValue: number; evidence: EvidenceStamp };
  aiControl: AiControlRequest;
};
export type NetRotationResult = { allowed: boolean; status:'PASS'|'BLOCKED'|'EVIDENCE_PENDING'; netAdvantageAtHorizon:number|null; reason:string; executionAuthorized:false };
export function evaluateNetRotationAdvantage(req: NetRotationContext): NetRotationResult {
  const fail=(reason:string,status:NetRotationResult['status']='EVIDENCE_PENDING'):NetRotationResult=>({allowed:false,status,netAdvantageAtHorizon:null,reason,executionAuthorized:false});
  if (!req || !req.decisionId?.trim() || !evidenceUsable(req.evidence,req.asOf) || !req.costs || !req.broker) return fail('TRANSITION_EVIDENCE_PENDING');
  const costs=[req.costs.transaction,req.costs.spread,req.costs.taxes,req.costs.financing,req.costs.implementation];
  if (![req.capital,...costs,req.uncertaintyReserveAtHorizon,req.lostOptionalityAtHorizon,req.broker.cash,req.broker.incumbentMarketValue].every(x=>Number.isFinite(x)&&x>=0) || req.capital<=0) return fail('INVALID_AMOUNTS');
  if (req.broker.status!=='RECONCILED' || !req.broker.snapshotId?.trim() || !evidenceUsable(req.broker.evidence,req.asOf) || req.capital>req.broker.incumbentMarketValue) return fail('BROKER_REALITY_UNKNOWN_OR_INSUFFICIENT_HOLDING');
  const i=req.incumbent,c=req.challenger;
  if (!i || !c || !i.entityId?.trim() || !c.entityId?.trim() || i.entityId.trim().toUpperCase()===c.entityId.trim().toUpperCase() || i.asOf!==req.asOf || c.asOf!==req.asOf || i.horizonYears!==c.horizonYears || !req.currency?.trim() || [i.currency,c.currency,req.broker.currency].some(x=>x!==req.currency)) return fail('INCOMPARABLE_RETURN_MODELS');
  const before=calculateScenarioOwnerReturn(i),after=calculateScenarioOwnerReturn(c);
  if (before.status!=='CALCULATED'||after.status!=='CALCULATED') return fail('EXPECTED_RETURN_EVIDENCE_PENDING');
  if (!req.aiControl || req.aiControl.asOf!==req.asOf || req.aiControl.decisionId!==req.decisionId || req.aiControl.action!=='INCREASE') return fail('AI_DECISION_FRAME_MISMATCH');
  if (!req.aiControl.positions.some(p=>p.entityId?.trim().toUpperCase()===c.entityId.trim().toUpperCase() && p.weight>0)) return fail('CHALLENGER_MISSING_FROM_PROPOSED_SIZING');
  const ai=evaluateAiExposureControl(req.aiControl);
  if (!ai.allowsIncrease) return fail('AI_CONTROL_BLOCKED','BLOCKED');
  const cost=costs.reduce((a,b)=>a+b,0);
  // Costs are funded from proceeds, so retained cash is not silently spent.
  if (!Number.isFinite(cost)||cost>=req.capital) return fail('COSTS_EXHAUST_CAPITAL','BLOCKED');
  const net=(req.capital-cost)*after.expectedTerminalWealthPerShare!/c.pricePerShare
    -req.capital*before.expectedTerminalWealthPerShare!/i.pricePerShare
    -req.uncertaintyReserveAtHorizon-req.lostOptionalityAtHorizon;
  if (!Number.isFinite(net)) return fail('NONFINITE_NET_ADVANTAGE');
  return {allowed:net>0,status:net>0?'PASS':'BLOCKED',netAdvantageAtHorizon:net,
    reason:net>0?'NET_ROTATION_ADVANTAGE_POSITIVE; broker approval remains separate':'NET_ROTATION_ADVANTAGE_NOT_POSITIVE',executionAuthorized:false};
}
