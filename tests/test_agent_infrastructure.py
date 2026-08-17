from api.agent_infrastructure import EvidenceClass, EvidenceEnvelope


def test_evidence_envelope_is_noncanonical_by_default():
    item = EvidenceEnvelope.build(source="https://example.com", source_type="web", content="evidence")
    assert item.canonical is False
    assert item.classification == EvidenceClass.UNCLASSIFIED
    assert len(item.content_hash) == 64


def test_same_content_has_same_hash():
    a = EvidenceEnvelope.build(source="a", source_type="api", content="same")
    b = EvidenceEnvelope.build(source="b", source_type="api", content="same")
    assert a.content_hash == b.content_hash


def test_memory_is_allowed_as_source_but_not_fact_by_default():
    item = EvidenceEnvelope.build(source="mem0", source_type="memory", content="remembered context")
    assert item.source_type == "memory"
    assert item.classification == EvidenceClass.UNCLASSIFIED
    assert item.canonical is False
