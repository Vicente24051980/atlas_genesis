from runtime.agentic_omega.transregional_workflow_engines import (
    LayerObservation,
    RotationStage,
    TransregionalRotationInput,
    WorkflowDepthInput,
    evaluate_transregional_rotation,
    evaluate_workflow_depth,
)
from runtime.agentic_omega.ai_demand_engines import SignalState


def test_single_region_is_not_transregional_confirmation():
    result = evaluate_transregional_rotation(TransregionalRotationInput((
        LayerObservation("HBM", "USA", 3.0),
        LayerObservation("SERVERS", "USA", 2.0),
        LayerObservation("POWER", "USA", 1.0),
    )))
    assert result.stage is RotationStage.JUMP
    assert result.portfolio_action_allowed is False


def test_multi_region_multi_layer_jump_reaches_stage_one_not_persistence():
    obs = tuple(
        LayerObservation(layer, region, 1.0)
        for layer in ("HBM", "SERVERS", "POWER")
        for region in ("USA", "KOREA", "TAIWAN")
    )
    result = evaluate_transregional_rotation(TransregionalRotationInput(obs))
    assert result.stage is RotationStage.TRANSREGIONAL_BREADTH
    assert result.signal is SignalState.GREEN_STRONG
    assert result.portfolio_action_allowed is False


def test_persistence_is_separate_gate():
    obs = tuple(
        LayerObservation(layer, region, 1.0)
        for layer in ("HBM", "SERVERS", "POWER")
        for region in ("USA", "KOREA", "TAIWAN")
    )
    result = evaluate_transregional_rotation(TransregionalRotationInput(obs, persistence_confirmed=True))
    assert result.stage is RotationStage.PERSISTENT_ROTATION
    assert result.portfolio_action_allowed is False


def test_deep_workflow_is_not_owner_economics():
    result = evaluate_workflow_depth(WorkflowDepthInput(7, 8, deployed=True))
    assert result.signal is SignalState.GREEN_STRONG
    assert result.autonomy_ratio == 0.875
    assert result.economic_proof is False
    assert result.portfolio_action_allowed is False


def test_workflow_roic_does_not_bypass_portfolio_gates():
    result = evaluate_workflow_depth(WorkflowDepthInput(8, 8, True, True, True, True, True))
    assert result.economic_proof is True
    assert result.portfolio_action_allowed is False
    assert "valuation" in result.reason.lower()
