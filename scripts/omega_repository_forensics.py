#!/usr/bin/env python3
"""Ω58–Ω62 repository forensics. Emits machine-readable evidence; never infers authority from filenames."""
from __future__ import annotations

import argparse
import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXECUTABLE_SUFFIXES = {'.py', '.ts', '.tsx', '.js', '.mjs', '.cjs'}
SKIP_PARTS = {'.git', 'node_modules', 'dist', 'build', '.next'}
CONSTANT_PATTERNS = {
    'fixed_n_20_35': re.compile(r'\b(?:MIN|MAX)_PORTFOLIO_POSITIONS\b|\b20\s*[-–]\s*35\b'),
    'fixed_n_30_32': re.compile(r'\b(?:N\s*=\s*(?:30|32)|OPTIMAL_N\s*=\s*(?:30|32))\b'),
    'diversification_authority': re.compile(r'\b(?:diversificationBonus|diversification_bonus|sectorCap|sector_cap)\b'),
    'incumbency_authority': re.compile(r'\b(?:incumbencyBonus|incumbency_bonus|mustKeep|must_keep|protectedTicker)\b'),
    'personal_state': re.compile(r'\b(?:currentInvestedEur|currentPositionWeight|personalPnLPct|personalAverageCost|isCurrentlyHeld|costBasis|personalExposure)\b'),
}
NARRATIVE_TERMS = re.compile(r'\b(?:must own|preferred|elite|founder quality|strategic asset|qualitative conviction|AI narrative)\b', re.I)


def files():
    for path in ROOT.rglob('*'):
        if not path.is_file() or any(part in SKIP_PARTS for part in path.parts):
            continue
        yield path


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def classify(path: Path) -> str:
    p = rel(path)
    if p.startswith(('docs/', 'CURRENT_CANON/', 'reports/')) or path.suffix.lower() in {'.md', '.txt'}:
        return 'DOC_ONLY_OR_RECORD'
    if p.startswith('tests/') or '.test.' in p or p.endswith('_test.py'):
        return 'TEST'
    if p.startswith('scripts/'):
        return 'SCRIPT'
    if path.suffix in EXECUTABLE_SUFFIXES:
        return 'EXECUTABLE_SOURCE'
    return 'DATA_OR_OTHER'


def python_imports(path: Path) -> list[str]:
    try:
        tree = ast.parse(path.read_text(encoding='utf-8'))
    except Exception:
        return []
    out = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            out.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            out.append(node.module)
    return sorted(set(out))


def js_imports(text: str) -> list[str]:
    patterns = [r'\bfrom\s+[\'\"]([^\'\"]+)[\'\"]', r'\brequire\(\s*[\'\"]([^\'\"]+)[\'\"]\s*\)']
    return sorted(set(m.group(1) for pattern in patterns for m in re.finditer(pattern, text)))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='reports/generated/omega_repository_forensics.json')
    args = ap.parse_args()

    rows, constants, narrative = [], [], []
    for path in files():
        p = rel(path)
        kind = classify(path)
        text = ''
        if path.suffix.lower() in EXECUTABLE_SUFFIXES | {'.md', '.json', '.yml', '.yaml'}:
            try:
                text = path.read_text(encoding='utf-8')
            except Exception:
                text = ''
        imports = python_imports(path) if path.suffix == '.py' else js_imports(text) if path.suffix in EXECUTABLE_SUFFIXES else []
        rows.append({'file': p, 'classification': kind, 'imports': imports})
        for name, pattern in CONSTANT_PATTERNS.items():
            matches = sorted(set(m.group(0) for m in pattern.finditer(text)))
            if matches:
                constants.append({'file': p, 'classification': kind, 'pattern': name, 'matches': matches})
        if kind in {'EXECUTABLE_SOURCE', 'SCRIPT'} and NARRATIVE_TERMS.search(text):
            narrative.append({'file': p, 'status': 'REVIEW_REQUIRED', 'reason': 'narrative term appears in executable code'})

    executable_paths = {row['file'] for row in rows if row['classification'] in {'EXECUTABLE_SOURCE', 'SCRIPT'}}
    inbound = {p: 0 for p in executable_paths}
    for row in rows:
        for imported in row['imports']:
            normalized = imported.replace('.', '/')
            for target in executable_paths:
                stem = target.rsplit('.', 1)[0]
                if normalized.endswith(stem) or normalized.endswith('/' + stem.split('/')[-1]):
                    inbound[target] += 1

    for row in rows:
        if row['file'] in inbound:
            row['inboundImportCount'] = inbound[row['file']]
            row['runtimeAuthority'] = 'POSSIBLE_ENTRYPOINT' if inbound[row['file']] == 0 else 'IMPORTED_CONFIRMED_STATIC'

    payload = {
        'schema': 'OMEGA_REPOSITORY_FORENSICS_2026-09-07-v1',
        'rule': 'STATIC_IMPORT_EVIDENCE_ONLY; filename names confer zero authority',
        'files': rows,
        'constantRegistryFindings': constants,
        'narrativeExecutableFindings': narrative,
        'limitations': [
            'dynamic imports/reflection/subprocess entrypoints require runtime tracing',
            'static detection is evidence, not proof of production invocation',
            'historical/doc occurrences are retained as provenance and are not automatically violations',
        ],
    }
    out = ROOT / args.out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'output': rel(out), 'files': len(rows), 'constant_findings': len(constants), 'narrative_findings': len(narrative)}))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
