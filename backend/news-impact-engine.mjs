const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
export const NEWS_ENGINE_VERSION='ATLAS-NEWS-IMPACT-1.0.0';

const RULES=[
 {id:'EXPORT_CONTROLS',terms:['export restriction','export restrictions','export control','chip ban','semiconductor ban','china restrictions'],topics:['SEMICONDUCTORS','GEOPOLITICS'],base:82,sectors:['Semiconductors','Technology'],tickers:['NVDA','ASML','AMAT','LRCX','KLAC','TSM','AMD','AVGO']},
 {id:'GUIDANCE_CUT',terms:['cuts guidance','cut guidance','lowers guidance','lowered guidance','profit warning','revenue warning','weak outlook'],topics:['EARNINGS','GUIDANCE'],base:88,sectors:[],tickers:[]},
 {id:'GUIDANCE_RAISE',terms:['raises guidance','raised guidance','boosts guidance','strong outlook','record backlog'],topics:['EARNINGS','GUIDANCE'],base:62,sectors:[],tickers:[]},
 {id:'REGULATION',terms:['antitrust','regulation','regulatory probe','fine','investigation','ai act'],topics:['REGULATION'],base:58,sectors:['Technology','Communication Services'],tickers:[]},
 {id:'SUPPLY_CHAIN',terms:['supply disruption','supply shortage','factory shutdown','earthquake','capacity shortage'],topics:['SUPPLY_CHAIN'],base:67,sectors:['Semiconductors','Industrials'],tickers:[]},
 {id:'RATES',terms:['rate hike','higher for longer','yield surge','bond yields rise'],topics:['RATES','DURATION'],base:48,sectors:[],tickers:[]},
 {id:'ENERGY',terms:['power shortage','grid constraint','electricity shortage','data center power'],topics:['ENERGY','INFRASTRUCTURE'],base:60,sectors:['Industrials','Utilities'],tickers:['ETN','VRT','CEG']},
];

function textOf(item){return `${item?.headline||''} ${item?.summary||''}`.toLowerCase()}
export function classifyNewsItem(item,{ticker='',sector=''}={}){
 const text=textOf(item);const matches=RULES.filter(r=>r.terms.some(t=>text.includes(t)));
 if(!matches.length)return {id:item?.id??null,eventClass:'UNCLASSIFIED',topics:[],impactScore:15,direction:'NEUTRAL',affectsTicker:false,affectsSector:false,thesisImpact:'NO_CHANGE',falsifierConfirmed:false,validationState:'SENSOR_ONLY',ruleVersion:NEWS_ENGINE_VERSION,reasons:['No deterministic material-event rule matched.']};
 const strongest=[...matches].sort((a,b)=>b.base-a.base)[0];
 const affectsTicker=!strongest.tickers.length||strongest.tickers.includes(String(ticker).toUpperCase());
 const affectsSector=!strongest.sectors.length||strongest.sectors.some(s=>String(sector).toLowerCase().includes(s.toLowerCase()));
 const relevance=(affectsTicker?10:0)+(affectsSector?8:0);const score=clamp(strongest.base+relevance);
 const negative=['EXPORT_CONTROLS','GUIDANCE_CUT','REGULATION','SUPPLY_CHAIN','RATES','ENERGY'].includes(strongest.id);
 return {id:item?.id??null,eventClass:strongest.id,topics:strongest.topics,impactScore:score,direction:negative?'NEGATIVE':'POSITIVE',affectsTicker,affectsSector,thesisImpact:score>=70?'THESIS_REVIEW_REQUIRED':score>=45?'MONITOR':'NO_CHANGE',falsifierConfirmed:false,validationState:'SENSOR_ONLY',ruleVersion:NEWS_ENGINE_VERSION,reasons:[`Matched ${strongest.id}`,affectsTicker?'Ticker exposure matched':'Ticker exposure not explicit',affectsSector?'Sector exposure matched':'Sector exposure not explicit','News is a sensor; primary evidence is required before any thesis falsifier can be confirmed.']};
}
export function classifyNewsFeed(items,context={}){
 const events=(Array.isArray(items)?items:[]).map(x=>({...x,impact:classifyNewsItem(x,context)})).sort((a,b)=>b.impact.impactScore-a.impact.impactScore);
 const maxImpact=events[0]?.impact?.impactScore??0;const review=events.filter(x=>x.impact.thesisImpact==='THESIS_REVIEW_REQUIRED');
 return {algorithmVersion:NEWS_ENGINE_VERSION,maxImpact,thesisReviewRequired:review.length>0,falsifierConfirmed:false,events,guardrail:'News classification can request thesis review but cannot create Verified Fact or confirm a falsifier.'};
}
