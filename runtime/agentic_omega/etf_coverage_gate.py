"""ATLAS Ω — ETF Coverage Gate.

Prevents accidental duplication of regional exposure already owned through ETFs.
ETF exposure is the base layer; an individual security in a covered region must
clear an explicit incremental-conviction hurdle before Competition for Capital.

Canonical law:
    ETF COVERAGE != INDIVIDUAL OVERWEIGHT THESIS
    ETF COVERAGE -> OVERWEIGHT GATE -> COMPETITION FOR CAPITAL
"""
from dataclasses import dataclass
from typing import Iterable, Mapping, Optional


@dataclass(frozen=True)
class ETFCoverage:
    ticker: str
    region: str
    weight_pct: float
    source_etf: str


@dataclass(frozen=True)
class OverweightCase:
    ticker: str
    region: str
    expected_return_edge: float
    economic_proof: float
    quality: float
    evidence_completeness: float = 100.0


def etf_coverage_gate(
    candidate: OverweightCase,
    holdings: Iterable[ETFCoverage],
    *,
    material_weight_pct: float = 0.50,
    min_expected_return_edge: float = 5.0,
    min_economic_proof: float = 70.0,
    min_quality: float = 70.0,
    min_evidence: float = 70.0,
) -> dict:
    """Return a fail-closed decision on whether an individual stock may proceed.

    ``expected_return_edge`` is the candidate's expected-return advantage in
    percentage points versus the relevant ETF/base exposure. Coverage below the
    material threshold is reported but does not block the candidate.
    """
    matches = [h for h in holdings if h.ticker == candidate.ticker]
    total_weight = sum(h.weight_pct for h in matches)
    materially_covered = total_weight >= material_weight_pct

    if candidate.evidence_completeness < min_evidence:
        decision = "INSUFFICIENT_EVIDENCE"
        clears = False
    elif not materially_covered:
        decision = "PROCEED_TO_COMPETITION"
        clears = True
    else:
        clears = (
            candidate.expected_return_edge >= min_expected_return_edge
            and candidate.economic_proof >= min_economic_proof
            and candidate.quality >= min_quality
        )
        decision = "OVERWEIGHT_JUSTIFIED" if clears else "ETF_COVERAGE_SUFFICIENT"

    return {
        "ticker": candidate.ticker,
        "region": candidate.region,
        "covered": bool(matches),
        "materially_covered": materially_covered,
        "aggregate_etf_weight_pct": round(total_weight, 4),
        "source_etfs": sorted({h.source_etf for h in matches}),
        "clears_etf_coverage_gate": clears,
        "decision": decision,
    }


def regional_coverage(regions: Iterable[str]) -> Mapping[str, bool]:
    """Normalize the canonical regional ETF base into a lookup."""
    return {region.strip().lower(): True for region in regions if region.strip()}


CANONICAL_REGIONAL_ETF_BASE = regional_coverage(
    ("Korea", "Taiwan", "China", "Japan", "Europe")
)
