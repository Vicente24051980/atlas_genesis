from api.realizable_alpha import (
    BiasHaircuts,
    FrictionCosts,
    RealizableAlphaRequest,
    calculate_realizable_alpha,
)


def test_alpha_trap_after_bias_and_costs() -> None:
    result = calculate_realizable_alpha(
        RealizableAlphaRequest(
            label="Collectible",
            reported_return_pct=11.0,
            benchmark_return_pct=5.54,
            bias_haircuts=BiasHaircuts(survivorship=8.0),
            friction_costs=FrictionCosts(management_fee=1.5),
            evidence_quality=80,
            out_of_sample_validated=True,
            live_validation_years=2,
        )
    )
    assert result.reportedAlphaPct > 0
    assert result.realizableAlphaPct < 0
    assert result.state == "ALPHA_TRAP"


def test_unproven_backtest_requires_validation() -> None:
    result = calculate_realizable_alpha(
        RealizableAlphaRequest(
            reported_return_pct=18,
            benchmark_return_pct=9,
            friction_costs=FrictionCosts(transaction_costs=1),
            evidence_quality=50,
            out_of_sample_validated=False,
        )
    )
    assert result.realizableAlphaPct > 0
    assert result.validationState == "LOW_EVIDENCE"
    assert result.state == "UNPROVEN"


def test_validated_positive_alpha() -> None:
    result = calculate_realizable_alpha(
        RealizableAlphaRequest(
            reported_return_pct=14,
            benchmark_return_pct=8,
            bias_haircuts=BiasHaircuts(selection=0.5, model_overfit=0.5),
            friction_costs=FrictionCosts(transaction_costs=0.5, slippage=0.5),
            evidence_quality=90,
            out_of_sample_validated=True,
            live_validation_years=4,
        )
    )
    assert result.realizableAlphaPct == 4.0
    assert result.state == "POSITIVE_ALPHA"
    assert result.validationState == "VALIDATED"
