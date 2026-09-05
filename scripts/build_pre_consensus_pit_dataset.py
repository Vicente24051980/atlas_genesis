#!/usr/bin/env python3
import csv, io, json, os, time, urllib.parse, urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

UA='ATLAS-Research/1.0 contact: atlas@example.invalid'
ROOT=Path(__file__).resolve().parents[1]
UNIVERSE=ROOT/'data/pre_consensus/pilot_universe.csv'
OUT=ROOT/'data/pre_consensus/generated/pit_panel.csv'
SEC_TICKERS='https://www.sec.gov/files/company_tickers.json'

def get(url, timeout=30):
    req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept-Encoding':'gzip, deflate'})
    with urllib.request.urlopen(req,timeout=timeout) as r: return r.read()

def load_universe(limit=None):
    with UNIVERSE.open() as f: rows=list(csv.DictReader(f))
    return rows[:limit] if limit else rows

def sec_map():
    data=json.loads(get(SEC_TICKERS))
    out={}
    for x in data.values(): out[x['ticker'].upper()]={'cik':int(x['cik_str']),'title':x['title']}
    return out

def facts_for(cik):
    return json.loads(get(f'https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json'))

def latest_fact_asof(facts, concepts, asof):
    best=None
    gaap=facts.get('facts',{}).get('us-gaap',{})
    for c in concepts:
        obj=gaap.get(c)
        if not obj: continue
        for unit, vals in obj.get('units',{}).items():
            for v in vals:
                filed=v.get('filed'); val=v.get('val'); form=v.get('form','')
                if filed and filed<=asof and form in {'10-Q','10-K','10-Q/A','10-K/A'} and isinstance(val,(int,float)):
                    key=(filed,v.get('end',''),v.get('fy',0) or 0)
                    if best is None or key>best[0]: best=(key,val,unit,c,v.get('end'),form)
    if not best: return None
    return {'value':best[1],'unit':best[2],'concept':best[3],'period_end':best[4],'form':best[5],'filed':best[0][0]}

def stooq_price(ticker, asof):
    sym=ticker.lower().replace('-','.')+'.us'
    d2=asof.replace('-',''); d1=(datetime.fromisoformat(asof)-timedelta(days=10)).date().strftime('%Y%m%d')
    url=f'https://stooq.com/q/d/l/?s={urllib.parse.quote(sym)}&d1={d1}&d2={d2}&i=d'
    text=get(url).decode('utf-8','replace')
    rows=list(csv.DictReader(io.StringIO(text)))
    if not rows: return None
    r=rows[-1]
    try: return {'date':r['Date'],'close':float(r['Close']),'source':url}
    except Exception: return None

def pageviews(title, asof, days=90):
    end=datetime.fromisoformat(asof).date()-timedelta(days=1); start=end-timedelta(days=days-1)
    t=urllib.parse.quote(title,safe='')
    url=f'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{t}/daily/{start:%Y%m%d}/{end:%Y%m%d}'
    try:
        items=json.loads(get(url)).get('items',[]); vals=[int(x.get('views',0)) for x in items]
        return {'views':sum(vals),'days':len(vals),'source':url} if vals else None
    except Exception: return None

def quarter_ends(start_year=2021,end_year=2026):
    out=[]
    for y in range(start_year,end_year+1):
        for m,d in [(3,31),(6,30),(9,30),(12,31)]:
            dt=date(y,m,d)
            if dt<=date(2026,6,30): out.append(dt.isoformat())
    return out

def main():
    limit=int(os.getenv('ATLAS_PIT_LIMIT','0')) or None
    snapshots=os.getenv('ATLAS_PIT_SNAPSHOTS')
    snaps=snapshots.split(',') if snapshots else quarter_ends()
    universe=load_universe(limit); mapping=sec_map(); rows=[]
    concepts={
      'revenue':['RevenueFromContractWithCustomerExcludingAssessedTax','Revenues','SalesRevenueNet'],
      'net_income':['NetIncomeLoss','ProfitLoss'],
      'equity':['StockholdersEquity','StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],
      'cash':['CashAndCashEquivalentsAtCarryingValue','CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'],
      'assets':['Assets'],'liabilities':['Liabilities'],
      'shares':['CommonStocksIncludingAdditionalPaidInCapitalMember','EntityCommonStockSharesOutstanding']
    }
    for u in universe:
        sec=mapping.get(u['ticker'].replace('-','')) or mapping.get(u['ticker'])
        if not sec:
            print('NO_SEC_MAP',u['ticker']); continue
        try: facts=facts_for(sec['cik'])
        except Exception as e:
            print('SEC_FAIL',u['ticker'],e); continue
        for snap in snaps:
            px=stooq_price(u['ticker'],snap); att=pageviews(u['wikipedia_title'],snap)
            rec={'ticker':u['ticker'],'sector':u['sector'],'snapshot_date':snap,'cik':sec['cik'],'company_name':sec['title'],
                 'price_date':px['date'] if px else '','close':px['close'] if px else '',
                 'pageviews_90d':att['views'] if att else '','pageview_days':att['days'] if att else '',
                 'sec_companyfacts_url':f'https://data.sec.gov/api/xbrl/companyfacts/CIK{sec["cik"]:010d}.json',
                 'price_source':px['source'] if px else '','attention_source':att['source'] if att else ''}
            filed=[]
            for name, cs in concepts.items():
                f=latest_fact_asof(facts,cs,snap)
                rec[name]=f['value'] if f else ''; rec[name+'_filed']=f['filed'] if f else ''; rec[name+'_period_end']=f['period_end'] if f else ''
                if f: filed.append(f['filed'])
            rec['latest_filing_used']=max(filed) if filed else ''
            rec['pit_valid']=bool(px and rec['latest_filing_used'] and rec['latest_filing_used']<=snap)
            rows.append(rec)
        time.sleep(0.11)
    OUT.parent.mkdir(parents=True,exist_ok=True)
    fields=list(rows[0].keys()) if rows else []
    with OUT.open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
    valid=sum(1 for r in rows if r['pit_valid'])
    print(json.dumps({'rows':len(rows),'valid_pit_rows':valid,'tickers':len(set(r['ticker'] for r in rows)),'output':str(OUT)}))
    if not rows or valid < max(1,int(len(rows)*0.70)): raise SystemExit('FAIL_CLOSED: insufficient PIT-valid rows')

if __name__=='__main__': main()
