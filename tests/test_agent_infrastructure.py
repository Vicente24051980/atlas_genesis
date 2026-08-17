from api.agent_infrastructure import EvidenceClass,EvidenceEnvelope
def test_external_evidence_defaults_noncanonical():
 e=EvidenceEnvelope.build(source="x",source_type="web",content="evidence");assert e.canonical is False;assert e.classification==EvidenceClass.UNCLASSIFIED;assert len(e.content_hash)==64
def test_hash_is_content_addressed():
 assert EvidenceEnvelope.build(source="a",source_type="api",content="same").content_hash==EvidenceEnvelope.build(source="b",source_type="memory",content="same").content_hash
def test_memory_never_promoted_by_ingestion():
 e=EvidenceEnvelope.build(source="mem0",source_type="memory",content="context");assert e.canonical is False and e.classification==EvidenceClass.UNCLASSIFIED
