from __future__ import annotations

from typing import TypedDict


class TrackedTicker(TypedDict, total=False):
    ticker: str
    symbol: str
    name: str
    sector: str
    state: str


# Bootstrap snapshot only. The mobile client reads this remotely so the tracked
# universe can be corrected without rebuilding the APK. Exact broker quantities,
# cost basis and P/L always come from Trading 212 when that connection is enabled.
SNAPSHOT_ID = "ATLAS-TRACKED-2026-08-09-BOOTSTRAP-v1"
SNAPSHOT_STATUS = "AWAITING_USER_CONFIRMATION"

PORTFOLIO: list[TrackedTicker] = [
    {"ticker": "MSFT", "name": "Microsoft", "sector": "Cloud / Software"},
    {"ticker": "AMZN", "name": "Amazon", "sector": "Cloud / Consumer"},
    {"ticker": "GOOG", "name": "Alphabet", "sector": "Cloud / Internet"},
    {"ticker": "ORCL", "name": "Oracle", "sector": "Cloud / Software"},
    {"ticker": "NOW", "name": "ServiceNow", "sector": "Software"},
    {"ticker": "NVDA", "name": "NVIDIA", "sector": "AI / Semiconductors"},
    {"ticker": "AVGO", "name": "Broadcom", "sector": "AI / Semiconductors"},
    {"ticker": "PLTR", "name": "Palantir", "sector": "AI / Software"},
    {"ticker": "TSM", "name": "Taiwan Semiconductor", "sector": "Semiconductors"},
    {"ticker": "ASML", "name": "ASML Holding", "sector": "Semiconductor Equipment"},
    {"ticker": "AMAT", "name": "Applied Materials", "sector": "Semiconductor Equipment"},
    {"ticker": "LRCX", "name": "Lam Research", "sector": "Semiconductor Equipment"},
    {"ticker": "KLAC", "name": "KLA", "sector": "Semiconductor Equipment"},
    {"ticker": "CDNS", "name": "Cadence Design Systems", "sector": "EDA"},
    {"ticker": "COHR", "name": "Coherent", "sector": "Optics"},
    {"ticker": "ANET", "name": "Arista Networks", "sector": "Networks"},
    {"ticker": "APH", "name": "Amphenol", "sector": "Connectivity"},
    {"ticker": "CLS", "name": "Celestica", "sector": "Infrastructure"},
    {"ticker": "FN", "name": "Fabrinet", "sector": "Infrastructure"},
    {"ticker": "ETN", "name": "Eaton", "sector": "Electrical Infrastructure"},
    {"ticker": "SU", "symbol": "SU.PA", "name": "Schneider Electric", "sector": "Electrical Infrastructure"},
    {"ticker": "GE", "name": "GE Aerospace", "sector": "Aerospace"},
    {"ticker": "CSL", "name": "Carlisle Companies", "sector": "Industrials"},
    {"ticker": "CAT", "name": "Caterpillar", "sector": "Industrials"},
    {"ticker": "ZBRA", "name": "Zebra Technologies", "sector": "Industrials / Automation"},
    {"ticker": "LLY", "name": "Eli Lilly", "sector": "Health"},
    {"ticker": "ABBV", "name": "AbbVie", "sector": "Health"},
    {"ticker": "TMO", "name": "Thermo Fisher Scientific", "sector": "Health"},
    {"ticker": "DHR", "name": "Danaher", "sector": "Health"},
    {"ticker": "V", "name": "Visa", "sector": "Payments"},
    {"ticker": "MA", "name": "Mastercard", "sector": "Payments"},
    {"ticker": "BAE", "symbol": "BAE.L", "name": "BAE Systems", "sector": "Defense"},
    {"ticker": "QLYS", "name": "Qualys", "sector": "Cybersecurity"},
]

PORTFOLIO_PENDING: list[TrackedTicker] = [
    {"ticker": "MCK", "name": "McKesson", "sector": "Health", "state": "PENDING"},
]

WATCHLIST: list[TrackedTicker] = [
    {"ticker": "MU", "name": "Micron Technology", "sector": "Semiconductors"},
    {"ticker": "TER", "name": "Teradyne", "sector": "Semiconductor Equipment"},
    {"ticker": "VRT", "name": "Vertiv", "sector": "Data Centers"},
    {"ticker": "IRM", "name": "Iron Mountain", "sector": "Data Centers"},
    {"ticker": "DLR", "name": "Digital Realty", "sector": "Data Centers"},
    {"ticker": "EQIX", "name": "Equinix", "sector": "Data Centers"},
    {"ticker": "PWR", "name": "Quanta Services", "sector": "Electrical Infrastructure"},
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
    {"ticker": "VRTX", "name": "Vertex Pharmaceuticals", "sector": "Biotech"},
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
    {"ticker": "MELI", "name": "MercadoLibre", "sector": "Commerce / Fintech"},
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
    {"ticker": "BSX", "name": "Boston Scientific", "sector": "Health"},
    {"ticker": "LMT", "name": "Lockheed Martin", "sector": "Defense"},
    {"ticker": "OVV", "name": "Ovintiv", "sector": "Energy"},
    {"ticker": "ICE", "name": "Intercontinental Exchange", "sector": "Financial Infrastructure"},
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
    if len(set(watch)) != len(watch):
        raise RuntimeError("duplicate watchlist ticker")
    overlap = sorted(portfolio.intersection(watch))
    if overlap:
        raise RuntimeError(f"portfolio/watchlist overlap: {','.join(overlap)}")


validate_universe()
