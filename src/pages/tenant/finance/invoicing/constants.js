// Shared color scheme for every income source — used by the table's
// "Income Account" chips and the "Income by Source" donut/legend, so both
// surfaces agree on the same colors for the same source.
export const INCOME_SOURCE_META = {
  'School Fees': { bg: '#DBEAFE', color: '#2563EB' },
  'Facility Income': { bg: '#DCFCE7', color: '#16A34A' },
  'Other Income': { bg: '#FEF3C7', color: '#D97706' },
  'Interest Income': { bg: '#CCFBF1', color: '#0D9488' },
  'Grant Income': { bg: '#F3E8FF', color: '#9333EA' },
  'Grants & Donations': { bg: '#F3E8FF', color: '#9333EA' },
  Others: { bg: '#F1F5F9', color: '#64748B' },
};

export const STATUS_META = {
  Paid: { bg: '#DCFCE7', color: '#15803D' },
  Unpaid: { bg: '#FEE2E2', color: '#DC2626' },
};

export const INCOME_CATEGORIES = Object.keys(INCOME_SOURCE_META).filter(
  (k) => k !== 'Others',
);

export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n}`;
}

export const mockInvoices = [
  {
    id: '1',
    date: '2025-01-20',
    invoiceNo: 'INV-000876',
    description: 'Hall Rental – Event Centre',
    payer: 'ABC Events Ltd',
    incomeAccount: 'Facility Income',
    amount: 1200000,
    status: 'Unpaid',
  },
  {
    id: '2',
    date: '2025-01-18',
    invoiceNo: 'INV-000875',
    description: 'WAEC Registration (Students)',
    payer: 'WAEC',
    incomeAccount: 'Other Income',
    amount: 800000,
    status: 'Paid',
  },
  {
    id: '3',
    date: '2025-01-12',
    invoiceNo: 'INV-000874',
    description: 'Interest on School Bank Account',
    payer: 'First Bank',
    incomeAccount: 'Interest Income',
    amount: 250000,
    status: 'Paid',
  },
  {
    id: '4',
    date: '2025-01-10',
    invoiceNo: 'INV-000873',
    description: 'Sale of Scrap Items',
    payer: 'Local Buyer',
    incomeAccount: 'Other Income',
    amount: 150000,
    status: 'Paid',
  },
  {
    id: '5',
    date: '2025-01-08',
    invoiceNo: 'INV-000872',
    description: 'Grant for ICT Project',
    payer: 'Education Trust Fund',
    incomeAccount: 'Grant Income',
    amount: 8000000,
    status: 'Paid',
  },
  {
    id: '6',
    date: '2025-01-06',
    invoiceNo: 'INV-000871',
    description: 'School Bus Hire – Excursion',
    payer: 'Greenfield Tours',
    incomeAccount: 'Facility Income',
    amount: 450000,
    status: 'Paid',
  },
  {
    id: '7',
    date: '2025-01-05',
    invoiceNo: 'INV-000870',
    description: 'Canteen Concession Fee',
    payer: 'Blue Plate Caterers',
    incomeAccount: 'Other Income',
    amount: 300000,
    status: 'Unpaid',
  },
  {
    id: '8',
    date: '2025-01-03',
    invoiceNo: 'INV-000869',
    description: 'Uniform Sales Commission',
    payer: 'Campus Wears Ltd',
    incomeAccount: 'Other Income',
    amount: 180000,
    status: 'Paid',
  },
  {
    id: '9',
    date: '2024-12-29',
    invoiceNo: 'INV-000868',
    description: 'Hall Rental – Wedding',
    payer: 'Okafor Family',
    incomeAccount: 'Facility Income',
    amount: 600000,
    status: 'Paid',
  },
  {
    id: '10',
    date: '2024-12-20',
    invoiceNo: 'INV-000867',
    description: 'PTA Development Levy',
    payer: 'Parent-Teacher Association',
    incomeAccount: 'Other Income',
    amount: 2000000,
    status: 'Unpaid',
  },
  {
    id: '11',
    date: '2024-12-15',
    invoiceNo: 'INV-000866',
    description: 'Interest on Fixed Deposit',
    payer: 'Zenith Bank',
    incomeAccount: 'Interest Income',
    amount: 320000,
    status: 'Paid',
  },
  {
    id: '12',
    date: '2024-12-10',
    invoiceNo: 'INV-000865',
    description: 'Grant for Library Renovation',
    payer: 'State Ministry of Education',
    incomeAccount: 'Grant Income',
    amount: 5000000,
    status: 'Paid',
  },
];

export const mockReceipts = [
  {
    id: 'r1',
    date: '2025-01-19',
    receiptNo: 'RCT-002231',
    description: 'WAEC Registration (Students)',
    payer: 'WAEC',
    incomeAccount: 'Other Income',
    amount: 800000,
  },
  {
    id: 'r2',
    date: '2025-01-13',
    receiptNo: 'RCT-002230',
    description: 'Interest on School Bank Account',
    payer: 'First Bank',
    incomeAccount: 'Interest Income',
    amount: 250000,
  },
  {
    id: 'r3',
    date: '2025-01-11',
    receiptNo: 'RCT-002229',
    description: 'Sale of Scrap Items',
    payer: 'Local Buyer',
    incomeAccount: 'Other Income',
    amount: 150000,
  },
  {
    id: 'r4',
    date: '2025-01-09',
    receiptNo: 'RCT-002228',
    description: 'Grant for ICT Project',
    payer: 'Education Trust Fund',
    incomeAccount: 'Grant Income',
    amount: 8000000,
  },
  {
    id: 'r5',
    date: '2025-01-07',
    receiptNo: 'RCT-002227',
    description: 'School Bus Hire – Excursion',
    payer: 'Greenfield Tours',
    incomeAccount: 'Facility Income',
    amount: 450000,
  },
  {
    id: 'r6',
    date: '2025-01-04',
    receiptNo: 'RCT-002226',
    description: 'Uniform Sales Commission',
    payer: 'Campus Wears Ltd',
    incomeAccount: 'Other Income',
    amount: 180000,
  },
  {
    id: 'r7',
    date: '2024-12-30',
    receiptNo: 'RCT-002225',
    description: 'Hall Rental – Wedding',
    payer: 'Okafor Family',
    incomeAccount: 'Facility Income',
    amount: 600000,
  },
  {
    id: 'r8',
    date: '2024-12-16',
    receiptNo: 'RCT-002224',
    description: 'Interest on Fixed Deposit',
    payer: 'Zenith Bank',
    incomeAccount: 'Interest Income',
    amount: 320000,
  },
];

// Income by Source — drives the donut chart + its legend. Values in Naira.
export const incomeBySource = [
  { name: 'School Fees', value: 292500000 },
  { name: 'Facility Income', value: 8000000 },
  { name: 'Other Income', value: 5000000 },
  { name: 'Grants & Donations', value: 4000000 },
  { name: 'Others', value: 5500000, caption: '6 Categories' },
];

export const summaryStats = {
  totalIncome: 315000000,
  collected: 292500000,
  outstanding: 22500000,
  collectionRate: 92.9,
};

// Income Trend (Last 7 Terms) — last two points match the Intelligent
// Insights "+18.4% (₦266.0M → ₦315.0M)" callout exactly.
export const incomeTrend = [
  { term: '2023 T2', income: 150000000 },
  { term: '2023 T3', income: 175000000 },
  { term: '2024 T1', income: 200000000 },
  { term: '2024 T2', income: 225000000 },
  { term: '2024 T3', income: 245000000 },
  { term: '2025 T1', income: 266000000 },
  { term: '2025 T2', income: 315000000 },
];

// ===================== Create Invoice modal =====================

// Mock payer directory — a real build would hit a payers/customers
// endpoint; this gives the "Payer / Customer" select something to pick
// from and lets the invoice's Payer Email auto-fill off that choice.
export const PAYERS = [
  { name: 'ABC Events Ltd', email: 'finance@abcevents.com', address: '123 Business Avenue, Lagos, Nigeria' },
  { name: 'WAEC', email: 'accounts@waec.org.ng', address: 'WAEC House, Yaba, Lagos, Nigeria' },
  { name: 'First Bank', email: 'schools@firstbanknigeria.com', address: 'Marina, Lagos, Nigeria' },
  { name: 'Education Trust Fund', email: 'grants@tetfund.gov.ng', address: 'Abuja, Nigeria' },
  { name: 'Parent-Teacher Association', email: 'pta@metropolitancollege.edu.ng', address: 'School Premises' },
  { name: 'Greenfield Tours', email: 'bookings@greenfieldtours.com', address: 'Ikeja, Lagos, Nigeria' },
];

// Specific ledger accounts under each income category — drives the
// "Income Account" select in Record Income, which narrows to whichever
// category is currently selected.
export const INCOME_ACCOUNTS_BY_CATEGORY = {
  'School Fees': ['Tuition Fees', 'Registration Fees', 'Examination Fees'],
  'Facility Income': ['Facility Rental Income', 'Hall Rental', 'Bus Hire Income'],
  'Other Income': ['Canteen Income', 'Uniform Sales Income', 'Miscellaneous Income'],
  'Interest Income': ['Bank Interest Income', 'Fixed Deposit Interest'],
  'Grant Income': ['Government Grant', 'NGO Grant', 'Donation Income'],
};

export const PAYMENT_TERMS = ['Due on Receipt', '7 Days', '14 Days', '30 Days', '60 Days'];

export const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'POS / Card', 'Cheque', 'Online Payment'];

export const BANK_ACCOUNTS = [
  'School Main Account – 0123456789',
  'Facility Development Fund – 0987654321',
];

export const TAX_OPTIONS = [
  { label: 'None', rate: 0 },
  { label: 'VAT (7.5%)', rate: 0.075 },
  { label: 'WHT (5%)', rate: 0.05 },
];

let invoiceSeq = 879;
export function generateInvoiceNo() {
  invoiceSeq += 1;
  return `INV-${String(invoiceSeq).padStart(6, '0')}`;
}

let receiptSeq = 9876;
export function generateReceiptNo() {
  receiptSeq += 1;
  return `RCPT-${String(receiptSeq).padStart(7, '0')}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateDisplay(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
