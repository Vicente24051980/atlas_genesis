#!/usr/bin/env python3
from __future__ import annotations
import argparse, itertools, json, math
from pathlib import Path
import pandas as pd

TARGET=["AVGO","REGN","ROP","INTU","V","ICE","IBKR","META","HWM","VRTX","SPGI","MELI","CW","PH","NVDA","MCK","BRK-B","RGA","DELL","GLW","CAH","VEEV","EHC","ASML","WAB","MLI","APG","AIZ","DE","CEG","VMI"]
# Restrict historical combo search to structurally marginal incumbents. This prevents the diagnostic from proposing removal of high-conviction core names merely because they lagged in-sample.
EDGE=["DELL","GLW","APG","AIZ","CEG","VMI","ASML"]
CHALLENGERS=["STRL","EME","RGLD","CBOE","CB","MEDP","CME","RSG","LMB","SEIC","PUK","WMS"]
SPY="SPY"; TD=252

def metrics(ret,tickers,spy):
    r=ret[tickers].mean(axis=1).dropna(); wealth=(1+r).cumprod(); years=len(r)/TD
    cagr=float(wealth.iloc[-1]**(1/years)-1); vol=float(r.std(ddof=1)*math.sqrt(TD)); dd=float((wealth/wealth.cummax()-1).min())
    q=r.quantile(.05); cv=float(r[r<=q].mean()); al=pd.concat([r.rename('p'),spy.rename('s')],axis=1).dropna(); beta=float(al.cov().loc['p','s']/al['s'].var())
    risk=.65*abs(dd)+.20*abs(cv)*math.sqrt(TD)+.15*vol
    return {"cagr":cagr,"vol":vol,"maxdd":dd,"beta":beta,"u":cagr-risk}

def main():
    import yfinance as yf
    ap=argparse.ArgumentParser(); ap.add_argument('--start',default='2023-09-05'); ap.add_argument('--end',default='2026-09-05'); ap.add_argument('--outdir',default='artifacts/structural-edge-combo'); a=ap.parse_args()
    universe=list(dict.fromkeys(TARGET+CHALLENGERS+[SPY])); raw=yf.download(universe,start=a.start,end=a.end,auto_adjust=True,progress=False,threads=True)
    close=raw['Close']; rets=close.pct_change(fill_method=None).dropna(); spy=rets[SPY]; stocks=rets.drop(columns=[SPY]); base=metrics(stocks,TARGET,spy)
    rows=[]
    for k in (1,2,3):
      for outs in itertools.combinations(EDGE,k):
        for ins in itertools.combinations(CHALLENGERS,k):
          trial=[t for t in TARGET if t not in outs]+list(ins); m=metrics(stocks,trial,spy)
          rows.append({"k":k,"outs":list(outs),"ins":list(ins),"delta_u":m['u']-base['u'],**m})
    rows.sort(key=lambda x:x['delta_u'],reverse=True)
    out=Path(a.outdir); out.mkdir(parents=True,exist_ok=True); (out/'combo_audit.json').write_text(json.dumps({"status":"DIAGNOSTIC_ONLY","base":base,"top":rows[:100]},indent=2),encoding='utf-8')
    lines=["# ATLAS Ω structural-edge combo diagnostic","","> Historical diagnostic only. Core names are excluded from the sell set by construction; forward structural review remains authoritative.","",f"Base U={base['u']:.4f} CAGR={base['cagr']:.2%} Vol={base['vol']:.2%} MaxDD={base['maxdd']:.2%}","","|#|k|OUT|IN|ΔU|CAGR|Vol|MaxDD|","|---:|---:|---|---|---:|---:|---:|---:|"]
    for i,r in enumerate(rows[:30],1): lines.append(f"|{i}|{r['k']}|{','.join(r['outs'])}|{','.join(r['ins'])}|{r['delta_u']:+.4f}|{r['cagr']:.2%}|{r['vol']:.2%}|{r['maxdd']:.2%}|")
    (out/'combo_audit.md').write_text('\n'.join(lines),encoding='utf-8'); print('\n'.join(lines))
if __name__=='__main__': main()
