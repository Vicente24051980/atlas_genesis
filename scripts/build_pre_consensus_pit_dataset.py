#!/usr/bin/env python3
import csv, gzip, io, json, os, time, urllib.parse, urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

UA='ATLAS-Research/1.0 github.com/Vicente24051980/atlas_genesis'
ROOT=Path(__file__).resolve().parents[1]
UNIVERSE=ROOT/'data/pre_consensus/pilot_universe.csv'
OUT=ROOT/'data/pre_consensus/generated/pit_panel.csv'
SEC_TICKERS='https://www.sec.gov/files/company_tickers.json'

def get(url, timeout=45):
    req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json,text/csv,text/plain,*/*'})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        raw=r.read()
        if r.headers.get('Content-Encoding','').lower()=='gzip' or raw[:2]==b'\x1f\x8b':
            raw=gzip.decompress(raw)
        return raw

def load_universe(limit=None):
    with UNIVERSE.open() as f: rows=list(csv.DictReader(f))
    return rows[:limit] if limit else rows

def sec_map():
    data=json.loads(get(SEC_TICKERS))
    return {x['ticker'].upper():{'cik':int(x['cik_str']),'title':x['title']} for x in data.values()}

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

def stooq_history(ticker, start='20200101', end='20260705'):
    sym=ticker.lower().replace('-','.')+'.us'
    url=f'https://stooq.com/q/d/l/?s={urllib.parse.quote(sym)}&d1={start}&d2={end}&i=d'
    text=get(url).decode('utf-8','replace')
    rows=[]
    for r in csv.DictReader(io.StringIO(text)):
        try: rows.append((r['Date'],float(r['Close'])))
        except Exception: pass
    return {'rows':rows,'source':url}

def stooq_price_from_history(hist, asof):
    eligible=[r for r in hist['rows'] if r[0]<=asof]
    if not eligible: return None
    d,c=eligible[-1]
    return {'date':d,'close':c,'source':hist['source']}

def pageviews_history(title, start='20201201', end='20260630'):
    t=urllib.parse.quote(title,safe='')
    url=f'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{t}/daily/{start}/{end}'
    try:
        items=json.loads(get(url)).get('items',[])
        rows=[(datetime.strptime(str(x['timestamp'])[:8],'%Y%m%d').date(),int(x.get('views',0))) for x in items]
        return {'rows':rows,'source':url}
    except Exception as e:
        print('PAGEVIEWS_FAIL',title,e)
        return {'rows':[],'source':url}

def pageviews_from_history(hist, asof, days=90):
    end=datetime.fromisoformat(asof).date()-timedelta(days=1); start=end-timedelta(days=days-1)
    vals=[v for d,v in hist['rows'] if start<=d<=end]
    return {'views':sum(vals),'days':len(vals),'source':hist['source']} if vals else None

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
      'shares':['EntityCommonStockSharesOutstanding','WeightedAverageNumberOfDilutedSharesOutstanding']
    }
    for u in universe:
        ticker=u['ticker']
        map_keys=[ticker,ticker.replace('-',''),ticker.replace('-','.')]
        sec=next((mapping.get(k) for k in map_keys if mapping.get(k)),None)
        if not sec:
            print('NO_SEC_MAP',ticker); continue
        try: facts=facts_for(sec['cik'])
        except Exception as e:
            print('SEC_FAIL',ticker,e); continue
        try: price_hist=stooq_history(ticker)
        except Exception as e:
            print('PRICE_FAIL',ticker,e); price_hist={'rows':[],'source':''}
        att_hist=pageviews_history(u['wikipedia_title'])
        for snap in snaps:
            px=stooq_price_from_history(price_hist,snap); att=pageviews_from_history(att_hist,snap)
            rec={'ticker':ticker,'sector':u['sector'],'snapshot_date':snap,'cik':sec['cik'],'company_name':sec['title'],
                 'price_date':px['date'] if px else '','close':px['close'] if px else '',
                 'pageviews_90d':att['views'] if att else '','pageview_days':att['days'] if att else '',
                 'sec_companyfacts_url':f'https://data.sec.gov/api/xbrl/companyfacts/CIK{sec["cik"]:010d}.json',
                 'price_source':px['source'] if px else price_hist.get('source',''),'attention_source':att['source'] if att else att_hist.get('source','')}
            filed=[]
            for name, cs in concepts.items():
                f=latest_fact_asof(facts,cs,snap)
                rec[name]=f['value'] if f else ''; rec[name+'_filed']=f['filed'] if f else ''; rec[name+'_period_end']=f['period_end'] if f else ''
                if f: filed.append(f['filed'])
            rec['latest_filing_used']=max(filed) if filed else ''
            rec['pit_valid']=bool(px and rec['latest_filing_used'] and rec['latest_filing_used']<=snap)
            rows.append(rec)
        time.sleep(0.12)
    OUT.parent.mkdir(parents=True,exist_ok=True)
    fields=list(rows[0].keys()) if rows else []
    with OUT.open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
    valid=sum(1 for r in rows if r['pit_valid'])
    coverage=valid/len(rows) if rows else 0
    print(json.dumps({'rows':len(rows),'valid_pit_rows':valid,'pit_coverage':round(coverage,4),'tickers':len(set(r['ticker'] for r in rows)),'output':str(OUT)}))
    if not rows or coverage<0.70: raise SystemExit('FAIL_CLOSED: insufficient PIT-valid rows')

if __name__=='__main__': main()
