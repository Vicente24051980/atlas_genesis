# FinancialData.Net live certification basket

Initial cross-market coverage gate for ATLAS Ω:

- US: MSFT, GOOGL, AMZN, NVDA
- ADR / global: TSM, ASML
- International-native: SU.PA, SAF.PA, TLX.DE

Certification checks provider coverage for company information, key metrics, income statement, balance sheet, cash flow and prices. Passing this coverage gate is **not** canonical validation. Material values must then be reconciled against Level-1 issuer/regulatory sources.

Suggested command after configuring `FINANCIALDATANET_API_KEY`:

```bash
python -m atlas_financiero.integrations.cli_certify MSFT GOOGL AMZN NVDA TSM ASML SU.PA:intl SAF.PA:intl TLX.DE:intl
```
