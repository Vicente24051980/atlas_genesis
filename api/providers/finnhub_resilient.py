from __future__ import annotations

import asyncio
import os
import time
from collections import deque
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"


@dataclass(slots=True)
class _CacheEntry:
    stored_at: float
    value: Any


@dataclass(frozen=True, slots=True)
class FinnhubPolicy:
    ttl_seconds: float
    stale_seconds: float


_POLICIES: tuple[tuple[str, FinnhubPolicy], ...] = (
    ("/quote", FinnhubPolicy(8.0, 300.0)),
    ("/stock/profile2", FinnhubPolicy(86_400.0, 7 * 86_400.0)),
    ("/stock/metric", FinnhubPolicy(21_600.0, 3 * 86_400.0)),
    ("/stock/recommendation", FinnhubPolicy(3_600.0, 86_400.0)),
    ("/company-news", FinnhubPolicy(900.0, 21_600.0)),
    ("/search", FinnhubPolicy(300.0, 3_600.0)),
)
_DEFAULT_POLICY = FinnhubPolicy(60.0, 900.0)


def policy_for(path: str) -> FinnhubPolicy:
    for prefix, policy in _POLICIES:
        if path.startswith(prefix):
            return policy
    return _DEFAULT_POLICY


class FinnhubResilientClient:
    """Server-side Finnhub adapter designed for ATLAS Ω fan-out workloads.

    Guarantees:
    - one in-flight upstream request per unique endpoint/parameter key;
    - short/long TTLs according to data volatility;
    - conservative calls-per-second throttle below Finnhub's global ceiling;
    - temporary cooldown after HTTP 429;
    - stale-last-good fallback when an upstream limit/outage occurs.

    No provider token is ever returned to clients.
    """

    def __init__(self, *, max_calls_per_second: int | None = None) -> None:
        configured = max_calls_per_second or int(os.getenv("FINNHUB_MAX_CALLS_PER_SECOND", "20"))
        self.max_calls_per_second = max(1, min(configured, 29))
        self._cache: dict[str, _CacheEntry] = {}
        self._key_locks: dict[str, asyncio.Lock] = {}
        self._rate_lock = asyncio.Lock()
        self._recent_calls: deque[float] = deque()
        self._cooldown_until = 0.0

    @staticmethod
    def _token() -> str:
        token = os.getenv("FINNHUB_TOKEN", "").strip()
        if not token:
            raise HTTPException(status_code=503, detail="FINNHUB_TOKEN is not configured")
        return token

    @staticmethod
    def _key(path: str, params: dict[str, Any]) -> str:
        normalized = urlencode(sorted((str(k), str(v)) for k, v in params.items()))
        return f"{path}?{normalized}"

    async def _throttle(self) -> None:
        while True:
            wait = 0.0
            async with self._rate_lock:
                now = time.monotonic()
                while self._recent_calls and now - self._recent_calls[0] >= 1.0:
                    self._recent_calls.popleft()
                if len(self._recent_calls) < self.max_calls_per_second:
                    self._recent_calls.append(now)
                    return
                wait = max(0.01, 1.0 - (now - self._recent_calls[0]))
            await asyncio.sleep(wait)

    @staticmethod
    def _age(entry: _CacheEntry | None, now: float) -> float | None:
        return None if entry is None else now - entry.stored_at

    async def fetch(
        self,
        path: str,
        params: dict[str, Any],
        *,
        policy: FinnhubPolicy | None = None,
    ) -> tuple[Any, str]:
        selected = policy or policy_for(path)
        key = self._key(path, params)
        now = time.monotonic()
        cached = self._cache.get(key)
        age = self._age(cached, now)
        if cached is not None and age is not None and age <= selected.ttl_seconds:
            return cached.value, "CACHE:FRESH"

        lock = self._key_locks.setdefault(key, asyncio.Lock())
        async with lock:
            now = time.monotonic()
            cached = self._cache.get(key)
            age = self._age(cached, now)
            if cached is not None and age is not None and age <= selected.ttl_seconds:
                return cached.value, "CACHE:FRESH"

            if now < self._cooldown_until:
                if cached is not None and age is not None and age <= selected.stale_seconds:
                    return cached.value, "CACHE:STALE:RATE_LIMIT"
                retry_after = max(1, int(self._cooldown_until - now))
                raise HTTPException(status_code=429, detail=f"Finnhub cooling down; retry in ~{retry_after}s")

            await self._throttle()
            headers = {"X-Finnhub-Token": self._token(), "Accept": "application/json"}
            timeout = httpx.Timeout(20.0, connect=10.0)
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(f"{FINNHUB_BASE_URL}{path}", params=params, headers=headers)
            except httpx.RequestError as exc:
                if cached is not None and age is not None and age <= selected.stale_seconds:
                    return cached.value, f"CACHE:STALE:{exc.__class__.__name__}"
                raise HTTPException(status_code=502, detail=f"Finnhub connection failed: {exc.__class__.__name__}") from exc

            if response.status_code == 429:
                retry_header = response.headers.get("retry-after")
                try:
                    retry_seconds = max(2.0, float(retry_header)) if retry_header else 5.0
                except ValueError:
                    retry_seconds = 5.0
                self._cooldown_until = time.monotonic() + min(retry_seconds, 60.0)
                if cached is not None and age is not None and age <= selected.stale_seconds:
                    return cached.value, "CACHE:STALE:429"
                raise HTTPException(status_code=429, detail="Finnhub rate limit reached")

            if response.status_code >= 500:
                if cached is not None and age is not None and age <= selected.stale_seconds:
                    return cached.value, f"CACHE:STALE:HTTP_{response.status_code}"
                raise HTTPException(status_code=502, detail=f"Finnhub upstream HTTP {response.status_code}")
            if response.status_code >= 400:
                raise HTTPException(status_code=502, detail=f"Finnhub upstream HTTP {response.status_code}")

            try:
                payload = response.json()
            except ValueError as exc:
                if cached is not None and age is not None and age <= selected.stale_seconds:
                    return cached.value, "CACHE:STALE:NON_JSON"
                raise HTTPException(status_code=502, detail="Finnhub returned non-JSON data") from exc

            self._cache[key] = _CacheEntry(stored_at=time.monotonic(), value=payload)
            return payload, "LIVE"

    def clear(self) -> None:
        self._cache.clear()
        self._cooldown_until = 0.0


finnhub_client = FinnhubResilientClient()


async def finnhub_get(path: str, params: dict[str, Any]) -> Any:
    payload, _ = await finnhub_client.fetch(path, params)
    return payload


async def finnhub_optional(path: str, params: dict[str, Any]) -> tuple[Any, str]:
    try:
        return await finnhub_client.fetch(path, params)
    except HTTPException as exc:
        return None, f"UNAVAILABLE:{exc.status_code}"
