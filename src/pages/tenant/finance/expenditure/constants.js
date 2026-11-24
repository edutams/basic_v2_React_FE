// Expense category meta — drives the table's category badge (when shown)
// and the "Expenditure by Category" donut/legend, so both surfaces agree
// on the same color for the same category.
export const EXPENSE_CATEGORY_META = {
  'Teaching Materials': { bg: '#DBEAFE', color: '#2563EB' },
  Maintenance: { bg: '#CCFBF1', color: '#0D9488' },
  'Catering & Welfare': { bg: '#F3E8FF', color: '#9333EA' },
  'Office & Stationery': { bg: '#FEF3C7', color: '#D97706' },
  'Other Expenses': { bg: '#F1F5F9', color: '#64748B' },
};

export const EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORY_META);

export const EXPENDITURE_ACCOUNTS_BY_CATEGORY = {
  'Teaching Materials': ['Textbooks & Workbooks', 'Laboratory & Science Equipment', 'ICT Learning Materials'],
  Maintenance: ['ICT Lab Maintenance', 'Building & Facility Repairs', 'Equipment Servicing'],
  'Catering & Welfare': ['Catering Supplies', 'Staff Welfare', 'Event Hospitality'],
  'Office & Stationery': ['Office Supplies', 'Printing & Stationery', 'Cleaning Materials'],
  'Other Expenses': ['Transport & Logistics', 'Utilities', 'Miscellaneous'],
};

export const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'POS / Card', 'Cheque', 'Online Payment'];

export const BANK_ACCOUNTS = [
  'School Main Account – 0123456789',
  'Facility Development Fund – 0987654321',
];

export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateDisplay(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

let expenditureSeq = 259;
export function generateRefNo() {
  expenditureSeq += 1;
  return `EXP-${String(expenditureSeq).padStart(4, '0')}`;
}

// ===================== Vendor directory =====================
// A real build would hit a vendor_manager.profile endpoint; this gives the
// "Vendor / Supplier" select something to pick from, matching the Vendor
// Manager module's own mock roster.
export const VENDORS = [
  'Alpha Books Ltd',
  'TechNova Solutions',
  'Royal Caterers Ltd',
  'PowerTech Electricals',
  'CleanPro Services',
];

// ===================== Summary stats =====================
export const summaryStats = {
  totalExpenditure: 525000,
  totalExpenditureChangePct: 12.4,
  totalPaid: 327000,
  totalPaidPctOfActual: 62.3,
  outstandingBalance: 198000,
  outstandingPctOfActual: 37.7,
  totalVendorsInUse: 5,
};

// ===================== Main listing table =====================
// Each row's `installmentLabel`/`installmentStatus` drives the chip in the
// Payment Request column ("2 of 3" = in progress, "Final (1 of 1)" = last
// installment, already fully settled).
export const mockExpenditures = [
  {
    id: '1',
    refNo: 'EXP-0259',
    date: '2025-11-14',
    description: 'Purchase of textbooks',
    vendor: 'Alpha Books Ltd',
    category: 'Teaching Materials',
    actual: 250000,
    paid: 100000,
    balance: 150000,
    requestAmount: 50000,
    installmentLabel: '2 of 3',
    installmentStatus: 'in_progress',
    balanceAfter: 100000,
    status: 'Pending Approval',
  },
  {
    id: '2',
    refNo: 'EXP-0258',
    date: '2025-11-10',
    description: 'ICT lab maintenance',
    vendor: 'TechNova Solutions',
    category: 'Maintenance',
    actual: 180000,
    paid: 180000,
    balance: 0,
    requestAmount: null,
    installmentLabel: 'Final (1 of 1)',
    installmentStatus: 'final',
    balanceAfter: 0,
    status: 'Pending Approval',
  },
  {
    id: '3',
    refNo: 'EXP-0257',
    date: '2025-11-08',
    description: 'Catering for school event',
    vendor: 'Royal Caterers Ltd',
    category: 'Catering & Welfare',
    actual: 95000,
    paid: 47500,
    balance: 47500,
    requestAmount: 47500,
    installmentLabel: '2 of 2',
    installmentStatus: 'in_progress',
    balanceAfter: 0,
    status: 'Pending Approval',
  },
  {
    id: '4',
    refNo: 'EXP-0256',
    date: '2025-11-05',
    description: 'Electrical repairs and supplies',
    vendor: 'PowerTech Electricals',
    category: 'Maintenance',
    actual: 72000,
    paid: 0,
    balance: 72000,
    requestAmount: 24000,
    installmentLabel: '1 of 3',
    installmentStatus: 'in_progress',
    balanceAfter: 48000,
    status: 'Pending Approval',
  },
  {
    id: '5',
    refNo: 'EXP-0255',
    date: '2025-11-02',
    description: 'Cleaning materials',
    vendor: 'CleanPro Services',
    category: 'Office & Stationery',
    actual: 38000,
    paid: 0,
    balance: 38000,
    requestAmount: 38000,
    installmentLabel: 'Final (1 of 1)',
    installmentStatus: 'final',
    balanceAfter: 0,
    status: 'Pending Approval',
  },
  {
    id: '6',
    refNo: 'EXP-0254',
    date: '2025-10-28',
    description: 'Office stationery restock',
    vendor: 'CleanPro Services',
    category: 'Office & Stationery',
    actual: 25000,
    paid: 25000,
    balance: 0,
    requestAmount: null,
    installmentLabel: 'Final (1 of 1)',
    installmentStatus: 'final',
    balanceAfter: 0,
    status: 'Approved',
  },
  {
    id: '7',
    refNo: 'EXP-0253',
    date: '2025-10-20',
    description: 'Science lab equipment',
    vendor: 'Alpha Books Ltd',
    category: 'Teaching Materials',
    actual: 65000,
    paid: 32500,
    balance: 32500,
    requestAmount: 32500,
    installmentLabel: '2 of 2',
    installmentStatus: 'in_progress',
    balanceAfter: 0,
    status: 'With Outstanding Payment',
  },
];

export const STATUS_TABS = [
  { value: 'Pending Approval', label: 'Pending Approval', count: 7 },
  { value: 'With Outstanding Payment', label: 'With Outstanding Payment', count: 12 },
  { value: 'Approved', label: 'Approved', count: 17 },
  { value: 'Rejected', label: 'Rejected', count: 0 },
  { value: 'All', label: 'All Entries', count: 24 },
];

// ===================== Expenditure by Category (right-rail donut) =====================
export const expenditureByCategory = [
  { name: 'Teaching Materials', value: 199500 },
  { name: 'Maintenance', value: 136500 },
  { name: 'Catering & Welfare', value: 94500 },
  { name: 'Office & Stationery', value: 63000 },
  { name: 'Other Expenses', value: 31500 },
];

// ===================== Posting Trend (last 7 terms) =====================
// Last point's paid/balance split matches `summaryStats` exactly
// (327,000 + 198,000 = 525,000) so the trend chart and the stat cards
// agree on the current term's numbers.
export const postingTrend = [
  { term: '2024 T1', actual: 255000, paid: 200000, balance: 55000 },
  { term: '2024 T2', actual: 288000, paid: 230000, balance: 58000 },
  { term: '2024 T3', actual: 312000, paid: 250000, balance: 62000 },
  { term: '2025 T1', actual: 356000, paid: 270000, balance: 86000 },
  { term: '2025 T2', actual: 398000, paid: 290000, balance: 108000 },
  { term: '2025 T3', actual: 462000, paid: 310000, balance: 152000 },
  { term: '2026 T1', actual: 525000, paid: 327000, balance: 198000 },
];

// ===================== Vendor Concentration (top 5 by actual spend) =====================
export const vendorConcentration = [
  { vendor: 'Alpha Books Ltd', actual: 250000, paid: 100000, balance: 150000, sharePct: 47.6 },
  { vendor: 'TechNova Solutions', actual: 180000, paid: 180000, balance: 0, sharePct: 34.3 },
  { vendor: 'Royal Caterers Ltd', actual: 95000, paid: 47500, balance: 47500, sharePct: 18.1 },
  { vendor: 'PowerTech Electricals', actual: 72000, paid: 0, balance: 72000, sharePct: 13.7 },
  { vendor: 'CleanPro Services', actual: 38000, paid: 0, balance: 38000, sharePct: 7.2 },
];

// ===================== Key Insights (bulleted, auto-generated-looking) =====================
export const keyInsights = [
  'Total expenditure is ₦525,000, up by 12.4% compared to last term.',
  '₦327,000 (62.3%) has been paid, with an outstanding balance of ₦198,000 (37.7%).',
  '7 payments (₦198,000) are pending approval, comprising 5 installment payments and 2 full payments.',
  'Spending is concentrated on 2 vendors (81.9% of total expenditure).',
  'Maintenance and Catering & Welfare account for 44% of total spending.',
];

export const keyInsightsRecommendation =
  'Approve legitimate installment payments promptly, monitor the outstanding balance (₦198,000), and consider diversifying suppliers.';

// ===================== Post Expenditure modal =====================

export const initialExpenditureValues = {
  description: '',
  category: '',
  account: '',
  vendor: '',
  actualAmount: '',
  refNo: '',
  expenditureDate: todayISO(),
  remarks: '',
};
