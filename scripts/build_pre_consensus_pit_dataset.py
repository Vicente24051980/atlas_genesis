#!/usr/bin/env python3
import csv, gzip, io, json, os, time, urllib.error, urllib.parse, urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

UA='ATLAS-Research/1.0 github.com/Vicente24051980/atlas_genesis'
ROOT=Path(__file__).resolve().parents[1]
UNIVERSE=ROOT/'data/pre_consensus/pilot_universe.csv'
OUT=ROOT/'data/pre_consensus/generated/pit_panel.csv'
SEC_TICKERS='https://www.sec.gov/files/company_tickers.json'
DOLT_API='https://www.dolthub.com/api/v1alpha1/deeleeramone/sec-company-facts/main'
FORMS={'10-Q','10-K','10-Q/A','10-K/A'}

def get(url, timeout=45):
    req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json,text/csv,text/plain,*/*'})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        raw=r.read()
        if r.headers.get('Content-Encoding','').lower()=='gzip' or raw[:2]==b'\x1f\x8b': raw=gzip.decompress(raw)
        return raw

def load_universe(limit=None):
    with UNIVERSE.open() as f: rows=list(csv.DictReader(f))
    return rows[:limit] if limit else rows

def sql_quote(v): return "'"+str(v).replace("'","''")+"'"

def dolt_query(sql, attempts=4):
    url=DOLT_API+'?'+urllib.parse.urlencode({'q':sql})
    last=None
    for i in range(attempts):
        try:
            payload=json.loads(get(url,90))
            status=payload.get('query_execution_status')
            if status in {'Success','RowLimit'}: return payload.get('rows',[]) or [],url,status
            raise RuntimeError(payload.get('query_execution_message') or status or 'DoltHub query failed')
        except Exception as e:
            last=e; time.sleep(0.4*(i+1))
    raise last

def direct_sec_map():
    data=json.loads(get(SEC_TICKERS))
    return {x['ticker'].upper():{'cik':str(int(x['cik_str'])),'title':x['title'],'identity_source':SEC_TICKERS} for x in data.values()}

def dolt_sec_map(tickers):
    aliases=sorted({t.upper() for x in tickers for t in (x,x.replace('-',''),x.replace('-','.'))})
    q='SELECT ticker,cik,name FROM primary_tickers WHERE UPPER(ticker) IN ('+','.join(sql_quote(x) for x in aliases)+')'
    rows,url,_=dolt_query(q)
    return {str(r['ticker']).upper():{'cik':str(r['cik']).lstrip('0') or '0','title':r.get('name') or r['ticker'],'identity_source':url} for r in rows}

def issuer_map(tickers):
    try:
        m=direct_sec_map(); print('IDENTITY_SOURCE SEC_DIRECT'); return m
    except Exception as e:
        print('SEC_IDENTITY_FALLBACK_DOLTHUB',repr(e)); return dolt_sec_map(tickers)

def sec_records_direct(cik, tags):
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

def sec_records_dolthub(cik, tags, max_asof):
    tag_sql=','.join(sql_quote(t) for t in sorted(tags)); form_sql=','.join(sql_quote(f) for f in sorted(FORMS))
    q=("SELECT x.tag,f.unit,f.start,f.end,f.val,f.fy,f.fp,f.form,f.filed "
       "FROM facts_enc f JOIN xbrl_tags x ON f.tag_id=x.tag_id "
       f"WHERE f.cik={sql_quote(str(int(cik)))} AND x.namespace='us-gaap' "
       f"AND x.tag IN ({tag_sql}) AND f.form IN ({form_sql}) AND f.filed<={sql_quote(max_asof)} ORDER BY f.filed,f.end")
    rows,url,status=dolt_query(q)
    if status=='RowLimit': raise RuntimeError('DoltHub RowLimit on issuer fact query; fail closed')
    out=[]
    for r in rows:
        try: val=float(r['val']) if r.get('val') not in (None,'') else None
        except Exception: val=None
        if val is None: continue
        out.append({'tag':r.get('tag'),'unit':r.get('unit'),'start':r.get('start'),'end':r.get('end'),'val':val,'fy':r.get('fy'),'fp':r.get('fp'),'form':r.get('form'),'filed':r.get('filed'),'source':url})
    return out

def issuer_records(cik,tags,max_asof):
    try:
        rows=sec_records_direct(cik,tags); return rows,'SEC_DIRECT'
    except Exception as e:
        print('SEC_FACTS_FALLBACK_DOLTHUB',cik,repr(e)); return sec_records_dolthub(cik,tags,max_asof),'DOLTHUB_SEC_MIRROR'

def latest_fact_asof(records, concepts, asof):
    best=None
    wanted=set(concepts)
    for v in records:
        filed=v.get('filed'); form=v.get('form',''); val=v.get('val')
        if v.get('tag') not in wanted or not filed or filed>asof or form not in FORMS or not isinstance(val,(int,float)): continue
        key=(filed,v.get('end') or '',int(v.get('fy') or 0))
        if best is None or key>best[0]: best=(key,v)
    if not best: return None
    v=best[1]
    return {'value':v['val'],'unit':v.get('unit'),'concept':v.get('tag'),'period_end':v.get('end'),'form':v.get('form'),'filed':v.get('filed'),'source':v.get('source')}

def stooq_history(ticker, start='20200101', end='20260705'):
    sym=ticker.lower().replace('-','.')+'.us'; url=f'https://stooq.com/q/d/l/?s={urllib.parse.quote(sym)}&d1={start}&d2={end}&i=d'
    text=get(url).decode('utf-8','replace'); rows=[]
    for r in csv.DictReader(io.StringIO(text)):
        try: rows.append((r['Date'],float(r['Close'])))
        except Exception: pass
    return {'rows':rows,'source':url}

def stooq_price_from_history(hist, asof):
    eligible=[r for r in hist['rows'] if r[0]<=asof]
    if not eligible: return None
    d,c=eligible[-1]; return {'date':d,'close':c,'source':hist['source']}

def pageviews_history(title):
    t=urllib.parse.quote(title,safe=''); rows=[]; sources=[]
    for y in range(2020,2027):
        start=f'{y}0101' if y>2020 else '20201201'; end=f'{y}1231' if y<2026 else '20260630'
        url=f'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{t}/daily/{start}/{end}'
        sources.append(url)
        try:
            items=json.loads(get(url)).get('items',[])
            rows.extend((datetime.strptime(str(x['timestamp'])[:8],'%Y%m%d').date(),int(x.get('views',0))) for x in items)
        except Exception as e: print('PAGEVIEWS_SEGMENT_FAIL',title,y,repr(e))
    return {'rows':rows,'source':' ; '.join(sources)}

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
    limit=int(os.getenv('ATLAS_PIT_LIMIT','0')) or None; snapshots=os.getenv('ATLAS_PIT_SNAPSHOTS')
    snaps=snapshots.split(',') if snapshots else quarter_ends(); universe=load_universe(limit); rows=[]
    concepts={'revenue':['RevenueFromContractWithCustomerExcludingAssessedTax','Revenues','SalesRevenueNet'],'net_income':['NetIncomeLoss','ProfitLoss'],'equity':['StockholdersEquity','StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],'cash':['CashAndCashEquivalentsAtCarryingValue','CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'],'assets':['Assets'],'liabilities':['Liabilities'],'shares':['EntityCommonStockSharesOutstanding','WeightedAverageNumberOfDilutedSharesOutstanding']}
    tags={x for xs in concepts.values() for x in xs}; mapping=issuer_map([u['ticker'] for u in universe]); max_asof=max(snaps)
    for u in universe:
        ticker=u['ticker']; map_keys=[ticker,ticker.replace('-',''),ticker.replace('-','.')]
        sec=next((mapping.get(k.upper()) for k in map_keys if mapping.get(k.upper())),None)
        if not sec: print('NO_ISSUER_MAP',ticker); continue
        try: facts,fact_source=issuer_records(sec['cik'],tags,max_asof)
        except Exception as e: print('FACTS_FAIL_CLOSED',ticker,repr(e)); continue
        try: price_hist=stooq_history(ticker)
        except Exception as e: print('PRICE_FAIL',ticker,repr(e)); price_hist={'rows':[],'source':''}
        att_hist=pageviews_history(u['wikipedia_title'])
        for snap in snaps:
            px=stooq_price_from_history(price_hist,snap); att=pageviews_from_history(att_hist,snap)
            rec={'ticker':ticker,'sector':u['sector'],'snapshot_date':snap,'cik':sec['cik'],'company_name':sec['title'],'identity_source':sec['identity_source'],'facts_provider':fact_source,'price_date':px['date'] if px else '','close':px['close'] if px else '','pageviews_90d':att['views'] if att else '','pageview_days':att['days'] if att else '','price_source':px['source'] if px else price_hist.get('source',''),'attention_source':att['source'] if att else att_hist.get('source','')}
            filed=[]; fact_sources=[]
            for name,cs in concepts.items():
                f=latest_fact_asof(facts,cs,snap); rec[name]=f['value'] if f else ''; rec[name+'_filed']=f['filed'] if f else ''; rec[name+'_period_end']=f['period_end'] if f else ''
                if f: filed.append(f['filed']); fact_sources.append(f.get('source') or '')
            rec['latest_filing_used']=max(filed) if filed else ''; rec['fundamental_source']=' ; '.join(sorted(set(x for x in fact_sources if x)))
            rec['pit_valid']=bool(px and rec['latest_filing_used'] and rec['latest_filing_used']<=snap); rows.append(rec)
        time.sleep(0.12)
    OUT.parent.mkdir(parents=True,exist_ok=True); fields=list(rows[0].keys()) if rows else []
    with OUT.open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
    valid=sum(1 for r in rows if r['pit_valid']); coverage=valid/len(rows) if rows else 0
    print(json.dumps({'rows':len(rows),'valid_pit_rows':valid,'pit_coverage':round(coverage,4),'tickers':len(set(r['ticker'] for r in rows)),'output':str(OUT)}))
    if not rows or coverage<0.70: raise SystemExit('FAIL_CLOSED: insufficient PIT-valid rows')

if __name__=='__main__': main()
