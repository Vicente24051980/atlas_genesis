"""Runtime bootstrap for the FinancialData.Net provider."""
from __future__ import annotations

import os

from .financialdatanet_adapter import FinancialDataNetAdapter


def build_financialdatanet_adapter() -> FinancialDataNetAdapter:
    api_key = os.getenv("FINANCIALDATANET_API_KEY")
    if not api_key:
        raise RuntimeError(
            "FINANCIALDATANET_API_KEY is not configured. Store it in the runtime secret/environment; never commit it."
        )

    try:
        from fdnpy import FinancialDataClient
    except ImportError as exc:
        raise RuntimeError("fdnpy is not installed. Install it with: pip install fdnpy") from exc

    return FinancialDataNetAdapter(FinancialDataClient(api_key=api_key))
