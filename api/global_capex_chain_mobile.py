from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/v1/mobile/capex-chain", tags=["mobile-global-capex-chain"])

# This table intentionally stores STRUCTURAL POSITION only. It does not store
# valuation, BUY/SELL signals, or fabricated E2-E4 evidence scores. Numeric
# CAPEX opportunity scores remain null until a traceable evidence profile is
# ingested and evaluated by the canonical Global CAPEX Chain Ω engine.
CAPEX_MAP: dict[str, dict[str, Any]] = {
    # EDD-0: allocators/payers. Compare by CAPEX payback, never by supplier capture.
    "GOOG": {"edd": 0, "role": "ALLOCATOR_PAYER", "mode": "PAYBACK", "rivers": ["AI_COMPUTE", "DATA_CENTER_PHYSICAL", "POWER_EQUIPMENT"]},
    "GOOGL": {"edd": 0, "role": "ALLOCATOR_PAYER", "mode": "PAYBACK", "rivers": ["AI_COMPUTE", "DATA_CENTER_PHYSICAL", "POWER_EQUIPMENT"]},
    "MSFT": {"edd": 0, "role": "ALLOCATOR_PAYER", "mode": "PAYBACK", "rivers": ["AI_COMPUTE", "DATA_CENTER_PHYSICAL", "POWER_EQUIPMENT"]},
    "AMZN": {"edd": 0, "role": "ALLOCATOR_PAYER", "mode": "PAYBACK", "rivers": ["AI_COMPUTE", "DATA_CENTER_PHYSICAL", "POWER_EQUIPMENT"]},
    "META": {"edd": 0, "role": "ALLOCATOR_PAYER", "mode": "PAYBACK", "rivers": ["AI_COMPUTE", "DATA_CENTER_PHYSICAL", "POWER_EQUIPMENT"]},
    "ORCL": {"edd": 0, "role": "ALLOCATOR_PAYER", "mode": "PAYBACK", "rivers": ["AI_COMPUTE", "DATA_CENTER_PHYSICAL"]},

    # EDD-1: direct compute / memory / networking / optics.
    "NVDA": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["AI_COMPUTE", "NETWORKING_OPTICS"]},
    "AMD": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["AI_COMPUTE"]},
    "AVGO": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["AI_COMPUTE", "NETWORKING_OPTICS"]},
    "ANET": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["NETWORKING_OPTICS", "DATA_CENTER_PHYSICAL"]},
    "CRDO": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["NETWORKING_OPTICS"]},
    "MRVL": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["AI_COMPUTE", "NETWORKING_OPTICS"]},
    "MU": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["ADVANCED_PACKAGING_MEMORY", "AI_COMPUTE"]},
    "LITE": {"edd": 1, "role": "DIRECT_COMPUTE_CONNECTIVITY", "mode": "CAPTURE", "rivers": ["NETWORKING_OPTICS"]},

    # EDD-2: semiconductor / manufacturing choke points.
    "TSM": {"edd": 2, "role": "MANUFACTURING_CHOKEPOINT", "mode": "CAPTURE", "rivers": ["SEMICONDUCTOR_FAB", "ADVANCED_PACKAGING_MEMORY"]},
    "ASML": {"edd": 2, "role": "MANUFACTURING_CHOKEPOINT", "mode": "CAPTURE", "rivers": ["SEMICONDUCTOR_FAB"]},
    "KLAC": {"edd": 2, "role": "MANUFACTURING_CHOKEPOINT", "mode": "CAPTURE", "rivers": ["SEMICONDUCTOR_FAB"]},
    "LRCX": {"edd": 2, "role": "MANUFACTURING_CHOKEPOINT", "mode": "CAPTURE", "rivers": ["SEMICONDUCTOR_FAB", "ADVANCED_PACKAGING_MEMORY"]},
    "AMAT": {"edd": 2, "role": "MANUFACTURING_CHOKEPOINT", "mode": "CAPTURE", "rivers": ["SEMICONDUCTOR_FAB", "ADVANCED_PACKAGING_MEMORY"]},
    "TER": {"edd": 2, "role": "MANUFACTURING_CHOKEPOINT", "mode": "CAPTURE", "rivers": ["SEMICONDUCTOR_FAB"]},
    "FN": {"edd": 2, "role": "MANUFACTURING_CHOKEPOINT", "mode": "CAPTURE", "rivers": ["NETWORKING_OPTICS", "DATA_CENTER_PHYSICAL"]},

    # EDD-3: physical infrastructure, grid equipment, aerospace production chain.
    "PWR": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["GRID_TRANSMISSION", "POWER_EQUIPMENT", "DATA_CENTER_PHYSICAL", "ELECTRIFICATION"]},
    "ETN": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["POWER_EQUIPMENT", "DATA_CENTER_PHYSICAL", "ELECTRIFICATION"]},
    "GEV": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["GENERATION", "GRID_TRANSMISSION", "POWER_EQUIPMENT"]},
    "VRT": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["DATA_CENTER_PHYSICAL", "POWER_EQUIPMENT"]},
    "NXT": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["GENERATION", "ELECTRIFICATION"]},
    "HWM": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["AEROSPACE", "DEFENSE"]},
    "GE": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["AEROSPACE", "DEFENSE"]},
    "AXON": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["DEFENSE", "OTHER"]},
    "EXENS": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["DEFENSE", "AEROSPACE"]},
    "EXENS.PA": {"edd": 3, "role": "PHYSICAL_INFRASTRUCTURE", "mode": "CAPTURE", "rivers": ["DEFENSE", "AEROSPACE"]},

    # EDD-4: generation, fuels and resources feeding the build-out.
    "CEG": {"edd": 4, "role": "POWER_FUEL_RESOURCES", "mode": "CAPTURE", "rivers": ["GENERATION", "DATA_CENTER_PHYSICAL"]},
    "VST": {"edd": 4, "role": "POWER_FUEL_RESOURCES", "mode": "CAPTURE", "rivers": ["GENERATION", "DATA_CENTER_PHYSICAL"]},
    "LNG": {"edd": 4, "role": "POWER_FUEL_RESOURCES", "mode": "CAPTURE", "rivers": ["FUEL_ENERGY", "ENERGY_SECURITY", "GENERATION"]},
    "BKR": {"edd": 4, "role": "POWER_FUEL_RESOURCES", "mode": "CAPTURE", "rivers": ["FUEL_ENERGY", "GENERATION", "ENERGY_SECURITY"]},
    "MP": {"edd": 4, "role": "POWER_FUEL_RESOURCES", "mode": "CAPTURE", "rivers": ["RESHORING_AUTOMATION", "DEFENSE", "OTHER"]},

    # EDD-5: financing and enabling industrial/logistics layers.
    "KKR": {"edd": 5, "role": "INDUSTRIAL_LOGISTICS_FINANCE", "mode": "CAPTURE", "rivers": ["DATA_CENTER_PHYSICAL", "POWER_EQUIPMENT", "RESHORING_AUTOMATION"]},

    # EDD-6: downstream productivity / services. Mapping does not imply low quality.
    "FTNT": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["OTHER"]},
    "IOT": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["RESHORING_AUTOMATION", "TRANSPORT_LOGISTICS"]},
    "ADYEN": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["OTHER"]},
    "NU": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["OTHER"]},
    "RDDT": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["OTHER"]},
    "TJX": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["OTHER"]},
    "WISE": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["OTHER"]},
    "SE": {"edd": 6, "role": "DOWNSTREAM_PRODUCTIVITY", "mode": "DOWNSTREAM_PRODUCTIVITY", "rivers": ["OTHER"]},
}


def _normalize_ticker(value: str) -> str:
    ticker = value.strip().upper()
    if not ticker or len(ticker) > 32 or any(ch not in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-" for ch in ticker):
        raise HTTPException(status_code=400, detail="valid ticker is required")
    return ticker


@router.get("/{ticker}")
async def capex_chain_profile(ticker: str) -> dict[str, Any]:
    symbol = _normalize_ticker(ticker)
    profile = CAPEX_MAP.get(symbol)
    if not profile:
        return {
            "ticker": symbol,
            "engine": "GLOBAL_CAPEX_CHAIN_OMEGA_V1",
            "mapped": False,
            "evidenceGate": "EVIDENCE_REQUIRED",
            "state": "UNMAPPED_RESEARCH_REQUIRED",
            "capexPositionScore": None,
            "structuralOpportunityScore": None,
            "capexFragilityScore": None,
            "guardrail": "No structural CAPEX role is fabricated for an unmapped ticker. Research and evidence ingestion are required.",
        }

    return {
        "ticker": symbol,
        "engine": "GLOBAL_CAPEX_CHAIN_OMEGA_V1",
        "mapped": True,
        "edd": profile["edd"],
        "role": profile["role"],
        "economicMode": profile["mode"],
        "rivers": profile["rivers"],
        "evidenceGate": "STRUCTURAL_MAP_ONLY",
        "state": "MAPPED_REQUIRES_E2_PLUS_EVIDENCE",
        "capexPositionScore": None,
        "capexConvergenceScore": None,
        "bottleneckPersistenceScore": None,
        "structuralOpportunityScore": None,
        "capexFragilityScore": None,
        "guardrail": "EDD/role/river mapping is structural taxonomy only. Scores remain null until traceable E2+ evidence is evaluated; this engine never emits BUY/SELL and valuation remains separate.",
    }
