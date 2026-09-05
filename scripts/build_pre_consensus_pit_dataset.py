#!/usr/bin/env python3
import csv, gzip, io, json, os, tempfile, time, urllib.parse, urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

import duckdb

UA='ATLAS-Research/1.0 github.com/Vicente24051980/atlas_genesis'
ROOT=Path(__file__).resolve().parents[1]
UNIVERSE=ROOT/'data/pre_consensus/pilot_universe.csv'
OUT=ROOT/'data/pre_consensus/generated/pit_panel.csv'
SEC_TICKERS='https://www.sec.gov/files/company_tickers.json'
PARQUET_BASE='https://github.com/deeleeramone/sec-company-facts/releases/download/parquet-latest'
FORMS={'10-Q','10-K','10-Q/A','10-K/A'}
CACHE=Path(tempfile.gettempdir())/'atlas-sec-parquet'
CACHE.mkdir(parents=True,exist_ok=True)

def get(url, timeout=60):
    req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json,text/csv,text/plain,*/*'})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        raw=r.read()
        if r.headers.get('Content-Encoding','').lower()=='gzip' or raw[:2]==b'\x1f\x8b': raw=gzip.decompress(raw)
        return raw

def download(name):
    p=CACHE/name
    if p.exists() and p.stat().st_size>0: return p
    req=urllib.request.Request(f'{PARQUET_BASE}/{name}',headers={'User-Agent':UA})
    with urllib.request.urlopen(req,timeout=180) as r, p.open('wb') as f:
        while True:
            chunk=r.read(1<<20)
            if not chunk: break
            f.write(chunk)
    return p

def load_universe(limit=None):
    with UNIVERSE.open() as f: rows=list(csv.DictReader(f))
    return rows[:limit] if limit else rows

def direct_sec_map():
    data=json.loads(get(SEC_TICKERS))
    return {x['ticker'].upper():{'cik':str(int(x['cik_str'])),'title':x['title'],'identity_source':SEC_TICKERS} for x in data.values()}

def parquet_sec_map():
    p=download('primary_tickers.parquet')
    rows=duckdb.sql(f"SELECT cik,ticker,name FROM read_parquet('{p.as_posix()}')").fetchall()
    return {str(t).upper():{'cik':str(c).lstrip('0') or '0','title':n or t,'identity_source':f'{PARQUET_BASE}/primary_tickers.parquet'} for c,t,n in rows}

def issuer_map():
    try:
        m=direct_sec_map(); print('IDENTITY_SOURCE SEC_DIRECT'); return m
    except Exception as e:
        print('SEC_IDENTITY_FALLBACK_PARQUET',repr(e)); return parquet_sec_map()

def sec_records_direct(cik,tags):
    url=f'https://data.sec.gov/api/xbrl/companyfacts/CIK{int(cik):010d}.json'
    data=json.loads(get(url)); out=[]
    gaap=data.get('facts',{}).get('us-gaap',{})
    for tag in tags:
        obj=gaap.get(tag) or {}
        for unit,vals in obj.get('units',{}).items():
            for v in vals:
                if v.get('form') in FORMS and isinstance(v.get('val'),(int,float)):
                    out.append({'tag':tag,'unit':unit,'start':v.get('start'),'end':v.get('end'),'val':v.get('val'),'fy':v.get('fy'),'fp':v.get('fp'),'form':v.get('form'),'filed':v.get('filed'),'source':url})
    return out

def sec_records_parquet(cik,tags,max_asof):
    bucket=int(cik)%64
    facts=download(f'facts_enc-b{bucket:05d}.parquet'); xtags=download('xbrl_tags.parquet')
    tag_list=','.join("'"+t.replace("'","''")+"'" for t in sorted(tags)); forms=','.join("'"+f+"'" for f in sorted(FORMS))
    q=f"""SELECT x.tag,f.unit,CAST(f.start AS VARCHAR),CAST(f.end AS VARCHAR),f.val,f.fy,f.fp,f.form,CAST(f.filed AS VARCHAR)
    FROM read_parquet('{facts.as_posix()}') f JOIN read_parquet('{xtags.as_posix()}') x ON f.tag_id=x.tag_id
    WHERE CAST(f.cik AS BIGINT)={int(cik)} AND x.namespace='us-gaap' AND x.tag IN ({tag_list})
      AND f.form IN ({forms}) AND f.filed<=DATE '{max_asof}' ORDER BY f.filed,f.end"""
    source=f'{PARQUET_BASE}/facts_enc-b{bucket:05d}.parquet'
    return [{'tag':r[0],'unit':r[1],'start':r[2] or None,'end':r[3] or None,'val':float(r[4]),'fy':r[5],'fp':r[6],'form':r[7],'filed':r[8],'source':source} for r in duckdb.sql(q).fetchall() if r[4] is not None]

def issuer_records(cik,tags,max_asof):
    try: return sec_records_direct(cik,tags),'SEC_DIRECT'
    except Exception as e:
        print('SEC_FACTS_FALLBACK_PARQUET',cik,repr(e)); return sec_records_parquet(cik,tags,max_asof),'DOLTHUB_SEC_PARQUET_MIRROR'

def latest_fact_asof(records,concepts,asof):
    best=None; wanted=set(concepts)
    for v in records:
        filed=v.get('filed'); val=v.get('val')
        if v.get('tag') not in wanted or not filed or filed>asof or v.get('form') not in FORMS or not isinstance(val,(int,float)): continue
        try: fy=int(v.get('fy') or 0)
        except Exception: fy=0
        key=(filed,v.get('end') or '',fy)
        if best is None or key>best[0]: best=(key,v)
    if not best: return None
    v=best[1]; return {'value':v['val'],'period_end':v.get('end'),'filed':v.get('filed'),'source':v.get('source')}

def stooq_history(ticker,start='20200101',end='20260705'):
    sym=ticker.lower().replace('-','.')+'.us'; url=f'https://stooq.com/q/d/l/?s={urllib.parse.quote(sym)}&d1={start}&d2={end}&i=d'
    text=get(url).decode('utf-8','replace'); rows=[]
    for r in csv.DictReader(io.StringIO(text)):
        try: rows.append((r['Date'],float(r['Close'])))
        except Exception: pass
    return {'rows':rows,'source':url}

def stooq_price_from_history(hist,asof):
    eligible=[r for r in hist['rows'] if r[0]<=asof]
    if not eligible: return None
    d,c=eligible[-1]; return {'date':d,'close':c,'source':hist['source']}

def pageviews_history(title,first_snap,last_snap):
    first=datetime.fromisoformat(first_snap).date()-timedelta(days=100); last=datetime.fromisoformat(last_snap).date(); rows=[]; sources=[]
    for y in range(first.year,last.year+1):
        start=max(first,date(y,1,1)); end=min(last,date(y,12,31)); t=urllib.parse.quote(title,safe='')
        url=f'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{t}/daily/{start:%Y%m%d}/{end:%Y%m%d}'; sources.append(url)
        try:
            items=json.loads(get(url)).get('items',[]); rows.extend((datetime.strptime(str(x['timestamp'])[:8],'%Y%m%d').date(),int(x.get('views',0))) for x in items)
        except Exception as e: print('PAGEVIEWS_SEGMENT_FAIL',title,y,repr(e))
    return {'rows':rows,'source':' ; '.join(sources)}

def pageviews_from_history(hist,asof,days=90):
    end=datetime.fromisoformat(asof).date()-timedelta(days=1); start=end-timedelta(days=days-1); vals=[v for d,v in hist['rows'] if start<=d<=end]
    return {'views':sum(vals),'days':len(vals),'source':hist['source']} if vals else None

def quarter_ends():
    return [date(y,m,d).isoformat() for y in range(2021,2027) for m,d in [(3,31),(6,30),(9,30),(12,31)] if date(y,m,d)<=date(2026,6,30)]

def main():
    limit=int(os.getenv('ATLAS_PIT_LIMIT','0')) or None; s=os.getenv('ATLAS_PIT_SNAPSHOTS'); snaps=s.split(',') if s else quarter_ends(); universe=load_universe(limit); rows=[]
    concepts={'revenue':['RevenueFromContractWithCustomerExcludingAssessedTax','Revenues','SalesRevenueNet'],'gross_profit':['GrossProfit'],'net_income':['NetIncomeLoss','ProfitLoss'],'operating_cash_flow':['NetCashProvidedByUsedInOperatingActivities'],'capex':['PaymentsToAcquirePropertyPlantAndEquipment'],'equity':['StockholdersEquity','StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],'cash':['CashAndCashEquivalentsAtCarryingValue','CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'],'assets':['Assets'],'liabilities':['Liabilities'],'debt':['LongTermDebtAndFinanceLeaseObligationsCurrent','LongTermDebtCurrent','LongTermDebtNoncurrent'],'shares':['EntityCommonStockSharesOutstanding','WeightedAverageNumberOfDilutedSharesOutstanding'],'diluted_eps':['EarningsPerShareDiluted']}
    tags={x for xs in concepts.values() for x in xs}; mapping=issuer_map(); max_asof=max(snaps)
    for u in universe:
        ticker=u['ticker']; keys=[ticker,ticker.replace('-',''),ticker.replace('-','.')]; sec=next((mapping.get(k.upper()) for k in keys if mapping.get(k.upper())),None)
        if not sec: print('NO_ISSUER_MAP',ticker); continue
        try: facts,fact_source=issuer_records(sec['cik'],tags,max_asof)
        except Exception as e: print('FACTS_FAIL_CLOSED',ticker,repr(e)); continue
        try: price_hist=stooq_history(ticker)
        except Exception as e: print('PRICE_FAIL',ticker,repr(e)); price_hist={'rows':[],'source':''}
        att_hist=pageviews_history(u['wikipedia_title'],min(snaps),max(snaps))
        for snap in snaps:
            px=stooq_price_from_history(price_hist,snap); att=pageviews_from_history(att_hist,snap)
            rec={'ticker':ticker,'sector':u['sector'],'snapshot_date':snap,'cik':sec['cik'],'company_name':sec['title'],'identity_source':sec['identity_source'],'facts_provider':fact_source,'price_date':px['date'] if px else '','close':px['close'] if px else '','pageviews_90d':att['views'] if att else '','pageview_days':att['days'] if att else '','price_source':px['source'] if px else price_hist.get('source',''),'attention_source':att['source'] if att else att_hist.get('source','')}
            filed=[]; sources=[]
            for name,cs in concepts.items():
                f=latest_fact_asof(facts,cs,snap); rec[name]=f['value'] if f else ''; rec[name+'_filed']=f['filed'] if f else ''; rec[name+'_period_end']=f['period_end'] if f else ''
                if f: filed.append(f['filed']); sources.append(f.get('source') or '')
            rec['latest_filing_used']=max(filed) if filed else ''; rec['fundamental_source']=' ; '.join(sorted(set(x for x in sources if x))); rec['pit_valid']=bool(px and rec['latest_filing_used'] and rec['latest_filing_used']<=snap); rows.append(rec)
        time.sleep(0.03)
    OUT.parent.mkdir(parents=True,exist_ok=True); fields=list(rows[0].keys()) if rows else []
    with OUT.open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
    valid=sum(1 for r in rows if r['pit_valid']); coverage=valid/len(rows) if rows else 0
    print(json.dumps({'rows':len(rows),'valid_pit_rows':valid,'pit_coverage':round(coverage,4),'tickers':len(set(r['ticker'] for r in rows)),'output':str(OUT)}))
    if not rows or coverage<0.70: raise SystemExit('FAIL_CLOSED: insufficient PIT-valid rows')

if __name__=='__main__': main()
