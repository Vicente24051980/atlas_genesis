from __future__ import annotations

from dataclasses import dataclass

from .ai_demand_engines import SignalState


def _unit(name: str, value: float) -> None:
    if not 0.0 <= value <= 1.0:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class SocialNarrativeBreadthInput:
    mention_volume_growth: float
    platform_adjusted_growth: float
    semantic_cluster_coherence: float
    author_diversity: float
    follower_tier_diversity: float
    sentiment_quality: float
    geographic_diversity: float
    persistence: float
    influencer_concentration: float
    bot_activity: float
    coordinated_activity: float
    platform_growth_distortion: float


@dataclass(frozen=True)
class SocialNarrativeBreadthResult:
    raw_breadth_score: float
    penalty_score: float
    adjusted_signal_score: float
    signal: SignalState
    early_trend_detected: bool
    institutional_flow_inferred: bool
    portfolio_action_allowed: bool
    reason: str


def evaluate_social_narrative_breadth(data: SocialNarrativeBreadthInput) -> SocialNarrativeBreadthResult:
    """Gate X/social mention surges before they enter ATLAS narrative velocity.

    All inputs are normalized to [0, 1]. The engine rewards platform-adjusted volume,
    semantic clustering, author/follower/geographic breadth, sentiment quality and
    persistence. It penalizes influencer concentration, bot/coordinated activity and
    platform-growth distortion. It never infers institutional flow or authorizes a
    portfolio action by itself.
    """
    for name, value in data.__dict__.items():
        _unit(name, value)

    raw = (
        0.16 * data.mention_volume_growth
        + 0.16 * data.platform_adjusted_growth
        + 0.15 * data.semantic_cluster_coherence
        + 0.16 * data.author_diversity
        + 0.10 * data.follower_tier_diversity
        + 0.08 * data.sentiment_quality
        + 0.07 * data.geographic_diversity
        + 0.12 * data.persistence
    )
    penalty = (
        0.34 * data.influencer_concentration
        + 0.28 * data.bot_activity
        + 0.28 * data.coordinated_activity
        + 0.10 * data.platform_growth_distortion
    )
    adjusted = max(0.0, min(1.0, raw * (1.0 - 0.75 * penalty)))

    durable_breadth = (
        data.author_diversity >= 0.60
        and data.follower_tier_diversity >= 0.50
        and data.persistence >= 0.60
        and penalty <= 0.35
    )
    early_trend = adjusted >= 0.62 and durable_breadth

    if early_trend and adjusted >= 0.78:
        signal = SignalState.GREEN_STRONG
    elif adjusted >= 0.58:
        signal = SignalState.GREEN
    elif adjusted >= 0.35:
        signal = SignalState.AMBER
    else:
        signal = SignalState.RED

    return SocialNarrativeBreadthResult(
        raw,
        penalty,
        adjusted,
        signal,
        early_trend,
        False,
        False,
        "mentions up is not institutional flow; social narrative breadth must survive platform normalization, author diversity, persistence, concentration, bot and coordinated-activity gates before it can enrich Theme Crowding or Narrative Velocity evidence",
    )


SOCIAL_NARRATIVE_CANONICAL_LAWS = (
    "MENTIONS UP != INSTITUTIONAL FLOW",
    "VIRALITY != DURABLE DEMAND",
    "INFLUENCER CONCENTRATION != BROAD ADOPTION",
    "BOT OR COORDINATED ACTIVITY != ORGANIC DIFFUSION",
    "SOCIAL BREADTH CAN ENRICH SIGNALS, BUT CANNOT CREATE EXPECTED RETURN",
)
