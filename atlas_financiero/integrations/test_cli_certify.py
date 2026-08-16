import pytest

from atlas_financiero.integrations.cli_certify import parse_symbols


def test_parse_symbols_routes_international_suffix():
    assert parse_symbols(["MSFT", "ASML.AS:intl"]) == [("MSFT", False), ("ASML.AS", True)]


def test_parse_symbols_rejects_empty_symbol():
    with pytest.raises(ValueError):
        parse_symbols([":intl"])
