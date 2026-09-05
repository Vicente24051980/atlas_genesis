import numpy as np
import pandas as pd

from atlas_quant_portfolio_audit import calc_metrics, empirical_knee, local_search_best_set, max_drawdown, risk_contribution


def synthetic_returns(seed=7, n_days=756):
    rng = np.random.default_rng(seed)
    idx = pd.bdate_range('2023-01-02', periods=n_days)
    market = rng.normal(0.0004, 0.009, n_days)
    data = {}
    for i, t in enumerate(['A','B','C','D','E','F']):
        alpha = 0.00015 * (5-i)
        noise = rng.normal(0, 0.004 + i*0.0005, n_days)
        data[t] = alpha + (0.55 + i*0.05)*market + noise
    return pd.DataFrame(data, index=idx), pd.Series(market, index=idx)


def test_max_drawdown_is_negative():
    wealth = pd.Series([1.0,1.2,0.9,1.3])
    assert max_drawdown(wealth) < 0


def test_metrics_are_finite():
    r, spy = synthetic_returns()
    m = calc_metrics(r,['A','B','C'],spy)
    assert np.isfinite(m.cagr)
    assert m.annualized_vol > 0
    assert m.max_drawdown <= 0
    assert np.isfinite(m.beta_vs_spy)


def test_risk_contribution_sums_to_one():
    r,_ = synthetic_returns()
    rc = risk_contribution(r,['A','B','C'])
    assert abs(sum(rc.values()) - 1.0) < 1e-8


def test_local_search_returns_requested_n():
    r,spy = synthetic_returns()
    m = local_search_best_set(r,list(r.columns),4,spy,list(r.columns))
    assert m.n == 4
    assert len(m.tickers) == 4


def test_empirical_knee_is_research_only_mechanical_rule():
    r,spy = synthetic_returns()
    frontier = [local_search_best_set(r,list(r.columns),n,spy,list(r.columns)) for n in range(2,6)]
    n,reason = empirical_knee(frontier,threshold=1.0)
    assert n == 2
    assert 'threshold' in reason
