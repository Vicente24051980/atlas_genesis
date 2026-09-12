import { capitalRiskTransferAdvantage } from './ai-demand-provenance-omega';
import {
  evaluateDataCenterRiskTransfer,
  type DataCenterRiskTransferInput,
  type DataCenterRiskTransferResult,
} from './ai-data-center-risk-transfer-omega';

export type DataCenterRiskTransferT5Input = {
  dcrt: DataCenterRiskTransferInput;
  fcfCaptured: number;
  ownCapitalAtRisk: number;
};

export type DataCenterRiskTransferT5Result = {
  dcrt: DataCenterRiskTransferResult;
  t5Contract: 'T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1';
  t5State: 'NOT_AUTHORIZED' | 'NO_CALCULABLE' | 'AVAILABLE';
  crta: number | null;
  downstreamAction: 'STOP_AT_R0_E1' | 'CONTINUE_STANDARD_ATLAS_STACK';
  reasons: string[];
};

export function evaluateDataCenterRiskTransferThroughT5(
  input: DataCenterRiskTransferT5Input,
): DataCenterRiskTransferT5Result {
  const dcrt = evaluateDataCenterRiskTransfer(input.dcrt);
  const reasons: string[] = [];

  const economicsAttributable =
    dcrt.evidenceGate === 'CONFIRMED' &&
    (dcrt.parentEconomicProofLevel === 'E3_REVENUE_MARGIN' ||
      dcrt.parentEconomicProofLevel === 'E4_FCF_ROIC_MULTI_PERIOD');

  if (!economicsAttributable) {
    reasons.push(
      'T5 is not authorized: data-center risk-transfer market formation or transaction evidence cannot substitute for attributable revenue/margin economics.',
    );
    return {
      dcrt,
      t5Contract: 'T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1',
      t5State: 'NOT_AUTHORIZED',
      crta: null,
      downstreamAction: 'STOP_AT_R0_E1',
      reasons,
    };
  }

  const diagnostic = capitalRiskTransferAdvantage(input.fcfCaptured, input.ownCapitalAtRisk);
  if (diagnostic.state === 'NO_CALCULABLE') {
    reasons.push(
      'Attributable economics exist, but CRTA is not calculable because own capital at risk is invalid, zero or unavailable. Do not infer infinity or a capital-light advantage.',
    );
    return {
      dcrt,
      t5Contract: 'T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1',
      t5State: 'NO_CALCULABLE',
      crta: null,
      downstreamAction: 'STOP_AT_R0_E1',
      reasons,
    };
  }

  reasons.push(
    'DCRT supplies evidence only; the existing T5 contract owns CRTA = FCF captured / own capital at risk. No DCRT score is added to the ATLAS Fundamental Score or FRU-MATH.',
  );

  return {
    dcrt,
    t5Contract: 'T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1',
    t5State: 'AVAILABLE',
    crta: diagnostic.value,
    downstreamAction: 'CONTINUE_STANDARD_ATLAS_STACK',
    reasons,
  };
}

export const AI_DATA_CENTER_RISK_TRANSFER_T5_ADAPTER = {
  id: 'AI_DATA_CENTER_RISK_TRANSFER_T5_ADAPTER_V1',
  effectiveDate: '2026-09-12',
  upstream: 'AI_DATA_CENTER_RISK_TRANSFER_OMEGA_V1',
  downstream: 'T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1',
  authority: 'EVIDENCE_ADAPTER_ONLY',
  rules: [
    'NO_NEW_KERNEL_CONTRACT',
    'NO_NEW_ENGINE',
    'C3_OR_C4_ATTRIBUTABLE_ECONOMICS_REQUIRED_BEFORE_T5',
    'T5_OWNS_CRTA_FORMULA',
    'ZERO_OR_INVALID_OWN_CAPITAL_AT_RISK_RETURNS_NO_CALCULABLE_NOT_INFINITY',
    'DCRT_SCORE_HAS_ZERO_DIRECT_FUNDAMENTAL_OR_FRU_WEIGHT',
  ],
} as const;
