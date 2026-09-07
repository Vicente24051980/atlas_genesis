/** E1/E2 hosted calculation, not a new engine or evidence-admission authority. */
export const SCENARIO_OWNER_RETURN_VERSION = '2026-09-07-v1.0.0';
export type EvidenceStamp = {
  source: string; version: string; publicationDate: string; availableAt: string;
  expiresAt: string;
};
export function evidenceUsable(e: EvidenceStamp | undefined, asOf: string): boolean {
  if (!e || !e.source?.trim() || !e.version?.trim()) return false;
  const [p, a, x, t] = [e.publicationDate, e.availableAt, e.expiresAt, asOf].map(Date.parse);
  return [p,a,x,t].every(Number.isFinite) && p <= a && a <= t && t <= x;
}
export type OwnerYear = {
  revenue: number; netMargin: number; ownerEarningsConversion: number;
  dilutedShares: number; cashDividendPerShare: number;
};
export type OwnerScenario = {
  name: 'BEAR' | 'BASE' | 'BULL'; probability: number; years: OwnerYear[];
  terminalOwnerEarningsMultiple: number; rationale: string;
};
export type ScenarioOwnerReturnInput = {
  entityId: string; asOf: string; currency: string; pricePerShare: number;
  horizonYears: number; evidence: EvidenceStamp;
  // Annual cash dividends are held as cash at zero return until the terminal date.
  // Buybacks/dilution enter ONLY through dilutedShares, never a second yield.
  scenarios: OwnerScenario[];
};
export type ScenarioOwnerReturnResult = {
  status: 'CALCULATED' | 'EVIDENCE_PENDING'; reason: string;
  expectedCagrPct: number | null; cagrOfExpectedWealthPct: number | null;
  expectedTerminalWealthPerShare: number | null;
  scenarios: { name: string; probability: number; terminalPrice: number; cashDividends: number; terminalWealth: number; cagrPct: number }[];
  terminalMultipleSensitivity: { multiplier: number; expectedCagrPct: number }[];
  authority: 'E2_CONDITIONAL_ON_SUPPLIED_ASSUMPTIONS';
};
export function calculateScenarioOwnerReturn(input: ScenarioOwnerReturnInput): ScenarioOwnerReturnResult {
  const pending = (reason: string): ScenarioOwnerReturnResult => ({status:'EVIDENCE_PENDING', reason,
    expectedCagrPct:null, cagrOfExpectedWealthPct:null, expectedTerminalWealthPerShare:null,
    scenarios:[], terminalMultipleSensitivity:[], authority:'E2_CONDITIONAL_ON_SUPPLIED_ASSUMPTIONS'});
  if (!input || !input.entityId?.trim() || !input.currency?.trim() || !evidenceUsable(input.evidence,input.asOf)) return pending('IDENTITY_OR_PIT_EVIDENCE_INVALID');
  if (!Number.isFinite(input.pricePerShare) || input.pricePerShare <= 0 || !Number.isInteger(input.horizonYears) || input.horizonYears < 3 || input.horizonYears > 6) return pending('PRICE_OR_HORIZON_INVALID');
  if (!Array.isArray(input.scenarios) || input.scenarios.length !== 3 || new Set(input.scenarios.map(s=>s?.name)).size !== 3 || input.scenarios.some(s=>!['BEAR','BASE','BULL'].includes(s?.name))) return pending('REQUIRE_BASE_BULL_BEAR');
  let probabilitySum = 0;
  for (const s of input.scenarios) {
    if (!Number.isFinite(s.probability) || s.probability < 0 || s.probability > 1 || !s.rationale?.trim() || !Number.isFinite(s.terminalOwnerEarningsMultiple) || s.terminalOwnerEarningsMultiple < 0 || !Array.isArray(s.years) || s.years.length !== input.horizonYears) return pending('SCENARIO_INVALID');
    probabilitySum += s.probability;
    for (const y of s.years) {
      if (!y || ![y.revenue,y.netMargin,y.ownerEarningsConversion,y.dilutedShares,y.cashDividendPerShare].every(Number.isFinite) || y.revenue < 0 || y.netMargin < 0 || y.netMargin > 1 || y.ownerEarningsConversion < 0 || y.ownerEarningsConversion > 1 || y.dilutedShares <= 0 || y.cashDividendPerShare < 0) return pending('OWNER_ECONOMICS_INVALID');
      const earnings = y.revenue*y.netMargin*y.ownerEarningsConversion/y.dilutedShares;
      if (!Number.isFinite(earnings) || y.cashDividendPerShare > earnings + 1e-10) return pending('DIVIDEND_NOT_COVERED_BY_OWNER_EARNINGS');
    }
  }
  if (Math.abs(probabilitySum-1)>1e-10) return pending('PROBABILITIES_MUST_SUM_TO_ONE');
  const scenarios = input.scenarios.map(s=>{
    const last=s.years[s.years.length-1];
    const terminalPrice=last.revenue*last.netMargin*last.ownerEarningsConversion/last.dilutedShares*s.terminalOwnerEarningsMultiple;
    const cashDividends=s.years.reduce((v,y)=>v+y.cashDividendPerShare,0);
    const terminalWealth=terminalPrice+cashDividends;
    return {name:s.name,probability:s.probability,terminalPrice,cashDividends,terminalWealth,cagrPct:100*(Math.pow(terminalWealth/input.pricePerShare,1/input.horizonYears)-1)};
  });
  if (scenarios.some(s=>![s.terminalPrice,s.terminalWealth,s.cagrPct].every(Number.isFinite))) return pending('NONFINITE_RESULT');
  const expectedCagrPct=scenarios.reduce((v,s)=>v+s.probability*s.cagrPct,0);
  const expectedTerminalWealthPerShare=scenarios.reduce((v,s)=>v+s.probability*s.terminalWealth,0);
  const terminalMultipleSensitivity=[0.8,1,1.2].map(multiplier=>({multiplier,expectedCagrPct:scenarios.reduce((v,s)=>v+s.probability*100*(Math.pow((s.terminalPrice*multiplier+s.cashDividends)/input.pricePerShare,1/input.horizonYears)-1),0)}));
  if (![expectedCagrPct,expectedTerminalWealthPerShare,...terminalMultipleSensitivity.map(s=>s.expectedCagrPct)].every(Number.isFinite)) return pending('NONFINITE_AGGREGATE');
  return {status:'CALCULATED',reason:'Scenario assumptions, not forecasts verified as facts; zero cash reinvestment.', expectedCagrPct,
    cagrOfExpectedWealthPct:100*(Math.pow(expectedTerminalWealthPerShare/input.pricePerShare,1/input.horizonYears)-1),
    expectedTerminalWealthPerShare,scenarios,terminalMultipleSensitivity,authority:'E2_CONDITIONAL_ON_SUPPLIED_ASSUMPTIONS'};
}
