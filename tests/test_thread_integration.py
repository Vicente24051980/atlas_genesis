from atlas_omega.research.thread_integration import (
    EpistemicClass, Evidence, ReviewStatus, agent_economics_gate,
    ai_value_capture_gate, health_innovation_gate, memory_supply_gate,
    valuation_scenario,
)

E = [Evidence("verified observation", EpistemicClass.FACT, "primary", "2026-09-18", True)]

def test_capability_does_not_imply_economics():
    r = agent_economics_gate(E, repeat_usage=True, paid_demand=False, unit_economics=False, transaction_evidence=True)
    assert r.status is ReviewStatus.OBSERVATION
    assert "willingness to pay absent" in r.falsifiers

def test_value_capture_requires_economics_and_fcf():
    r = ai_value_capture_gate(E, revenue_capture_known=True, inference_cost_known=True, fcf_known=False)
    assert r.status is ReviewStatus.OBSERVATION

def test_health_phase_three_is_not_commercial_evidence():
    r = health_innovation_gate(E, reached_stage="PHASE_III", commercial_evidence=False)
    assert r.status is ReviewStatus.OBSERVATION
    assert "commercial conversion not reached" in r.falsifiers

def test_memory_price_action_is_not_enough():
    r = memory_supply_gate(E, pricing_power=True, contracted_supply=False, demand_corroboration=True)
    assert r.status is ReviewStatus.OBSERVATION

def test_openai_newsletter_math_is_mechanical_only():
    x = valuation_scenario(1_200_000_000_000, 10, 240)
    assert x["revenue_required"] == 120_000_000_000
    assert x["subscriber_equivalents"] == 500_000_000
    y = valuation_scenario(1_200_000_000_000, 2, 240)
    assert y["subscriber_equivalents"] == 2_500_000_000
