from runtime.agentic_omega.frontier_risk_engines import (
    EdgeCloudInput,
    FrontierCyberInput,
    PostQuantumInput,
    evaluate_edge_cloud,
    evaluate_frontier_cyber,
    evaluate_post_quantum,
)


def test_frontier_cyber_requires_monetization():
    r = evaluate_frontier_cyber(FrontierCyberInput(True, False, 0.30, 0.35, False))
    assert not r.portfolio_action_allowed
    assert "MONETIZATION" in r.reason


def test_frontier_cyber_roic_unlocks_action_gate():
    r = evaluate_frontier_cyber(FrontierCyberInput(True, True, 0.30, 0.35, True))
    assert r.economic_proof
    assert r.portfolio_action_allowed


def test_edge_and_cloud_can_expand_together():
    r = evaluate_edge_cloud(EdgeCloudInput(-0.5, -0.4, True, 0.20, 0.25))
    assert r.regime == "HYBRID_EXPANSION"
    assert not r.portfolio_action_allowed


def test_pqc_is_watch_only_without_economics():
    r = evaluate_post_quantum(PostQuantumInput(True, True, True, False, False))
    assert not r.portfolio_action_allowed


def test_pqc_economics_can_pass_gate():
    r = evaluate_post_quantum(PostQuantumInput(True, True, True, True, True))
    assert r.portfolio_action_allowed
