from __future__ import annotations

import hashlib
import unicodedata
from dataclasses import dataclass, asdict


@dataclass(frozen=True)
class HashResult:
    engine: str
    passed: bool
    computed_hash: str
    declared_hash: str
    violation: str | None

    def to_dict(self) -> dict:
        return asdict(self)


class HashEngine:
    """CORE-00 HashEngine reference runtime for text payloads.

    Frozen profile implemented here:
    UTF-8 text -> Unicode NFC -> CRLF normalized to LF -> SHA-256.

    JSON/JCS hashing is intentionally not invented here; that path must be
    materialized from the frozen RFC-8785 contract separately.
    """

    ENGINE_NAME = "HashEngine"
    PROFILE = "CORE-HASH-v1"

    @staticmethod
    def normalize_text(raw_text: str) -> bytes:
        if not isinstance(raw_text, str):
            raise TypeError("raw_text must be str")
        normalized = unicodedata.normalize("NFC", raw_text)
        normalized = normalized.replace("\r\n", "\n")
        return normalized.encode("utf-8")

    @classmethod
    def compute_raw_hash(cls, raw_text: str) -> str:
        return hashlib.sha256(cls.normalize_text(raw_text)).hexdigest()

    @classmethod
    def verify_integrity(cls, raw_text: str, declared_hash: str) -> HashResult:
        if not isinstance(declared_hash, str) or not declared_hash:
            raise ValueError("declared_hash must be a non-empty hexadecimal SHA-256 string")

        computed = cls.compute_raw_hash(raw_text)
        passed = computed.lower() == declared_hash.lower()
        return HashResult(
            engine=cls.ENGINE_NAME,
            passed=passed,
            computed_hash=computed,
            declared_hash=declared_hash,
            violation=None if passed else "INTEGRITY.HASH_MISMATCH",
        )
