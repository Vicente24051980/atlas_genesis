import pytest

from runtime.agentic_omega.ai_demand_engines import SignalState
from runtime.agentic_omega.social_narrative_breadth import (
    SocialNarrativeBreadthInput,
    evaluate_social_narrative_breadth,
)


def test_social_narrative_breadth_detects_persistent_organic_trend():
    result = evaluate_social_narrative_breadth(
        SocialNarrativeBreadthInput(
            mention_volume_growth=0.92,
            platform_adjusted_growth=0.88,
            semantic_cluster_coherence=0.84,
            author_diversity=0.86,
            follower_tier_diversity=0.78,
            sentiment_quality=0.72,
            geographic_diversity=0.70,
            persistence=0.82,
            influencer_concentration=0.18,
            bot_activity=0.08,
            coordinated_activity=0.07,
            platform_growth_distortion=0.10,
        )
    )

    assert result.signal == SignalState.GREEN_STRONG
    assert result.early_trend_detected
    assert not result.institutional_flow_inferred
    assert not result.portfolio_action_allowed


def test_viral_influencer_concentration_blocks_breadth_claim():
    result = evaluate_social_narrative_breadth(
        SocialNarrativeBreadthInput(
            mention_volume_growth=0.98,
            platform_adjusted_growth=0.92,
            semantic_cluster_coherence=0.80,
            author_diversity=0.34,
            follower_tier_diversity=0.28,
            sentiment_quality=0.75,
            geographic_diversity=0.35,
            persistence=0.42,
            influencer_concentration=0.94,
            bot_activity=0.12,
            coordinated_activity=0.14,
            platform_growth_distortion=0.10,
        )
    )

    assert not result.early_trend_detected
    assert result.adjusted_signal_score < result.raw_breadth_score
    assert not result.institutional_flow_inferred


def test_bot_and_coordinated_activity_penalize_false_positive():
    result = evaluate_social_narrative_breadth(
        SocialNarrativeBreadthInput(
            mention_volume_growth=0.95,
            platform_adjusted_growth=0.90,
            semantic_cluster_coherence=0.88,
            author_diversity=0.72,
            follower_tier_diversity=0.68,
            sentiment_quality=0.74,
            geographic_diversity=0.66,
            persistence=0.72,
            influencer_concentration=0.20,
            bot_activity=0.86,
            coordinated_activity=0.82,
            platform_growth_distortion=0.24,
        )
    )

    assert not result.early_trend_detected
    assert result.penalty_score > 0.55
    assert result.signal in {SignalState.AMBER, SignalState.RED}


def test_social_narrative_breadth_rejects_out_of_range_inputs():
    with pytest.raises(ValueError):
        evaluate_social_narrative_breadth(
            SocialNarrativeBreadthInput(
                mention_volume_growth=1.10,
                platform_adjusted_growth=0.50,
                semantic_cluster_coherence=0.50,
                author_diversity=0.50,
                follower_tier_diversity=0.50,
                sentiment_quality=0.50,
                geographic_diversity=0.50,
                persistence=0.50,
                influencer_concentration=0.50,
                bot_activity=0.50,
                coordinated_activity=0.50,
                platform_growth_distortion=0.50,
            )
        )
