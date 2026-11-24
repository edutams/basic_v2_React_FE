export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

export function formatDateDisplay(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const AS_AT_DATES = ['31 Mar, 2026', '31 Dec, 2025', '30 Sep, 2025'];
export const COMPARE_DATES = ['31 Dec, 2025', '30 Sep, 2025', '30 Jun, 2025'];

export const BALANCE_SHEET_TABS = [
  { value: 'balance-sheet', label: 'Balance Sheet' },
  { value: 'assets', label: 'Asset Details' },
  { value: 'liabilities', label: 'Liabilities Details' },
  { value: 'equity', label: 'Equity Details' },
  { value: 'trend', label: 'Trend & Analysis' },
];

// Consistent color scheme across every Balance Sheet chart (the CEO's
// screenshots swap Liabilities/Equity colors between screens — this keeps
// one consistent mapping throughout this build instead of copying that
// inconsistency).
export const COLORS = {
  assets: '#2563EB',
  nonCurrentAssets: '#2563EB',
  currentAssets: '#16A34A',
  liabilities: '#9333EA',
  nonCurrentLiabilities: '#2563EB',
  currentLiabilities: '#16A34A',
  equity: '#16A34A',
  accumulatedSurplus: '#2563EB',
  currentPeriodSurplus: '#16A34A',
};

// ===================== Balance Sheet tab =====================
export const balanceSheetStats = {
  totalAssets: 1842000,
  totalAssetsChangePct: 8.7,
  totalLiabilities: 642000,
  totalLiabilitiesChangePct: 6.3,
  netAssets: 1200000,
  netAssetsChangePct: 10.1,
  currentRatio: '2.51 : 1',
  currentRatioNote: 'Good liquidity',
  equityRatio: 65.1,
  equityRatioNote: 'Financially stable',
};

export const balanceSheetStatement = {
  assets: [
    { item: 'Non-Current Assets', amount: 1250000, pct: 67.9 },
    { item: 'Current Assets', amount: 592000, pct: 32.1 },
  ],
  liabilities: [
    { item: 'Non-Current Liabilities', amount: 350000, pct: 19.0 },
    { item: 'Current Liabilities', amount: 292000, pct: 15.9 },
  ],
  equity: [
    { item: 'Accumulated Surplus', amount: 983000, pct: 53.4 },
    { item: 'Current Period Surplus', amount: 217000, pct: 11.8 },
  ],
};

export const assetsComposition = [
  { name: 'Non-Current Assets', value: 1250000, pct: 67.9 },
  { name: 'Current Assets', value: 592000, pct: 32.1 },
];

export const liabilitiesEquityComposition = [
  { name: 'Total Liabilities', value: 642000, pct: 34.9 },
  { name: 'Total Equity', value: 1200000, pct: 65.1 },
];

// 4 terms, matching the Balance Sheet tab's "(Last 4 Terms)" chart title —
// the same 4 most recent points as `periodMovementAnalysis` below (which
// covers 7 terms, for the Trend & Analysis tab's wider chart).
export const financialPositionTrend = [
  { term: '2025 T2', assets: 1620000, equity: 1000000, liabilities: 570000 },
  { term: '2025 T3', assets: 1720000, equity: 1090000, liabilities: 600000 },
  { term: '2025 T4', assets: 1780000, equity: 1150000, liabilities: 620000 },
  { term: '2026 T1', assets: 1842000, equity: 1200000, liabilities: 642000 },
];

export const balanceSheetInsights = [
  'Total assets increased by 8.7% to ₦1,842,000.',
  'Total liabilities increased by 6.3% to ₦642,000.',
  'Net assets (equity) grew by 10.1% to ₦1,200,000.',
  'Current ratio is 2.51:1, indicating a healthy liquidity position.',
];

// ===================== Asset Details tab =====================
export const assetDetailsStats = {
  totalAssets: 1842000,
  totalAssetsChangePct: 8.7,
  nonCurrentAssets: 1250000,
  nonCurrentAssetsPct: 67.9,
  currentAssets: 592000,
  currentAssetsPct: 32.1,
  assetRecords: 48,
  netAssetMovement: 147000,
  netAssetMovementPct: 8.7,
};

export const assetAccounts = {
  nonCurrent: {
    label: 'A. Non-Current Assets (Fixed Assets)',
    items: 16,
    cost: 1580000,
    depreciation: 330000,
    nbv: 1250000,
    rows: [
      { account: 'Land and Buildings', items: 2, cost: 1000000, depreciation: 200000, nbv: 800000 },
      { account: 'Furniture and Fittings', items: 6, cost: 180000, depreciation: 50000, nbv: 130000 },
      { account: 'ICT Equipment', items: 5, cost: 250000, depreciation: 60000, nbv: 190000 },
      { account: 'Motor Vehicles', items: 1, cost: 120000, depreciation: 20000, nbv: 100000 },
      { account: 'Other Fixed Assets', items: 2, cost: 30000, depreciation: 0, nbv: 30000 },
    ],
  },
  current: {
    label: 'B. Current Assets',
    items: 32,
    cost: 592000,
    depreciation: 0,
    nbv: 592000,
    rows: [
      { account: 'Cash and Bank Balances', items: 3, cost: 292000, depreciation: 0, nbv: 292000 },
      { account: 'Accounts Receivable (Fees & Others)', items: 24, cost: 250000, depreciation: 0, nbv: 250000 },
      { account: 'Inventories (Stores)', items: 5, cost: 50000, depreciation: 0, nbv: 50000 },
    ],
  },
};

export const recentAssetTransactions = [
  { date: '2026-03-12', description: 'Purchase of 10 computers', category: 'ICT Equipment', type: 'Addition', amount: 250000, status: 'Posted' },
  { date: '2026-02-20', description: 'Office chairs (20 units)', category: 'Furniture and Fittings', type: 'Addition', amount: 80000, status: 'Posted' },
  { date: '2026-01-15', description: 'Depreciation for Jan 2026', category: 'ICT Equipment', type: 'Depreciation', amount: -20000, status: 'Posted' },
  { date: '2025-12-31', description: 'Depreciation for Dec 2025', category: 'Furniture and Fittings', type: 'Depreciation', amount: -10000, status: 'Posted' },
];

export const assetTrend = [
  { term: '2025 T1', total: 1520000, nonCurrent: 1020000, current: 500000 },
  { term: '2025 T2', total: 1620000, nonCurrent: 1090000, current: 530000 },
  { term: '2025 T3', total: 1720000, nonCurrent: 1160000, current: 560000 },
  { term: '2026 T1', total: 1842000, nonCurrent: 1250000, current: 592000 },
];

export const assetDetailsInsights = [
  'Total assets are ₦1,842,000, up by 8.7% (₦147,000) from 31 Dec, 2025.',
  'Non-current assets account for 67.9% (₦1,250,000) of total assets.',
  'Current assets account for 32.1% (₦592,000) of total assets.',
  'The school added ₦330,000 in new assets during the period.',
];

// ===================== Liabilities Details tab =====================
export const liabilityDetailsStats = {
  totalLiabilities: 642000,
  totalLiabilitiesChangePct: 6.3,
  nonCurrentLiabilities: 350000,
  nonCurrentLiabilitiesPct: 54.5,
  currentLiabilities: 292000,
  currentLiabilitiesPct: 45.5,
  liabilityRecords: 12,
  liabilityMovement: 38000,
  liabilityMovementPct: 6.3,
};

export const liabilityAccounts = {
  nonCurrent: {
    label: 'A. Non-Current Liabilities',
    records: 3,
    balance: 350000,
    pct: 54.5,
    rows: [
      { account: 'Long-term Loan', records: 1, balance: 250000, pct: 38.9 },
      { account: 'Lease Liability (Equipment)', records: 1, balance: 80000, pct: 12.5 },
      { account: 'Other Non-Current Liabilities', records: 1, balance: 20000, pct: 3.1 },
    ],
  },
  current: {
    label: 'B. Current Liabilities',
    records: 9,
    balance: 292000,
    pct: 45.5,
    rows: [
      { account: 'Accounts Payable (Suppliers)', records: 4, balance: 198000, pct: 30.8 },
      { account: 'Accrued Expenses', records: 2, balance: 42000, pct: 6.5 },
      { account: 'Taxes and Statutory Deductions', records: 1, balance: 28000, pct: 4.4 },
      { account: 'Other Current Liabilities', records: 2, balance: 24000, pct: 3.7 },
    ],
  },
};

export const recentLiabilityTransactions = [
  { date: '2026-03-28', description: 'Supplier invoice (books)', account: 'Accounts Payable', amount: 150000, type: 'Addition', status: 'Posted' },
  { date: '2026-03-20', description: 'Q1 utility expense accrual', account: 'Accrued Expenses', amount: 30000, type: 'Addition', status: 'Posted' },
  { date: '2026-03-10', description: 'Loan repayment (Term 4)', account: 'Long-term Loan', amount: -50000, type: 'Payment', status: 'Posted' },
  { date: '2026-02-28', description: 'PAYE (Feb 2026)', account: 'Taxes & Statutory Deductions', amount: 28000, type: 'Addition', status: 'Posted' },
];

export const liabilityTrend = [
  { term: '2025 T1', total: 540000, nonCurrent: 300000, current: 240000 },
  { term: '2025 T2', total: 570000, nonCurrent: 310000, current: 260000 },
  { term: '2025 T3', total: 600000, nonCurrent: 330000, current: 270000 },
  { term: '2026 T1', total: 642000, nonCurrent: 350000, current: 292000 },
];

export const liabilityDetailsInsights = [
  'Total liabilities are ₦642,000, up by 6.3% (₦38,000) from 31 Dec, 2025.',
  'Non-current liabilities account for 54.5% (₦350,000) of total liabilities.',
  'Current liabilities account for 45.5% (₦292,000) of total liabilities.',
  'The increase is mainly from higher accounts payable (₦48,000) during the period.',
];

// ===================== Equity Details tab =====================
export const equityDetailsStats = {
  totalEquity: 1200000,
  totalEquityChangePct: 10.1,
  accumulatedSurplus: 983000,
  accumulatedSurplusPct: 81.9,
  currentPeriodSurplus: 217000,
  currentPeriodSurplusPct: 18.1,
  equityRatio: 65.1,
  equityMovement: 110000,
  equityMovementPct: 10.1,
};

export const equityAccounts = {
  accumulatedSurplus: {
    label: 'A. Accumulated Surplus',
    balance: 983000,
    pct: 81.9,
    movement: 73000,
    changeLabel: '+8.0%',
    rows: [
      { account: 'Opening Balance', balance: 910000, pct: 75.8, movement: 0, changeLabel: '–' },
      { account: 'Prior Period Adjustments', balance: -10000, pct: -0.8, movement: -10000, changeLabel: '–' },
      { account: 'Transfers / Reserves', balance: 83000, pct: 6.9, movement: 83000, changeLabel: '–' },
    ],
  },
  currentPeriodSurplus: {
    label: 'B. Current Period Surplus',
    balance: 217000,
    pct: 18.1,
    movement: 37000,
    changeLabel: '+20.6%',
    rows: [
      { account: 'Income for the Period', balance: 742000, pct: 61.8, movement: 101000, changeLabel: '+15.8%' },
      { account: 'Less: Expenditure for the Period', balance: -525000, pct: -43.8, movement: -58000, changeLabel: '+12.4%' },
    ],
  },
};

export const recentEquityTransactions = [
  { date: '2026-03-31', description: 'Surplus for Term 1, 2025/2026', account: 'Current Period Surplus', amount: 217000, type: 'Surplus Transfer', status: 'Posted' },
  { date: '2026-01-10', description: 'Transfer to Building Reserve', account: 'Accumulated Surplus', amount: 50000, type: 'Transfer', status: 'Posted' },
  { date: '2025-12-31', description: 'Prior period adjustment', account: 'Accumulated Surplus', amount: -10000, type: 'Adjustment', status: 'Posted' },
  { date: '2025-09-30', description: 'Surplus for Term 3, 2025/2026', account: 'Current Period Surplus', amount: 180000, type: 'Surplus Transfer', status: 'Posted' },
];

// Equity Trend — stacked bar (Accumulated Surplus + Current Surplus) with a
// Total Equity line overlaid, every point labeled (matches the mockup,
// unlike Post Expenditure's Posting Trend which only labels the last one).
export const equityTrend = [
  { term: '2025 T2', accumulatedSurplus: 850000, currentPeriodSurplus: 60000, total: 910000 },
  { term: '2025 T3', accumulatedSurplus: 873000, currentPeriodSurplus: 110000, total: 983000 },
  { term: '2025 T4', accumulatedSurplus: 910000, currentPeriodSurplus: 180000, total: 1090000 },
  { term: '2026 T1', accumulatedSurplus: 983000, currentPeriodSurplus: 217000, total: 1200000 },
];

export const equityDetailsInsights = [
  'Total equity (net assets) is ₦1,200,000, up by 10.1% (₦110,000) from 31 Dec, 2025.',
  'Accumulated surplus accounts for 81.9% (₦983,000) of total equity.',
  'Current period surplus is ₦217,000, an increase of 20.6% (₦37,000).',
  'Equity ratio is 65.1%, indicating a financially stable position.',
];

// ===================== Trend & Analysis tab =====================
export const financialStructure = [
  { name: 'Equity (Net Assets)', value: 1200000, pct: 65.1 },
  { name: 'Liabilities', value: 642000, pct: 34.9 },
];

export const periodMovementAnalysis = [
  { term: '2024 T2', assets: 1340000, liabilities: 480000, equity: 820000 },
  { term: '2024 T3', assets: 1420000, liabilities: 510000, equity: 870000 },
  { term: '2025 T1', assets: 1520000, liabilities: 540000, equity: 930000 },
  { term: '2025 T2', assets: 1620000, liabilities: 570000, equity: 1000000 },
  { term: '2025 T3', assets: 1720000, liabilities: 600000, equity: 1090000 },
  { term: '2025 T4', assets: 1780000, liabilities: 620000, equity: 1150000 },
  { term: '2026 T1', assets: 1842000, liabilities: 642000, equity: 1200000 },
];

export const financialRatiosTrend = [
  { metric: 'Current Ratio', previous: '2.42 : 1', current: '2.51 : 1', changeLabel: '+0.09', direction: 'up', good: true },
  { metric: 'Equity Ratio', previous: '63.8%', current: '65.1%', changeLabel: '+1.3 pp', direction: 'up', good: true },
  { metric: 'Liabilities Ratio', previous: '36.2%', current: '34.9%', changeLabel: '−1.3 pp', direction: 'down', good: true },
  { metric: 'Asset Growth', previous: formatNaira(1694000), current: formatNaira(1842000), changeLabel: '+8.7%', direction: 'up', good: true },
];

export const trendAnalysisInsights = [
  'Total assets increased by 8.7% (₦148,000) to ₦1,842,000.',
  'Total liabilities rose by 6.3% (₦38,000) to ₦642,000.',
  'Total equity (net assets) grew by 10.1% (₦110,000) to ₦1,200,000.',
  'Equity ratio is 65.1%, indicating a strong and stable financial position.',
  'Current ratio is 2.51:1, showing good short-term liquidity.',
];
