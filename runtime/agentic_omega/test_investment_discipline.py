from runtime.agentic_omega.ai_demand_engines import SignalState
from runtime.agentic_omega.investment_discipline import (
    PreMortemInversionInput,
    ResearchIntensityInput,
    evaluate_pre_mortem_inversion,
    evaluate_research_intensity,
)


def test_high_conviction_without_falsifiers_fails_process_gate():
    result = evaluate_pre_mortem_inversion(
        PreMortemInversionInput(0.95, 0.20, 0.50, 0.90, 0.20, 0.20, 0.20)
    )
    assert result.gate_passed is False
    assert result.signal is SignalState.RED
    assert result.portfolio_action_allowed is False


def test_inversion_with_survivable_sizing_can_pass_process_gate():
    result = evaluate_pre_mortem_inversion(
        PreMortemInversionInput(0.85, 0.90, 0.20, 0.60, 0.90, 0.90, 0.90)
    )
    assert result.gate_passed is True
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False


def test_large_uncertain_position_requires_more_research():
    result = evaluate_research_intensity(ResearchIntensityInput(10000.0, 0.90, 0.90, 0.30))
    assert result.gate_passed is False
    assert result.signal in {SignalState.RED, SignalState.AMBER}


def test_sufficient_research_can_pass_discipline_gate():
    result = evaluate_research_intensity(ResearchIntensityInput(10000.0, 0.50, 0.50, 0.30))
    assert result.gate_passed is True
    assert result.signal in {SignalState.GREEN, SignalState.GREEN_STRONG}
    assert result.portfolio_action_allowed is False
