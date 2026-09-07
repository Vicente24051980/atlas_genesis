from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

UNIVERSE_VERSION = 'ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06'
DEFAULT_UNIVERSE = Path('data/atlas-core-universe-economic-entities-2026-09-06.txt')
SEC_TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json'
SEC_DERIVED_TICKER_TO_CIK_URL = 'https://raw.githubusercontent.com/jadchaar/sec-cik-mapper/main/mappings/stocks/ticker_to_cik.json'
SEC_DERIVED_TICKER_TO_NAME_URL = 'https://raw.githubusercontent.com/jadchaar/sec-cik-mapper/main/mappings/stocks/ticker_to_company_name.json'
SEC_FACTS_URL = 'https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json'
USER_AGENT = 'ATLAS-Research/1.1 (contact via github.com/Vicente24051980/atlas_genesis/issues)'

FLOW_TAGS = {
    'revenue': [
        'RevenueFromContractWithCustomerExcludingAssessedTax',
        'Revenues',
        'SalesRevenueNet',
    ],
    'net_income': ['NetIncomeLoss', 'ProfitLoss'],
    'operating_cash_flow': ['NetCashProvidedByUsedInOperatingActivities'],
    'capex': [
        'PaymentsToAcquirePropertyPlantAndEquipment',
        'PaymentsToAcquireProductiveAssets',
    ],
}

POINT_TAGS = {
    'assets': ['Assets'],
    'liabilities': ['Liabilities'],
    'equity': ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],
    'cash': ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'],
    'shares_outstanding': ['CommonStockSharesOutstanding'],
    'long_term_debt': [
        'LongTermDebtAndFinanceLeaseObligations',
        'LongTermDebt',
        'LongTermDebtNoncurrent',
    ],
}


@dataclass(frozen=True)
class Observation:
    value: float | int
    unit: str
    filed: str
    period_end: str
    form: str
    fy: int | None
    fp: str | None
    accession: str | None
    tag: str


def _tokens(path: Path) -> list[str]:
    out: list[str] = []
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        out.extend(line.split())
    return out


def _get_json(url: str, *, retries: int = 4, timeout: int = 30) -> Any:
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': USER_AGENT,
            'Accept-Encoding': 'identity',
            'Accept': 'application/json',
        },
    )
    last: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return json.loads(response.read().decode('utf-8'))
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            last = exc
            if isinstance(exc, urllib.error.HTTPError) and exc.code not in {403, 429, 500, 502, 503, 504}:
                break
            time.sleep(min(8.0, 0.75 * (2 ** attempt)))
    if isinstance(last, urllib.error.HTTPError):
        detail = f'HTTP_{last.code}'
    else:
        detail = last.__class__.__name__ if last else 'UNKNOWN'
    raise RuntimeError(f'FETCH_FAILED:{url}:{detail}')


def _official_ticker_map(payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for row in payload.values():
        if not isinstance(row, dict):
            continue
        ticker = str(row.get('ticker', '')).upper().strip()
        if ticker:
            out[ticker] = {
                'cik_str': row.get('cik_str'),
                'title': row.get('title'),
                'mapping_source': 'SEC_OFFICIAL_COMPANY_TICKERS',
            }
    return out


def _derived_ticker_map(cik_payload: dict[str, Any], name_payload: dict[str, Any] | None) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    names = name_payload if isinstance(name_payload, dict) else {}
    for ticker_raw, cik_raw in cik_payload.items():
        ticker = str(ticker_raw).upper().strip()
        cik = str(cik_raw).strip()
        if not ticker or not cik:
            continue
        out[ticker] = {
            'cik_str': cik,
            'title': names.get(ticker),
            'mapping_source': 'SEC_DERIVED_DAILY_MAPPING_SEC_CIK_MAPPER_GITHUB',
        }
    return out


def _load_ticker_map() -> tuple[dict[str, dict[str, Any]], str, str | None]:
    try:
        official = _official_ticker_map(_get_json(SEC_TICKERS_URL))
        if official:
            return official, 'SEC_OFFICIAL_COMPANY_TICKERS', None
    except Exception as exc:
        official_error = str(exc)
    else:
        official_error = 'SEC_OFFICIAL_MAPPING_EMPTY'

    cik_payload = _get_json(SEC_DERIVED_TICKER_TO_CIK_URL)
    try:
        name_payload = _get_json(SEC_DERIVED_TICKER_TO_NAME_URL)
    except Exception:
        name_payload = None
    derived = _derived_ticker_map(cik_payload, name_payload)
    if not derived:
        raise RuntimeError('SEC_DERIVED_TICKER_MAPPING_EMPTY')
    return derived, 'SEC_DERIVED_DAILY_MAPPING_SEC_CIK_MAPPER_GITHUB', official_error


def _units_for_tag(facts: dict[str, Any], tag: str) -> dict[str, list[dict[str, Any]]]:
    for taxonomy in ('us-gaap', 'ifrs-full'):
        block = facts.get(taxonomy)
        if not isinstance(block, dict):
            continue
        row = block.get(tag)
        if isinstance(row, dict) and isinstance(row.get('units'), dict):
            return row['units']
    return {}


def _candidate_rows(facts: dict[str, Any], tags: list[str]) -> list[tuple[str, str, dict[str, Any]]]:
    rows: list[tuple[str, str, dict[str, Any]]] = []
    for tag in tags:
        units = _units_for_tag(facts, tag)
        for unit, observations in units.items():
            if unit not in {'USD', 'shares'}:
                continue
            if not isinstance(observations, list):
                continue
            for obs in observations:
                if isinstance(obs, dict) and isinstance(obs.get('val'), (int, float)):
                    rows.append((tag, unit, obs))
    return rows


def _to_observation(tag: str, unit: str, obs: dict[str, Any]) -> Observation:
    return Observation(
        value=obs['val'], unit=unit, filed=str(obs.get('filed', '')),
        period_end=str(obs.get('end', '')), form=str(obs.get('form', '')),
        fy=obs.get('fy') if isinstance(obs.get('fy'), int) else None,
        fp=str(obs.get('fp')) if obs.get('fp') is not None else None,
        accession=str(obs.get('accn')) if obs.get('accn') is not None else None,
        tag=tag,
    )


def _latest_annual(facts: dict[str, Any], tags: list[str]) -> tuple[Observation | None, Observation | None]:
    rows = []
    for tag, unit, obs in _candidate_rows(facts, tags):
        form = str(obs.get('form', ''))
        fp = str(obs.get('fp', ''))
        if form in {'10-K', '20-F', '40-F'} and fp == 'FY' and isinstance(obs.get('fy'), int):
            rows.append(_to_observation(tag, unit, obs))
    by_fy: dict[int, Observation] = {}
    for row in rows:
        existing = by_fy.get(row.fy or -1)
        if existing is None or (row.filed, row.period_end) > (existing.filed, existing.period_end):
            by_fy[row.fy or -1] = row
    ordered = sorted(by_fy.values(), key=lambda x: (x.fy or -1, x.filed), reverse=True)
    return (ordered[0] if ordered else None, ordered[1] if len(ordered) > 1 else None)


def _latest_point(facts: dict[str, Any], tags: list[str]) -> Observation | None:
    rows = []
    for tag, unit, obs in _candidate_rows(facts, tags):
        if str(obs.get('form', '')) in {'10-Q', '10-K', '20-F', '40-F', '6-K'}:
            rows.append(_to_observation(tag, unit, obs))
    if not rows:
        return None
    return max(rows, key=lambda x: (x.period_end, x.filed))


def _obs_dict(obs: Observation | None) -> dict[str, Any] | None:
    return None if obs is None else {
        'value': obs.value, 'unit': obs.unit, 'filed': obs.filed,
        'periodEnd': obs.period_end, 'form': obs.form, 'fy': obs.fy,
        'fp': obs.fp, 'accession': obs.accession, 'tag': obs.tag,
        'source': 'SEC_COMPANYFACTS',
    }


def _growth_pct(current: Observation | None, prior: Observation | None) -> float | None:
    if current is None or prior is None or prior.value == 0:
        return None
    return (float(current.value) / float(prior.value) - 1.0) * 100.0


def _fcf(current_ocf: Observation | None, current_capex: Observation | None) -> float | None:
    if current_ocf is None or current_capex is None:
        return None
    return float(current_ocf.value) - abs(float(current_capex.value))


def _record(ticker: str, cik_row: dict[str, Any] | None, companyfacts: dict[str, Any] | None, error: str | None) -> dict[str, Any]:
    base: dict[str, Any] = {
        'universeVersion': UNIVERSE_VERSION,
        'ticker': ticker,
        'pointZeroPriorAdvantage': 0,
        'currentPortfolioStateConsumed': False,
        'retrievedAt': datetime.now(timezone.utc).isoformat(),
        'sourceClass': 'PRIMARY_REGULATORY',
        'provider': 'SEC_EDGAR_COMPANYFACTS',
        'status': 'UNKNOWN' if error else 'CAPTURED',
        'error': error,
    }
    if cik_row is None:
        return {**base, 'status': 'UNKNOWN_NO_SEC_TICKER_MAPPING', 'e2Ready': False}
    base['cik'] = str(cik_row.get('cik_str', '')).zfill(10)
    base['secTitle'] = cik_row.get('title')
    base['tickerMappingSource'] = cik_row.get('mapping_source')
    if companyfacts is None:
        return {**base, 'e2Ready': False}

    facts = companyfacts.get('facts') if isinstance(companyfacts.get('facts'), dict) else {}
    annual: dict[str, dict[str, Any] | None] = {}
    missing: list[str] = []
    for field, tags in FLOW_TAGS.items():
        cur, prior = _latest_annual(facts, tags)
        annual[field] = _obs_dict(cur)
        annual[f'{field}_prior'] = _obs_dict(prior)
        if cur is None:
            missing.append(field)
    points: dict[str, dict[str, Any] | None] = {}
    for field, tags in POINT_TAGS.items():
        point = _latest_point(facts, tags)
        points[field] = _obs_dict(point)
        if point is None and field in {'assets', 'liabilities', 'equity'}:
            missing.append(field)

    rev_cur, rev_prior = _latest_annual(facts, FLOW_TAGS['revenue'])
    ni_cur, ni_prior = _latest_annual(facts, FLOW_TAGS['net_income'])
    ocf_cur, _ = _latest_annual(facts, FLOW_TAGS['operating_cash_flow'])
    capex_cur, _ = _latest_annual(facts, FLOW_TAGS['capex'])
    descriptors = {
        'annualRevenueGrowthPct': _growth_pct(rev_cur, rev_prior),
        'annualNetIncomeGrowthPct': _growth_pct(ni_cur, ni_prior),
        'annualFcfUsd': _fcf(ocf_cur, capex_cur),
    }
    critical_fundamental = {'revenue', 'operating_cash_flow', 'assets', 'liabilities', 'equity'}
    fundamental_ready = not bool(critical_fundamental & set(missing))
    return {
        **base,
        'entityName': companyfacts.get('entityName'),
        'annualFacts': annual,
        'pointInTimeFacts': points,
        'descriptors': descriptors,
        'missingFields': sorted(set(missing)),
        'fundamentalCoverageReady': fundamental_ready,
        'valuationEvidenceStatus': 'UNKNOWN_REQUIRES_SEPARATE_PRICE_AND_VALUATION_LAYER',
        'e2Ready': False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--universe', type=Path, default=DEFAULT_UNIVERSE)
    parser.add_argument('--output', type=Path, default=Path('artifacts/point_zero_e1_sec_matrix.jsonl'))
    parser.add_argument('--summary', type=Path, default=Path('artifacts/point_zero_e1_sec_summary.json'))
    parser.add_argument('--offset', type=int, default=0)
    parser.add_argument('--limit', type=int, default=0, help='0 means all remaining entities')
    parser.add_argument('--sleep', type=float, default=0.13)
    args = parser.parse_args()

    universe = _tokens(args.universe)
    if len(universe) != 487 or len(set(universe)) != 487:
        raise SystemExit('CANONICAL_UNIVERSE_INTEGRITY_FAILURE')
    end = len(universe) if args.limit <= 0 else min(len(universe), args.offset + args.limit)
    selected = universe[args.offset:end]

    ticker_map, mapping_source, mapping_fallback_reason = _load_ticker_map()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, Any]] = []

    for ticker in selected:
        cik_row = ticker_map.get(ticker)
        if cik_row is None:
            records.append(_record(ticker, None, None, None))
            continue
        cik = str(cik_row['cik_str']).zfill(10)
        try:
            payload = _get_json(SEC_FACTS_URL.format(cik=cik))
            records.append(_record(ticker, cik_row, payload, None))
        except Exception as exc:
            records.append(_record(ticker, cik_row, None, str(exc)))
        time.sleep(max(0.0, args.sleep))

    with args.output.open('w', encoding='utf-8') as fh:
        for row in records:
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + '\n')

    captured = sum(r['status'] == 'CAPTURED' for r in records)
    mapped = sum(r.get('cik') is not None for r in records)
    fundamental_ready = sum(bool(r.get('fundamentalCoverageReady')) for r in records)
    summary = {
        'runType': 'POINT_ZERO_E1_SEC_EVIDENCE_CAPTURE',
        'universeVersion': UNIVERSE_VERSION,
        'requestedOffset': args.offset,
        'requestedCount': len(selected),
        'tickerMappingSource': mapping_source,
        'tickerMappingFallbackReason': mapping_fallback_reason,
        'secMappedCount': mapped,
        'capturedCount': captured,
        'fundamentalCoverageReadyCount': fundamental_ready,
        'e2ReadyCount': 0,
        'rankingAuthorized': False,
        'reasonRankingBlocked': 'VALUATION_AND_EXPECTED_RETURN_LAYER_NOT_CAPTURED_YET',
        'generatedAt': datetime.now(timezone.utc).isoformat(),
    }
    args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True), encoding='utf-8')
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
