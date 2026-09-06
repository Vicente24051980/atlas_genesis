#!/usr/bin/env python3
"""Rebuild Lingotto 13F panel Q4-2023 through Q4-2025 from SEC primary XML.

Outputs:
- normalized_snapshots.csv
- event_ledger.csv
- transition_metrics.csv
- options_layer.csv

Methodological rules:
- Q3-2025 uses Amendment No.1 information table as the canonical full table. SEC
  classifies the amendment as `adds new holdings entries`, not a restatement; the
  amended table carries the full 36-line table and separates SLB common/call exposure.
- Calls are a separate instrument layer.
- Corporate actions are normalized before share deltas are interpreted.
- Paramount Q2->Q3 2025 is left unresolved as a manager-trade delta because Class B
  holders could elect cash or stock subject to proration.
"""
from __future__ import annotations
import io
import math
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path
import pandas as pd
import requests

CIK = "1732768"
USER_AGENT = "ATLAS research contact: Vicente24051980 GitHub"
OUT = Path(__file__).resolve().parent / "generated_lingotto_2023Q4_2025Q4"
OUT.mkdir(exist_ok=True)

FILINGS = {
    "2023Q4": ("000173276824000001", "2024-02-13"),
    "2024Q1": ("000173276824000003", "2024-05-15"),
    "2024Q2": ("000173276824000005", "2024-08-12"),
    "2024Q3": ("000117266124004632", "2024-11-13"),
    "2024Q4": ("000117266125000491", "2025-02-04"),
    "2025Q1": ("000117266125002046", "2025-05-15"),
    "2025Q2": ("000117266125003216", "2025-08-13"),
    # Amendment No.1 is canonical analytical table for Q3.
    "2025Q3": ("000117266125004755", "2025-11-13"),
    "2025Q4": ("000117266126000570", "2026-02-10"),
}
QUARTERS = list(FILINGS)


def sec_url(accession: str, doc: str = "infotable.xml") -> str:
    return f"https://www.sec.gov/Archives/edgar/data/{CIK}/{accession}/{doc}"


def localname(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def text_of(node: ET.Element, wanted: str, default: str = "") -> str:
    for child in node.iter():
        if localname(child.tag) == wanted:
            return (child.text or default).strip()
    return default


def parse_information_table(q: str, accession: str, filing_date: str) -> list[dict]:
    r = requests.get(sec_url(accession), headers={"User-Agent": USER_AGENT}, timeout=30)
    r.raise_for_status()
    root = ET.fromstring(r.content)
    rows = []
    for n in root.iter():
        if localname(n.tag) != "infoTable":
            continue
        issuer = text_of(n, "nameOfIssuer")
        cusip = text_of(n, "cusip")
        value = int(float(text_of(n, "value", "0")))
        shares = int(float(text_of(n, "sshPrnamt", "0")))
        put_call = text_of(n, "putCall")
        rows.append({
            "quarter": q,
            "issuer": issuer,
            "cusip": cusip,
            "value": value,
            "shares": shares,
            "option": put_call,
            "instrument_layer": "OPTION" if put_call else "LONG_13F",
            "filing_date": filing_date,
            "accession": accession,
        })
    if not rows:
        raise RuntimeError(f"No information-table rows parsed for {q}")
    return rows


def canonical_id(row: pd.Series) -> str:
    issuer = row["issuer"].upper()
    if "GINKGO" in issuer:
        return "GINKGO_LINEAGE"
    if "DESKTOP METAL" in issuer:
        return "DESKTOP_METAL_LINEAGE"
    if "GATOS SILVER" in issuer or "FIRST MAJESTIC" in issuer:
        return "GATOS_FIRST_MAJESTIC_LINEAGE"
    if "PARAMOUNT GLOBAL" in issuer or "PARAMOUNT SKYDANCE" in issuer:
        return "PARAMOUNT_LINEAGE"
    if row["cusip"] == "806857108":
        return "SLB_LINEAGE"
    return row["cusip"]


def normalize_prev_shares(k: str, q0: str, q1: str, shares: float) -> tuple[float, str]:
    if k == "GINKGO_LINEAGE" and (q0, q1) == ("2024Q2", "2024Q3"):
        return shares / 40.0, "Ginkgo 1-for-40 reverse split effective 2024-08-19"
    if k == "DESKTOP_METAL_LINEAGE" and (q0, q1) == ("2024Q1", "2024Q2"):
        return shares / 10.0, "Desktop Metal 1-for-10 reverse split effective 2024-06-10"
    if k == "GATOS_FIRST_MAJESTIC_LINEAGE" and (q0, q1) == ("2024Q4", "2025Q1"):
        return shares * 2.55, "Gatos -> First Majestic exchange ratio 2.55x, completed 2025-01-16"
    return shares, ""


def build_event_ledger(long_df: pd.DataFrame) -> pd.DataFrame:
    out = []
    for q0, q1 in zip(QUARTERS[:-1], QUARTERS[1:]):
        a = long_df[long_df.quarter.eq(q0)].set_index("canonical_security_id")
        b = long_df[long_df.quarter.eq(q1)].set_index("canonical_security_id")
        for k in sorted(set(a.index) | set(b.index)):
            if k not in a.index:
                out.append((q0, q1, k, "NEW_VISIBLE_POSITION", math.nan,
                            float(b.loc[k, "shares"]), math.nan,
                            float(b.loc[k, "value"]), ""))
                continue
            if k not in b.index:
                out.append((q0, q1, k, "VISIBLE_EXIT", float(a.loc[k, "shares"]),
                            math.nan, math.nan, float(a.loc[k, "value"]), ""))
                continue
            raw0 = float(a.loc[k, "shares"])
            s1 = float(b.loc[k, "shares"])
            if k == "PARAMOUNT_LINEAGE" and (q0, q1) == ("2025Q2", "2025Q3"):
                out.append((q0, q1, k, "CORPORATE_ACTION_MIXED_CONSIDERATION",
                            raw0, s1, math.nan, math.nan,
                            "Class B holders could elect $15 cash or 1 share, subject to proration"))
                continue
            s0, note = normalize_prev_shares(k, q0, q1, raw0)
            d = s1 - s0
            tol = max(1.0, abs(s0) * 1e-6)
            if abs(d) <= tol:
                event = "UNCHANGED_SHARES"
            elif d > 0:
                event = "VISIBLE_POSITION_INCREASE"
            else:
                event = "VISIBLE_POSITION_DECREASE"
            p1 = float(b.loc[k, "value"]) / s1
            out.append((q0, q1, k, event, s0, s1, d, abs(d) * p1, note))
    return pd.DataFrame(out, columns=[
        "from_quarter", "to_quarter", "canonical_security_id", "event",
        "normalized_prev_shares", "current_shares", "normalized_delta_shares",
        "approx_abs_trade_value_at_to_q_price", "note"
    ])


def transition_metrics(long_df: pd.DataFrame, ledger: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for q0, q1 in zip(QUARTERS[:-1], QUARTERS[1:]):
        a = long_df[long_df.quarter.eq(q0)].set_index("canonical_security_id")
        b = long_df[long_df.quarter.eq(q1)].set_index("canonical_security_id")
        wa = (a.value / a.value.sum()).to_dict()
        wb = (b.value / b.value.sum()).to_dict()
        visible_weight_churn = 0.5 * sum(abs(wa.get(k, 0) - wb.get(k, 0)) for k in set(wa) | set(wb))
        e = ledger[ledger.from_quarter.eq(q0) & ledger.to_quarter.eq(q1)]
        avg_book = (a.value.sum() + b.value.sum()) / 2
        share_flow_proxy = e.approx_abs_trade_value_at_to_q_price.sum(skipna=True) / avg_book
        c = e.event.value_counts().to_dict()
        rows.append({
            "from_quarter": q0, "to_quarter": q1,
            "long_lines_from": len(a), "long_lines_to": len(b),
            "long_book_value_from": int(a.value.sum()), "long_book_value_to": int(b.value.sum()),
            "visible_weight_churn": visible_weight_churn,
            "approx_share_flow_proxy_over_avg_book": share_flow_proxy,
            "new": c.get("NEW_VISIBLE_POSITION", 0), "exit": c.get("VISIBLE_EXIT", 0),
            "increase": c.get("VISIBLE_POSITION_INCREASE", 0),
            "decrease": c.get("VISIBLE_POSITION_DECREASE", 0),
            "unchanged": c.get("UNCHANGED_SHARES", 0),
            "corp_action_unresolved": c.get("CORPORATE_ACTION_MIXED_CONSIDERATION", 0),
        })
    return pd.DataFrame(rows)


def main() -> None:
    rows = []
    for q, (acc, date) in FILINGS.items():
        rows.extend(parse_information_table(q, acc, date))
    df = pd.DataFrame(rows)
    df["canonical_security_id"] = df.apply(canonical_id, axis=1)
    long_df = df[df.instrument_layer.eq("LONG_13F")].copy()
    long_df["visible_weight_long_only"] = long_df.groupby("quarter")["value"].transform(lambda x: x / x.sum())
    ledger = build_event_ledger(long_df)
    metrics = transition_metrics(long_df, ledger)

    df.to_csv(OUT / "normalized_snapshots.csv", index=False)
    ledger.to_csv(OUT / "event_ledger.csv", index=False)
    metrics.to_csv(OUT / "transition_metrics.csv", index=False)
    df[df.instrument_layer.eq("OPTION")].to_csv(OUT / "options_layer.csv", index=False)
    print(metrics.to_string(index=False))


if __name__ == "__main__":
    main()
