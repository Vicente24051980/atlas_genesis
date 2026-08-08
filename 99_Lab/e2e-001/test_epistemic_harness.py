import importlib.util
import json
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("epistemic_harness", ROOT / "epistemic_harness.py")
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class EpistemicHarnessBenchmark(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with (ROOT / "fixtures" / "cases.json").open("r", encoding="utf-8") as fh:
            cls.cases = json.load(fh)

    def test_fixture_contract(self):
        self.assertGreaterEqual(len(self.cases), 6)
        for case in self.cases:
            with self.subTest(case=case["name"]):
                result = MODULE.validate_and_route(case["item"])
                self.assertEqual(case["expected_status"], result.status)
                self.assertEqual(case["expected_route"], result.route)

    def test_interpretations_are_never_promoted(self):
        for canonical in (True, False):
            item = {
                "id": "guard-1",
                "text": "Author X argues Y.",
                "kind": "interpretation",
                "source": "source-1",
                "attributed_to": "Author X",
                "canonical_evidence": canonical,
                "truth_claim": "established",
                "attribution": "preserved",
            }
            result = MODULE.validate_and_route(item)
            self.assertEqual("REJECT", result.status)

    def test_attribution_is_preserved(self):
        item = {
            "id": "guard-2",
            "text": "Author X argues Y.",
            "kind": "interpretation",
            "source": "source-1",
            "attributed_to": "Author X",
            "canonical_evidence": False,
            "truth_claim": "not_established",
            "attribution": "none",
        }
        result = MODULE.validate_and_route(item)
        self.assertEqual("REJECT", result.status)
        self.assertIn("interpretation_attribution_must_be_preserved", result.reasons)

    def test_documentation_not_dogma(self):
        documentary_fact = {
            "id": "doc-1",
            "text": "Author X argues Y.",
            "kind": "fact",
            "source": "book-x-page-42",
            "canonical_evidence": True,
            "truth_claim": "established",
            "attribution": "preserved",
            "attributed_to": "Author X",
        }
        proposition = {
            "id": "doc-2",
            "text": "Y is objectively true.",
            "kind": "interpretation",
            "source": "book-x-page-42",
            "canonical_evidence": False,
            "truth_claim": "not_established",
            "attribution": "preserved",
            "attributed_to": "Author X",
        }
        self.assertEqual("PASS", MODULE.validate_and_route(documentary_fact).status)
        self.assertEqual("PASS", MODULE.validate_and_route(proposition).status)

    def test_malformed_input_rejected(self):
        result = MODULE.validate_and_route({"id": "bad"})
        self.assertEqual("REJECT", result.status)
        self.assertEqual("rejected", result.route)


if __name__ == "__main__":
    unittest.main()
