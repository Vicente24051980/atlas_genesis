from __future__ import annotations

import asyncio
from datetime import timedelta
from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

from api.kronos_adapter import KronosAdapterError, adapter

router = APIRouter(prefix="/v1/atlas/kronos", tags=["kronos-experimental"])

ENGINE_ID = "KRONOS_MARKET_FORECAST_OMEGA_v0_2"
STATUS = "EXPERIMENTAL_NON_CANONICAL"
DEFAULT_MODEL = "NeoQuasar/Kronos-small"
SUPPORTED_HORIZONS_DAYS = (5, 20, 60)


class KronosBar(BaseModel):
    """ATLAS-normalized daily K-line input. OHLC is mandatory; volume/amount are optional."""

    timestamp: str = Field(min_length=1, max_length=64)
    open: float
    high: float
    low: float
    close: float
    volume: float | None = Field(default=None, ge=0)
    amount: float | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_ohlc(self) -> "KronosBar":
        if self.high < self.low:
            raise ValueError("high must be >= low")
        if self.high < max(self.open, self.close):
            raise ValueError("high must be >= open and close")
        if self.low > min(self.open, self.close):
            raise ValueError("low must be <= open and close")
        return self


class KronosMarketForecastRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=32)
    bars: list[KronosBar] = Field(min_length=32, max_length=512)
    horizon_days: Literal[5, 20, 60] = 20
    sample_count: int = Field(default=20, ge=1, le=500)
    temperature: float = Field(default=1.0, gt=0, le=5.0)
    top_p: float = Field(default=0.9, gt=0, le=1.0)
    model_id: str = Field(default=DEFAULT_MODEL, min_length=1, max_length=128)


class KronosMarketForecastResult(BaseModel):
    engine: str
    status: str
    symbol: str
    modelId: str
    horizonDays: int
    sampleCount: int
    lookbackBars: int
    inferenceStatus: str
    forecast: dict[str, Any] | None
    authority: str
    guardrail: str


def _guardrail() -> str:
    return (
        "Kronos is an experimental probabilistic market-forecast signal only. "
        "It cannot issue BUY/SELL decisions, alter ATLAS fundamental scores, "
        "invalidate thesis evidence, or become canonical before out-of-sample validation."
    )


def _validate_timestamps(payload: KronosMarketForecastRequest) -> list[Any]:
    try:
        import pandas as pd
    except ImportError:
        # Validation remains available in the lightweight API even without Kronos dependencies.
        timestamps = [bar.timestamp for bar in payload.bars]
        if len(set(timestamps)) != len(timestamps):
            raise HTTPException(status_code=422, detail="duplicate timestamps are not allowed")
        return timestamps

    parsed = pd.to_datetime([bar.timestamp for bar in payload.bars], utc=True, errors="coerce")
    if parsed.isna().any():
        raise HTTPException(status_code=422, detail="all timestamps must be parseable datetimes")
    if parsed.duplicated().any():
        raise HTTPException(status_code=422, detail="duplicate timestamps are not allowed")
    if not parsed.is_monotonic_increasing:
        raise HTTPException(status_code=422, detail="timestamps must be strictly increasing")
    return list(parsed)


def validate_kronos_request(payload: KronosMarketForecastRequest) -> KronosMarketForecastResult:
    _validate_timestamps(payload)
    return KronosMarketForecastResult(
        engine=ENGINE_ID,
        status=STATUS,
        symbol=payload.symbol.strip().upper(),
        modelId=payload.model_id,
        horizonDays=payload.horizon_days,
        sampleCount=payload.sample_count,
        lookbackBars=len(payload.bars),
        inferenceStatus="VALIDATED_NOT_EXECUTED",
        forecast=None,
        authority="SIGNAL_ONLY_NO_BUY_SELL_AUTHORITY",
        guardrail=_guardrail(),
    )


def _future_business_timestamps(payload: KronosMarketForecastRequest) -> list[str]:
    try:
        import pandas as pd
    except ImportError as exc:
        raise KronosAdapterError("pandas is required for Kronos inference") from exc

    parsed = pd.to_datetime([bar.timestamp for bar in payload.bars], utc=True, errors="raise")
    last = parsed[-1].tz_convert(None)
    future = pd.bdate_range(start=last + timedelta(days=1), periods=payload.horizon_days)
    return [value.isoformat() for value in future]


@router.post("/validate", response_model=KronosMarketForecastResult)
async def kronos_validate(payload: KronosMarketForecastRequest) -> KronosMarketForecastResult:
    return validate_kronos_request(payload)


@router.post("/predict", response_model=KronosMarketForecastResult)
async def kronos_predict(payload: KronosMarketForecastRequest) -> KronosMarketForecastResult:
    validated = validate_kronos_request(payload)
    runtime = adapter.status()
    if payload.model_id != runtime.model_id:
        raise HTTPException(
            status_code=409,
            detail=f"requested model_id must match configured KRONOS_MODEL_ID ({runtime.model_id})",
        )
    if not runtime.enabled:
        raise HTTPException(status_code=503, detail="Kronos inference is disabled; set ATLAS_KRONOS_ENABLED=true")
    if not runtime.source_available:
        raise HTTPException(status_code=503, detail=runtime.detail)
    if not runtime.dependencies_available:
        raise HTTPException(status_code=503, detail=runtime.detail)

    bars = [bar.model_dump(exclude_none=True) for bar in payload.bars]
    future_timestamps = _future_business_timestamps(payload)
    try:
        forecast = await asyncio.to_thread(
            adapter.predict,
            bars=bars,
            future_timestamps=future_timestamps,
            horizon_days=payload.horizon_days,
            sample_count=payload.sample_count,
            temperature=payload.temperature,
            top_p=payload.top_p,
        )
    except KronosAdapterError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return validated.model_copy(
        update={
            "inferenceStatus": "KRONOS_SMALL_EXECUTED",
            "forecast": forecast,
        }
    )


@router.get("/status")
async def kronos_status() -> dict[str, Any]:
    runtime = adapter.status()
    return {
        "engine": ENGINE_ID,
        "status": STATUS,
        "runtime": {
            "enabled": runtime.enabled,
            "sourcePath": runtime.source_path,
            "sourceAvailable": runtime.source_available,
            "dependenciesAvailable": runtime.dependencies_available,
            "modelLoaded": runtime.model_loaded,
            "device": runtime.device,
            "modelId": runtime.model_id,
            "tokenizerId": runtime.tokenizer_id,
            "detail": runtime.detail,
        },
        "decisionAuthority": False,
    }


@router.get("/manifest")
async def kronos_manifest() -> dict[str, Any]:
    return {
        "engine": ENGINE_ID,
        "status": STATUS,
        "upstream": "shiyu-coder/Kronos",
        "license": "MIT",
        "defaultModel": DEFAULT_MODEL,
        "maxLookback": 512,
        "supportedHorizonsDays": list(SUPPORTED_HORIZONS_DAYS),
        "requiredFields": ["open", "high", "low", "close"],
        "optionalFields": ["volume", "amount"],
        "decisionAuthority": False,
        "modelWeightsInGit": False,
        "runtimeOptIn": "ATLAS_KRONOS_ENABLED=true",
        "sourcePathEnv": "KRONOS_SOURCE_PATH",
        "optionalRequirements": "api/requirements-kronos.txt",
        "nextGate": "WALK_FORWARD_VALIDATION_BEFORE_ANY_CANONICAL_SIGNAL_USE",
    }
