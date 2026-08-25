from .rotation_integrity import RotationInput, RotationState, rotation_integrity

def test_confirmed_receiver():
    r=rotation_integrity(RotationInput(.02,.72,4,.8,.6,1,True))
    assert r.state == RotationState.CONFIRMED_RECEIVER
    assert r.executable

def test_stale_fails_closed():
    r=rotation_integrity(RotationInput(.03,.8,5,.9,.8,30,True))
    assert r.state == RotationState.INSUFFICIENT_EVIDENCE
    assert not r.executable

def test_subsector_cannot_proxy_sector():
    r=rotation_integrity(RotationInput(.02,.7,4,.8,.6,1,False))
    assert r.state == RotationState.INSUFFICIENT_EVIDENCE

def test_economic_divergence_blocks_execution():
    r=rotation_integrity(RotationInput(.02,.7,4,.3,.6,1,True))
    assert r.state == RotationState.CONFIRMED_RECEIVER
    assert not r.executable
