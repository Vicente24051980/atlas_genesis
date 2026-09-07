#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'src'
SELECTOR = 'capital-blind-portfolio-selection-omega'
ALLOWED = {
    'src/atlas/algorithm/capital-blind-portfolio-selection-omega.test.ts',
    'src/atlas/algorithm/point-zero-rebuild-entrypoint-omega.ts',
    'src/atlas/algorithm/point-zero-rebuild-entrypoint-omega.test.ts',
}
PATTERN = re.compile(r"(?:from\s+['\"][^'\"]*capital-blind-portfolio-selection-omega['\"]|require\([^)]*capital-blind-portfolio-selection-omega[^)]*\))")

violations: list[str] = []
for path in SRC.rglob('*'):
    if not path.is_file() or path.suffix not in {'.ts', '.tsx', '.js', '.jsx'}:
        continue
    rel = path.relative_to(ROOT).as_posix()
    if rel in ALLOWED:
        continue
    text = path.read_text(encoding='utf-8', errors='ignore')
    if SELECTOR in text and PATTERN.search(text):
        violations.append(rel)

if violations:
    print('POINT_ZERO_ENTRYPOINT_BYPASS')
    for violation in sorted(violations):
        print(f' - {violation}')
    print('Production code must call runCanonicalPointZeroRebuildOmega so SecuritySnapshot + AS_OF validation cannot be bypassed.')
    sys.exit(1)

print('POINT_ZERO_ENTRYPOINT_GUARD_OK')
