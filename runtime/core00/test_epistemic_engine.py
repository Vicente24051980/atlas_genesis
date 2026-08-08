import unittest

from runtime.core00.epistemic_engine import EpistemicEngine


class TestEpistemicEngine(unittest.TestCase):
    def test_happy_path_pass(self):
        uo_data = {
            "resolution_state": {
                "overall_resolution": "resolved",
                "consistency_state": "consistent",
            }
        }
        res = EpistemicEngine.evaluate_epistemics(uo_data)
        self.assertTrue(res["passed"])
        self.assertEqual(res["execution_status"], "PASS")

    def test_reconciled_errata(self):
        uo_data = {
            "resolution_state": {
                "overall_resolution": "resolved",
                "consistency_state": "reconciled",
            },
            "reconciliation": {"policy": "official_errata_override"},
        }
        res = EpistemicEngine.evaluate_epistemics(uo_data)
        self.assertEqual(res["execution_status"], "PASS_RECONCILED")
        self.assertEqual(
            res["violations"][0]["code"],
            "EVENT.EPISTEMIC_RECONCILIATION_APPLIED",
        )

    def test_conflict_unresolved(self):
        uo_data = {
            "resolution_state": {
                "overall_resolution": "partial",
                "consistency_state": "conflicted",
            }
        }
        res = EpistemicEngine.evaluate_epistemics(uo_data)
        self.assertEqual(res["execution_status"], "PASS_WITH_CONFLICT")

    def test_ambiguous_requires_context(self):
        uo_data = {
            "resolution_state": {
                "overall_resolution": "resolved",
                "consistency_state": "consistent",
                "requires_context": True,
            }
        }
        res = EpistemicEngine.evaluate_epistemics(uo_data)
        self.assertEqual(res["execution_status"], "PASS_AMBIGUOUS")


if __name__ == "__main__":
    unittest.main()
