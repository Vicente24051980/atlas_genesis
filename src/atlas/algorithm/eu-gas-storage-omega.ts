export {
  EU_GAS_STORAGE_OMEGA_VERSION,
  assessEuGasStorageOmega,
  type EuGasStorageInput,
  type EuGasStorageResult,
  type EuGasStorageState,
  type OfficialSupplyAssessment,
  type RefillTrajectory,
  type StressLevel,
} from '../eu-gas-storage/engine';

export const EU_GAS_STORAGE_OMEGA_REGISTRATION = {
  id: 'EU_GAS_STORAGE_OMEGA',
  version: '1.0.0',
  family: 'EUROPEAN_FRAGMENTATION_ENERGY_SECURITY_OMEGA',
  scope: 'SYSTEMIC_CONTEXT_AND_DISCOVERY',
  buySignal: false,
  currentFlowRequiredForTickerPromotion: true,
  downstream: [
    'ENERGY_ROTATION_OMEGA',
    'MONEY_ROTATION_OMEGA',
    'INSTITUTIONAL_CAPITAL_ROTATION_OMEGA',
    'PORTFOLIO_RISK_OMEGA',
  ],
} as const;
