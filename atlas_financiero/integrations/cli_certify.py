"""CLI for FinancialData.Net live certification.

Usage:
    python -m atlas_financiero.integrations.cli_certify MSFT ASML.AS:intl

Suffix `:intl` routes the symbol through the provider international endpoints.
"""
from __future__ import annotations

import argparse
import json
from typing import List, Tuple

from .bootstrap import build_financialdatanet_adapter
from .live_certification import certify_basket


def parse_symbols(values: List[str]) -> List[Tuple[str, bool]]:
    basket: List[Tuple[str, bool]] = []
    for raw in values:
        international = raw.lower().endswith(":intl")
        symbol = raw[:-5] if international else raw
        symbol = symbol.strip()
        if not symbol:
            raise ValueError("Empty symbol")
        basket.append((symbol, international))
    return basket


def main() -> int:
    parser = argparse.ArgumentParser(description="Run ATLAS Ω FinancialData.Net live certification")
    parser.add_argument("symbols", nargs="+", help="Ticker(s); append :intl for international endpoints")
    args = parser.parse_args()

    adapter = build_financialdatanet_adapter()
    results = certify_basket(adapter, parse_symbols(args.symbols))
    print(json.dumps([result.to_dict() for result in results], indent=2, sort_keys=True))
    return 0 if all(r.status == "READY_FOR_LEVEL1_RECONCILIATION" for r in results) else 2


if __name__ == "__main__":
    raise SystemExit(main())
