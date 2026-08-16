export type AtlasEngineAuthority = 'CORE' | 'REFINEMENT' | 'SPECIALIZED' | 'GATE' | 'AUXILIARY';

export interface AtlasEngineManifest {
  id: string;
  version: string;
  authority: AtlasEngineAuthority;
  role: string;
  emitsAutomaticTrade: false;
  rules: readonly string[];
  states?: readonly string[];
}

export const SUCCESSOR_DETECTION_OMEGA_V1_1: AtlasEngineManifest = {
  id: 'SUCCESSOR_DETECTION_OMEGA_V1_1',
  version: '1.1.0',
  authority: 'REFINEMENT',
  role: 'detect category migration and future global leaders before consensus',
  emitsAutomaticTrade: false,
  states: ['WATCH', 'EMERGING', 'CONSOLIDATED_CHALLENGER', 'SUCCESSOR_CANDIDATE', 'GENERATIONAL_LEADER_WATCH'],
  rules: [
    'Separate MEGACAP_SUCCESSOR from EMERGING_LEADER_MULTIBAGGER.',
    'Use Rank Velocity across 3M, 6M and 12M windows.',
    'Economic Proof Gate requires FCF/share, incremental ROIC, payback, market share and financing quality where applicable.',
    'Through-Cycle Normalization is mandatory for memory, commodities and cyclical businesses.',
    'Index migration is evidence of scale/liquidity, never a BUY signal.',
    'Price appreciation alone is neither confirmation nor falsifier.',
  ],
};

export const AI_FINANCIAL_FRAGILITY_OMEGA_V1: AtlasEngineManifest = {
  id: 'AI_FINANCIAL_FRAGILITY_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'measure whether AI investment economics are becoming financially fragile',
  emitsAutomaticTrade: false,
  states: ['F0_HEALTHY', 'F1_EXPANSION', 'F2_STRETCHED', 'F3_FRAGILE', 'F4_CASCADE_RISK'],
  rules: [
    'High CAPEX is not fragility by itself.',
    'Track CAPEX/OCF, FCF/share, commitments, leases, utilization, concentration and financing dependence.',
    'F4 requires multi-source confirmation including financing or collateral stress.',
  ],
};

export const AI_CREDIT_TRANSMISSION_OMEGA_V1: AtlasEngineManifest = {
  id: 'AI_CREDIT_TRANSMISSION_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'map AI infrastructure buyer-lender-vehicle-collateral-backstop-refinancing chains',
  emitsAutomaticTrade: false,
  states: ['SELF_FUNDED_ROBUST', 'EXTERNAL_FINANCE_HEALTHY', 'LEVERAGED_EXPANSION', 'REFINANCING_SENSITIVE', 'COLLATERAL_STRESS', 'CREDIT_TRANSMISSION_BREAK'],
  rules: [
    'Private-credit growth is not bearish by itself.',
    'Tangible infrastructure is not automatically safe collateral.',
    'Vendor financing, guarantees and backstops must be treated as economic exposure when material.',
    'AI subprime is a stress-test analogy, not a factual classification.',
  ],
};

export const SOVEREIGN_LIQUIDITY_PLUMBING_OMEGA_V1: AtlasEngineManifest = {
  id: 'SOVEREIGN_LIQUIDITY_PLUMBING_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'detect sovereign funding, FX/carry and international USD-liquidity market-functioning stress',
  emitsAutomaticTrade: false,
  states: ['PLUMBING_NORMAL', 'ABSORPTION_WATCH', 'FX_CARRY_STRESS', 'SOVEREIGN_LIQUIDITY_STRESS', 'MARKET_FUNCTIONING_RISK'],
  rules: [
    'Track TIC, Treasury auctions, term premium, FIMA, swap lines, JPY/BOJ and cross-currency basis.',
    'Separate dollar reserve share from trade invoicing, safe-asset, collateral and private-capital roles.',
    'FIMA/swap usage is plumbing evidence, not proof of insolvency or secret devaluation policy.',
  ],
};

export const EU_FISCAL_STRESS_OMEGA_V1: AtlasEngineManifest = {
  id: 'EU_FISCAL_STRESS_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'measure euro-area sovereign fiscal sustainability and fragmentation pressure',
  emitsAutomaticTrade: false,
  states: ['E0_NORMAL', 'E1_DETERIORATING', 'E2_FISCAL_PRESSURE', 'E3_FRAGMENTATION_RISK', 'E4_SYSTEMIC_EVENT'],
  rules: [
    'Track r-g, primary balance, interest/revenue, spreads, CDS and auction quality.',
    'Political debt-cancellation proposals are not systemic fragmentation evidence by themselves.',
  ],
};

export const CHINA_INDUSTRIAL_DISPLACEMENT_OMEGA_V1: AtlasEngineManifest = {
  id: 'CHINA_INDUSTRIAL_DISPLACEMENT_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'measure Chinese industrial share gains and Western pricing-power displacement',
  emitsAutomaticTrade: false,
  states: ['NO_DISPLACEMENT', 'EARLY_SHARE_GAIN', 'STRUCTURAL_SHARE_GAIN', 'WESTERN_MARGIN_PRESSURE', 'INDUSTRIAL_REGIME_SHIFT'],
  rules: [
    'China financial attractiveness is not China industrial competitiveness.',
    'Track export share, cost curves, localization, vertical integration and incumbent margin/share response.',
  ],
};

export const SPECULATIVE_LIQUIDITY_CANARY_OMEGA_V1: AtlasEngineManifest = {
  id: 'SPECULATIVE_LIQUIDITY_CANARY_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'use BTC and high-beta liquidity data as a marginal-risk-liquidity sensor',
  emitsAutomaticTrade: false,
  states: ['RISK_LIQUIDITY_HEALTHY', 'DIVERGENCE_WATCH', 'LIQUIDITY_STRESS', 'CASCADE_CONFIRMATION'],
  rules: [
    'BTC alone never predicts an equity crash.',
    'Require confirmation from liquidity momentum, DXY/real yields, HY spreads and breadth.',
  ],
};

export const SYSTEMIC_CASCADE_OMEGA_V1: AtlasEngineManifest = {
  id: 'SYSTEMIC_CASCADE_OMEGA_V1',
  version: '1.0.0',
  authority: 'GATE',
  role: 'escalate risk only when economic, credit, liquidity and sovereign stress reinforce one another',
  emitsAutomaticTrade: false,
  states: ['WATCH', 'RISK_REDUCTION_REVIEW', 'REGIME_CHANGE_REVIEW', 'SYSTEMIC_DELEVERAGING_RISK'],
  rules: [
    'Do not double-count multiple signals sourced from the same causal event.',
    '1-3 independent signals = WATCH; 4-6 = RISK_REDUCTION_REVIEW; 7-9 = REGIME_CHANGE_REVIEW.',
    'Systemic deleveraging requires broad cross-channel confirmation, not a simple arithmetic count.',
    'This gate can require portfolio review but cannot issue structural SELL by itself.',
  ],
};

export const INSTITUTIONAL_CONVERGENCE_OMEGA_V1: AtlasEngineManifest = {
  id: 'INSTITUTIONAL_CONVERGENCE_OMEGA_V1',
  version: '1.0.0',
  authority: 'AUXILIARY',
  role: 'measure delayed multi-manager sponsorship convergence without misclassifying it as real-time flow',
  emitsAutomaticTrade: false,
  states: ['NO_CONVERGENCE', 'EMERGING_SPONSORSHIP', 'MULTI_MANAGER_CONVERGENCE', 'CONVERGENCE_CONFIRMED', 'CONVERGENCE_DECAY'],
  rules: [
    '13F change is sponsorship evidence, not real-time flow.',
    'Manager overlap must be de-duplicated.',
    'Convergence raises audit priority only.',
  ],
};

export const WINNER_PRESERVATION_OMEGA_V1: AtlasEngineManifest = {
  id: 'WINNER_PRESERVATION_OMEGA_V1',
  version: '1.0.0',
  authority: 'AUXILIARY',
  role: 'prevent premature sale of compounding successor candidates solely because price has multiplied',
  emitsAutomaticTrade: false,
  rules: [
    'A 2x or 5x is not a sell signal.',
    'Re-audit moat, revisions, FCF/share, incremental ROIC, runway and implied valuation.',
    'Reduce only when forward asymmetry materially deteriorates or a structural falsifier appears.',
  ],
};

export const OPTIONALITY_RESERVE_OMEGA_V1: AtlasEngineManifest = {
  id: 'OPTIONALITY_RESERVE_OMEGA_V1',
  version: '1.0.0',
  authority: 'AUXILIARY',
  role: 'slow deployment and preserve capacity when valuation, concentration, liquidity or credit risk rises without portfolio falsifiers',
  emitsAutomaticTrade: false,
  rules: [
    'Optionality Reserve is not market timing and does not force liquidation.',
    'Prefer staged entries and reduced chase risk when systemic conditions worsen.',
  ],
};

export const CAPITAL_SAFETY_LEVERAGE_DISCIPLINE_OMEGA_V1: AtlasEngineManifest = {
  id: 'CAPITAL_SAFETY_LEVERAGE_DISCIPLINE_OMEGA_V1',
  version: '1.0.0',
  authority: 'AUXILIARY',
  role: 'treat margin, Lombard and collateral leverage as explicit forced-sale risk',
  emitsAutomaticTrade: false,
  rules: [
    'Leverage is not ordinary alpha.',
    'Model asset decline -> LTV rise -> margin call -> forced sale before approving collateralized leverage.',
  ],
};

export const ATLAS_V3_1_SYSTEMIC_EXTENSION_ENGINES = [
  SUCCESSOR_DETECTION_OMEGA_V1_1,
  AI_FINANCIAL_FRAGILITY_OMEGA_V1,
  AI_CREDIT_TRANSMISSION_OMEGA_V1,
  SOVEREIGN_LIQUIDITY_PLUMBING_OMEGA_V1,
  EU_FISCAL_STRESS_OMEGA_V1,
  CHINA_INDUSTRIAL_DISPLACEMENT_OMEGA_V1,
  SPECULATIVE_LIQUIDITY_CANARY_OMEGA_V1,
  SYSTEMIC_CASCADE_OMEGA_V1,
  INSTITUTIONAL_CONVERGENCE_OMEGA_V1,
  WINNER_PRESERVATION_OMEGA_V1,
  OPTIONALITY_RESERVE_OMEGA_V1,
  CAPITAL_SAFETY_LEVERAGE_DISCIPLINE_OMEGA_V1,
] as const;
