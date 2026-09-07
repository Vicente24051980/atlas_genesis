from pathlib import Path

RAW = Path('data/t0-universe-user-seed-2026-09-05.txt')
CANONICAL = Path('data/atlas-core-universe-economic-entities-2026-09-06.txt')
ALIASES = {'GOOG': 'GOOGL', 'FOX': 'FOXA', 'NWS': 'NWSA'}


def _tokens(path: Path) -> list[str]:
    out: list[str] = []
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        out.extend(line.split())
    return out


def _first_seen_unique(tokens: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for ticker in tokens:
        if ticker not in seen:
            seen.add(ticker)
            out.append(ticker)
    return out


def _canonical_entities(raw_tokens: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for raw in raw_tokens:
        entity = ALIASES.get(raw, raw)
        if entity not in seen:
            seen.add(entity)
            out.append(entity)
    return out


def test_point_zero_universe_counts_and_aliases_are_reproducible() -> None:
    raw = _tokens(RAW)
    unique = _first_seen_unique(raw)
    canonical = _canonical_entities(raw)

    assert len(raw) == 650
    assert len(unique) == 490
    assert len(canonical) == 487
    assert set(ALIASES) <= set(unique)
    assert {'GOOGL', 'FOXA', 'NWSA'} <= set(canonical)
    assert not (set(ALIASES) & set(canonical))


def test_canonical_entity_file_exactly_matches_deterministic_normalization() -> None:
    raw = _tokens(RAW)
    expected = _canonical_entities(raw)
    stored = _tokens(CANONICAL)

    assert len(stored) == 487
    assert stored == expected
    assert len(stored) == len(set(stored))
