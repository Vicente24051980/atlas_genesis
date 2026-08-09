import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { AtlasApi, type Quote } from '../core/api/atlasApi';
import { AuditLogRepository } from '../db/repositories/AuditLogRepository';
import { type PortfolioPosition, PortfolioRepository } from '../db/repositories/PortfolioRepository';

const MAIN_PORTFOLIO_ID='PORTFOLIO-MAIN';
type LiveRow=PortfolioPosition&{quote?:Quote;source?:string;brokerPrice?:number|null};

export default function PortfolioScreen(){
  const router=useRouter(); const [items,setItems]=useState<LiveRow[]>([]); const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false); const [status,setStatus]=useState('LOCAL CACHE');

  const reconcileBroker=useCallback(async()=>{
    try{
      const broker=await AtlasApi.portfolio();
      for(const p of broker.positions){
        if(!p.ticker||!p.quantity||p.quantity<=0)continue;
        const existing=await PortfolioRepository.getByTicker(p.ticker);
        await PortfolioRepository.upsert({id:existing?.id??`POS-${p.ticker}-${Date.now()}`,portfolioId:MAIN_PORTFOLIO_ID,canonicalTicker:p.ticker,companyName:p.name||existing?.companyName||p.ticker,quantity:p.quantity,costBasis:p.averagePrice,status:'ACTIVE',updatedAt:new Date(broker.observedAt)});
      }
      const liveTickers=new Set(broker.positions.map(p=>p.ticker).filter(Boolean));
      const local=await PortfolioRepository.getAll();
      for(const x of local.filter(x=>x.status==='ACTIVE'&&!liveTickers.has(x.canonicalTicker))){
        await PortfolioRepository.upsert({...x,status:'INACTIVE',updatedAt:new Date(broker.observedAt)});
      }
      await AuditLogRepository.insert({id:`AUD-BROKER-${Date.now()}`,action:'BROKER_PORTFOLIO_RECONCILE',actor:'SYSTEM',target:'PORTFOLIO',payloadHash:null,createdAt:new Date()});
      setStatus(`${broker.provider} · READ ONLY · ${broker.positions.length} POSITIONS`);
      return new Map(broker.positions.map(p=>[p.ticker,p.currentPrice]));
    }catch(error){setStatus(`LOCAL CACHE · ${error instanceof Error?error.message:'BROKER UNAVAILABLE'}`);return new Map<string,number|null>();}
  },[]);

  const load=useCallback(async()=>{
    const brokerPrices=await reconcileBroker();
    const local=(await PortfolioRepository.getAll()).filter(x=>x.status==='ACTIVE');
    const rows:LiveRow[]=[];
    for(let i=0;i<local.length;i+=6){
      const batch=await Promise.all(local.slice(i,i+6).map(async p=>{try{return {...p,quote:await AtlasApi.quote(p.canonicalTicker),source:brokerPrices.has(p.canonicalTicker)?'TRADING212':'LOCAL',brokerPrice:brokerPrices.get(p.canonicalTicker)}}catch{return {...p,source:brokerPrices.has(p.canonicalTicker)?'TRADING212':'LOCAL',brokerPrice:brokerPrices.get(p.canonicalTicker)}}}));rows.push(...batch);
    }
    setItems(rows);setLoading(false);setRefreshing(false);
  },[reconcileBroker]);
  useFocusEffect(useCallback(()=>{void load()},[load]));

  const summary=useMemo(()=>items.reduce((a,x)=>{const cost=(x.costBasis||0)*x.quantity;const price=x.quote?.price??x.brokerPrice??x.costBasis??0;const value=price*x.quantity;const prev=x.quote?.changePct!=null&&price?price/(1+x.quote.changePct/100):price;return {cost:a.cost+cost,value:a.value+value,day:a.day+(price-prev)*x.quantity}}, {cost:0,value:0,day:0}),[items]);
  const pnl=summary.value-summary.cost,pnlPct=summary.cost?100*pnl/summary.cost:0;

  return <FlatList style={styles.screen} contentContainerStyle={styles.content} data={items} keyExtractor={x=>x.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);void load()}} tintColor="#65d9ff"/>}
    ListHeaderComponent={<View style={styles.header}><View style={styles.top}><View><Text style={styles.eyebrow}>ATLAS Ω · PORTFOLIO LIVE</Text><Text style={styles.title}>Cartera</Text></View><View style={styles.pill}><Text style={styles.pillText}>{status}</Text></View></View><View style={styles.hero}><Text style={styles.heroLabel}>VALOR ACTUAL</Text><Text style={styles.heroValue}>{money(summary.value)}</Text><View style={styles.heroBottom}><Text style={[styles.heroPnl,pnl<0?styles.red:styles.green]}>{signedMoney(pnl)} · {signedPct(pnlPct)}</Text><Text style={[styles.heroPnl,summary.day<0?styles.red:styles.green]}>Día {signedMoney(summary.day)}</Text></View></View><View style={styles.metrics}><Metric label="COSTE" value={money(summary.cost)}/><Metric label="POSICIONES" value={String(items.length)}/><Metric label="P/L" value={signedPct(pnlPct)} tone={pnl<0?'bad':'good'}/></View><View style={styles.guard}><Text style={styles.guardTitle}>BROKER GUARD</Text><Text style={styles.guardText}>ATLAS usa únicamente endpoints GET del backend Trading 212. No existen rutas de compra/venta en esta app.</Text></View><View style={styles.table}><Text style={[styles.th,styles.symbol]}>ACTIVO</Text><Text style={styles.th}>DÍA</Text><Text style={styles.th}>VALOR</Text><Text style={styles.th}>P/L</Text></View></View>}
    ListEmptyComponent={loading?<ActivityIndicator color="#65d9ff" size="large" style={{marginTop:30}}/>:<Text style={styles.empty}>Sin posiciones en caché. Configura credenciales read-only de Trading 212 en el backend.</Text>}
    renderItem={({item})=>{const price=item.quote?.price??item.brokerPrice??item.costBasis??0;const value=price*item.quantity;const cost=(item.costBasis||0)*item.quantity;const itemPnl=value-cost;const itemPct=cost?100*itemPnl/cost:0;return <Pressable onPress={()=>router.push({pathname:'/terminal',params:{ticker:item.canonicalTicker}})} style={styles.row}><View style={styles.symbol}><Text style={styles.ticker}>{item.canonicalTicker}</Text><Text numberOfLines={1} style={styles.company}>{item.companyName}</Text><Text style={styles.meta}>{item.quantity} × {item.costBasis?.toFixed(2)??'—'} · {item.source}</Text></View><View style={styles.cell}><Text style={[styles.main,(item.quote?.changePct||0)<0?styles.red:styles.green]}>{item.quote?.changePct==null?'—':signedPct(item.quote.changePct)}</Text><Text style={styles.sub}>{price?price.toFixed(2):'—'}</Text></View><View style={styles.cell}><Text style={styles.main}>{compact(value)}</Text><Text style={styles.sub}>{summary.value?`${(100*value/summary.value).toFixed(1)}% peso`:'—'}</Text></View><View style={styles.cell}><Text style={[styles.main,itemPnl<0?styles.red:styles.green]}>{signedPct(itemPct)}</Text><Text style={styles.sub}>{signedMoney(itemPnl)}</Text></View></Pressable>}}
  />;
}
function Metric({label,value,tone}:{label:string;value:string;tone?:'good'|'bad'}){return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue,tone==='good'?styles.green:tone==='bad'?styles.red:null]}>{value}</Text></View>}
const money=(v:number)=>`${Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(v)} €`;const compact=(v:number)=>`${Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:1}).format(v)} €`;const signedMoney=(v:number)=>`${v>=0?'+':''}${Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(v)} €`;const signedPct=(v:number)=>`${v>=0?'+':''}${v.toFixed(2)}%`;
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#05080c'},content:{padding:14,paddingBottom:42},header:{gap:10},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:8},eyebrow:{color:'#607487',fontSize:8,fontWeight:'900',letterSpacing:1.2},title:{color:'#eff4f8',fontSize:26,fontWeight:'900',marginTop:3},pill:{maxWidth:'62%',borderWidth:1,borderColor:'#22513f',backgroundColor:'#0b1915',borderRadius:999,paddingHorizontal:8,paddingVertical:5},pillText:{color:'#68d9aa',fontSize:7,fontWeight:'900'},hero:{backgroundColor:'#081018',borderWidth:1,borderColor:'#183044',borderRadius:10,padding:14},heroLabel:{color:'#587086',fontSize:8,fontWeight:'900'},heroValue:{color:'#eef5fa',fontSize:31,fontWeight:'900',marginTop:4},heroBottom:{flexDirection:'row',justifyContent:'space-between',marginTop:5},heroPnl:{fontSize:10,fontWeight:'900'},green:{color:'#4ddca2'},red:{color:'#ff6c7e'},metrics:{flexDirection:'row',gap:6},metric:{flex:1,backgroundColor:'#090e14',borderWidth:1,borderColor:'#17222e',borderRadius:8,padding:9},metricLabel:{color:'#546678',fontSize:7,fontWeight:'900'},metricValue:{color:'#b9c7d3',fontSize:12,fontWeight:'900',marginTop:3},guard:{backgroundColor:'#151309',borderWidth:1,borderColor:'#4f4219',borderRadius:8,padding:9},guardTitle:{color:'#d8b958',fontSize:7,fontWeight:'900'},guardText:{color:'#92804c',fontSize:8,lineHeight:13,marginTop:3},table:{flexDirection:'row',minHeight:26,alignItems:'center',borderBottomWidth:1,borderColor:'#1a2632'},th:{flex:1,color:'#506274',fontSize:7,fontWeight:'900',textAlign:'right'},symbol:{flex:1.8,textAlign:'left'},row:{flexDirection:'row',alignItems:'center',minHeight:62,borderBottomWidth:1,borderBottomColor:'#101923'},ticker:{color:'#dfe8ef',fontSize:13,fontWeight:'900'},company:{color:'#617386',fontSize:8,marginTop:2,maxWidth:135},meta:{color:'#46586a',fontSize:7,marginTop:2},cell:{flex:1,alignItems:'flex-end'},main:{color:'#b6c4d0',fontSize:10,fontWeight:'900'},sub:{color:'#4f6173',fontSize:7,marginTop:2},empty:{color:'#607285',textAlign:'center',padding:40,lineHeight:17}});
