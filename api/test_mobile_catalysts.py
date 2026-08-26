from __future__ import annotations

import asyncio

from api import main as legacy
from api.mobile_catalysts import mobile_catalysts


def test_catalysts_without_provider_token_fails_closed(monkeypatch) -> None:
    monkeypatch.setattr(legacy, "FINNHUB_TOKEN", "")
    payload = asyncio.run(mobile_catalysts(days=14))
    assert payload["earnings"]["state"] == "DATA_GATE"
    assert payload["macro"]["state"] == "DATA_GATE"
    assert payload["earnings"]["items"] == []
    assert payload["macro"]["items"] == []
    assert "never converted" in payload["guardrails"][0]
