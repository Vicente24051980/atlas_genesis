from __future__ import annotations

import pytest

from api.global_capex_chain_mobile import capex_chain_profile


@pytest.mark.asyncio
async def test_mapped_capex_profile_has_taxonomy_but_no_fabricated_score():
    payload = await capex_chain_profile("pwr")
    assert payload["mapped"] is True
    assert payload["edd"] == 3
    assert payload["role"] == "PHYSICAL_INFRASTRUCTURE"
    assert payload["evidenceGate"] == "STRUCTURAL_MAP_ONLY"
    assert payload["capexPositionScore"] is None
    assert payload["structuralOpportunityScore"] is None


@pytest.mark.asyncio
async def test_edd_zero_is_payback_cohort():
    payload = await capex_chain_profile("msft")
    assert payload["edd"] == 0
    assert payload["economicMode"] == "PAYBACK"


@pytest.mark.asyncio
async def test_unknown_ticker_requires_research_instead_of_fabrication():
    payload = await capex_chain_profile("ZZZZ")
    assert payload["mapped"] is False
    assert payload["evidenceGate"] == "EVIDENCE_REQUIRED"
    assert payload["structuralOpportunityScore"] is None
