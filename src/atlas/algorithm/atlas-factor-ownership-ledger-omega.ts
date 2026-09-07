export const ATLAS_FACTOR_OWNERSHIP_LEDGER_OMEGA_VERSION = '2026-09-07-v1.1.0' as const;

export type FactorOwnershipRecord = {
  factorId: 'VALUATION' | 'FREE_CASH_FLOW' | 'ROIC' | 'BACKLOG' | 'CAPEX' | 'EXPECTATION_GAP' | 'ORGANIC_GROWTH';
  canonicalNormalizer: string;
  scoringOwner: string | 'UNRESOLVED_RUNTIME_MAPPING' | 'NONE_RAW_FACTOR';
  secondaryConsumers: readonly string[];
  diagnosticOnlyConsumers?: readonly string[];
  rawFactMayAddIndependentPoints: boolean;
  duplicatePointPolicy: 'FORBID';
  runtimeStatus: 'ENFORCED_FOR_REGISTERED_CLAIMS' | 'AUDIT_ONLY_UNTIL_SCORER_MAPPING';
  rationale: string;
};

/**
 * This ledger owns factor reuse, not economic truth. A factor can be consumed by many engines,
 * but the same normalized fact may not be converted into independent points more than once.
 * UNRESOLVED_RUNTIME_MAPPING fails closed for ADD_POINTS claims until the real scorer is mapped.
 */
export const ATLAS_FACTOR_OWNERSHIP_LEDGER_OMEGA: readonly FactorOwnershipRecord[] = [
  {
    factorId: 'VALUATION',
    canonicalNormalizer: 'VALUATION_OMEGA',
    scoringOwner: 'VALUATION_OMEGA',
    secondaryConsumers: ['EXPECTED_RETURN_3_6Y', 'ACTIVE_VS_INDEX_HURDLE_OMEGA_V1', 'VALUATION_COMPRESSION_STRESS_OMEGA_V1'],
    diagnosticOnlyConsumers: ['EXTERNAL_VALUATION_CROSS_CHECK_OMEGA_V1', 'VALUATION_METHOD_INTEGRITY_OMEGA_V1'],
    rawFactMayAddIndependentPoints: true,
    duplicatePointPolicy: 'FORBID',
    runtimeStatus: 'ENFORCED_FOR_REGISTERED_CLAIMS',
    rationale: 'Valuation may contribute once through its canonical owner. Cross-checks and stress diagnostics must not create a second valuation score.',
  },
  {
    factorId: 'FREE_CASH_FLOW',
    canonicalNormalizer: 'OWNER_ECONOMICS_NORMALIZATION_OMEGA_V1',
    scoringOwner: 'UNRESOLVED_RUNTIME_MAPPING',
    secondaryConsumers: ['PRINCIPAL_OMEGA', 'VALUATION_OMEGA', 'EXPECTED_RETURN_3_6Y', 'ECONOMIC_THROUGHPUT_GATE_OMEGA_V1', 'AI_CAPEX_PAYBACK_OMEGA_V2_1'],
    rawFactMayAddIndependentPoints: false,
    duplicatePointPolicy: 'FORBID',
    runtimeStatus: 'AUDIT_ONLY_UNTIL_SCORER_MAPPING',
    rationale: 'Normalized FCF is shared evidence. Until the live scoring owner is mapped, no new independent FCF points may be introduced by a secondary engine.',
  },
  {
    factorId: 'ROIC',
    canonicalNormalizer: 'REINVESTMENT_RUNWAY_ROIC_OMEGA_V1',
    scoringOwner: 'UNRESOLVED_RUNTIME_MAPPING',
    secondaryConsumers: ['PRINCIPAL_OMEGA', 'BUSINESS_QUALITY_OMEGA', 'CAPITAL_ALLOCATION_QUALITY_OMEGA_V1', 'ECONOMIC_THROUGHPUT_GATE_OMEGA_V1', 'EXPECTED_RETURN_3_6Y'],
    rawFactMayAddIndependentPoints: false,
    duplicatePointPolicy: 'FORBID',
    runtimeStatus: 'AUDIT_ONLY_UNTIL_SCORER_MAPPING',
    rationale: 'ROIC must be normalized once and referenced thereafter; historical ROIC and incremental ROIC are not separate point opportunities without an explicitly distinct construct.',
  },
  {
    factorId: 'BACKLOG',
    canonicalNormalizer: 'CONTRACT_ECONOMIC_EVIDENCE_NORMALIZER_OMEGA_V1',
    scoringOwner: 'NONE_RAW_FACTOR',
    secondaryConsumers: ['QUALITY_ADJUSTED_BACKLOG_OMEGA_V1', 'GRID_BOTTLENECK_POWER_CAPTURE_OMEGA_V1', 'NARRATIVE_TO_NUMBERS_BRIDGE_OMEGA_V1'],
    rawFactMayAddIndependentPoints: false,
    duplicatePointPolicy: 'FORBID',
    runtimeStatus: 'ENFORCED_FOR_REGISTERED_CLAIMS',
    rationale: 'Raw backlog, RPO, contract ceilings, orders and shipments are evidence states, not recognized revenue/FCF and must never be rewarded twice.',
  },
  {
    factorId: 'CAPEX',
    canonicalNormalizer: 'CAPEX_PRODUCTIVITY_OMEGA',
    scoringOwner: 'UNRESOLVED_RUNTIME_MAPPING',
    secondaryConsumers: ['AI_CAPEX_PAYBACK_OMEGA_V2_1', 'AI_FINANCIAL_FRAGILITY_OMEGA_V1_1', 'GLOBAL_CAPEX_CHAIN_OMEGA', 'EXPECTED_RETURN_3_6Y'],
    rawFactMayAddIndependentPoints: false,
    duplicatePointPolicy: 'FORBID',
    runtimeStatus: 'AUDIT_ONLY_UNTIL_SCORER_MAPPING',
    rationale: 'CAPEX level, productivity, financing quality and payback are related but distinct constructs. The raw spend itself cannot become repeated positive or negative points.',
  },
  {
    factorId: 'EXPECTATION_GAP',
    canonicalNormalizer: 'EXPECTATION_GAP_OMEGA',
    scoringOwner: 'UNRESOLVED_RUNTIME_MAPPING',
    secondaryConsumers: ['EXPECTED_RETURN_3_6Y', 'EVENT_PRICING_OPTIONS_EXPECTATIONS_OMEGA_V1', 'TAPE_RS_COMPLEMENTARY_ONLY'],
    rawFactMayAddIndependentPoints: false,
    duplicatePointPolicy: 'FORBID',
    runtimeStatus: 'AUDIT_ONLY_UNTIL_SCORER_MAPPING',
    rationale: 'Expectations and price response may inform one expectation-gap construct; multiple market-surprise proxies cannot independently reward the same latent surprise.',
  },
  {
    factorId: 'ORGANIC_GROWTH',
    canonicalNormalizer: 'ORGANIC_GROWTH_DECOMPOSITION_OMEGA_V1',
    scoringOwner: 'UNRESOLVED_RUNTIME_MAPPING',
    secondaryConsumers: ['GROWTH_OMEGA', 'PRINCIPAL_OMEGA', 'EXPECTED_RETURN_3_6Y', 'NARRATIVE_TO_NUMBERS_BRIDGE_OMEGA_V1'],
    rawFactMayAddIndependentPoints: false,
    duplicatePointPolicy: 'FORBID',
    runtimeStatus: 'AUDIT_ONLY_UNTIL_SCORER_MAPPING',
    rationale: 'Reported growth is decomposed once for M&A, FX, divestitures and accounting effects; consumers reference the normalized organic series rather than recreating independent growth points.',
  },
] as const;

export type FactorClaimIntent = 'CONSUME' | 'ADD_POINTS';

export type FactorClaimDecision = {
  allowed: boolean;
  reason: string;
};

export function getFactorOwnership(factorId: FactorOwnershipRecord['factorId']): FactorOwnershipRecord {
  const record = ATLAS_FACTOR_OWNERSHIP_LEDGER_OMEGA.find((item) => item.factorId === factorId);
  if (!record) throw new Error(`factor_not_registered:${factorId}`);
  return record;
}

export function getUnresolvedScoringOwnershipFactors(): FactorOwnershipRecord['factorId'][] {
  return ATLAS_FACTOR_OWNERSHIP_LEDGER_OMEGA
    .filter((record) => record.scoringOwner === 'UNRESOLVED_RUNTIME_MAPPING')
    .map((record) => record.factorId);
}

/**
 * Canonical portfolio publication is stricter than research/diagnostic execution.
 * Until every high-risk factor either has one mapped scoring owner or explicitly has
 * no raw-factor scoring authority, ATLAS must not promote a structural portfolio to
 * CANONICAL_READY. This prevents an unmapped legacy scorer from bypassing the ledger.
 */
export function isFactorOwnershipCanonicalPublicationReady(): boolean {
  return getUnresolvedScoringOwnershipFactors().length === 0;
}

export function validateFactorClaim(
  factorId: FactorOwnershipRecord['factorId'],
  claimer: string,
  intent: FactorClaimIntent,
): FactorClaimDecision {
  const record = getFactorOwnership(factorId);

  if (intent === 'CONSUME') {
    const knownConsumer = claimer === record.canonicalNormalizer ||
      claimer === record.scoringOwner ||
      record.secondaryConsumers.includes(claimer) ||
      (record.diagnosticOnlyConsumers ?? []).includes(claimer);
    return knownConsumer
      ? { allowed: true, reason: 'registered_consumer_reference_only' }
      : { allowed: false, reason: 'unregistered_factor_consumer' };
  }

  if (record.scoringOwner === 'NONE_RAW_FACTOR') {
    return { allowed: false, reason: 'raw_factor_has_no_direct_scoring_authority' };
  }
  if (record.scoringOwner === 'UNRESOLVED_RUNTIME_MAPPING') {
    return { allowed: false, reason: 'scoring_owner_unresolved_fail_closed' };
  }
  if (claimer !== record.scoringOwner) {
    return { allowed: false, reason: 'secondary_consumer_cannot_add_independent_points' };
  }
  return { allowed: true, reason: 'single_registered_scoring_owner' };
}
