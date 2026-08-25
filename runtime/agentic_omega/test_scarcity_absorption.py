from runtime.agentic_omega.scarcity_absorption import (
    OrganizationalAbsorptionInput,
    ScarcityMigrationInput,
    organizational_absorption_omega,
    scarcity_migration_omega,
)


def test_capability_surplus_when_organization_cannot_absorb_ai():
    result = organizational_absorption_omega(
        OrganizationalAbsorptionInput(40, 35, 30, 40, 45, 25)
    )
    assert result["state"] == "CAPABILITY_SURPLUS"
    assert result["economic_proof_gate"] is False


def test_absorption_ready_requires_broad_deployment_readiness():
    result = organizational_absorption_omega(
        OrganizationalAbsorptionInput(85, 80, 78, 82, 76, 84)
    )
    assert result["state"] == "DEPLOYMENT_READY"
    assert result["economic_proof_gate"] is True


def test_bottleneck_without_owner_economics_cannot_pass():
    result = scarcity_migration_omega(
        ScarcityMigrationInput(95, 95, 45, 90, 42, 40, 80)
    )
    assert result["state"] == "BOTTLENECK_ONLY"
    assert result["competition_for_capital_eligible"] is False


def test_scarcity_capture_needs_equity_validation_to_confirm():
    result = scarcity_migration_omega(
        ScarcityMigrationInput(90, 92, 85, 88, 82, 80, 45)
    )
    assert result["state"] == "SCARCITY_CAPTURE_WATCH"
    assert result["competition_for_capital_eligible"] is False


def test_scarcity_capture_confirmed_only_with_owner_economics_and_market_validation():
    result = scarcity_migration_omega(
        ScarcityMigrationInput(90, 92, 88, 90, 86, 84, 72)
    )
    assert result["state"] == "SCARCITY_CAPTURE_CONFIRMED"
    assert result["economic_capture_floor"] >= 80
    assert result["competition_for_capital_eligible"] is True
