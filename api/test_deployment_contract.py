from pathlib import Path

from api.app import app


def _paths() -> set[str]:
    return set(app.openapi().get("paths", {}))


def test_production_app_exposes_mobile_and_agentic_surfaces() -> None:
    paths = _paths()
    required = {
        "/health",
        "/v1/mobile/health",
        "/v1/mobile/indices",
        "/v1/mobile/company/{ticker}",
        "/v1/mobile/portfolio",
        "/v1/mobile/catalysts",
        "/v1/mobile/audit/{ticker}",
        "/v1/mobile/broker/status",
        "/v1/mobile/broker/account",
        "/v1/mobile/broker/positions",
        "/v1/mobile/broker/orders",
        "/v1/mobile/broker/metadata/instruments/search",
        "/v1/agentic-omega/health",
        "/v1/agentic-omega/v2/capabilities",
        "/v1/agentic-omega/v2/evidence-capabilities",
        "/v1/agentic-omega/v2/governance/capabilities",
    }
    assert required <= paths


def test_render_blueprint_targets_live_service_and_production_entrypoint() -> None:
    blueprint = Path("render.yaml").read_text(encoding="utf-8")
    assert "name: atlas-genesis\n" in blueprint
    assert "branch: main" in blueprint
    assert "autoDeployTrigger: commit" in blueprint
    assert "startCommand: uvicorn api.app:app --host 0.0.0.0 --port $PORT" in blueprint
    assert "healthCheckPath: /v1/mobile/health" in blueprint
    assert "python -c" in blueprint
    assert "Missing production routes" in blueprint
    for required_route in (
        "/v1/mobile/indices",
        "/v1/mobile/company/{ticker}",
        "/v1/mobile/catalysts",
        "/v1/mobile/audit/{ticker}",
        "/v1/mobile/broker/status",
        "/v1/mobile/broker/account",
        "/v1/mobile/broker/positions",
        "/v1/mobile/broker/orders",
        "/v1/mobile/broker/metadata/instruments/search",
    ):
        assert required_route in blueprint
    assert "ATLAS_DEPLOY_REVISION" in blueprint
    assert "TRADING212_LIVE_TRADING_ENABLED" in blueprint
    assert 'value: "false"' in blueprint
    assert "ATLAS_AGENT_CONTROL_TOKEN" in blueprint
    assert "generateValue: true" in blueprint
