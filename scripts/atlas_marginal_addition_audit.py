#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from pathlib import Path

from atlas_quant_portfolio_audit import (
    TARGET_31,
    BENCHMARK,
    calc_metrics,
    download_prices,
)

# Open tournament. No sector slots and no preferred challenger.
CHALLENGERS_32 = [
    "CME", "CB", "MEDP", "CBOE", "RSG", "LMB", "WMS", "SEIC",
    "RGLD", "PUK", "EME", "STRL",
]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", default="2023-09-05")
    ap.add_argument("--end", default="2026-09-05")
    ap.add_argument("--outdir", default="artifacts/marginal-addition-audit")
    args = ap.parse_args()

    universe = list(dict.fromkeys(TARGET_31 + CHALLENGERS_32 + [BENCHMARK]))
    prices = download_prices(universe, args.start, args.end)
    returns = prices.pct_change(fill_method=None).dropna()
    spy = returns[BENCHMARK]
    stocks = returns.drop(columns=[BENCHMARK])

    base = calc_metrics(stocks, TARGET_31, spy)
    rows = []
    for ticker in CHALLENGERS_32:
        m = calc_metrics(stocks, TARGET_31 + [ticker], spy)
        rows.append({
            "ticker": ticker,
            "n": 32,
            "cagr": m.cagr,
            "annualized_vol": m.annualized_vol,
            "max_drawdown": m.max_drawdown,
            "beta_vs_spy": m.beta_vs_spy,
            "empirical_utility_proxy": m.empirical_utility_proxy,
            "delta_u_proxy_vs_n31": m.empirical_utility_proxy - base.empirical_utility_proxy,
            "delta_cagr_vs_n31": m.cagr - base.cagr,
            "delta_vol_vs_n31": m.annualized_vol - base.annualized_vol,
            "delta_maxdd_vs_n31": m.max_drawdown - base.max_drawdown,
        })

    rows.sort(key=lambda x: x["delta_u_proxy_vs_n31"], reverse=True)
    threshold = 0.0025
    payload = {
        "status": "DIAGNOSTIC_ONLY_EXPECTED_RETURN_EVIDENCE_PENDING",
        "warning": "Historical return is not Expected Return Ω and cannot by itself promote N=32.",
        "base_n31": asdict(base),
        "materiality_threshold_proxy": threshold,
        "challengers": rows,
        "empirical_winner": rows[0]["ticker"],
        "empirical_winner_passes_proxy_threshold": rows[0]["delta_u_proxy_vs_n31"] >= threshold,
        "canonical_n32_state": "NOT_PROVEN_FORWARD_STRUCTURAL_INPUTS_REQUIRED",
    }

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / "marginal_addition_audit.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    lines = [
        "# ATLAS Ω Marginal Addition Audit — N31 → N32",
        "",
        "> DIAGNOSTIC_ONLY. Historical return is not Expected Return Ω and cannot by itself promote a challenger.",
        "",
        f"Base N31: CAGR {base.cagr:.2%} | Vol {base.annualized_vol:.2%} | MaxDD {base.max_drawdown:.2%} | U_proxy {base.empirical_utility_proxy:.4f}",
        "",
        "| Rank | Challenger | ΔU proxy | CAGR | Vol | MaxDD |",
        "|---:|---|---:|---:|---:|---:|",
    ]
    for i, row in enumerate(rows, 1):
        lines.append(
            f"| {i} | {row['ticker']} | {row['delta_u_proxy_vs_n31']:+.4f} | {row['cagr']:.2%} | {row['annualized_vol']:.2%} | {row['max_drawdown']:.2%} |"
        )
    lines += [
        "",
        f"Empirical winner: **{rows[0]['ticker']}**.",
        f"Proxy materiality threshold: {threshold:.4f}.",
        "Canonical N32: **NOT_PROVEN — forward structural inputs required**.",
    ]
    report = "\n".join(lines)
    (outdir / "marginal_addition_audit.md").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
