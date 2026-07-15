// Realistic placeholder data for the MAVEN platform (INR, Nifty 50 focus).

export const investor = {
  name: "Aarav Sharma",
  email: "aarav.sharma@example.in",
  initials: "AS",
  memberSince: "Mar 2023",
  plan: "Pro",
  riskProfile: "Moderate",
  city: "Bengaluru",
};

export const portfolioSummary = {
  value: 2847650,
  invested: 2410000,
  dayChange: 18420,
  dayChangePct: 0.65,
  totalReturn: 437650,
  totalReturnPct: 18.16,
  xirr: 21.4,
  healthScore: 78,
  riskLevel: "Moderate",
  diversification: 72,
  volatility: 14.2,
  sharpe: 1.32,
  beta: 0.94,
};

export const allocation = [
  { name: "Equity", value: 68, amount: 1936402, color: "var(--color-chart-1)" },
  { name: "Mutual Funds", value: 18, amount: 512577, color: "var(--color-chart-2)" },
  { name: "Gold ETF", value: 8, amount: 227812, color: "var(--color-chart-3)" },
  { name: "Cash", value: 6, amount: 170859, color: "var(--color-chart-4)" },
];

export const sectorDistribution = [
  { name: "Financials", value: 28 },
  { name: "IT", value: 22 },
  { name: "Energy", value: 14 },
  { name: "FMCG", value: 12 },
  { name: "Auto", value: 10 },
  { name: "Pharma", value: 8 },
  { name: "Others", value: 6 },
];

export const performanceSeries = [
  { month: "Jan", portfolio: 2410, nifty: 2410 },
  { month: "Feb", portfolio: 2452, nifty: 2438 },
  { month: "Mar", portfolio: 2398, nifty: 2405 },
  { month: "Apr", portfolio: 2521, nifty: 2470 },
  { month: "May", portfolio: 2604, nifty: 2532 },
  { month: "Jun", portfolio: 2588, nifty: 2519 },
  { month: "Jul", portfolio: 2691, nifty: 2601 },
  { month: "Aug", portfolio: 2742, nifty: 2640 },
  { month: "Sep", portfolio: 2698, nifty: 2612 },
  { month: "Oct", portfolio: 2789, nifty: 2688 },
  { month: "Nov", portfolio: 2812, nifty: 2705 },
  { month: "Dec", portfolio: 2847, nifty: 2731 },
];

export const growthSeries = [
  { year: "2020", value: 480 },
  { year: "2021", value: 910 },
  { year: "2022", value: 1320 },
  { year: "2023", value: 1880 },
  { year: "2024", value: 2410 },
  { year: "2025", value: 2847 },
];

export type Holding = {
  symbol: string;
  name: string;
  sector: string;
  qty: number;
  avg: number;
  ltp: number;
  dayPct: number;
};

export const holdings: Holding[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", qty: 60, avg: 2410, ltp: 2892, dayPct: 1.24 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Financials", qty: 90, avg: 1520, ltp: 1684, dayPct: 0.42 },
  { symbol: "INFY", name: "Infosys", sector: "IT", qty: 110, avg: 1340, ltp: 1876, dayPct: 2.15 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", qty: 40, avg: 3410, ltp: 4128, dayPct: -0.68 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Financials", qty: 120, avg: 890, ltp: 1214, dayPct: 0.91 },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", qty: 200, avg: 402, ltp: 458, dayPct: -0.31 },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infra", qty: 30, avg: 2980, ltp: 3612, dayPct: 1.08 },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", qty: 8, avg: 9800, ltp: 12420, dayPct: 1.72 },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", qty: 45, avg: 1120, ltp: 1548, dayPct: 0.55 },
  { symbol: "TITAN", name: "Titan Company", sector: "Consumer", qty: 25, avg: 2840, ltp: 3388, dayPct: -1.14 },
];

export const withHoldingMetrics = (h: Holding) => {
  const invested = h.qty * h.avg;
  const current = h.qty * h.ltp;
  const pnl = current - invested;
  const pnlPct = (pnl / invested) * 100;
  return { ...h, invested, current, pnl, pnlPct };
};

export const niftyOverview = {
  level: 24731.4,
  change: 168.9,
  changePct: 0.69,
  dayHigh: 24788.2,
  dayLow: 24602.1,
  advances: 34,
  declines: 16,
  pe: 22.8,
  vix: 13.4,
};

export const gainers = [
  { symbol: "INFY", name: "Infosys", ltp: 1876, pct: 2.15 },
  { symbol: "MARUTI", name: "Maruti Suzuki", ltp: 12420, pct: 1.72 },
  { symbol: "RELIANCE", name: "Reliance", ltp: 2892, pct: 1.24 },
  { symbol: "LT", name: "L&T", ltp: 3612, pct: 1.08 },
  { symbol: "ICICIBANK", name: "ICICI Bank", ltp: 1214, pct: 0.91 },
];

export const losers = [
  { symbol: "TITAN", name: "Titan", ltp: 3388, pct: -1.14 },
  { symbol: "TCS", name: "TCS", ltp: 4128, pct: -0.68 },
  { symbol: "ITC", name: "ITC", ltp: 458, pct: -0.31 },
  { symbol: "NESTLEIND", name: "Nestlé India", ltp: 2456, pct: -0.28 },
  { symbol: "WIPRO", name: "Wipro", ltp: 542, pct: -0.22 },
];

export const sectorPerformance = [
  { name: "IT", pct: 1.84 },
  { name: "Auto", pct: 1.21 },
  { name: "Energy", pct: 0.92 },
  { name: "Financials", pct: 0.44 },
  { name: "Pharma", pct: 0.31 },
  { name: "Metal", pct: -0.18 },
  { name: "FMCG", pct: -0.42 },
  { name: "Realty", pct: -0.71 },
];

export type NiftyCompany = {
  symbol: string;
  name: string;
  sector: string;
  ltp: number;
  pct: number;
  mcap: number;
  pe: number;
  rsi: number;
  sentiment: "Positive" | "Neutral" | "Negative";
};

export const niftyCompanies: NiftyCompany[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", ltp: 2892, pct: 1.24, mcap: 1956000, pe: 24.1, rsi: 62, sentiment: "Positive" },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Financials", ltp: 1684, pct: 0.42, mcap: 1281000, pe: 19.4, rsi: 54, sentiment: "Neutral" },
  { symbol: "TCS", name: "Tata Consultancy", sector: "IT", ltp: 4128, pct: -0.68, mcap: 1492000, pe: 29.8, rsi: 48, sentiment: "Neutral" },
  { symbol: "INFY", name: "Infosys", sector: "IT", ltp: 1876, pct: 2.15, mcap: 778000, pe: 26.2, rsi: 71, sentiment: "Positive" },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Financials", ltp: 1214, pct: 0.91, mcap: 854000, pe: 18.1, rsi: 58, sentiment: "Positive" },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", ltp: 458, pct: -0.31, mcap: 572000, pe: 25.6, rsi: 44, sentiment: "Negative" },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infra", ltp: 3612, pct: 1.08, mcap: 496000, pe: 34.2, rsi: 64, sentiment: "Positive" },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", ltp: 12420, pct: 1.72, mcap: 390000, pe: 27.9, rsi: 68, sentiment: "Positive" },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", ltp: 1548, pct: 0.55, mcap: 371000, pe: 33.1, rsi: 56, sentiment: "Neutral" },
  { symbol: "TITAN", name: "Titan Company", sector: "Consumer", ltp: 3388, pct: -1.14, mcap: 300000, pe: 88.4, rsi: 41, sentiment: "Negative" },
  { symbol: "AXISBANK", name: "Axis Bank", sector: "Financials", ltp: 1148, pct: 0.34, mcap: 354000, pe: 13.7, rsi: 52, sentiment: "Neutral" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", ltp: 1562, pct: 0.88, mcap: 892000, pe: 62.3, rsi: 66, sentiment: "Positive" },
];

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  score: number;
  summary: string;
  related: string[];
};

export const news: NewsItem[] = [
  {
    id: "n1",
    title: "Infosys raises FY26 revenue guidance on strong AI deal pipeline",
    source: "Economic Times",
    time: "42 min ago",
    sentiment: "Positive",
    score: 0.82,
    summary:
      "Infosys lifted its full-year revenue growth outlook to 4–6% citing a robust deal pipeline in generative-AI transformation projects and stabilising discretionary spend among BFSI clients.",
    related: ["INFY", "TCS", "WIPRO"],
  },
  {
    id: "n2",
    title: "RBI holds repo rate at 6.5%, signals prolonged pause",
    source: "Mint",
    time: "1 hr ago",
    sentiment: "Neutral",
    score: 0.51,
    summary:
      "The Monetary Policy Committee kept the repo rate unchanged for the eighth straight meeting, maintaining a 'withdrawal of accommodation' stance while trimming its inflation forecast for the second half.",
    related: ["HDFCBANK", "ICICIBANK", "AXISBANK"],
  },
  {
    id: "n3",
    title: "Titan Q3 margins pressured by rising gold prices and studded weakness",
    source: "Moneycontrol",
    time: "2 hr ago",
    sentiment: "Negative",
    score: 0.28,
    summary:
      "Titan reported softer jewellery margins as elevated gold prices weighed on studded ratios. Management guided to a gradual recovery but flagged near-term demand caution.",
    related: ["TITAN"],
  },
  {
    id: "n4",
    title: "Reliance Retail crosses milestone store count, JioMart scales quick-commerce",
    source: "Business Standard",
    time: "3 hr ago",
    sentiment: "Positive",
    score: 0.76,
    summary:
      "Reliance Industries' retail arm expanded aggressively into tier-2 cities while JioMart's quick-commerce push improved order density, supporting the consumer segment's growth narrative.",
    related: ["RELIANCE"],
  },
  {
    id: "n5",
    title: "Auto sales beat estimates as SUV demand stays resilient",
    source: "Livemint",
    time: "5 hr ago",
    sentiment: "Positive",
    score: 0.71,
    summary:
      "Passenger vehicle dispatches rose in double digits led by SUVs, with Maruti Suzuki and M&M outperforming. Rural demand recovery and festive momentum aided volumes.",
    related: ["MARUTI"],
  },
];

export type Recommendation = {
  id: string;
  symbol: string;
  name: string;
  action: "Buy" | "Hold" | "Sell";
  confidence: number;
  expectedReturn: number;
  horizon: string;
  risk: "Low" | "Moderate" | "High";
  currentPrice: number;
  targetPrice: number;
  thesis: string;
  indicators: { label: string; value: string; signal: "bullish" | "bearish" | "neutral" }[];
  supportingNews: string[];
};

export const recommendations: Recommendation[] = [
  {
    id: "r1",
    symbol: "INFY",
    name: "Infosys",
    action: "Buy",
    confidence: 87,
    expectedReturn: 14.5,
    horizon: "6–9 months",
    risk: "Moderate",
    currentPrice: 1876,
    targetPrice: 2148,
    thesis:
      "Accelerating large-deal wins in AI-led transformation, improving margin trajectory, and positive analyst revisions position Infosys for outperformance versus the IT index.",
    indicators: [
      { label: "RSI (14)", value: "71", signal: "bullish" },
      { label: "50-DMA", value: "Above", signal: "bullish" },
      { label: "Deal TCV", value: "+18% YoY", signal: "bullish" },
      { label: "Valuation", value: "26.2x", signal: "neutral" },
    ],
    supportingNews: ["n1"],
  },
  {
    id: "r2",
    symbol: "TITAN",
    name: "Titan Company",
    action: "Sell",
    confidence: 74,
    expectedReturn: -8.2,
    horizon: "3–6 months",
    risk: "High",
    currentPrice: 3388,
    targetPrice: 3110,
    thesis:
      "Margin compression from elevated gold prices, stretched valuations at 88x, and weak studded-jewellery mix create downside risk in the near term.",
    indicators: [
      { label: "RSI (14)", value: "41", signal: "bearish" },
      { label: "50-DMA", value: "Below", signal: "bearish" },
      { label: "Gross Margin", value: "-140 bps", signal: "bearish" },
      { label: "Valuation", value: "88.4x", signal: "bearish" },
    ],
    supportingNews: ["n3"],
  },
  {
    id: "r3",
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    action: "Hold",
    confidence: 69,
    expectedReturn: 6.1,
    horizon: "9–12 months",
    risk: "Low",
    currentPrice: 1684,
    targetPrice: 1787,
    thesis:
      "Merger integration progressing but NIM normalisation and deposit-cost pressure cap near-term upside. Attractive franchise warrants holding through the transition.",
    indicators: [
      { label: "RSI (14)", value: "54", signal: "neutral" },
      { label: "NIM", value: "Stable", signal: "neutral" },
      { label: "Deposit Growth", value: "+16%", signal: "bullish" },
      { label: "Valuation", value: "19.4x", signal: "neutral" },
    ],
    supportingNews: ["n2"],
  },
  {
    id: "r4",
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    action: "Buy",
    confidence: 81,
    expectedReturn: 11.8,
    horizon: "6–12 months",
    risk: "Moderate",
    currentPrice: 12420,
    targetPrice: 13890,
    thesis:
      "Strong SUV portfolio momentum, market-share recovery, and operating leverage from a richer mix support an upbeat earnings trajectory.",
    indicators: [
      { label: "RSI (14)", value: "68", signal: "bullish" },
      { label: "SUV Mix", value: "+ Rising", signal: "bullish" },
      { label: "Order Book", value: "Healthy", signal: "bullish" },
      { label: "Valuation", value: "27.9x", signal: "neutral" },
    ],
    supportingNews: ["n5"],
  },
];

export const rebalancing = {
  current: [
    { name: "Equity", value: 68 },
    { name: "Mutual Funds", value: 18 },
    { name: "Gold ETF", value: 8 },
    { name: "Cash", value: 6 },
  ],
  suggested: [
    { name: "Equity", value: 60 },
    { name: "Mutual Funds", value: 22 },
    { name: "Gold ETF", value: 12 },
    { name: "Cash", value: 6 },
  ],
  actions: [
    { symbol: "TITAN", action: "Trim", from: 8.6, to: 4.0, reason: "Overvalued, negative momentum" },
    { symbol: "INFY", action: "Add", from: 7.2, to: 9.5, reason: "Strong AI-led thesis, positive signals" },
    { symbol: "Gold ETF", action: "Add", from: 8.0, to: 12.0, reason: "Improve hedge & diversification" },
    { symbol: "Cash", action: "Deploy", from: 6.0, to: 4.0, reason: "Reduce cash drag in bull trend" },
  ],
  expectedImprovement: {
    return: 1.6,
    risk: -2.3,
    diversification: 9,
    sharpe: 0.18,
  },
};

export type ChatMessage = { role: "user" | "assistant"; content: string; sources?: string[] };

export const chatHistory: ChatMessage[] = [
  {
    role: "user",
    content: "Is my portfolio too concentrated in IT stocks?",
  },
  {
    role: "assistant",
    content:
      "Your portfolio currently has ~22% allocation to IT (Infosys and TCS combined), which is moderately above the Nifty 50 IT weight of ~14%. This tilt has helped recently given IT's +1.84% sector move, but it does raise single-sector concentration risk.\n\nFor a Moderate risk profile, I'd suggest keeping IT between 15–18%. You could trim TCS slightly and redeploy into an underweight defensive sector like FMCG or Pharma to improve diversification (currently scored 72/100).",
    sources: ["Portfolio holdings", "Nifty 50 sector weights", "Risk profile: Moderate"],
  },
];

export const suggestedPrompts = [
  "Explain my portfolio health score",
  "What are the top AI recommendations this week?",
  "How does rebalancing reduce my risk?",
  "Summarise today's market sentiment",
  "Which of my holdings look overvalued?",
  "What is XIRR and why does mine differ from returns?",
];

export const explainability = {
  recommendation: recommendations[0],
  agents: [
    { name: "Profile Agent", role: "Assesses investor goals & risk tolerance", status: "Moderate risk · 8-yr horizon" },
    { name: "Market Agent", role: "Analyses price action & technical indicators", status: "Bullish · RSI 71, above 50-DMA" },
    { name: "News Agent", role: "Sentiment analysis over financial news", status: "Positive · score 0.82" },
    { name: "Portfolio Agent", role: "Evaluates fit within current holdings", status: "Adds to underweight quality IT" },
    { name: "RAG Retriever", role: "Retrieves supporting knowledge & filings", status: "6 evidence documents" },
  ],
  signals: [
    { label: "Technical momentum", weight: 28, detail: "RSI 71, price above 50/200-DMA, rising volume" },
    { label: "News sentiment", weight: 24, detail: "Guidance upgrade, +0.82 aggregate score across 9 articles" },
    { label: "Fundamentals", weight: 22, detail: "Deal TCV +18% YoY, margin trajectory improving" },
    { label: "Profile fit", weight: 16, detail: "Quality large-cap, matches Moderate risk mandate" },
    { label: "Valuation", weight: 10, detail: "26.2x P/E, in-line with 3-yr median" },
  ],
  retrieved: [
    { title: "Infosys Q3 FY25 earnings call transcript", type: "Filing" },
    { title: "ET: Infosys raises FY26 guidance", type: "News" },
    { title: "Sector note: Indian IT deal momentum", type: "Research" },
    { title: "Nifty IT technical structure", type: "Market data" },
  ],
};

export const marketInsights = [
  {
    title: "IT leadership broadening",
    body: "Breadth is improving in large-cap IT as deal commentary turns constructive. Momentum favours quality names with AI exposure.",
    tone: "Positive" as const,
  },
  {
    title: "Rate pause supports financials",
    body: "A prolonged RBI pause keeps funding costs predictable. Private banks with strong deposit franchises remain well positioned.",
    tone: "Neutral" as const,
  },
  {
    title: "Watch consumer discretionary",
    body: "Elevated input costs are pressuring select consumer names. Selectivity matters; avoid stretched valuations.",
    tone: "Negative" as const,
  },
];

export const preferredSectors = ["Information Technology", "Financials", "Auto", "Pharma"];