from runtime.agentic_omega.cyclical_normalization import RefiningInput, FreightInput, refining_normalization, freight_cycle


def test_refiner_peak_crack_is_haircut():
    x = RefiningInput(36, 18, 94, 6, 6, 100, 1000, 500, 90, 100)
    r = refining_normalization(x)
    assert r["cycle_penalty"] == 50
    assert r["normalized_fcf_per_share"] < 10
    assert r["buyback_yield_pct"] > 0


def test_freight_rewards_deleveraging():
    x = FreightInput(10, 5, 2, 17, 17, 2.8, 2.2, 5, 90)
    r = freight_cycle(x)
    assert r["deleveraging_score"] > 50
    assert r["score"] > 60
