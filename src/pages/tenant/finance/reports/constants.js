export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

export const PERIODS = ['First Term, 2025/2026', 'Second Term, 2025/2026', 'Third Term, 2025/2026'];
export const COMPARE_PERIODS = ['First Term, 2024/2025', 'Second Term, 2024/2025', 'Third Term, 2024/2025'];

export const REPORT_TABS = [
  { value: 'summary', label: 'Account Summary' },
  { value: 'income', label: 'Income Details' },
  { value: 'expenditure', label: 'Expenditure Details' },
  { value: 'trend', label: 'Trend & Analysis' },
];

// ===================== Shared category/account meta =====================
export const EXPENSE_CATEGORY_META = {
  'Teaching Materials': { color: '#2563EB' },
  Maintenance: { color: '#0D9488' },
  'Catering & Welfare': { color: '#9333EA' },
  'Office & Stationery': { color: '#D97706' },
  'Other Expenses': { color: '#94A3B8' },
};

export const INCOME_ACCOUNT_META = {
  'School Fees (Tuition)': { color: '#2563EB' },
  'Levies (ICT, Exam, Dev.)': { color: '#0D9488' },
  'Sales (Books, Uniform, etc.)': { color: '#D97706' },
  'Donations & Grants': { color: '#9333EA' },
  'Other Income': { color: '#94A3B8' },
};

// ===================== Account Summary tab =====================
export const summaryStats = {
  totalIncome: 742000,
  totalIncomeChangePct: 15.8,
  totalExpenditure: 525000,
  totalExpenditureChangePct: 12.4,
  surplus: 217000,
  surplusChangePct: 24.9,
  expenditureRatio: 70.8,
  incomeGrowthPct: 15.8,
};

// Income & Expenditure Account statement — drives the Account Summary
// tab's main table exactly as a school's own financial statement would
// lay it out (Income section, Expenditure section, then the net result).
export const statementIncomeRows = [
  { item: 'School Fees', amount: 587000, pctOfIncome: 79.1 },
  { item: 'Other Income (e.g. Levies, Sales, Donations)', amount: 155000, pctOfIncome: 20.9 },
];

export const statementExpenditureRows = [
  { item: 'Teaching Materials', amount: 199500, pctOfIncome: 26.9 },
  { item: 'Maintenance', amount: 136500, pctOfIncome: 18.4 },
  { item: 'Catering & Welfare', amount: 94500, pctOfIncome: 12.7 },
  { item: 'Office & Stationery', amount: 63000, pctOfIncome: 8.5 },
  { item: 'Other Expenses', amount: 31500, pctOfIncome: 4.2 },
];

export const incomeVsExpenditureTrend = [
  { term: '2024 T1', income: 420000, expenditure: 310000 },
  { term: '2024 T2', income: 470000, expenditure: 345000 },
  { term: '2024 T3', income: 520000, expenditure: 375000 },
  { term: '2025 T1', income: 580000, expenditure: 410000 },
  { term: '2025 T2', income: 630000, expenditure: 450000 },
  { term: '2025 T3', income: 685000, expenditure: 485000 },
  { term: '2026 T1', income: 742000, expenditure: 525000 },
];

export const expenditureByCategory = [
  { name: 'Teaching Materials', value: 199500 },
  { name: 'Maintenance', value: 136500 },
  { name: 'Catering & Welfare', value: 94500 },
  { name: 'Office & Stationery', value: 63000 },
  { name: 'Other Expenses', value: 31500 },
];

export const accountSummaryInsights = [
  'The school recorded a surplus of ₦217,000 (29.2% of income) for the period.',
  'Total income grew by 15.8% compared to the same period last session.',
  'Total expenditure increased by 12.4%, which is below the income growth rate.',
  'Teaching Materials and Maintenance account for 65.3% of total expenditure.',
];

export const actionsNextSteps = [
  { icon: 'database', title: 'Review outstanding payments', description: '(₦198,000) and raise installments.' },
  { icon: 'chart', title: 'Monitor high-cost categories', description: '(Teaching Materials & Maintenance).' },
  { icon: 'calendar', title: 'Project next term’s income and expenditure.', description: '' },
];

// ===================== Income Details tab =====================
export const incomeDetailsStats = {
  totalIncome: 742000,
  totalIncomeChangePct: 15.8,
  schoolFees: 587000,
  schoolFeesPct: 79.1,
  otherIncome: 155000,
  otherIncomePct: 20.9,
  incomeGrowthPct: 15.8,
  collectionEfficiency: 96.3,
};

export const incomeByAccount = [
  { account: 'School Fees (Tuition)', amount: 587000, pctOfTotal: 79.1, vsPriorTerm: 14.7, trend: [60, 64, 68, 70, 74, 78, 79] },
  { account: 'Levies (ICT, Exam, Dev.)', amount: 64000, pctOfTotal: 8.6, vsPriorTerm: 18.5, trend: [40, 44, 48, 52, 58, 62, 65] },
  { account: 'Sales (Books, Uniform, etc.)', amount: 42000, pctOfTotal: 5.7, vsPriorTerm: 12.0, trend: [50, 52, 48, 54, 58, 55, 57] },
  { account: 'Donations & Grants', amount: 30000, pctOfTotal: 4.0, vsPriorTerm: 25.0, trend: [20, 25, 30, 28, 35, 40, 42] },
  { account: 'Other Income', amount: 19000, pctOfTotal: 2.6, vsPriorTerm: 9.5, trend: [45, 46, 44, 48, 47, 50, 49] },
];

export const recentIncomeTransactions = [
  { date: '2025-11-12', description: 'School Fees – SS2 Calm', account: 'School Fees (Tuition)', amount: 35000, mode: 'Bank Transfer', status: 'Received' },
  { date: '2025-11-12', description: 'ICT Levy – SS1', account: 'Levies', amount: 5000, mode: 'POS', status: 'Received' },
  { date: '2025-11-11', description: 'Sale of Exercise Books', account: 'Sales', amount: 12000, mode: 'Cash', status: 'Received' },
  { date: '2025-11-10', description: 'Donation – Alumni Association', account: 'Donations & Grants', amount: 30000, mode: 'Bank Transfer', status: 'Received' },
  { date: '2025-11-08', description: 'School Fees – SS3 Hope', account: 'School Fees (Tuition)', amount: 35000, mode: 'Bank Transfer', status: 'Received' },
];

export const incomeComposition = [
  { name: 'School Fees', value: 587000, pct: 79.1 },
  { name: 'Levies', value: 64000, pct: 8.6 },
  { name: 'Sales', value: 42000, pct: 5.7 },
  { name: 'Donations & Grants', value: 30000, pct: 4.0 },
  { name: 'Other Income', value: 19000, pct: 2.6 },
];

export const incomeTrend = [
  { term: '2024 T1', income: 420000 },
  { term: '2024 T2', income: 470000 },
  { term: '2024 T3', income: 520000 },
  { term: '2025 T1', income: 580000 },
  { term: '2025 T2', income: 630000 },
  { term: '2025 T3', income: 685000 },
  { term: '2026 T1', income: 742000 },
];

export const incomeDetailsInsights = [
  'Total income is ₦742,000, up by 15.8% compared to the same term last session.',
  'School fees account for 79.1% of total income (₦587,000).',
  'Other income (levies, sales, donations, etc.) contributed 20.9% (₦155,000).',
  'Collection efficiency is 96.3% for the period.',
];

// ===================== Expenditure Details tab =====================
export const expenditureDetailsStats = {
  totalExpenditure: 525000,
  totalExpenditureChangePct: 12.4,
  expenditureRecords: 24,
  totalAmountPaid: 327000,
  totalAmountPaidPct: 62.3,
  paidRecords: 17,
  paidRecordsPct: 70.8,
  outstandingRecords: 7,
  outstandingRecordsPct: 29.2,
  outstandingAmount: 198000,
  outstandingAmountPct: 37.7,
};

export const expenditureByAccount = [
  { account: 'Teaching Materials', amount: 199500, pctOfTotal: 38.0, vsPriorTerm: 10.5, trend: [55, 58, 60, 62, 65, 68, 70] },
  { account: 'Maintenance', amount: 136500, pctOfTotal: 26.0, vsPriorTerm: 15.3, trend: [40, 44, 46, 50, 54, 58, 60] },
  { account: 'Catering & Welfare', amount: 94500, pctOfTotal: 18.0, vsPriorTerm: 8.6, trend: [48, 50, 49, 52, 51, 53, 55] },
  { account: 'Office & Stationery', amount: 63000, pctOfTotal: 12.0, vsPriorTerm: 9.1, trend: [42, 44, 43, 46, 45, 48, 47] },
  { account: 'Other Expenses', amount: 31500, pctOfTotal: 6.0, vsPriorTerm: 14.8, trend: [30, 32, 35, 33, 38, 40, 42] },
];

export const recentExpenditureTransactions = [
  { date: '2025-11-14', description: 'Purchase of textbooks', account: 'Teaching Materials', amount: 100000, vendor: 'Alpha Books Ltd', status: 'Paid' },
  { date: '2025-11-12', description: 'ICT lab maintenance', account: 'Maintenance', amount: 72500, vendor: 'TechNova Solutions', status: 'Paid' },
  { date: '2025-11-10', description: 'Catering for school event', account: 'Catering & Welfare', amount: 47500, vendor: 'Royal Caterers Ltd', status: 'Paid' },
  { date: '2025-11-08', description: 'Office stationery supplies', account: 'Office & Stationery', amount: 29500, vendor: 'CleanPro Services', status: 'Paid' },
  { date: '2025-11-05', description: 'Electrical repairs', account: 'Maintenance', amount: 64000, vendor: 'PowerTech Electricals', status: 'Paid' },
];

export const expenditureTrend = [
  { term: '2024 T1', expenditure: 310000 },
  { term: '2024 T2', expenditure: 345000 },
  { term: '2024 T3', expenditure: 375000 },
  { term: '2025 T1', expenditure: 410000 },
  { term: '2025 T2', expenditure: 450000 },
  { term: '2025 T3', expenditure: 485000 },
  { term: '2026 T1', expenditure: 525000 },
];

export const expenditureDetailsInsights = [
  'Total expenditure is ₦525,000, up by 12.4% compared to the same term last session.',
  'Teaching Materials accounts for 38.0% (₦199,500) of total expenditure.',
  'Maintenance expenditure increased by 15.3% to ₦136,500.',
  'Outstanding amount is ₦198,000 (37.7%) across 7 expenditure records.',
];

// ===================== Trend & Analysis tab =====================
export const surplusDeficitTrend = [
  { term: '2024 T1', value: 120000 },
  { term: '2024 T2', value: 105000 },
  { term: '2024 T3', value: 128000 },
  { term: '2025 T1', value: 150000 },
  { term: '2025 T2', value: 155000 },
  { term: '2025 T3', value: 175000 },
  { term: '2026 T1', value: 217000 },
];

export const keyFinancialTrends = [
  { metric: 'Total Income', icon: 'income', current: 742000, previous: 641000, changeLabel: '+15.8%', direction: 'up', good: true, trend: [60, 64, 66, 70, 72, 76, 79] },
  { metric: 'Total Expenditure', icon: 'expenditure', current: 525000, previous: 467000, changeLabel: '+12.4%', direction: 'up', good: false, trend: [50, 53, 55, 58, 60, 64, 66] },
  { metric: 'Surplus / (Deficit)', icon: 'scale', current: 217000, previous: 174000, changeLabel: '+24.9%', direction: 'up', good: true, trend: [40, 42, 46, 50, 52, 58, 62] },
  { metric: 'Expenditure Ratio', icon: 'percent', current: '70.8%', previous: '72.9%', changeLabel: '−2.1 pp', direction: 'down', good: true, trend: [72, 73, 71, 72, 71, 70.5, 70.8] },
  { metric: 'Collection Efficiency', icon: 'target', current: '96.3%', previous: '93.5%', changeLabel: '+2.8 pp', direction: 'up', good: true, trend: [90, 91, 92, 93, 94, 95, 96.3] },
];

export const incomeExpenditureComposition = [
  { name: 'Expenditure', value: 525000, pct: 70.8 },
  { name: 'Surplus', value: 217000, pct: 29.2 },
];

export const trendAnalysisInsights = [
  'Income increased by 15.8% (₦101,000) compared to the same term last session.',
  'Expenditure grew by 12.4% (₦58,000), at a slower rate than income.',
  'Surplus improved by 24.9% to ₦217,000.',
  'Expenditure ratio reduced to 70.8% (down 2.1 percentage points), indicating better cost control.',
  'Collection efficiency is 96.3%, up by 2.8 percentage points.',
];
