export type BottleneckLayer = 'POWER_GENERATION'|'GRID_ELECTRICAL'|'COOLING'|'ADVANCED_PACKAGING'|'HBM_MEMORY'|'FOUNDRY'|'LITHOGRAPHY'|'NETWORKING_OPTICS'|'SERVER_ASSEMBLY'|'MONETIZATION';
export interface BottleneckOwner { ticker:string; layer:BottleneckLayer; role:string; evidenceState:'CONFIRMED'|'WATCH'; }
export const BOTTLENECK_OWNERSHIP_OMEGA = {
 version:'2026-08-17-v1.0',
 objective:'Find listed companies controlling scarce nodes that constrain system-level economic throughput; owning a bottleneck is not itself a BUY.',
 scoreDimensions:['SCARCITY','SUBSTITUTABILITY','LEAD_TIME','CAPACITY_UTILIZATION','PRICING_POWER','BOTTLENECK_RELIEF','ECONOMIC_CAPTURE','FCF_CONVERSION','ROIC','EXPECTED_RETURN'],
 rules:[
  'CAPACITY_ADDED_NEQ_THROUGHPUT_CREATED','UTILIZATION_NEQ_PRODUCTIVITY','BOTTLENECK_OWNER_NEQ_AUTOMATIC_BUY',
  'CONFIRM_CURRENT_CONSTRAINT_WITH_PRIMARY_OR_HIGH_QUALITY_EVIDENCE','PASS_EXPECTED_RETURN_AFTER_ECONOMIC_PROOF','FALSIFIER_VETO_REMAINS_ABSOLUTE'
 ],
 universe:[
  {ticker:'GEV',layer:'POWER_GENERATION',role:'gas turbines/grid equipment',evidenceState:'WATCH'},
  {ticker:'ETN',layer:'GRID_ELECTRICAL',role:'switchgear/power distribution/data-center electrical architecture',evidenceState:'CONFIRMED'},
  {ticker:'PWR',layer:'GRID_ELECTRICAL',role:'transmission/grid construction',evidenceState:'WATCH'},
  {ticker:'HUBB',layer:'GRID_ELECTRICAL',role:'utility electrical components',evidenceState:'WATCH'},
  {ticker:'VRT',layer:'COOLING',role:'data-center power and liquid cooling',evidenceState:'CONFIRMED'},
  {ticker:'NVT',layer:'COOLING',role:'electrical/thermal infrastructure exposure',evidenceState:'WATCH'},
  {ticker:'TSM',layer:'ADVANCED_PACKAGING',role:'CoWoS advanced packaging and leading-edge foundry',evidenceState:'CONFIRMED'},
  {ticker:'AMKR',layer:'ADVANCED_PACKAGING',role:'outsourced semiconductor packaging/test',evidenceState:'WATCH'},
  {ticker:'ASX',layer:'ADVANCED_PACKAGING',role:'advanced packaging/test',evidenceState:'WATCH'},
  {ticker:'MU',layer:'HBM_MEMORY',role:'HBM supplier',evidenceState:'WATCH'},
  {ticker:'ASML',layer:'LITHOGRAPHY',role:'EUV lithography',evidenceState:'CONFIRMED'},
  {ticker:'AVGO',layer:'NETWORKING_OPTICS',role:'AI networking/custom accelerators',evidenceState:'WATCH'},
  {ticker:'ANET',layer:'NETWORKING_OPTICS',role:'high-speed datacenter networking',evidenceState:'WATCH'},
  {ticker:'COHR',layer:'NETWORKING_OPTICS',role:'optical components/lasers',evidenceState:'WATCH'},
  {ticker:'LITE',layer:'NETWORKING_OPTICS',role:'optical components/lasers',evidenceState:'WATCH'},
  {ticker:'CRDO',layer:'NETWORKING_OPTICS',role:'high-speed connectivity',evidenceState:'WATCH'},
  {ticker:'MRVL',layer:'NETWORKING_OPTICS',role:'datacenter interconnect/custom silicon',evidenceState:'WATCH'},
  {ticker:'2317.TW',layer:'SERVER_ASSEMBLY',role:'Foxconn AI server/rack manufacturing',evidenceState:'CONFIRMED'}
 ] satisfies BottleneckOwner[]
} as const;
