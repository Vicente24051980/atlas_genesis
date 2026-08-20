import {
  evaluateGlobalCapexChain,
  type EconomicProofLevel,
  type GlobalCapexChainInput,
  type GlobalCapexChainResult,
} from './global-capex-chain-omega';
import {
  evaluateNeocloudCustomerAcceptanceGate,
  type NeocloudCustomerAcceptanceInput,
  type NeocloudCustomerAcceptanceResult,
} from './neocloud-customer-acceptance-gate-omega';

export type NeocloudGlobalCapexInput = {
  capex: GlobalCapexChainInput;
  acceptance: NeocloudCustomerAcceptanceInput;
};

export type NeocloudGlobalCapexResult = {
  acceptance: NeocloudCustomerAcceptanceResult;
  requestedEconomicProofLevel: EconomicProofLevel;
  appliedEconomicProofLevel: EconomicProofLevel;
  globalCapex: GlobalCapexChainResult;
};

const proofRank: Record<EconomicProofLevel, number> = {
  E0_NARRATIVE: 0,
  E1_MANAGEMENT_CLAIM: 1,
  E2_ORDERS_CONTRACTS: 2,
  E3_REVENUE_MARGIN: 3,
  E4_FCF_ROIC_MULTI_PERIOD: 4,
};

const proofByRank: readonly EconomicProofLevel[] = [
  'E0_NARRATIVE',
  'E1_MANAGEMENT_CLAIM',
  'E2_ORDERS_CONTRACTS',
  'E3_REVENUE_MARGIN',
  'E4_FCF_ROIC_MULTI_PERIOD',
];

function clampEconomicProof(
  requested: EconomicProofLevel,
  ceiling: EconomicProofLevel,
): EconomicProofLevel {
  const rank = Math.min(proofRank[requested], proofRank[ceiling]);
  return proofByRank[rank] ?? 'E0_NARRATIVE';
}

export function evaluateNeocloudGlobalCapexChain(
  input: NeocloudGlobalCapexInput,
): NeocloudGlobalCapexResult {
  if (input.capex.ticker !== input.acceptance.ticker) {
    throw new Error('neocloud_global_capex_ticker_mismatch');
  }

  const acceptance = evaluateNeocloudCustomerAcceptanceGate(input.acceptance);
  const appliedEconomicProofLevel = clampEconomicProof(
    input.capex.economicProofLevel,
    acceptance.economicProofCeiling,
  );

  const globalCapex = evaluateGlobalCapexChain({
    ...input.capex,
    economicProofLevel: appliedEconomicProofLevel,
  });

  if (proofRank[input.capex.economicProofLevel] > proofRank[appliedEconomicProofLevel]) {
    globalCapex.reasons.push(
      `Neocloud Customer Acceptance Gate capped Economic Proof from ${input.capex.economicProofLevel} to ${appliedEconomicProofLevel}.`,
    );
  }

  return {
    acceptance,
    requestedEconomicProofLevel: input.capex.economicProofLevel,
    appliedEconomicProofLevel,
    globalCapex,
  };
}
