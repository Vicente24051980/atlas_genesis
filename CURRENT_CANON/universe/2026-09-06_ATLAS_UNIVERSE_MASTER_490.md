# ATLAS Ω — MASTER UNIVERSE 490

Date: 2026-09-06
Status: ACTIVE_CANONICAL / SELECTOR INPUT

## Law

This is the effective ATLAS selector universe derived from the user's 650-entry Nasdaq 100 + expanded/adjusted S&P 500 source by deterministic ticker deduplication.

- RAW source rows: 650
- UNIQUE selector tickers: 490
- Duplicate rows: 160
- Deduplication key: normalized ticker symbol
- Sector, index membership, source frequency and duplicate occurrence add zero selection authority.
- Every ticker starts from zero under the same ATLAS gates.
- Portfolio construction remains MAX RETURN / LOW VOL with endogenous N.

## Canonical tickers

AAPL, MSFT, NVDA, GOOGL, GOOG, AVGO, ADBE, AMD, AMAT, ASML, ARM, APP, TEAM, ADSK, CDNS, CRWD, DDOG, FTNT, INTC, INTU, KLAC, LRCX, MRVL, MCHP, MU, MPWR, NXPI, PANW, QCOM, ROP, STX, SNPS, TER, TXN, WDC, WDAY, AMZN, META, NFLX, BKNG, DASH, EBAY, MELI, PYPL, SHOP, TTD, TSLA, ABNB, CCEP, COST, KDP, KHC, MAR, MDLZ, MNST, ORLY, PEP, ROST, SBUX, TTWO, WBD, ALNY, AMGN, AZN, AXON, BIIB, DXCM, GILD, IDXX, ILMN, INSM, ISRG, MRNA, REGN, VRTX, CHTR, CMCSA, TMUS, ADP, BKR, CTAS, CTSH, CPRT, CSX, FANG, FAST, FER, GEHC, HON, ODFL, PCAR, PAYX, VRSK, AEP, CEG, EXC, XEL, CSCO, LIN, CSGP, PLTR, ORCL, DELL, ANET, IBM, CRM, APH, ADI, VRSN, AKAM, GEN, EPAM, IT, JBL, PTC, FFIV, ZS, HPQ, NTAP, SMCI, TRMB, TEL, KEYS, CDW, TYL, GLW, FI, TDY, ZBRA, ENPH, SWKS, QRVO, VZ, DIS, T, EA, OMC, IPG, LYV, FOXA, PARA, MTCH, HD, MCD, LOW, TJX, NKE, AZO, HLT, CMG, GM, F, DHI, LEN, DRI, YUM, RCL, CCL, MGM, WYNN, EXPE, APTV, TSCO, ULTA, GRMN, NVR, POOL, DPZ, BBY, HAS, WMT, KO, PG, PM, MO, CL, TGT, SYY, GIS, KMB, MKC, HSY, ADM, CAG, SJM, TSN, CLX, EL, KVUE, DG, DLTR, KR, BRK.B, JPM, V, MA, BAC, MS, GS, WFC, AXP, C, SCHW, BLK, SPGI, CB, PGR, ICE, CME, MMC, MCO, AON, PNC, USB, COF, TFC, AIG, MET, PRU, TRV, AJG, DFS, FITB, HBAN, NTRS, TROW, CINF, NDAQ, ACGL, STT, BK, MTB, RF, CFG, KEY, FIS, GPN, LLY, JNJ, ABBV, MRK, UNH, TMO, ABT, DHR, PFE, MDT, SYK, CI, ELV, ZTS, BSX, BDX, HUM, CVS, CAH, MCK, ZBH, A, IQV, RMD, EW, HCA, WAT, HSIC, MTD, LH, DGX, STE, COO, CAT, GE, RTX, GEV, UNP, LMT, NOC, GD, BA, DE, ETN, UPS, FDX, NSC, ITW, EMR, PH, TT, TDG, CARR, DOV, EXPD, CHRW, LUV, DAL, UAL, MMM, SWK, ROK, AME, HUBB, GWW, XOM, CVX, COP, EOG, SLB, MPC, PSX, VLO, WMB, OKE, HAL, HES, OXY, DVN, KMI, APA, CTRA, TRGP, ECL, APD, SHW, FCX, NUE, DOW, DD, PPG, VMC, MLM, STLD, BALL, AVY, ALB, MOS, CF, NEE, SO, DUK, SRE, D, PCG, PEG, ED, WEC, DTE, ES, NI, AEE, ETR, CNP, PLD, AMT, EQIX, CCI, PSA, WELL, DLR, O, SPG, VTR, EXR, SBAC, AVB, EQR, HST, IRM, ENTG, SNX, DAY, DXC, VRNT, NWSA, NWS, FOX, BWA, KMX, LKQ, NCLH, PENN, PVH, RL, TPR, VFC, WHR, CZR, CPB, CHD, HRL, LW, TAP, WBA, AFL, ALL, ALLY, AMP, AIZ, CBOE, CMA, EG, FDS, GL, IVZ, JEF, LNC, L, MKTX, PFG, RJF, SYF, WRB, WTW, ZION, ALGN, BIO, TECH, CRL, XRAY, INCY, PODD, MOH, OGN, RVTY, TFX, UHS, VTRIS, WST, AOS, ALK, ALLE, AAL, GNRC, HII, JBHT, MAS, PNR, PWR, RHI, ROL, SNA, TXT, WAB, XYL, EQT, MRO, DINO, FTI, AMCR, ATR, CE, CTVA, EMN, FMC, IP, PKG, SEE, SW, AES, LNT, AWK, ATO, CMS, FE, NRG, PNW, PPL, ARE, BXP, CPT, FRT, DOC, KIM, MAA, UDR, VICI, WPC, BR, BF.B, CTLT, ERIE, EVRG, CPAY, HWM, J, LULU, OTIS, VLTO, ACN, BAX, BMY.

## Selector semantics

`Universe -> eligibility -> forward ER -> weighted risk (40% permanent loss / 20% tail / 40% volatility) -> fragility/scenarios -> marginal portfolio contribution -> endogenous N -> sizing`.

No ticker may receive extra authority because it appears twice in the source, belongs to both Nasdaq and S&P, or fills a sector/geographic bucket.
