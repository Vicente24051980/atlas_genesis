from api.screener import _passes


def _row(**overrides):
    base = {
        "marketCap": 50.0,
        "pe": 20.0,
        "beta": 1.0,
        "roic": 25.0,
        "day": 1.0,
        "above200dma": True,
        "ret1y": 15.0,
        "ret2y": 30.0,
    }
    base.update(overrides)
    return base


def test_all_active_filters_pass_only_when_every_field_passes():
    assert _passes(_row(), 10, 25, 1.2, 20, True, True, True, True)
    assert not _passes(_row(beta=1.3), 10, 25, 1.2, 20, True, True, True, True)


def test_missing_value_never_passes_an_active_filter():
    assert not _passes(_row(roic=None), None, None, None, 20, False, False, False, False)
    assert not _passes(_row(ret2y=None), None, None, None, None, False, False, False, True)


def test_missing_value_is_allowed_when_filter_is_inactive():
    assert _passes(_row(roic=None, beta=None, pe=None), None, None, None, None, False, False, False, False)
