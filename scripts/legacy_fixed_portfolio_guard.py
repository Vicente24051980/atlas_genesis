#!/usr/bin/env python3
"""Fail-closed guard for historical scripts with embedded portfolio membership.

These scripts remain reproducible research artifacts, but they are not allowed to
act as current ATLAS portfolio selectors. Explicit opt-in is required so an
agent/workflow cannot accidentally resurrect a stale hard-coded portfolio.
"""
from __future__ import annotations

import os

ALLOW_ENV = "ATLAS_ALLOW_LEGACY_FIXED_PORTFOLIO"


def require_explicit_legacy_opt_in(script_name: str) -> None:
    if os.environ.get(ALLOW_ENV) != "1":
        raise RuntimeError(
            f"{script_name} is a LEGACY_FIXED_PORTFOLIO_DIAGNOSTIC and has zero current "
            f"portfolio authority. Set {ALLOW_ENV}=1 only when intentionally reproducing "
            "the historical diagnostic. Current structural selection must use the "
            "versioned universe authority + structural publication gate."
        )
