from __future__ import annotations

import pytest
from fastapi import HTTPException

from api import main
from api import trading212_controlled as controlled


def test_controlled_mobile_broker_blocks_live_material_action(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(controlled.legacy, "TRADING212_ENV", "live")
    with pytest.raises(HTTPException) as exc:
        controlled._block_live_material_action()
    assert exc.value.status_code == 403
    assert exc.value.detail["code"] == "HUMAN_APPROVAL_REQUIRED"
    assert exc.value.detail["approvalBridge"] == "NOT_IMPLEMENTED_LIVE_EXECUTION_FAIL_CLOSED"


def test_demo_material_action_boundary_does_not_block(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(controlled.legacy, "TRADING212_ENV", "demo")
    controlled._block_live_material_action()


def test_legacy_compatibility_entrypoint_also_blocks_live(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "TRADING212_ENV", "live")
    with pytest.raises(HTTPException) as exc:
        main._block_live_material_action()
    assert exc.value.status_code == 403
    assert exc.value.detail["code"] == "HUMAN_APPROVAL_REQUIRED"
