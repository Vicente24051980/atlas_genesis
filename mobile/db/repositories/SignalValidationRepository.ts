import { and, eq, isNull, lte } from 'drizzle-orm';
import { AtlasApi } from '../../core/api/atlasApi';
import { db } from '../client';
import { company, signalEvaluation } from '../schema';

const DAY=86_400_000;
export const SignalValidationRepository={
  async recordDownside(ticker:string,score:number,state:string,price:number|null,reasons:string[],algorithmVersion?:string){
    const symbol=ticker.toUpperCase();const companyRows=await db.select().from(company).where(eq(company.canonicalTicker,symbol)).limit(1);const companyId=companyRows[0]?.id||`COMPANY-${symbol}`;const bucket=Math.floor(Date.now()/3_600_000);const id=`SIG-DOWNSIDE-${symbol}-${bucket}`;
    const existing=await db.select().from(signalEvaluation).where(eq(signalEvaluation.id,id)).limit(1);if(existing.length)return;
    await db.insert(signalEvaluation).values({id,companyId,signalType:'DOWNSIDE_ALERT',state,score,horizon:'7D',reasonJson:JSON.stringify({ticker:symbol,reasons,algorithmVersion}),evidenceRefsJson:'[]',priceAtSignal:price,outcomeJson:null,createdAt:new Date(),evaluatedAt:null});
  },
  async evaluateMatured(){
    const cutoff=new Date(Date.now()-7*DAY);const pending=await db.select().from(signalEvaluation).where(and(isNull(signalEvaluation.evaluatedAt),lte(signalEvaluation.createdAt,cutoff)));
    for(const signal of pending){
      let meta:{ticker?:string}={};try{meta=JSON.parse(signal.reasonJson)}catch{}const ticker=meta.ticker;if(!ticker||!signal.priceAtSignal)continue;
      try{
        const history=(await AtlasApi.history(ticker,'1M')).rows.filter(r=>new Date(r.t).getTime()>=signal.createdAt.getTime()).slice(0,8);if(history.length<2)continue;
        const start=signal.priceAtSignal,end=history.at(-1)!.c,min=Math.min(...history.map(r=>r.l??r.c));const returnPct=((end-start)/start)*100,drawdownPct=((min-start)/start)*100;const predictedDownside=(signal.score??0)>=50;const materialDrop=drawdownPct<=-5;const classification=predictedDownside?(materialDrop?'TRUE_POSITIVE':'FALSE_POSITIVE'):(materialDrop?'FALSE_NEGATIVE':'TRUE_NEGATIVE');
        await db.update(signalEvaluation).set({outcomeJson:JSON.stringify({ticker,horizon:'7D',endPrice:end,returnPct,drawdownPct,classification,rule:'material downside = <= -5% drawdown within evaluation window'}),evaluatedAt:new Date()}).where(eq(signalEvaluation.id,signal.id));
      }catch{}
    }
  },
  async all(){return db.select().from(signalEvaluation)},
};
