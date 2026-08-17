# ATLAS Ω — 12 FINALISTS SCENARIO / CAGR GATE

Date: 2026-08-17
Status: RESEARCH SNAPSHOT — NOT PORTFOLIO / NOT AUTOMATIC BUY
Parent report: `atlas_omega/research/2026-08-17_ATLAS_TOP20_DEEP_DIVE_TO_12_FINALISTS.md`

## Purpose
Take the 12 sector-agnostic finalists through a common 4-year valuation-normalization test inside the user’s 3–6 year horizon. The purpose is to distinguish:
- where economic money is being captured,
- where the business is excellent,
- where the current valuation can plausibly compound at a high rate,
- and where the same economic proof is already too fully priced.

## Data integrity
- Fundamental proof uses latest published Q2/Q3/FY data retrievable through 2026-08-17.
- Starting valuation anchors are independently validated snapshots mainly from 2026-07-30/31; they are not presented as live 2026-08-17 multiples.
- Where recent Aug closes were available, they were used only as a drift/crowding check rather than silently changing the common valuation anchor.
- Bear/Base/Bull growth rates and terminal multiples below are ATLAS scenario assumptions, not analyst promises.
- One-year consensus is used as an anchor, then deliberately normalized. Current one-year growth spikes are NOT extrapolated for four years.
- Price CAGR excludes dividends. Dividend yield can add roughly 0–2.5 percentage points depending on company and future payout; it is not guaranteed.

## Formula
4-year price CAGR = `[(1 + normalized per-share growth)^4 × (terminal P/E / starting forward P/E)]^(1/4) - 1`.

This is deliberately simple and auditable. It does not pretend to be a full DCF. The next ATLAS Implied Return Ω layer can replace P/E with normalized FCF/share where FCF is economically cleaner.

## Verified valuation anchors
|Ticker|Validated forward-P/E anchor|Anchor note|
|---|---:|---|
|TSM|17.75x|StockAnalysis/S&P Global stats, Jul-31; ADR valuation field.|
|CB|12.65x|StockAnalysis/S&P Global forecast, Jul-23/30 snapshot.|
|MSFT|23.07x|StockAnalysis/S&P Global FY27 forecast snapshot; MarketWatch Aug-10 independently described ~25x after rerating.|
|NVDA|21.70x|StockAnalysis/S&P Global FY27 forecast snapshot Jul-28/29.|
|BKR|23.29x|StockAnalysis/S&P Global FY26 forecast snapshot Jul-29.|
|LMT|18.55x|Validated late-Jul snapshot in prior audit.|
|META|16.99x|StockAnalysis/S&P Global FY26 forecast snapshot Jul-30.|
|GOOGL|25.12x|StockAnalysis/S&P Global statistics Jul-31.|
|GD|22.90x|StockAnalysis/S&P Global FY26 forecast snapshot Jul-30.|
|ICE|19.47x|StockAnalysis/S&P Global FY26 forecast snapshot Jul-22/30.|
|APH|32.19x|StockAnalysis/S&P Global FY26 forecast snapshot Jul-30.|
|FIX|34.67x|Derived from validated Jul-30 close $1,697.84 / FY26 consensus EPS $48.97.|

## Bear / Base / Bull assumptions and price CAGR

|Ticker|Bear growth / terminal PE|Bear CAGR|Base growth / terminal PE|Base CAGR|Bull growth / terminal PE|Bull CAGR|ATLAS gate|
|---|---|---:|---|---:|---|---:|---|
|NVDA|14% / 16x|5.6%|26% / 24x|29.2%|36% / 30x|47.5%|PASS — highest upside, highest event/cycle sensitivity|
|TSM|12% / 14x|5.5%|20% / 19x|22.1%|26% / 23x|34.4%|PASS — strongest valuation/growth balance; geopolitical sizing cap|
|META|7% / 13x|0.1%|15% / 19x|18.3%|22% / 24x|33.0%|PASS — CAPEX-payback gate remains critical|
|MSFT|9% / 20x|5.2%|14% / 26x|17.5%|18% / 31x|27.0%|PASS — high-quality monetization with CAPEX burden|
|APH|10% / 20x|-2.3%|18% / 28x|14.0%|25% / 34x|26.7%|PASS / SIZING — excellent proof, high multiple-compression sensitivity|
|GOOGL|7% / 18x|-1.6%|15% / 24x|13.7%|21% / 29x|25.4%|PASS — business growth strong; FCF/CAPEX payback must recover|
|FIX|8% / 20x|-5.9%|20% / 28x|13.8%|28% / 34x|27.4%|PASS / SIZING — very high growth but hyperscaler/funding-pool + multiple risk|
|ICE|5% / 16x|~0.0%|9% / 20x|9.7%|13% / 23x|17.8%|BALLAST / COMPOUNDER — lower CAGR, cleaner funding pool|
|CB|4% / 10x|-1.9%|7% / 13x|7.7%|10% / 15x|14.8%|BALLAST / LOW-BETA — exceptional quality, not a high-CAGR winner at base assumptions|
|LMT|2% / 15x|-3.3%|7% / 19x|7.6%|11% / 22x|15.8%|BALLAST / SOVEREIGN CAPEX — backlog/FCF strong, return profile more moderate|
|BKR|2% / 15x|-8.6%|9% / 20x|4.9%|15% / 24x|15.9%|WATCH — orders/RPO are excellent but revenue conversion + valuation fail high-CAGR base gate|
|GD|3% / 16x|-5.8%|7% / 21x|4.7%|11% / 24x|12.3%|WATCH — excellent defense cash/backlog but current return hurdle is modest|

## Approximate base total-return ordering
Adding current dividend yield only as a rough non-compounding bridge does not materially change the high-CAGR group. Approximate base total-return CAGRs become roughly:
NVDA 29%, TSM 23%, META 19%, MSFT 18%, APH 15%, GOOGL 14%, FIX 14%, ICE 11%, LMT 10%, CB 9%, BKR 6%, GD 6%.

Dividend addition is only an approximation; future dividends and payout policies are not guaranteed.

## Multiple-compression sensitivity
If each company were repriced immediately from its starting forward P/E to the Bear terminal multiple, before any fundamental growth, the approximate valuation-only shock would be:
MSFT -13%; ICE -18%; LMT -19%; CB -21%; TSM -21%; META -23%; NVDA -26%; GOOGL -28%; GD -30%; BKR -36%; APH -38%; FIX -42%.

This is NOT a forecasted drawdown. It is a sensitivity test showing where the valuation layer can dominate even when the business remains intact.

## Economic proof that anchors the scenarios
- TSM: Q2 2026 revenue $40.20B, gross margin 67.7%, operating margin 60.3%; Q3 revenue guide $44.6–45.8B.
- NVDA: Q1 FY27 revenue $81.6B +85% YoY; Data Center $75.2B +92%; gross margin ~75%; Q2 revenue guide $91B ±2%.
- META: Q2 revenue $60.8B +28%; ad impressions +14%, price/ad +12%; OCF $31.9B but FCF only $0.784B because capex/finance leases were ~$31.1B; FY26 capex guide $130–145B.
- CB: Q2 core operating EPS $7.26 +18.2%; combined ratio 83.8%; core ROTE 21.2%; tangible book value/share +17.1% YoY.
- BKR: Q2 orders $10.5B; IET $7.1B; RPO $40.1B; FCF $1.109B; but revenue $6.742B was -2% YoY. CAPEX capture is proven in orders/RPO, not yet fully in revenue.
- LMT: Q2 sales $20.1B +11%; FCF $2.9B; $65B new orders; record backlog $230B.
- GD: Q2 operating cash $1.9B; capex $234M; $20B orders; book-to-bill 1.4x; backlog $136.5B.
- ICE: Q2 net revenue $2.7B +5%; adjusted EPS $1.90 +5%; adjusted margin 61%; H1 capital return $1.8B.
- APH: Q1 orders $9.4B / book-to-bill 1.24x / FCF $831M; Q2 evidence in the prior audit confirms another strong order/revenue step-up.

## Final scenario-gate classification

### A — HIGH-CAGR PASS
TSM, NVDA, MSFT, META, GOOGL, APH, FIX.

These seven have a base scenario above roughly 13% price CAGR in this deliberately normalized model. They are NOT seven independent bets: all are materially exposed to the AI/hyperscaler funding pool, directly or indirectly.

### B — DIVERSIFYING QUALITY / LOWER RETURN HURDLE
ICE, CB, LMT.

These improve funding-pool diversification, resilience and volatility characteristics, but do not beat the pure high-CAGR group on the base return model.

### C — ECONOMIC PROOF YES, INVESTMENT GATE NOT YET
BKR, GD.

BKR is the clearest example of why CAPEX Hunters Ω and Implied Return Ω must remain separate. Its order/RPO proof is exceptional, yet its current earnings/valuation setup needs materially stronger revenue/EPS conversion to clear a high-CAGR hurdle. GD has excellent backlog and cash conversion but needs a lower entry multiple or faster per-share growth to become a top implied-return candidate.

## Funding-pool law after the CAGR gate
The seven A-pass names are heavily correlated economically:
- direct AI compute/foundry: NVDA, TSM;
- hyperscaler spenders/monetizers: MSFT, META, GOOGL;
- physical connectivity/buildout captors: APH, FIX.

Therefore the result is a discovery ranking, NOT portfolio construction. A portfolio must deduplicate these funding pools before sizing.

## Key conclusion
Where the money is going and where the best stock return is likely are different questions.

CAPEX Hunters Ω answers the first.
ATLAS Implied Return Ω answers the second.
Portfolio Construction Ω must combine them without counting the same hyperscaler dollar multiple times.

At this gate, the cleanest high-CAGR combinations are TSM, NVDA, MSFT and META; GOOGL, APH and FIX remain valid passes with larger CAPEX-payback or multiple-compression sensitivities. ICE, CB and LMT are the strongest diversifying complements. BKR and GD stay alive as evidence-rich watch candidates rather than being forced into a BUY decision.

## Next action
Run the A-pass + diversifying-complement set through portfolio-level funding-pool deduplication and compare against the latest explicitly confirmed ATLAS portfolio only after the exact current portfolio snapshot is resolved. MOTOR_ORIGEN remains immutable and no research finalist automatically overwrites a portfolio holding.
