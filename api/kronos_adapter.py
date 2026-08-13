from __future__ import annotations

import importlib
import os
import sys
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

DEFAULT_MODEL_ID = "NeoQuasar/Kronos-small"
DEFAULT_TOKENIZER_ID = "NeoQuasar/Kronos-Tokenizer-base"
DEFAULT_SOURCE_PATH = "/opt/kronos"


class KronosAdapterError(RuntimeError):
    pass


@dataclass(frozen=True)
class KronosRuntimeStatus:
    enabled: bool
    source_path: str
    source_available: bool
    dependencies_available: bool
    model_loaded: bool
    device: str
    model_id: str
    tokenizer_id: str
    detail: str


class KronosSmallAdapter:
    """Lazy, isolated adapter around the upstream shiyu-coder/Kronos project.

    The adapter intentionally does not vendor model weights or load PyTorch at API
    import time. Production can mount/clone the MIT-licensed upstream source at
    KRONOS_SOURCE_PATH and opt in with ATLAS_KRONOS_ENABLED=true.
    """

    def __init__(self) -> None:
        self.enabled = os.getenv("ATLAS_KRONOS_ENABLED", "false").strip().lower() == "true"
        self.source_path = os.getenv("KRONOS_SOURCE_PATH", DEFAULT_SOURCE_PATH).strip() or DEFAULT_SOURCE_PATH
        self.model_id = os.getenv("KRONOS_MODEL_ID", DEFAULT_MODEL_ID).strip() or DEFAULT_MODEL_ID
        self.tokenizer_id = os.getenv("KRONOS_TOKENIZER_ID", DEFAULT_TOKENIZER_ID).strip() or DEFAULT_TOKENIZER_ID
        self.device = os.getenv("KRONOS_DEVICE", "cpu").strip() or "cpu"
        self._predictor: Any | None = None
        self._lock = threading.Lock()

    def _source_available(self) -> bool:
        root = Path(self.source_path)
        return (root / "model" / "__init__.py").is_file()

    def _dependencies_available(self) -> bool:
        required = ("numpy", "pandas", "torch", "einops", "huggingface_hub", "safetensors")
        for name in required:
            try:
                importlib.import_module(name)
            except Exception:
                return False
        return True

    def status(self) -> KronosRuntimeStatus:
        source_available = self._source_available()
        dependencies_available = self._dependencies_available()
        if not self.enabled:
            detail = "disabled by ATLAS_KRONOS_ENABLED"
        elif not source_available:
            detail = f"upstream Kronos source not found at {self.source_path}"
        elif not dependencies_available:
            detail = "optional Kronos runtime dependencies are not installed"
        elif self._predictor is None:
            detail = "ready for lazy model load"
        else:
            detail = "Kronos-small predictor loaded"
        return KronosRuntimeStatus(
            enabled=self.enabled,
            source_path=self.source_path,
            source_available=source_available,
            dependencies_available=dependencies_available,
            model_loaded=self._predictor is not None,
            device=self.device,
            model_id=self.model_id,
            tokenizer_id=self.tokenizer_id,
            detail=detail,
        )

    def _load_predictor(self) -> Any:
        if self._predictor is not None:
            return self._predictor
        if not self.enabled:
            raise KronosAdapterError("Kronos inference is disabled")
        if not self._source_available():
            raise KronosAdapterError(f"Kronos source not found at {self.source_path}")
        if not self._dependencies_available():
            raise KronosAdapterError("Kronos optional dependencies are not installed")

        with self._lock:
            if self._predictor is not None:
                return self._predictor
            source = str(Path(self.source_path).resolve())
            if source not in sys.path:
                sys.path.insert(0, source)
            try:
                module = importlib.import_module("model")
                Kronos = getattr(module, "Kronos")
                KronosTokenizer = getattr(module, "KronosTokenizer")
                KronosPredictor = getattr(module, "KronosPredictor")
                tokenizer = KronosTokenizer.from_pretrained(self.tokenizer_id)
                model = Kronos.from_pretrained(self.model_id)
                self._predictor = KronosPredictor(model, tokenizer, max_context=512, device=self.device)
            except Exception as exc:
                raise KronosAdapterError(f"failed to load Kronos-small: {exc.__class__.__name__}: {exc}") from exc
        return self._predictor

    def predict(
        self,
        *,
        bars: list[dict[str, Any]],
        future_timestamps: list[Any],
        horizon_days: int,
        sample_count: int,
        temperature: float,
        top_p: float,
    ) -> dict[str, Any]:
        predictor = self._load_predictor()
        try:
            pd = importlib.import_module("pandas")
            frame = pd.DataFrame(bars)
            x_timestamp = pd.Series(pd.to_datetime(frame.pop("timestamp"), utc=True).dt.tz_convert(None))
            y_timestamp = pd.Series(pd.to_datetime(future_timestamps))
            pred = predictor.predict(
                df=frame,
                x_timestamp=x_timestamp,
                y_timestamp=y_timestamp,
                pred_len=horizon_days,
                T=temperature,
                top_p=top_p,
                sample_count=sample_count,
                verbose=False,
            )
        except KronosAdapterError:
            raise
        except Exception as exc:
            raise KronosAdapterError(f"Kronos prediction failed: {exc.__class__.__name__}: {exc}") from exc

        if pred is None or len(pred) == 0:
            raise KronosAdapterError("Kronos returned an empty forecast")

        rows = pred.reset_index(drop=True).to_dict(orient="records")
        first_close = float(rows[0]["close"])
        terminal_close = float(rows[-1]["close"])
        return {
            "predictedBars": rows,
            "firstPredictedClose": first_close,
            "terminalPredictedClose": terminal_close,
            "predictedCloseChangePct": round((terminal_close / first_close - 1.0) * 100.0, 4) if first_close else None,
        }


adapter = KronosSmallAdapter()
