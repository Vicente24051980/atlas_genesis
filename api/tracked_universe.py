from __future__ import annotations

from typing import TypedDict


class TrackedTicker(TypedDict, total=False):
    ticker: str
    symbol: str
    name: str
    sector: str
    state: str


# Current operational snapshot confirmed by Vicente. This is execution/monitoring
# state only and MUST NOT be supplied as a Point-Zero selection prior.
# Broker quantities, cost basis and P/L remain VOLATILE and must be refreshed
# from the broker before any material action.
SNAPSHOT_ID = "ATLAS-CURRENT-OPERATIONAL-27-2026-09-06-GLW-OUT-VRT-IN-v1"
SNAPSHOT_STATUS = "USER_CONFIRMED_OPERATIONAL_STATE_BROKER_RECONCILIATION_REQUIRED_BEFORE_ACTION"

PORTFOLIO: list[TrackedTicker] = [
    {"ticker": "AXON", "name": "Axon Enterprise", "sector": "Industrials"},
    {"ticker": "MELI", "name": "MercadoLibre", "sector": "Consumer Discretionary"},
    {"ticker": "CRWD", "name": "CrowdStrike Holdings", "sector": "Information Technology"},
    {"ticker": "LRCX", "name": "Lam Research", "sector": "Information Technology"},
    {"ticker": "PWR", "name": "Quanta Services", "sector": "Industrials"},
    {"ticker": "GEV", "name": "GE Vernova", "sector": "Industrials"},
    {"ticker": "AVGO", "name": "Broadcom", "sector": "Information Technology"},
    {"ticker": "PANW", "name": "Palo Alto Networks", "sector": "Information Technology"},
    {"ticker": "SYK", "name": "Stryker", "sector": "Health Care"},
    {"ticker": "MA", "name": "Mastercard", "sector": "Financials"},
    {"ticker": "ANET", "name": "Arista Networks", "sector": "Information Technology"},
    {"ticker": "CDNS", "name": "Cadence Design Systems", "sector": "Information Technology"},
    {"ticker": "ISRG", "name": "Intuitive Surgical", "sector": "Health Care"},
    {"ticker": "APH", "name": "Amphenol", "sector": "Information Technology"},
    {"ticker": "HWM", "name": "Howmet Aerospace", "sector": "Industrials"},
    {"ticker": "VRT", "name": "Vertiv Holdings", "sector": "Industrials"},
    {"ticker": "TT", "name": "Trane Technologies", "sector": "Industrials"},
    {"ticker": "VRTX", "name": "Vertex Pharmaceuticals", "sector": "Health Care"},
    {"ticker": "BSX", "name": "Boston Scientific", "sector": "Health Care"},
    {"ticker": "INTU", "name": "Intuit", "sector": "Information Technology"},
    {"ticker": "TRGP", "name": "Targa Resources", "sector": "Energy"},
    {"ticker": "LLY", "name": "Eli Lilly", "sector": "Health Care"},
    {"ticker": "GE", "name": "GE Aerospace", "sector": "Industrials"},
    {"ticker": "ETN", "name": "Eaton", "sector": "Industrials"},
    {"ticker": "ICE", "name": "Intercontinental Exchange", "sector": "Financials"},
    {"ticker": "V", "name": "Visa", "sector": "Financials"},
    {"ticker": "BKNG", "name": "Booking Holdings", "sector": "Consumer Discretionary"},
]

PORTFOLIO_PENDING: list[TrackedTicker] = []

# Non-selection monitoring/research queue. Current holdings are intentionally
# excluded here because the mobile validator treats portfolio/watchlist overlap
# as a state-integrity error. This queue has zero canonical selection authority.
WATCHLIST: list[TrackedTicker] = [
    {"ticker": "MU", "name": "Micron Technology", "sector": "Semiconductors"},
    {"ticker": "TER", "name": "Teradyne", "sector": "Semiconductor Equipment"},
    {"ticker": "IRM", "name": "Iron Mountain", "sector": "Data Centers"},
    {"ticker": "DLR", "name": "Digital Realty", "sector": "Data Centers"},
    {"ticker": "EQIX", "name": "Equinix", "sector": "Data Centers"},
    {"ticker": "CEG", "name": "Constellation Energy", "sector": "Power"},
    {"ticker": "BE", "name": "Bloom Energy", "sector": "Power"},
    {"ticker": "CCJ", "name": "Cameco", "sector": "Uranium"},
    {"ticker": "NEE", "name": "NextEra Energy", "sector": "Utilities"},
    {"ticker": "FSLR", "name": "First Solar", "sector": "Solar"},
    {"ticker": "ENPH", "name": "Enphase Energy", "sector": "Solar"},
    {"ticker": "XEL", "name": "Xcel Energy", "sector": "Utilities"},
    {"ticker": "BKR", "name": "Baker Hughes", "sector": "Energy"},
    {"ticker": "SLB", "name": "SLB", "sector": "Energy"},
    {"ticker": "FANG", "name": "Diamondback Energy", "sector": "Energy"},
    {"ticker": "EOG", "name": "EOG Resources", "sector": "Energy"},
    {"ticker": "NEM", "name": "Newmont", "sector": "Gold"},
    {"ticker": "AEM", "name": "Agnico Eagle Mines", "sector": "Gold"},
    {"ticker": "B", "name": "Barrick Mining", "sector": "Gold"},
    {"ticker": "WPM", "name": "Wheaton Precious Metals", "sector": "Gold"},
    {"ticker": "FNV", "name": "Franco-Nevada", "sector": "Gold"},
    {"ticker": "KGC", "name": "Kinross Gold", "sector": "Gold"},
    {"ticker": "AU", "name": "AngloGold Ashanti", "sector": "Gold"},
    {"ticker": "GFI", "name": "Gold Fields", "sector": "Gold"},
    {"ticker": "RGLD", "name": "Royal Gold", "sector": "Gold"},
    {"ticker": "GLD", "name": "SPDR Gold Shares", "sector": "Gold ETF"},
    {"ticker": "IAU", "name": "iShares Gold Trust", "sector": "Gold ETF"},
    {"ticker": "RPI", "symbol": "RPI.L", "name": "Raspberry Pi Holdings", "sector": "Edge Computing"},
    {"ticker": "SPCX", "name": "SpaceX", "sector": "Space"},
    {"ticker": "UBER", "name": "Uber Technologies", "sector": "Mobility"},
    {"ticker": "CELH", "name": "Celsius Holdings", "sector": "Consumer"},
    {"ticker": "TSLA", "name": "Tesla", "sector": "Automotive"},
    {"ticker": "SLV", "name": "iShares Silver Trust", "sector": "Silver ETF"},
    {"ticker": "SATL", "name": "Satellogic", "sector": "Space"},
    {"ticker": "MRNA", "name": "Moderna", "sector": "Biotech"},
    {"ticker": "BNTX", "name": "BioNTech", "sector": "Biotech"},
    {"ticker": "VKTX", "name": "Viking Therapeutics", "sector": "Biotech"},
    {"ticker": "CRSP", "name": "CRISPR Therapeutics", "sector": "Biotech"},
    {"ticker": "NTLA", "name": "Intellia Therapeutics", "sector": "Biotech"},
    {"ticker": "RXRX", "name": "Recursion Pharmaceuticals", "sector": "Biotech / AI"},
    {"ticker": "ALNY", "name": "Alnylam Pharmaceuticals", "sector": "Biotech"},
    {"ticker": "IONS", "name": "Ionis Pharmaceuticals", "sector": "Biotech"},
    {"ticker": "REGN", "name": "Regeneron Pharmaceuticals", "sector": "Biotech"},
    {"ticker": "ARGX", "name": "argenx", "sector": "Biotech"},
    {"ticker": "CYTK", "name": "Cytokinetics", "sector": "Biotech"},
    {"ticker": "PRTA", "name": "Prothena", "sector": "Biotech"},
    {"ticker": "INSM", "name": "Insmed", "sector": "Biotech"},
    {"ticker": "NBIX", "name": "Neurocrine Biosciences", "sector": "Biotech"},
    {"ticker": "MDGL", "name": "Madrigal Pharmaceuticals", "sector": "Biotech"},
    {"ticker": "BEAM", "name": "Beam Therapeutics", "sector": "Biotech"},
    {"ticker": "SANA", "name": "Sana Biotechnology", "sector": "Biotech"},
    {"ticker": "APP", "name": "AppLovin", "sector": "Software / Ads"},
    {"ticker": "HUBS", "name": "HubSpot", "sector": "Software"},
    {"ticker": "DT", "name": "Dynatrace", "sector": "Software"},
    {"ticker": "ABB", "name": "ABB", "sector": "Automation"},
    {"ticker": "DDOG", "name": "Datadog", "sector": "Observability"},
    {"ticker": "NET", "name": "Cloudflare", "sector": "Cloud / Security"},
    {"ticker": "ESTC", "name": "Elastic", "sector": "Search / Observability"},
    {"ticker": "MDB", "name": "MongoDB", "sector": "Database"},
    {"ticker": "NFLX", "name": "Netflix", "sector": "Media"},
    {"ticker": "META", "name": "Meta Platforms", "sector": "Internet"},
    {"ticker": "IDXX", "name": "IDEXX Laboratories", "sector": "Health"},
    {"ticker": "CRL", "name": "Charles River Laboratories", "sector": "Health"},
    {"ticker": "EAT", "name": "Brinker International", "sector": "Consumer"},
    {"ticker": "BHP", "name": "BHP Group", "sector": "Materials"},
    {"ticker": "COR", "name": "Cencora", "sector": "Health"},
    {"ticker": "ABT", "name": "Abbott Laboratories", "sector": "Health"},
    {"ticker": "LMT", "name": "Lockheed Martin", "sector": "Defense"},
    {"ticker": "OVV", "name": "Ovintiv", "sector": "Energy"},
    {"ticker": "IBM", "name": "IBM", "sector": "Technology"},
    {"ticker": "GFS", "name": "GlobalFoundries", "sector": "Semiconductors"},
    {"ticker": "IONQ", "name": "IonQ", "sector": "Quantum"},
    {"ticker": "QBTS", "name": "D-Wave Quantum", "sector": "Quantum"},
    {"ticker": "RGTI", "name": "Rigetti Computing", "sector": "Quantum"},
    {"ticker": "QUBT", "name": "Quantum Computing Inc.", "sector": "Quantum"},
]


def validate_universe() -> None:
    portfolio = {item["ticker"] for item in PORTFOLIO}
    watch = [item["ticker"] for item in WATCHLIST]
    if len(portfolio) != len(PORTFOLIO):
        raise RuntimeError("duplicate portfolio ticker")
    if len(PORTFOLIO) != 27:
        raise RuntimeError("current operational portfolio must contain 27 tickers")
    if len(set(watch)) != len(watch):
        raise RuntimeError("duplicate watchlist ticker")
    overlap = sorted(portfolio.intersection(watch))
    if overlap:
        raise RuntimeError(f"portfolio/watchlist overlap: {','.join(overlap)}")


validate_universe()
