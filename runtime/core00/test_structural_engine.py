import unittest

from runtime.core00.structural_engine import StructuralEngine


class TestStructuralEngine(unittest.TestCase):
    def test_valid_uo_structure(self):
        valid_uo = {
            "version": "1.1",
            "input_manifest": {"source_type": "text"},
            "history": {"current_version": 1},
            "identity": {"essence": "test"},
            "resolution_state": {"overall_resolution": "resolved"},
            "assertions": [],
            "evidence": [],
        }
        result = StructuralEngine.validate_uo(valid_uo)
        self.assertTrue(result["passed"])
        self.assertEqual(result["violationCount"], 0)

    def test_case_030_violations(self):
        malformed_uo = {
            "version": "1.1",
            "input_manifest": {"source_type": "text"},
            "history": {"current_version": 1},
            "identity": {"essence": "test"},
            "resolution_state": {"overall_resolution": "resolved"},
            "assertions": [{
                "assertion_id": "AST-001",
                "confidence": {"source_fidelity": 2.5},
            }],
            "evidence": [],
            "unauthorized_payload_injection": {"attack_vector": "overflow"},
        }
        result = StructuralEngine.validate_uo(malformed_uo)
        self.assertFalse(result["passed"])
        self.assertEqual(result["violationCount"], 2)
        locations = [v["location"] for v in result["violations"]]
        self.assertIn("root.unauthorized_payload_injection", locations)
        self.assertIn("assertions[0].confidence.source_fidelity", locations)


if __name__ == "__main__":
    unittest.main()
