export type CapexProductivityState =
  | 'CAPEX_HIGHLY_PRODUCTIVE'
  | 'CAPEX_PRODUCTIVE'
  | 'CAPEX_WATCH'
  | 'CAPEX_DETERIORATION'
  | 'CAPEX_RED_ALERT'
  | 'CAPEX_VALUE_DESTRUCTION_RISK'
  | 'CAPEX_UNDER_MONETIZATION'
  | 'INSUFFICIENT_DATA';

export type IncrementalRoicRegime =
  | 'TRUE_INCREMENTAL_RETURN'
  | 'CAPITAL_RELEASE_WITH_EARNINGS_GROWTH'
  | 'CAPITAL_ADDITION_WITH_EARNINGS_DECLINE'
  | 'BUSINESS_CONTRACTION_CAPITAL_RELEASE'
  | 'UNSTABLE_DENOMINATOR'
  | 'MISSING';

export type CapexProductivityInput = {
  ticker: string;
  roicCurrent: number | null;
  roicAvg3y: number | null;
  roicAvg5y: number | null;
  incrementalRoic: number | null;
  incrementalRoicRegime?: IncrementalRoicRegime;
  incrementalRoicScoreEligible?: boolean;
  incrementalCapitalMetricsScoreEligible?: boolean;
  capexGrowth: number | null;
  capexCagr3y: number | null;
  revenueGrowth: number | null;
  revenueCagr3y: number | null;
  operatingIncomeGrowth: number | null;
  fcfGrowth: number | null;
  fcfCagr3y: number | null;
  fcfPerShareGrowth: number | null;
  fcfPerShareCagr3y: number | null;
  fcfToCapex: number | null;
  fcfToCapexPrior1y: number | null;
  fcfToCapexPrior2y: number | null;
  assetTurnover: number | null;
  assetTurnoverPrior1y: number | null;
  assetTurnoverPrior2y: number | null;
  incrementalRevenueToInvestedCapital: number | null;
  incrementalOperatingProfitToInvestedCapital: number | null;
  capexToRevenue: number | null;
  capexToCfo: number | null;
  netDebtToEbitda: number | null;
  netDebtGrowth: number | null;
  interestCoverage: number | null;
  dilutedShareCagr: number | null;
  sbcToRevenue: number | null;
  sbcToFcf: number | null;
  incrementalOperatingMargin: number | null;
  externalFinancingRequired: boolean | null;
  capacityUnderConstruction: boolean;
  monetizationEvidence: boolean;
};

export type CapexWatchSignal = {
  code: string;
  active: boolean;
  detail: string;
};

export type CapexProductivityResult = {
  ticker: string;
  score: number | null;
  state: CapexProductivityState;
  signalCount: number;
  signals: CapexWatchSignal[];
  completeness: number;
  componentScores: {
    roic: number | null;
    fcfConversion: number | null;
    assetProductivity: number | null;
    capitalIntensity: number | null;
    financingQuality: number | null;
    dilution: number | null;
    incrementalReturn: number | null;
  };
};

type ScorePart = { normalized: number; maxPoints: number };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function componentScore(parts: ScorePart[], totalWeight: number): number | null {
  if (!parts.length) return null;
  const possible = parts.reduce((sum, part) => sum + part.maxPoints, 0);
  const earned = parts.reduce((sum, part) => sum + clamp(part.normalized) * part.maxPoints, 0);
  return Math.round((earned / possible) * totalWeight * 10) / 10;
}

function absoluteRoicScore(roic: number): number {
  if (roic >= 30) return 1;
  if (roic >= 20) return 0.9;
  if (roic >= 15) return 0.75;
  if (roic >= 10) return 0.55;
  if (roic >= 5) return 0.3;
  return 0.1;
}

function trendScore(current: number, reference: number): number {
  const delta = current - reference;
  if (delta >= 5) return 1;
  if (delta >= 0) return 0.8;
  if (delta >= -3) return 0.55;
  if (delta >= -7) return 0.3;
  return 0.1;
}

function cagrScore(value: number): number {
  if (value >= 20) return 1;
  if (value >= 10) return 0.8;
  if (value >= 5) return 0.65;
  if (value >= 0) return 0.5;
  if (value >= -10) return 0.25;
  return 0.05;
}

function leverageScore(value: number): number {
  if (value <= 0) return 1;
  if (value <= 1) return 0.9;
  if (value <= 2) return 0.75;
  if (value <= 3) return 0.55;
  if (value <= 4) return 0.3;
  return 0.1;
}

function coverageScore(value: number): number {
  if (value >= 15) return 1;
  if (value >= 8) return 0.85;
  if (value >= 5) return 0.65;
  if (value >= 3) return 0.4;
  return 0.15;
}

function shareScore(value: number): number {
  if (value <= -2) return 1;
  if (value <= 0) return 0.9;
  if (value <= 1) return 0.75;
  if (value <= 3) return 0.5;
  if (value <= 5) return 0.25;
  return 0.05;
}

function ratioScore(value: number, excellent: number, good: number, weak: number): number {
  if (value >= excellent) return 1;
  if (value >= good) return 0.75;
  if (value >= weak) return 0.5;
  if (value >= 0) return 0.25;
  return 0.05;
}

function computeComponentScores(input: CapexProductivityInput) {
  const incrementalRoicScorable = input.incrementalRoicScoreEligible !== false;
  const incrementalCapitalScorable = input.incrementalCapitalMetricsScoreEligible !== false;

  const roicParts: ScorePart[] = [];
  if (input.roicCurrent != null) roicParts.push({ normalized: absoluteRoicScore(input.roicCurrent), maxPoints: 10 });
  if (input.roicCurrent != null && input.roicAvg3y != null) roicParts.push({ normalized: trendScore(input.roicCurrent, input.roicAvg3y), maxPoints: 5 });
  if (incrementalRoicScorable && input.incrementalRoic != null && input.roicAvg3y != null) {
    roicParts.push({ normalized: trendScore(input.incrementalRoic, input.roicAvg3y), maxPoints: 5 });
  }

  const fcfParts: ScorePart[] = [];
  if (input.fcfToCapex != null) fcfParts.push({ normalized: ratioScore(input.fcfToCapex, 2, 1, 0.5), maxPoints: 8 });
  if (input.fcfPerShareCagr3y != null) fcfParts.push({ normalized: cagrScore(input.fcfPerShareCagr3y), maxPoints: 7 });
  if (input.fcfCagr3y != null) fcfParts.push({ normalized: cagrScore(input.fcfCagr3y), maxPoints: 5 });

  const assetParts: ScorePart[] = [];
  if (input.assetTurnover != null && input.assetTurnoverPrior1y != null) {
    assetParts.push({ normalized: trendScore(input.assetTurnover * 100, input.assetTurnoverPrior1y * 100), maxPoints: 5 });
  }
  if (incrementalCapitalScorable && input.incrementalRevenueToInvestedCapital != null) {
    assetParts.push({ normalized: ratioScore(input.incrementalRevenueToInvestedCapital, 0.75, 0.4, 0.15), maxPoints: 5 });
  }
  if (incrementalCapitalScorable && input.incrementalOperatingProfitToInvestedCapital != null) {
    assetParts.push({ normalized: ratioScore(input.incrementalOperatingProfitToInvestedCapital, 0.3, 0.2, 0.1), maxPoints: 5 });
  }

  const intensityParts: ScorePart[] = [];
  if (input.capexToCfo != null) {
    const normalized = input.capexToCfo <= 0.35 ? 1 : input.capexToCfo <= 0.55 ? 0.8 : input.capexToCfo <= 0.75 ? 0.55 : input.capexToCfo <= 1 ? 0.3 : 0.1;
    intensityParts.push({ normalized, maxPoints: 5 });
  }
  if (input.capexCagr3y != null && input.revenueCagr3y != null) {
    intensityParts.push({ normalized: trendScore(input.revenueCagr3y, input.capexCagr3y), maxPoints: 5 });
  }
  if (input.capexGrowth != null && input.operatingIncomeGrowth != null) {
    intensityParts.push({ normalized: trendScore(input.operatingIncomeGrowth, input.capexGrowth), maxPoints: 5 });
  }

  const financingParts: ScorePart[] = [];
  if (input.netDebtToEbitda != null) financingParts.push({ normalized: leverageScore(input.netDebtToEbitda), maxPoints: 4 });
  if (input.interestCoverage != null) financingParts.push({ normalized: coverageScore(input.interestCoverage), maxPoints: 3 });
  if (input.netDebtGrowth != null) {
    financingParts.push({ normalized: input.netDebtGrowth <= 0 ? 1 : input.netDebtGrowth <= 10 ? 0.75 : input.netDebtGrowth <= 25 ? 0.45 : 0.15, maxPoints: 3 });
  }

  const dilutionParts: ScorePart[] = [];
  if (input.dilutedShareCagr != null) dilutionParts.push({ normalized: shareScore(input.dilutedShareCagr), maxPoints: 6 });
  if (input.sbcToFcf != null) dilutionParts.push({ normalized: input.sbcToFcf <= 0.1 ? 1 : input.sbcToFcf <= 0.2 ? 0.75 : input.sbcToFcf <= 0.4 ? 0.45 : 0.15, maxPoints: 2 });
  if (input.sbcToRevenue != null) dilutionParts.push({ normalized: input.sbcToRevenue <= 0.03 ? 1 : input.sbcToRevenue <= 0.08 ? 0.75 : input.sbcToRevenue <= 0.15 ? 0.45 : 0.15, maxPoints: 2 });

  const returnParts: ScorePart[] = [];
  if (incrementalRoicScorable && input.incrementalRoic != null) {
    returnParts.push({ normalized: absoluteRoicScore(input.incrementalRoic), maxPoints: 6 });
  }
  if (input.incrementalOperatingMargin != null) {
    const normalized = input.incrementalOperatingMargin >= 25 ? 1 : input.incrementalOperatingMargin >= 15 ? 0.8 : input.incrementalOperatingMargin >= 5 ? 0.55 : input.incrementalOperatingMargin >= 0 ? 0.3 : 0.05;
    returnParts.push({ normalized, maxPoints: 4 });
  }

  return {
    roic: componentScore(roicParts, 20),
    fcfConversion: componentScore(fcfParts, 20),
    assetProductivity: componentScore(assetParts, 15),
    capitalIntensity: componentScore(intensityParts, 15),
    financingQuality: componentScore(financingParts, 10),
    dilution: componentScore(dilutionParts, 10),
    incrementalReturn: componentScore(returnParts, 10),
  };
}

export function evaluateCapexProductivity(input: CapexProductivityInput): CapexProductivityResult {
  const incrementalRoicScorable = input.incrementalRoicScoreEligible !== false;
  const explicitCapitalAdditionDeterioration = input.incrementalRoicRegime === 'CAPITAL_ADDITION_WITH_EARNINGS_DECLINE';

  const signals: CapexWatchSignal[] = [
    {
      code: 'CAPEX_UP_ROIC_DOWN',
      active: input.capexGrowth != null && input.capexGrowth > 25 && input.roicCurrent != null && input.roicAvg3y != null && input.roicCurrent < input.roicAvg3y,
      detail: 'CAPEX > +25% mientras ROIC cae frente a su referencia de 3 años.',
    },
    {
      code: 'CAPEX_UP_FCFPS_DOWN',
      active: input.capexGrowth != null && input.capexGrowth > 25 && input.fcfPerShareGrowth != null && input.fcfPerShareGrowth < 0,
      detail: 'CAPEX > +25% mientras FCF por acción cae.',
    },
    {
      code: 'FCF_CAPEX_TWO_YEAR_DECLINE',
      active: input.fcfToCapex != null && input.fcfToCapexPrior1y != null && input.fcfToCapexPrior2y != null && input.fcfToCapex < input.fcfToCapexPrior1y && input.fcfToCapexPrior1y < input.fcfToCapexPrior2y,
      detail: 'FCF/CAPEX se deteriora durante dos ejercicios consecutivos.',
    },
    {
      code: 'DEBT_FUNDED_CAPEX',
      active: input.netDebtGrowth != null && input.netDebtGrowth > 25 && input.capexGrowth != null && input.capexGrowth > 25,
      detail: 'Deuda neta y CAPEX crecen simultáneamente por encima del 25%.',
    },
    {
      code: 'DILUTION_GT_3',
      active: input.dilutedShareCagr != null && input.dilutedShareCagr > 3,
      detail: 'Acciones diluidas crecen por encima del 3% anual.',
    },
    {
      code: 'ASSET_TURNOVER_DECLINE',
      active: input.assetTurnover != null && input.assetTurnoverPrior1y != null && input.assetTurnoverPrior2y != null && input.assetTurnover < input.assetTurnoverPrior1y && input.assetTurnoverPrior1y < input.assetTurnoverPrior2y,
      detail: 'Asset turnover cae durante dos periodos consecutivos.',
    },
    {
      code: 'INCREMENTAL_ROIC_BELOW_HISTORY',
      active: explicitCapitalAdditionDeterioration || (
        incrementalRoicScorable
        && input.incrementalRoic != null
        && input.roicAvg3y != null
        && input.incrementalRoic < input.roicAvg3y * 0.75
      ),
      detail: explicitCapitalAdditionDeterioration
        ? 'El capital invertido aumenta mientras NOPAT no crece: deterioro incremental económicamente válido.'
        : 'ROIC incremental interpretable está materialmente por debajo del ROIC histórico.',
    },
    {
      code: 'REVENUE_UP_FCFPS_NOT_UP',
      active: input.revenueGrowth != null && input.revenueGrowth > 0 && input.fcfPerShareGrowth != null && input.fcfPerShareGrowth <= 0,
      detail: 'Ingresos crecen pero FCF por acción no crece.',
    },
    {
      code: 'OPERATING_PROFIT_LAGS_CAPEX',
      active: input.operatingIncomeGrowth != null && input.capexGrowth != null && input.capexGrowth > 0 && input.operatingIncomeGrowth < input.capexGrowth * 0.5,
      detail: 'Beneficio operativo crece a menos de la mitad del ritmo del CAPEX.',
    },
    {
      code: 'EXTERNAL_FINANCING_REQUIRED',
      active: input.externalFinancingRequired === true,
      detail: 'La expansión requiere financiación externa para mantener compromisos operativos y de CAPEX.',
    },
  ];

  const numericFields = [
    input.roicCurrent, input.roicAvg3y, input.roicAvg5y, input.incrementalRoic, input.capexGrowth,
    input.capexCagr3y, input.revenueGrowth, input.revenueCagr3y, input.operatingIncomeGrowth,
    input.fcfGrowth, input.fcfCagr3y, input.fcfPerShareGrowth, input.fcfPerShareCagr3y, input.fcfToCapex,
    input.assetTurnover, input.incrementalRevenueToInvestedCapital, input.incrementalOperatingProfitToInvestedCapital,
    input.capexToRevenue, input.capexToCfo, input.netDebtToEbitda, input.netDebtGrowth, input.interestCoverage,
    input.dilutedShareCagr, input.sbcToRevenue, input.sbcToFcf, input.incrementalOperatingMargin,
  ];
  const completeness = Math.round((numericFields.filter((value) => value != null).length / numericFields.length) * 100);
  const componentScores = computeComponentScores(input);
  const weightedComponents: [number | null, number][] = [
    [componentScores.roic, 20],
    [componentScores.fcfConversion, 20],
    [componentScores.assetProductivity, 15],
    [componentScores.capitalIntensity, 15],
    [componentScores.financingQuality, 10],
    [componentScores.dilution, 10],
    [componentScores.incrementalReturn, 10],
  ];
  const availableComponents = weightedComponents.filter((entry): entry is [number, number] => entry[0] != null);
  const signalCount = signals.filter((signal) => signal.active).length;

  if (completeness < 60 || availableComponents.length < 5) {
    return { ticker: input.ticker, score: null, state: 'INSUFFICIENT_DATA', signalCount, signals, completeness, componentScores };
  }

  const earnedPoints = availableComponents.reduce((sum, [value]) => sum + value, 0);
  const availableWeight = availableComponents.reduce((sum, [, weight]) => sum + weight, 0);
  const score = Math.round((earnedPoints / availableWeight) * 100);

  if (input.capacityUnderConstruction && !input.monetizationEvidence) {
    return { ticker: input.ticker, score, state: 'CAPEX_UNDER_MONETIZATION', signalCount, signals, completeness, componentScores };
  }

  let state: CapexProductivityState;
  if (signalCount >= 3) state = 'CAPEX_DETERIORATION';
  else if (signalCount >= 2) state = 'CAPEX_WATCH';
  else if (score >= 85) state = 'CAPEX_HIGHLY_PRODUCTIVE';
  else if (score >= 70) state = 'CAPEX_PRODUCTIVE';
  else if (score >= 55) state = 'CAPEX_WATCH';
  else if (score >= 40) state = 'CAPEX_DETERIORATION';
  else state = 'CAPEX_VALUE_DESTRUCTION_RISK';

  return { ticker: input.ticker, score, state, signalCount, signals, completeness, componentScores };
}
