import {
  evaluateNeocloudCustomerAcceptanceGate,
  type NeocloudCustomerAcceptanceInput,
} from './neocloud-customer-acceptance-gate-omega';

const acceptedBase: NeocloudCustomerAcceptanceInput = {
  ticker: 'NEOCLOUD_CASE',
  evidenceTraceable: true,
  evidenceIds: ['contract-filing', 'acceptance-release'],
  contracted: true,
  capacitySecured: true,
  hardwareReady: true,
  deployed: true,
  acceptanceStatus: 'ACCEPTED',
  slaPassed: true,
  escrowReleased: true,
  revenueRecognizedFromAcceptedDeployment: false,
  marginProvenOnAcceptedDeployment: false,
  multiPeriodCashReturnProven: false,
  materialAcceptanceDelay: false,
  contractRenegotiatedOrCancelled: false,
};

describe('Neocloud Customer Acceptance Gate Omega v1', () => {
  it('keeps a deployed cluster at E2 while acceptance is pending', () => {
    const result = evaluateNeocloudCustomerAcceptanceGate({
      ...acceptedBase,
      acceptanceStatus: 'PENDING',
      slaPassed: null,
      escrowReleased: null,
    });

    expect(result).toMatchObject({
      stage: 'N3_DEPLOYED',
      acceptanceGate: 'PENDING',
      economicProofCeiling: 'E2_ORDERS_CONTRACTS',
      canPromoteToE3: false,
    });
  });

  it('treats formal customer acceptance as stronger execution proof but not E3 monetization', () => {
    const result = evaluateNeocloudCustomerAcceptanceGate(acceptedBase);

    expect(result).toMatchObject({
      stage: 'N4_CUSTOMER_ACCEPTED',
      acceptanceGate: 'PASS',
      economicProofCeiling: 'E2_ORDERS_CONTRACTS',
      canPromoteToE3: false,
    });
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('does not equal revenue recognition'),
      expect.stringContaining('Escrow release'),
    ]));
  });

  it('does not promote recognized revenue without margin to E3', () => {
    const result = evaluateNeocloudCustomerAcceptanceGate({
      ...acceptedBase,
      revenueRecognizedFromAcceptedDeployment: true,
    });

    expect(result).toMatchObject({
      stage: 'N5_REVENUE_RECOGNIZED',
      economicProofCeiling: 'E2_ORDERS_CONTRACTS',
      canPromoteToE3: false,
    });
  });

  it('permits E3 only after acceptance, attributable revenue and margin are all proven', () => {
    const result = evaluateNeocloudCustomerAcceptanceGate({
      ...acceptedBase,
      revenueRecognizedFromAcceptedDeployment: true,
      marginProvenOnAcceptedDeployment: true,
    });

    expect(result).toMatchObject({
      stage: 'N6_MARGIN_PROVEN',
      economicProofCeiling: 'E3_REVENUE_MARGIN',
      canPromoteToE3: true,
      canPromoteToE4: false,
    });
  });

  it('permits E4 only after multi-period cash return is proven', () => {
    const result = evaluateNeocloudCustomerAcceptanceGate({
      ...acceptedBase,
      revenueRecognizedFromAcceptedDeployment: true,
      marginProvenOnAcceptedDeployment: true,
      multiPeriodCashReturnProven: true,
    });

    expect(result).toMatchObject({
      stage: 'N7_CASH_RETURN_PROVEN',
      economicProofCeiling: 'E4_FCF_ROIC_MULTI_PERIOD',
      canPromoteToE3: true,
      canPromoteToE4: true,
    });
  });

  it('routes rejection, dispute or failed SLA to extraordinary execution review', () => {
    const result = evaluateNeocloudCustomerAcceptanceGate({
      ...acceptedBase,
      acceptanceStatus: 'REJECTED',
      slaPassed: false,
      escrowReleased: false,
    });

    expect(result).toMatchObject({
      stage: 'NX_EXECUTION_REVIEW',
      acceptanceGate: 'FAIL',
      canPromoteToE3: false,
      canPromoteToE4: false,
    });
  });

  it('rejects impossible stage ordering', () => {
    expect(() =>
      evaluateNeocloudCustomerAcceptanceGate({
        ...acceptedBase,
        deployed: false,
        acceptanceStatus: 'ACCEPTED',
      }),
    ).toThrow('neocloud_acceptance_requires_deployment');
  });
});
