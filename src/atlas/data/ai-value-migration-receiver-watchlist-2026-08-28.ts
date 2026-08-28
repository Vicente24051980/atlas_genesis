import type { AiReceiverLayer, AiValueProofState } from '../algorithm/ai-value-migration-receiver-omega';

export type ReceiverPriority = 'P1' | 'P2' | 'P3' | 'OPTIONALITY';
export type BrokerAvailability = 'KNOWN_AVAILABLE_USER_SCREENSHOT' | 'UNVERIFIED';

export interface AiValueMigrationReceiverSnapshot {
  ticker: string;
  company: string;
  layer: AiReceiverLayer;
  proofState: AiValueProofState;
  priority: ReceiverPriority;
  portfolioFit: 'LOWER_VOL_QUALITY' | 'BALANCED_GROWTH' | 'HIGH_GROWTH_HIGH_VOL' | 'CAPEX_HEAVY' | 'OPTIONALITY';
  trading212Availability: BrokerAvailability;
  evidenceSummary: string;
  keyRisk: string;
  primaryEvidenceUrls: readonly string[];
}

/**
 * Research snapshot, not a portfolio or BUY list.
 *
 * Proof states are deliberately conservative. ARR, ACV, bookings and run-rate
 * metrics do not automatically count as recognized revenue under ATLAS.
 */
export const AI_VALUE_MIGRATION_RECEIVER_WATCHLIST_2026_08_28: readonly AiValueMigrationReceiverSnapshot[] = [
  {
    ticker: 'RELX',
    company: 'RELX',
    layer: 'TRUSTED_DATA',
    proofState: 'T2_REVENUE_LINKAGE',
    priority: 'P1',
    portfolioFit: 'LOWER_VOL_QUALITY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Legal underlying revenue growth accelerated to 10%; RELX explicitly attributes the improvement to AI-enabled legal analytics/tools and reports adoption of Lexis+ with Protege.',
    keyRisk: 'AI-specific FCF and incremental ROIC are not separately disclosed.',
    primaryEvidenceUrls: [
      'https://www.relx.com/media/press-releases/year-2026/first-half-2026',
      'https://www.sec.gov/Archives/edgar/data/929869/000092986926000054/relx-20260723xex99d1.htm'
    ]
  },
  {
    ticker: 'TRI',
    company: 'Thomson Reuters',
    layer: 'TRUSTED_DATA',
    proofState: 'T2_REVENUE_LINKAGE',
    priority: 'P1',
    portfolioFit: 'LOWER_VOL_QUALITY',
    trading212Availability: 'UNVERIFIED',
    evidenceSummary: 'Q2 recurring revenue growth in Legal and Corporates was explicitly driven by Westlaw and CoCounsel; CoCounsel has reached one million professionals.',
    keyRisk: 'AI margin/FCF attribution remains incomplete and broker availability must be verified before operational candidacy.',
    primaryEvidenceUrls: [
      'https://ir.thomsonreuters.com/news-releases/news-release-details/thomson-reuters-reports-second-quarter-2026-results',
      'https://www.thomsonreuters.com/en/press-releases/2026/february/one-million-professionals-turn-to-cocounsel-as-thomson-reuters-scales-ai-for-regulated-industries'
    ]
  },
  {
    ticker: 'CRM',
    company: 'Salesforce',
    layer: 'SYSTEM_OF_RECORD',
    proofState: 'T1_ADOPTION',
    priority: 'P1',
    portfolioFit: 'BALANCED_GROWTH',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Agentforce/Data 360 ARR reached nearly $3.9B, Agentforce ARR exceeded $1.5B and premium agentic SKU bookings more than doubled QoQ; these are strong paid-expansion signals but remain ARR/bookings rather than clean recognized-AI-revenue disclosure.',
    keyRisk: 'Must prove recognized AI revenue, margin linkage and FCF/ROIC after the current repricing.',
    primaryEvidenceUrls: [
      'https://investor.salesforce.com/news/news-details/2026/Salesforce-Delivers-Record-Second-Quarter-Fiscal-2027-Results/default.aspx'
    ]
  },
  {
    ticker: 'NOW',
    company: 'ServiceNow',
    layer: 'WORKFLOW_ORCHESTRATION',
    proofState: 'T1_ADOPTION',
    priority: 'P1',
    portfolioFit: 'BALANCED_GROWTH',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'ServiceNow AI crossed $1B of ACV and agentic deployments increased ninefold in nine months while subscription revenue grew 24.5%; ACV is paid demand evidence, not recognized revenue by itself.',
    keyRisk: 'High duration/valuation sensitivity and lack of separately disclosed AI FCF.',
    primaryEvidenceUrls: [
      'https://investor.servicenow.com/news/news-details/2026/ServiceNow-Reports-Second-Quarter-2026-Financial-Results/default.aspx'
    ]
  },
  {
    ticker: 'GOOG',
    company: 'Alphabet',
    layer: 'CLOUD_PLATFORM',
    proofState: 'T2_REVENUE_LINKAGE',
    priority: 'P1',
    portfolioFit: 'CAPEX_HEAVY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Google Cloud revenue grew 82% to $24.8B, with the company explicitly citing enterprise AI solutions and AI infrastructure as major drivers.',
    keyRisk: 'Very high AI CAPEX and negative near-term FCF pressure can dilute owner capture despite strong revenue.',
    primaryEvidenceUrls: [
      'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000066/googexhibit991q22026.htm'
    ]
  },
  {
    ticker: 'MSFT',
    company: 'Microsoft',
    layer: 'WORKFLOW_ORCHESTRATION',
    proofState: 'T2_REVENUE_LINKAGE',
    priority: 'P1',
    portfolioFit: 'CAPEX_HEAVY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Microsoft has disclosed an AI business annual revenue run rate above $37B, supporting real monetization across cloud and software distribution.',
    keyRisk: 'CAPEX intensity is rising rapidly and AI economics remain less transparent than the headline run-rate suggests.',
    primaryEvidenceUrls: [
      'https://www.reuters.com/business/ai-investment-boom-puts-big-techs-free-cash-flow-under-pressure-2026-07-22/'
    ]
  },
  {
    ticker: 'SPGI',
    company: 'S&P Global',
    layer: 'TRUSTED_DATA',
    proofState: 'T1_ADOPTION',
    priority: 'P1',
    portfolioFit: 'LOWER_VOL_QUALITY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'S&P Global reports rapid adoption and expansion of AI solutions and is reorganizing Market Intelligence around agentic solutions, data and workflow capabilities.',
    keyRisk: 'No clean attributable AI revenue or AI FCF disclosure yet.',
    primaryEvidenceUrls: [
      'https://www.sec.gov/Archives/edgar/data/64040/000006404026000040/spgi2q2026-earningsrelease.htm',
      'https://www.sec.gov/Archives/edgar/data/64040/000110465926080751/tm2619719d1_ex99-1.htm'
    ]
  },
  {
    ticker: 'MCO',
    company: "Moody's",
    layer: 'TRUSTED_DATA',
    proofState: 'T1_ADOPTION',
    priority: 'P1',
    portfolioFit: 'LOWER_VOL_QUALITY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Moody’s says AI adoption is driving demand for decision-grade connected intelligence; Analytics ARR reached $3.7B and recurring revenue remains dominant.',
    keyRisk: 'AI contribution is not isolated from ratings/analytics cycle and direct AI revenue linkage remains incomplete.',
    primaryEvidenceUrls: [
      'https://www.sec.gov/Archives/edgar/data/1059556/000162828026049104/a2q26earningsrelease.htm'
    ]
  },
  {
    ticker: 'PLTR',
    company: 'Palantir Technologies',
    layer: 'WORKFLOW_ORCHESTRATION',
    proofState: 'T2_REVENUE_LINKAGE',
    priority: 'P2',
    portfolioFit: 'HIGH_GROWTH_HIGH_VOL',
    trading212Availability: 'UNVERIFIED',
    evidenceSummary: 'Revenue grew 93% and the company raised forecasts again on strong demand for its AI-powered data analytics platform across government and U.S. commercial customers.',
    keyRisk: 'Extreme expectations/valuation and high volatility can overwhelm excellent operating proof.',
    primaryEvidenceUrls: [
      'https://www.reuters.com/technology/palantir-raises-annual-revenue-forecast-strong-demand-us-government-commercial-2026-08-03/'
    ]
  },
  {
    ticker: 'SNOW',
    company: 'Snowflake',
    layer: 'SYSTEM_OF_RECORD',
    proofState: 'T1_ADOPTION',
    priority: 'P2',
    portfolioFit: 'HIGH_GROWTH_HIGH_VOL',
    trading212Availability: 'UNVERIFIED',
    evidenceSummary: 'Snowflake raised its product-revenue outlook citing meaningful uplift from AI capabilities and growing enterprise use of Cortex/Snowpark, but AI revenue is not separately recognized.',
    keyRisk: 'Consumption volatility, competitive intensity and valuation sensitivity.',
    primaryEvidenceUrls: [
      'https://www.reuters.com/business/snowflake-raises-annual-product-revenue-forecast-enterprises-ramp-up-ai-2026-05-27/'
    ]
  },
  {
    ticker: 'ADBE',
    company: 'Adobe',
    layer: 'APPLICATIONS',
    proofState: 'T1_ADOPTION',
    priority: 'P2',
    portfolioFit: 'BALANCED_GROWTH',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Firefly ending ARR approached $300M and enterprise-generated assets grew more than fourfold; Adobe has explicit credit-based monetization for AI agents.',
    keyRisk: 'AI may both expand and cannibalize traditional creative/stock economics; ARR still needs recognized revenue, FCF and ROIC proof.',
    primaryEvidenceUrls: [
      'https://www.adobe.com/cc-shared/assets/investor-relations/pdfs/11606202/c5y6yteraf.pdf',
      'https://www.adobe.com/cc-shared/assets/investor-relations/pdfs/adbe-q2fy26-transcript.pdf'
    ]
  },
  {
    ticker: 'WDAY',
    company: 'Workday',
    layer: 'SYSTEM_OF_RECORD',
    proofState: 'T1_ADOPTION',
    priority: 'P2',
    portfolioFit: 'BALANCED_GROWTH',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'More than half of net new Q2 wins adopted at least one AI solution while subscription revenue rose 13.9%, supporting customer-acceptance evidence.',
    keyRisk: 'AI revenue and incremental margin are not yet separately demonstrated.',
    primaryEvidenceUrls: [
      'https://www.reuters.com/business/workday-beats-second-quarter-revenue-estimates-2026-08-27/'
    ]
  },
  {
    ticker: 'SAP',
    company: 'SAP',
    layer: 'SYSTEM_OF_RECORD',
    proofState: 'T1_ADOPTION',
    priority: 'P2',
    portfolioFit: 'BALANCED_GROWTH',
    trading212Availability: 'UNVERIFIED',
    evidenceSummary: 'Cloud revenue rose 24% at constant currency and Cloud ERP Suite 27%, while SAP links its Autonomous Enterprise strategy and Business AI platform to backlog momentum.',
    keyRisk: 'AI-specific revenue is not disclosed and recent AI/data acquisitions are dilutive to near-term operating profit.',
    primaryEvidenceUrls: [
      'https://news.sap.com/2026/07/sap-announces-q2-and-half-year-2026-results/'
    ]
  },
  {
    ticker: 'AMZN',
    company: 'Amazon',
    layer: 'CLOUD_PLATFORM',
    proofState: 'T1_ADOPTION',
    priority: 'P2',
    portfolioFit: 'CAPEX_HEAVY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'AWS revenue grew 37% to $42.2B, its fastest growth in 18 quarters, providing a powerful distribution surface for enterprise AI even though AI revenue is not isolated.',
    keyRisk: 'Very high infrastructure spending and weak recent FCF relative to operating cash flow.',
    primaryEvidenceUrls: [
      'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000024/amzn-20260630xex991.htm'
    ]
  },
  {
    ticker: 'ORCL',
    company: 'Oracle',
    layer: 'CLOUD_PLATFORM',
    proofState: 'T2_REVENUE_LINKAGE',
    priority: 'P3',
    portfolioFit: 'CAPEX_HEAVY',
    trading212Availability: 'UNVERIFIED',
    evidenceSummary: 'FY26 cloud infrastructure revenue grew 77% and Q4 IaaS 93%, demonstrating powerful AI infrastructure capture alongside a large applications base.',
    keyRisk: 'Capex reached about 174% of operating cash flow in FY26 and Oracle plans substantial debt/equity financing; CFQ/Financed Demand review is mandatory.',
    primaryEvidenceUrls: [
      'https://investor.oracle.com/investor-news/news-details/2026/Oracle-Announces-Record-Q4-and-FY-2026-Results-Driven-by-Cloud-Infrastructure--Cloud-Applications/',
      'https://www.reuters.com/business/ai-investment-boom-puts-big-techs-free-cash-flow-under-pressure-2026-07-22/'
    ]
  },
  {
    ticker: 'AAPL',
    company: 'Apple',
    layer: 'DEVICE_OS_DISTRIBUTION',
    proofState: 'T0_NARRATIVE',
    priority: 'OPTIONALITY',
    portfolioFit: 'OPTIONALITY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Apple controls a massive device/OS distribution surface, but ATLAS still lacks sufficient attributable AI monetization evidence to promote the distribution thesis above optionality.',
    keyRisk: 'Distribution control may not translate into incremental AI revenue, margin or ROIC.',
    primaryEvidenceUrls: []
  },
  {
    ticker: 'MANH',
    company: 'Manhattan Associates',
    layer: 'VERTICAL_SOFTWARE',
    proofState: 'T0_NARRATIVE',
    priority: 'OPTIONALITY',
    portfolioFit: 'LOWER_VOL_QUALITY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Cloud revenue grew 26%, RPO 23% and bookings reached another record, giving MANH strong workflow control; AI-specific monetization has not yet been isolated.',
    keyRisk: 'Do not relabel ordinary cloud growth as AI capture without attributable evidence.',
    primaryEvidenceUrls: [
      'https://www.manh.com/about-us/newsroom/press-releases/earnings-2026-q2'
    ]
  },
  {
    ticker: 'ROP',
    company: 'Roper Technologies',
    layer: 'VERTICAL_SOFTWARE',
    proofState: 'T0_NARRATIVE',
    priority: 'OPTIONALITY',
    portfolioFit: 'LOWER_VOL_QUALITY',
    trading212Availability: 'KNOWN_AVAILABLE_USER_SCREENSHOT',
    evidenceSummary: 'Roper combines vertical-software switching costs with 11% Q2 FCF growth and says it is investing to commercialize AI across its businesses, but no attributable AI revenue is yet disclosed.',
    keyRisk: 'AI thesis remains optionality until product-level paid expansion and revenue linkage appear.',
    primaryEvidenceUrls: [
      'https://www.ropertech.com/news-releases/news-release-details/roper-technologies-announces-second-quarter-financial-results-3'
    ]
  }
] as const;
