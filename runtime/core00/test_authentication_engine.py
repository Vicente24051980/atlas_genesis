import unittest

from authentication_engine import AuthenticationEngine


class TestAuthenticationEngine(unittest.TestCase):
    def test_verified_issuer(self):
        valid_uo = {
            "input_manifest": {
                "authentication_proof": {
                    "method": "digital_signature_rsa_sha256",
                    "issuer": "CN=Internal Test Pipeline (Verified)",
                    "signature_status": "VERIFIED",
                }
            }
        }
        res = AuthenticationEngine.verify_authenticity(valid_uo)
        self.assertTrue(res["passed"])
        self.assertEqual(res["execution_status"], "VERIFIED")

    def test_unverified_issuer_quarantined(self):
        unverified_uo = {
            "input_manifest": {
                "authentication_proof": {
                    "method": "digital_signature_rsa_sha256",
                    "issuer": "CN=Microsoft Investor Relations (Unverified CA)",
                    "signature_status": "UNVERIFIED_ISSUER",
                }
            }
        }
        res = AuthenticationEngine.verify_authenticity(unverified_uo)
        self.assertFalse(res["passed"])
        self.assertEqual(res["execution_status"], "QUARANTINED")
        self.assertEqual(res["violations"][0]["code"], "AUTHENTICITY.SOURCE_VERIFICATION_FAILED")


if __name__ == "__main__":
    unittest.main()
