import os

import pytest

from atlas_financiero.integrations.bootstrap import build_financialdatanet_adapter


def test_bootstrap_requires_secret(monkeypatch):
    monkeypatch.delenv("FINANCIALDATANET_API_KEY", raising=False)
    with pytest.raises(RuntimeError, match="FINANCIALDATANET_API_KEY"):
        build_financialdatanet_adapter()
