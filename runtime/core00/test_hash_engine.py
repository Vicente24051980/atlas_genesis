import unittest

from runtime.core00.hash_engine import HashEngine
from runtime.core00.validation_harness import Core00Harness


class HashEngineTests(unittest.TestCase):
    def test_hash_round_trip_passes(self):
        raw = "ATLAS Ω\r\nCORE-00"
        declared = HashEngine.compute_raw_hash(raw)
        result = HashEngine.verify_integrity(raw, declared)
        self.assertTrue(result.passed)
        self.assertIsNone(result.violation)

    def test_crlf_normalizes_to_lf(self):
        self.assertEqual(
            HashEngine.compute_raw_hash("a\r\nb"),
            HashEngine.compute_raw_hash("a\nb"),
        )

    def test_unicode_normalizes_to_nfc(self):
        composed = "é"
        decomposed = "e\u0301"
        self.assertEqual(
            HashEngine.compute_raw_hash(composed),
            HashEngine.compute_raw_hash(decomposed),
        )

    def test_mismatch_fails_fast(self):
        result = Core00Harness.validate_text_payload("payload", "0" * 64)
        self.assertFalse(result.admitted)
        self.assertEqual("REJECT", result.terminal_status)
        self.assertEqual(1, len(result.steps))
        self.assertEqual("HashEngine", result.steps[0].engine)

    def test_valid_hash_does_not_claim_core_pass(self):
        raw = "payload"
        result = Core00Harness.validate_text_payload(raw, HashEngine.compute_raw_hash(raw))
        self.assertFalse(result.admitted)
        self.assertEqual("RUNTIME_PENDING", result.terminal_status)
        self.assertEqual(5, len(result.steps))
        self.assertEqual("PASS", result.steps[0].status)
        self.assertTrue(all(step.status == "NOT_IMPLEMENTED" for step in result.steps[1:]))


if __name__ == "__main__":
    unittest.main()
