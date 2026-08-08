from __future__ import annotations

import hashlib
import json
import unicodedata
from pathlib import Path


def compute_core_hash(raw_text: str) -> str:
    normalized = unicodedata.normalize("NFC", raw_text).replace("\r\n", "\n")
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


L0 = [
    ("CASE-001", "Ingestión básica de hecho único", "El beneficio neto de Microsoft Corporation en el ejercicio 2025 fue de 88100 millones de USD.\n"),
    ("CASE-002", "Ingestión multiaserción financiera", "NVIDIA reportó ingresos de 30000 millones de USD en el Q3 y un margen bruto del 75 por ciento.\n"),
    ("CASE-003", "Entidad canónica única", "Apple Inc. lanzó el chip M4 fabricado en proceso de 3 nanómetros.\n"),
    ("CASE-004", "Múltiplos de valoración", "ASML cotiza a un PER de 35 veces beneficios con un ROIC del 28 por ciento.\n"),
    ("CASE-005", "Estructura de deuda y caja", "Alphabet mantiene una posición de caja neta de 110000 millones de USD.\n"),
    ("CASE-006", "Retribución al accionista", "Meta Platforms autorizó un programa adicional de recompra de acciones por 50000 millones de USD.\n"),
    ("CASE-007", "Evolución de márgenes operativos", "Amazon AWS alcanzó un margen operativo del 38 por ciento en el segundo trimestre.\n"),
    ("CASE-008", "Free Cash Flow directo", "Free Cash Flow de Berkshire Hathaway ascendió a 25000 millones de USD en el semestre.\n"),
    ("CASE-009", "CapEx y gastos de capital", "TSMC proyecta un CapEx anual de 32000 millones de USD para expansión de capacidad.\n"),
    ("CASE-010", "Guidance corporativo estándar", "Broadcom eleva su estimación de ingresos anuales a 51000 millones de USD.\n"),
]
L1 = [
    ("CASE-011", "Ambigüedad de entidad por acrónimo", "La división de consumo de VLO aumentó sus ventas un 12 por ciento.\n"),
    ("CASE-012", "Mención temporal relativa", "La compañía duplicará sus entregas el próximo trimestre.\n"),
    ("CASE-013", "Homónimo de moneda sin ISO", "El dividendo distribuido fue de 2.5 dólares por acción.\n"),
    ("CASE-014", "Elipsis en sujeto de aserción", "Registró un crecimiento del EBITDA del 15 por ciento en Europa.\n"),
    ("CASE-015", "Rango de estimación amplio", "Los ingresos del ejercicio se situarán entre 1000 y 1500 millones.\n"),
    ("CASE-016", "Referencia geográfica indeterminada", "La planta del sur incrementó la producción un 20 por ciento.\n"),
    ("CASE-017", "Citable no atribuido", "Se prevé una reestructuración del 5 por ciento de la plantilla.\n"),
    ("CASE-018", "Métrica ajustada sin reconciliar", "El beneficio neto ajustado difiere del GAAP en un 25 por ciento.\n"),
]
L2 = [
    ("CASE-019", "Cifras de ingreso contradictorias", "Un reporte indica ingresos de 10B y otra nota prensa cita 12B para el mismo periodo.\n", "conflicted", None),
    ("CASE-020", "Conflicto entre Guidance y Realizado", "El guidance proyectaba 5B pero el reporte final auditado registró 4.1B.\n", "conflicted", None),
    ("CASE-021", "Conflicto prensa vs 10-K auditado", "Nota de prensa afirma deuda cero mientras el 10-K registra 2B de pasivo financiero.\n", "conflicted", None),
    ("CASE-022", "Supersesión por reexpresión de cuentas", "La reexpresión de cuentas de 2024 corrige el margen operativo del 20 al 16 por ciento.\n", "reconciled", "restatement_override"),
    ("CASE-023", "Conflicto de litigio contingente", "Demandante exige 1B pero la provisión contable de la empresa es de 100M.\n", "conflicted", None),
    ("CASE-024", "Discrepancia de fechas de cierre", "El cierre fiscal en Europa es 31 de diciembre pero la matriz consolida a 30 de septiembre.\n", "conflicted", None),
    ("CASE-025", "Colisión de identidades filiales", "Subsidiaria A asume deuda de Subsidiaria B pero el garante oficial es la matriz.\n", "conflicted", None),
    ("CASE-026", "Reconciliación por Fe de Erratas", "Fe de erratas oficial corrige el beneficio por acción reportado de 1.20 a 2.10 USD.\n", "reconciled", "official_errata_override"),
]
L3 = [
    ("CASE-027", "Hash mismatch en input manifest", "Texto físico alterado intencionalmente para provocar descalce criptográfico.\n"),
    ("CASE-028", "Firma de emisor no verificada", "Microsoft Corporation anuncia un dividendo extraordinario de 5.00 USD por acción con fecha de registro 15 de septiembre de 2026.\n"),
    ("CASE-029", "Referencia circular en derived claims", "La hipótesis A valida la tesis B. La tesis B justifica el informe C. El informe C fundamenta la hipótesis A.\n"),
    ("CASE-030", "Violación estructural additionalProperties", "Payload de prueba para validación de sobrecarga estructural y violaciones de esquema UO 1.1.\n"),
]


def build_case(case_id: str, level: str, title: str, raw_text: str, consistency="consistent", policy=None):
    ambiguous = level == "L1"
    issuer = "CN=Microsoft Investor Relations (Unverified CA)" if case_id == "CASE-028" else ("CN=Internal Analytics Engine (Verified)" if case_id == "CASE-029" else "CN=Internal Test Pipeline (Verified)")
    sig = "UNVERIFIED_ISSUER" if case_id == "CASE-028" else "VERIFIED"
    raw_hash = "0" * 64 if case_id == "CASE-027" else compute_core_hash(raw_text)
    uo = {
        "version": "1.1",
        "input_manifest": {"source_type": "text", "captured_at": "2026-08-08T12:00:00Z", "raw_hash": raw_hash, "hash_algorithm": "sha256", "normalization_profile": "CORE-HASH-v1", "authentication_proof": {"method": "digital_signature_rsa_sha256", "issuer": issuer, "signature_status": sig}},
        "history": {"current_version": 1, "evolution_log": [{"version": 1, "change_description": f"Ingestión de prueba {case_id}", "reason": f"Suite de validación {level}", "trigger_evidence_id": f"EVD-{case_id}-01"}]},
        "identity": {"essence": f"Objeto de prueba canónico {case_id}: {title}"},
        "resolution_state": {"dimensions": {"entity": 1.0, "temporal": 1.0, "unit": 1.0, "currency": 1.0, "location": 1.0}, "overall_resolution": "partial" if ambiguous or consistency == "conflicted" else "resolved", "consistency_state": consistency, "conflict_type": "ambiguity" if ambiguous else None, "requires_context": ambiguous, "blocking_dimensions": []},
        "reconciliation": {"status": "not_applicable" if not policy else "resolved", "resolved_by": None, "canonical_assertion": None, "policy": policy or "none"},
        "epistemic_summary": {"verified_assertions_count": 1, "supported_assertions_count": 0, "unverified_assertions_count": 0, "disputed_assertions_count": 0, "refuted_assertions_count": 0, "unknown_identification_confidence": 1.0, "unknown_coverage_estimate": 1.0, "canonical_status": "rejected" if level == "L3" else "accepted"},
        "context": {"purpose": f"Test case {case_id}"},
        "assertions": [{"assertion_id": "AST-001", "statement": raw_text.strip(), "class": "verified_fact", "status": "verified", "provenance_mode": "external_source", "confidence": {"source_fidelity": 2.5 if case_id == "CASE-030" else 1.0, "evidential_support": 1.0, "composite_confidence": 1.0}, "evidence_ids": [f"EVD-{case_id}-01"]}],
        "derived_claims": [],
        "evidence": [{"evidence_id": f"EVD-{case_id}-01", "source_origin": "Test Origin", "emission_date": "2026-08-08T12:00:00Z", "evidence_type": "primary_document", "uri_or_reference": f"REF-{case_id}", "confidence": 1.0, "verbatim_extract": raw_text.strip()}],
        "personal_relevance": {"domain": "financial", "weight": 5}, "freshness": {"category": "evergreen"}, "inaction_cost": {"level": "low", "justification": "Test"},
        "relations": {"mentions": [], "canonical_entities": [], "canonical_events": [], "typed_relations": []}, "actions": {"operational_state": "guardar", "action_mode": "inform", "next_step": "Test", "requires_user_confirmation": False},
        "value": {"importance": 5, "urgency": 1, "impact": 5, "reusability": 1, "global_confidence": 1.0, "novelty": 1}, "confidence_matrix": {"assertions": 1.0, "truth_status": 1.0, "insights": 1.0, "consequences": 1.0, "risks": 1.0, "opportunities": 1.0, "unknowns": 0.0},
    }
    if case_id == "CASE-029":
        uo["derived_claims"] = [{"claim_id": "CLM-001", "derived_from": ["CLM-003"]}, {"claim_id": "CLM-002", "derived_from": ["CLM-001"]}, {"claim_id": "CLM-003", "derived_from": ["CLM-002"]}]
    if case_id == "CASE-030":
        uo["unauthorized_payload_injection"] = {"attack_vector": "schema_violation"}
    return uo


def expected(case_id: str, level: str, consistency="consistent"):
    if case_id == "CASE-027": return {"terminal_status": "REJECT", "rejected_by": "HashEngine", "violation_code": None}
    if case_id == "CASE-028": return {"terminal_status": "QUARANTINED", "rejected_by": "AuthenticationEngine", "violation_code": "AUTHENTICITY.SOURCE_VERIFICATION_FAILED"}
    if case_id == "CASE-029": return {"terminal_status": "REJECT", "rejected_by": "ReferenceEngine", "violation_code": "REFERENCE.CIRCULAR_DEPENDENCY_DETECTED"}
    if case_id == "CASE-030": return {"terminal_status": "REJECT", "rejected_by": "StructuralEngine", "violation_code": "STRUCTURAL.SCHEMA_VALIDATION_FAILED"}
    if consistency == "reconciled": status = "PASS_RECONCILED"
    elif consistency == "conflicted": status = "PASS_WITH_CONFLICT"
    elif level == "L1": status = "PASS_AMBIGUOUS"
    else: status = "PASS"
    return {"terminal_status": status, "rejected_by": None, "violation_code": None}


def generate_fixtures():
    base = Path(__file__).resolve().parent / "cases"
    records = [(x, "L0", "consistent", None) for x in L0] + [(x, "L1", "consistent", None) for x in L1] + [((a,b,c), "L2", d, e) for a,b,c,d,e in L2] + [(x, "L3", "consistent", None) for x in L3]
    for (case_id, title, raw_text), level, consistency, policy in records:
        folder = base / case_id; folder.mkdir(parents=True, exist_ok=True)
        uo = build_case(case_id, level, title, raw_text, consistency, policy)
        (folder / "input.txt").write_text(raw_text, encoding="utf-8", newline="\n")
        (folder / "uo.json").write_text(json.dumps(uo, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        (folder / "expected-report.json").write_text(json.dumps(expected(case_id, level, consistency), indent=2) + "\n", encoding="utf-8")
        (folder / "metadata.yaml").write_text(f'case_id: {case_id}\nlevel: {level}\ntitle: "{title}"\nexpected_status: {expected(case_id, level, consistency)["terminal_status"]}\n', encoding="utf-8")
    print(f"Generated 30 deterministic CORE-00 fixtures in {base}")


if __name__ == "__main__":
    generate_fixtures()
