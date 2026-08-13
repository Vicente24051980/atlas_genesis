from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

router = APIRouter(prefix="/v1/atlas/kronos", tags=["kronos-experimental"])

ENGINE_ID = "KRONOS_MARKET_FORECAST_OMEGA_v0_1"
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


def validate_kronos_request(payload: KronosMarketForecastRequest) -> KronosMarketForecastResult:
    """Validate the ATLAS↔Kronos contract without loading Kronos/PyTorch.

    This intentionally provides no synthetic forecast. Actual model inference will be
    implemented behind a replaceable adapter after dependency and reproducibility checks.
    """

    timestamps = [bar.timestamp for bar in payload.bars]
    if len(set(timestamps)) != len(timestamps):
        raise HTTPException(status_code=422, detail="duplicate timestamps are not allowed")

    return KronosMarketForecastResult(
        engine=ENGINE_ID,
        status=STATUS,
        symbol=payload.symbol.strip().upper(),
        modelId=payload.model_id,
        horizonDays=payload.horizon_days,
        sampleCount=payload.sample_count,
        lookbackBars=len(payload.bars),
        inferenceStatus="ADAPTER_NOT_ENABLED",
        forecast=None,
        authority="SIGNAL_ONLY_NO_BUY_SELL_AUTHORITY",
        guardrail=(
            "Kronos is an experimental probabilistic market-forecast signal only. "
            "It cannot issue BUY/SELL decisions, alter ATLAS fundamental scores, "
            "invalidate thesis evidence, or become canonical before out-of-sample validation."
        ),
    )


@router.post("/validate", response_model=KronosMarketForecastResult)
async def kronos_validate(payload: KronosMarketForecastRequest) -> KronosMarketForecastResult:
    return validate_kronos_request(payload)


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
        "nextGate": "IMPLEMENT_ISOLATED_ADAPTER_AND_WALK_FORWARD_VALIDATION",
    }
