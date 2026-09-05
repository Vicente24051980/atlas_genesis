export const ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA_VERSION = '2026-09-05-v2.0.0' as const;

export const ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA = {
  governanceStatus: 'ACTIVE_CANONICAL_PENDING_PR_MERGE',
  contracts: {
    delta: { id: 'DELTA_DIVERGENCE_OMEGA_V1_1', runtimeAuthority: 'SHADOW_ONLY' },
    kappa: { id: 'KAPPA_CALIBRATION_OMEGA_V1_1', runtimeAuthority: 'CALIBRATION_ONLY' },
    gamma: { id: 'GAMMA_VIGENCIA_OMEGA_V1_2', runtimeAuthority: 'VIGENCIA_ONLY' },
    upsilon: { id: 'UPSILON_ALLOCATION_OMEGA_V1', runtimeAuthority: 'ALLOCATION_ONLY' },
    rho: { id: 'RHO_COUNTERPARTY_EXPOSURE_OMEGA_V1', runtimeAuthority: 'EXPOSURE_AGGREGATION_ONLY' },
  },
  boundaries: {
    deltaCannotConclude: true,
    deltaCannotModulateCoreConfidenceWhileShadow: true,
    kappaCannotChangeMethodology: true,
    gammaCannotBuySell: true,
    upsilonCannotAdmitExclude: true,
    rhoCannotBuySell: true,
    rhoCannotSetWeight: true,
    rhoCannotAdmitExclude: true,
    falsifierVetoIndependent: true,
    decisionSafetyIndependent: true,
  },
  aiCapexPreScoreSequence: [
    'T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1_1',
    'T1_FUNDAMENTAL_HARD_GATES',
    'T2_FINANCING_QUALITY_GATE_OMEGA_V1',
    'T3_CIRCULAR_DEMAND_GATE_OMEGA_V1',
    'T4_QUALITY_ADJUSTED_BACKLOG_OMEGA_V1',
    'T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1',
    'ATLAS_FUNDAMENTAL_SCORE',
  ],
} as const;
