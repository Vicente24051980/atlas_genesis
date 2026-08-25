"""ATLAS Ω — cyclical owner-economics normalization.

CURRENT FCF != NORMALIZED FCF
LOW PE AT PEAK EARNINGS != CHEAP
CREDIT IMPROVEMENT != CYCLE IMMUNITY
"""
from dataclasses import dataclass


def _clip(x: float) -> float:
    return max(0.0, min(100.0, float(x)))


@dataclass(frozen=True)
class RefiningInput:
    current_crack: float
    normalized_crack_3_5y: float
    utilization_pct: float
    operating_cost_per_bbl: float
    normalized_operating_cost_per_bbl: float
    maintenance_capex: float
    normalized_ebitda: float
    net_debt: float
    shares_now: float
    shares_year_ago: float


def refining_normalization(x: RefiningInput) -> dict:
    if min(x.current_crack, x.normalized_crack_3_5y, x.shares_now, x.shares_year_ago) <= 0:
        raise ValueError("positive crack spreads and share counts required")
    crack_factor = min(1.0, x.normalized_crack_3_5y / x.current_crack)
    cost_factor = min(1.0, x.normalized_operating_cost_per_bbl / max(x.operating_cost_per_bbl, .01))
    utilization_factor = _clip(x.utilization_pct) / 100.0
    cycle_penalty = _clip((1.0-crack_factor)*100)
    buyback_yield = (x.shares_year_ago-x.shares_now)/x.shares_year_ago*100
    normalized_fcf = max(0.0, x.normalized_ebitda*crack_factor*cost_factor*utilization_factor - x.maintenance_capex)
    normalized_fcf_per_share = normalized_fcf/x.shares_now
    return {"normalized_fcf": normalized_fcf,
            "normalized_fcf_per_share": normalized_fcf_per_share,
            "cycle_penalty": cycle_penalty,
            "buyback_yield_pct": buyback_yield,
            "leverage_flag": x.net_debt > x.normalized_ebitda*2.5}


@dataclass(frozen=True)
class FreightInput:
    revenue_growth: float
    yield_growth: float
    volume_growth: float
    ebitda_margin: float
    normalized_margin: float
    debt_to_ebitda: float
    next_year_debt_to_ebitda: float
    productivity_gain: float
    network_utilization: float


def freight_cycle(x: FreightInput) -> dict:
    margin_quality = 100 - min(100, abs(x.ebitda_margin-x.normalized_margin)*5)
    deleveraging = _clip((x.debt_to_ebitda-x.next_year_debt_to_ebitda)*50 + 50)
    demand = _clip(50 + 4*x.volume_growth + 2*x.yield_growth)
    execution = _clip(50 + 3*x.productivity_gain + .3*x.network_utilization)
    score = .25*margin_quality + .25*deleveraging + .25*demand + .25*execution
    state = "NORMALIZED_GREEN" if score >= 75 and x.next_year_debt_to_ebitda <= 2.5 else "WATCH"
    return {"score": _clip(score), "state": state,
            "deleveraging_score": deleveraging, "demand_score": demand}
