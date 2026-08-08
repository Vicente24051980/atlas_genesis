from typing import Any


class AuthenticationEngine:
    """Authenticity/provenance gate for UO 1.1 RC1.

    This runtime implementation evaluates the declared authentication proof
    without changing the frozen conceptual contract.
    """

    TRUSTED_ISSUERS = {
        "CN=Internal Test Pipeline (Verified)",
        "CN=Internal Analytics Engine (Verified)",
        "CN=Microsoft Corporation Official SEC Registry",
        "CN=SEC EDGAR Filing System",
    }

    @classmethod
    def verify_authenticity(cls, uo_data: dict[str, Any]) -> dict[str, Any]:
        violations: list[dict[str, Any]] = []
        input_manifest = uo_data.get("input_manifest", {})
        auth_proof = input_manifest.get("authentication_proof", {})

        method = auth_proof.get("method")
        issuer = auth_proof.get("issuer")
        signature_status = auth_proof.get("signature_status")

        if not auth_proof or not method or not issuer or not signature_status:
            violations.append({
                "code": "AUTHENTICITY.PROOF_MISSING",
                "severity": "error",
                "blocking": True,
                "message": "Authentication proof or required fields missing in input_manifest.",
                "location": "input_manifest.authentication_proof",
            })
            return cls._build_result(False, "UNVERIFIED", violations)

        if signature_status == "INVALID_SIGNATURE":
            violations.append({
                "code": "AUTHENTICITY.INVALID_SIGNATURE",
                "severity": "fatal",
                "blocking": True,
                "message": f"Cryptographic signature check failed for issuer '{issuer}'. Possible forgery.",
                "location": "input_manifest.authentication_proof.signature_status",
            })
            return cls._build_result(False, "INVALID", violations)

        if signature_status == "UNVERIFIED_ISSUER" or issuer not in cls.TRUSTED_ISSUERS:
            violations.append({
                "code": "AUTHENTICITY.SOURCE_VERIFICATION_FAILED",
                "severity": "error",
                "blocking": True,
                "message": f"Declared source identity could not be verified. Certificate issuer '{issuer}' is not trusted.",
                "location": "input_manifest.authentication_proof.issuer",
            })
            return cls._build_result(False, "QUARANTINED", violations)

        if signature_status == "VERIFIED" and issuer in cls.TRUSTED_ISSUERS:
            return cls._build_result(True, "VERIFIED", [])

        violations.append({
            "code": "AUTHENTICITY.UNKNOWN_STATUS",
            "severity": "error",
            "blocking": True,
            "message": f"Unhandled signature status '{signature_status}' or untrusted issuer '{issuer}'.",
            "location": "input_manifest.authentication_proof",
        })
        return cls._build_result(False, "QUARANTINED", violations)

    @staticmethod
    def _build_result(passed: bool, execution_status: str, violations: list[dict[str, Any]]) -> dict[str, Any]:
        return {
            "engine": "AuthenticationEngine",
            "executed": True,
            "passed": passed,
            "execution_status": execution_status,
            "violationCount": len(violations),
            "violations": violations,
            "status": "COMPLETED" if passed else "HALTED",
        }
