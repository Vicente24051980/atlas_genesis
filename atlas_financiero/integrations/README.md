# FinancialData.Net → ATLAS Ω

Status: **implemented adapter; runtime activation requires `FINANCIALDATANET_API_KEY`**.

## Contract

FinancialData.Net is a secondary structured-data provider. ATLAS engines must consume normalized `EvidenceRecord` objects from `FinancialDataNetAdapter`, never raw provider payloads.

## Safety / evidence laws

- `MARKET_CAP_CHANGE != CAPITAL_FLOW`.
- Institutional holdings/13F snapshots are ownership evidence, not real-time fund-flow evidence.
- Price is not fundamental evidence.
- Missing/null is not zero.
- Decisive financial facts must be reconciled with Level-1 sources (issuer IR, regulatory filings, exchange/regulator data) before they can support a canonical thesis change.
- API keys belong in environment/secrets only; never commit credentials.

## Activation

```bash
pip install fdnpy
export FINANCIALDATANET_API_KEY='...'
```

Create the provider client in the application bootstrap and inject it into the adapter:

```python
import os
from fdnpy import FinancialDataClient
from atlas_financiero.integrations.financialdatanet_adapter import FinancialDataNetAdapter

client = FinancialDataClient(api_key=os.environ["FINANCIALDATANET_API_KEY"])
adapter = FinancialDataNetAdapter(client)
records = adapter.key_metrics("MSFT")
```

## Tests

The included unit tests validate normalization, timestamp/provenance capture and the constitutional market-cap/flow guardrail. They do not call the live API and therefore do not require credentials.

## Next runtime gate

Live certification requires a valid API key and should test a representative ATLAS basket (US + international) against primary-source filings before promotion from **SOURCE CANDIDATE** to **VALIDATED SECONDARY PROVIDER**.
