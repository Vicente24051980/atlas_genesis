import unittest

from runtime.core00.reference_engine import ReferenceEngine


class TestReferenceEngine(unittest.TestCase):
    def test_acyclic_graph_passes(self):
        valid_uo = {
            "derived_claims": [
                {"claim_id": "CLM-001", "derived_from": ["AST-001"]},
                {"claim_id": "CLM-002", "derived_from": ["CLM-001"]},
            ]
        }
        res = ReferenceEngine.validate_references(valid_uo)
        self.assertTrue(res["passed"])
        self.assertEqual(res["violationCount"], 0)

    def test_case_029_circular_dependency(self):
        circular_uo = {
            "derived_claims": [
                {"claim_id": "CLM-001", "derived_from": ["CLM-003"]},
                {"claim_id": "CLM-002", "derived_from": ["CLM-001"]},
                {"claim_id": "CLM-003", "derived_from": ["CLM-002"]},
            ]
        }
        res = ReferenceEngine.validate_references(circular_uo)
        self.assertFalse(res["passed"])
        self.assertEqual(res["execution_status"], "FATAL_REJECT")
        self.assertEqual(
            res["violations"][0]["code"],
            "REFERENCE.CIRCULAR_DEPENDENCY_DETECTED",
        )
        self.assertIn(
            "CLM-001 -> CLM-003 -> CLM-002 -> CLM-001",
            res["violations"][0]["message"],
        )


if __name__ == "__main__":
    unittest.main()
