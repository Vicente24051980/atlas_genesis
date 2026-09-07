from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

UNIVERSE_VERSION = 'ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06'
DEFAULT_API_BASE = 'https://atlas-genesis.onrender.com'


def _get_json(url: str, retries: int = 4, timeout: int = 30) -> Any:
    req = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': 'ATLAS-PointZero/1.0'})
    last: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return json.loads(response.read().decode('utf-8'))
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            last = exc
            if isinstance(exc, urllib.error.HTTPError) and exc.code not in {429, 500, 502, 503, 504}:
                break
            time.sleep(min(12.0, 1.0 * (2 ** attempt)))
    raise RuntimeError(f'QUOTE_FETCH_FAILED:{last.__class__.__name__ if last else "UNKNOWN"}')


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


def _num(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) else None


def _latest_shares(row: dict[str, Any]) -> float | None:
    block = row.get('pointInTimeFacts') if isinstance(row.get('pointInTimeFacts'), dict) else {}
    item = block.get('shares_outstanding') if isinstance(block.get('shares_outstanding'), dict) else None
    return _num(item.get('value')) if item else None


def _quote_price(payload: dict[str, Any]) -> float | None:
    data = payload.get('data') if isinstance(payload.get('data'), dict) else payload
    for key in ('c', 'current', 'price'):
        value = _num(data.get(key)) if isinstance(data, dict) else None
        if value is not None and value > 0:
            return value
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--e1-matrix', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path('artifacts/point_zero_market_overlay.jsonl'))
    parser.add_argument('--summary', type=Path, default=Path('artifacts/point_zero_market_overlay_summary.json'))
    parser.add_argument('--api-base', default=DEFAULT_API_BASE)
    parser.add_argument('--sleep', type=float, default=1.05)
    args = parser.parse_args()

    rows = _load_jsonl(args.e1_matrix)
    if len(rows) != 487:
        raise SystemExit(f'E1_MATRIX_ROW_COUNT_MISMATCH:{len(rows)}')
    args.output.parent.mkdir(parents=True, exist_ok=True)

    out: list[dict[str, Any]] = []
    price_ok = 0
    market_cap_ok = 0
    fcf_yield_ok = 0
    for row in rows:
        ticker = str(row['ticker'])
        price = None
        error = None
        try:
            encoded = urllib.parse.quote(ticker, safe='.-')
            payload = _get_json(f"{args.api_base.rstrip('/')}/v1/quote/{encoded}")
            price = _quote_price(payload)
            if price is None:
                error = 'QUOTE_PRICE_UNKNOWN'
        except Exception as exc:
            error = exc.__class__.__name__
        if price is not None:
            price_ok += 1

        shares = _latest_shares(row)
        market_cap = price * shares if price is not None and shares is not None and shares > 0 else None
        if market_cap is not None:
            market_cap_ok += 1

        descriptors = row.get('descriptors') if isinstance(row.get('descriptors'), dict) else {}
        fcf = _num(descriptors.get('annualFcfUsd'))
        fcf_yield = (fcf / market_cap * 100.0) if fcf is not None and market_cap not in (None, 0) else None
        if fcf_yield is not None:
            fcf_yield_ok += 1

        out.append({
            'universeVersion': UNIVERSE_VERSION,
            'ticker': ticker,
            'pointZeroPriorAdvantage': 0,
            'currentPortfolioStateConsumed': False,
            'retrievedAt': datetime.now(timezone.utc).isoformat(),
            'price': price,
            'priceSource': 'ATLAS_PUBLIC_BACKEND_FINNHUB_SECONDARY' if price is not None else 'UNKNOWN',
            'quoteError': error,
            'sharesOutstandingSec': shares,
            'marketCapDerivedUsd': market_cap,
            'annualRevenueGrowthPct': _num(descriptors.get('annualRevenueGrowthPct')),
            'annualNetIncomeGrowthPct': _num(descriptors.get('annualNetIncomeGrowthPct')),
            'annualFcfUsd': fcf,
            'annualFcfYieldPct': fcf_yield,
            'screeningDescriptorOnly': True,
            'expectedReturn3to6Y': None,
            'expectedReturnStatus': 'UNKNOWN_NOT_MODELED',
            'rankingAuthorized': False,
        })
        time.sleep(max(0.0, args.sleep))

    with args.output.open('w', encoding='utf-8') as fh:
        for row in out:
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + '\n')

    summary = {
        'runType': 'POINT_ZERO_MARKET_OVERLAY',
        'universeVersion': UNIVERSE_VERSION,
        'rowCount': len(out),
        'priceCoverageCount': price_ok,
        'derivedMarketCapCoverageCount': market_cap_ok,
        'fcfYieldCoverageCount': fcf_yield_ok,
        'expectedReturnModeledCount': 0,
        'rankingAuthorized': False,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
    }
    args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True), encoding='utf-8')
    print(json.dumps(summary, sort_keys=True))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
